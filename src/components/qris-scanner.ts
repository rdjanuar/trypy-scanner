import QrScanner from 'qr-scanner';
import loadingPaymentJson from '../assets/lotties/loading-payment.json';
import qrisIcon from '../assets/icons/qris.svg';
import dayIcon from '../assets/icons/day.svg';
import galeryIcon from '../assets/icons/galery.svg';

const TwLitElement = TW(LitElement)

@customElement('qris-scanner')
export class QrisScanner extends TwLitElement {
  @provide({ context: loggerContext })
  logger: ILogger = logger;

  @state()
  private scannedQrData = '';

  @state()
  private scanProgress = 0;

  private _decodeTask = new Task(this, {
    task: async ([qrData]) => {
      if (!qrData) return;
      this.logger.add('INFO', `Processing QR data: ${qrData.substring(0, 80)}...`);
      
      this.scanProgress = 0;
      const interval = setInterval(() => {
        if (this.scanProgress < 95) {
          this.scanProgress += Math.random() * 5 + 2;
        }
      }, 100);

      try {
        await decode({ data: qrData }, this.logger);
      } finally {
        clearInterval(interval);
        this.scanProgress = 100;
        this.scanning = false
        this.scannedQrData = ''
      }
      return qrData;
    },
    args: () => [this.scannedQrData],
  });

  @query('#qr-video')
  videoElement!: HTMLVideoElement;

  @state()
  flashOn = false;

  @state()
  errorMessage = '';

  @state()
  scanning = false

  @state()
  private bottomSheetHeight = 0;

  private mediaStream?: MediaStream;
  private scanInterval?: ReturnType<typeof setInterval>;

  firstUpdated() {
    logger.add('DEBUG', `User Agent ${JSON.stringify(window.navigator.userAgent)}`)
    logger.add('DEBUG', `Navigator ${JSON.stringify(window.navigator, null, 2)}`)
    setTimeout(() => {
      this.startCamera();
    }, 300);
  }

  private _onSheetResize(e: CustomEvent<{ height: number }>) {
    this.bottomSheetHeight = e.detail.height;
  }

 
  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopCamera();
  }

  private async startCamera() {
    if (!this.videoElement) {
      this.errorMessage = 'Video element not found';
      this.logger.add('ERROR', 'Video element not found in Shadow DOM');
      return;
    }

    this.logger.add('INFO', 'Starting camera...');

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      this.logger.add('INFO', 'Got media stream (environment camera)');
      const track = this.mediaStream.getVideoTracks()[0];
      if (track) {
        const settings = track.getSettings();
        this.logger.add('DEBUG', `Camera: ${track.label} | ${settings.width}x${settings.height}`);
      }

      this.videoElement.srcObject = this.mediaStream;
      await this.videoElement.play();
      this.logger.add('INFO', 'Video playing');

      this.startQrScanning();
    } catch (err) {
      this.logger.add('WARN', `Environment camera failed: ${err}`);
      console.error('Camera error:', err);
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
        this.logger.add('INFO', 'Fallback to user camera OK');
        this.videoElement.srcObject = this.mediaStream;
        await this.videoElement.play();
        this.startQrScanning();
      } catch (fallbackErr) {
        this.logger.add('ERROR', `All cameras failed: ${fallbackErr}`);
        this.errorMessage = 'Camera Error: ' + fallbackErr;
      }
    }
  }

  private startQrScanning() {
    if (this.scanning) return;
    this.scanning = true;
    this.logger.add('INFO', 'QR scanning started (interval: 300ms)');

    this.scanInterval = setInterval(async () => {
      if (!this.videoElement || this.videoElement.readyState < 2) return;
      if (this._decodeTask.status === TaskStatus.PENDING) return;
      try {
        const result = await QrScanner.scanImage(this.videoElement, {
          returnDetailedScanResult: true
        });
        if (result?.data) {
          this.scannedQrData = result.data;
          console.log('Decoded QR code:', result.data);
          this.dispatchEvent(new CustomEvent('qr-scanned', { detail: result.data }));
        }
      } catch {
      }
    }, 300);
  }

  private stopCamera() {
    logger.add('INFO', 'Stopping camera');
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = undefined;
    }
    this.scanning = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = undefined;
    }
  }

  private toggleFlash() {
    if (!this.mediaStream) return;
    const track = this.mediaStream.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities() as any;
      if (capabilities?.torch) {
        this.flashOn = !this.flashOn;
        track.applyConstraints({ advanced: [{ torch: this.flashOn } as any] });
        this.logger.add('INFO', `Flash ${this.flashOn ? 'ON' : 'OFF'}`);
      } else {
        this.logger.add('WARN', 'Torch not supported on this device');
        console.warn('Torch not supported on this device');
      }
    } catch (err) {
      this.logger.add('ERROR', `Flash error: ${err}`);
      console.warn('Flash not supported', err);
    }
  }

  @query('#file-input')
  private fileInput!: HTMLInputElement;

  private _openGallery() {
    this.fileInput?.click();
  }

  private async _onFileSelected(e: Event) {
    this.scannedQrData = ''
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      this.logger.add('INFO', 'Scanning uploaded image for QR code...');
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      if (result?.data) {
        this.scannedQrData = result.data;
        this.logger.add('INFO', `Decoded QR code from image: ${result.data}`);
        this.dispatchEvent(new CustomEvent('qr-scanned', { detail: result.data }));
      }
    } catch (err) {
      this.logger.add('ERROR', `Failed to decode QR from image: ${err}`);
      this.errorMessage = 'QR Code tidak ditemukan pada gambar.';
      setTimeout(() => { this.errorMessage = ''; }, 3000);
    } finally {
      this.clearFile()
    }
  }

  private _tapCount = 0;
  private _tapTimer?: ReturnType<typeof setTimeout>;

  private clearFile() {
    if(this.fileInput) {
      this.fileInput.value = ''
    }
  }

  private _onHeaderTap() {
    this._tapCount++;
    if (this._tapTimer) clearTimeout(this._tapTimer);
    this._tapTimer = setTimeout(() => { this._tapCount = 0; }, 500);

    if (this._tapCount >= 3) {
      this._tapCount = 0;
      this.toggleDebugLog();
    }
  }

  private _onChangePaymentMethod() {
    this.logger.add('INFO', 'User clicked "Ubah" payment method');
  }

  private _onShowQr() {
    this.logger.add('INFO', 'User clicked "Tampilkan QR"');
  }

  private _onQrisTap() {
    this.logger.add('INFO', 'User clicked "QRIS Tap"');
  }

  private toggleDebugLog() {
    this.logger.toggle();
  }

  protected render() {
    return html`
      ${this.errorMessage ? html`<div class="absolute z-999 text-white bg-red-600/80 p-4 text-center w-full top-[40%] font-bold">${this.errorMessage}</div>` : ''}

      ${this._decodeTask.render({
        pending: () => html`
          <div class="absolute inset-0 z-9999 bg-white flex flex-col items-center justify-center">
            <lottie-animation .animationData=${loadingPaymentJson}></lottie-animation>
            <div class="space-y-2 text-center">
            <p class="text-strong font-semibold text-base">Tunggu sebentar ya...</p>
            <p class="text-secondary text-sm font-normal">Transaksimu sedang kami proses</p>
            <ui-progress-bar value=${this.scanProgress} max="100" size="sm" .ui=${{
              base: 'mt-6'
            }}></ui-progress-bar>
            </div>
          </div>
        `
      })}
      
    
      <div class="absolute inset-0 z-1">
        <video id="qr-video" playsinline autoplay muted></video>
      </div>
      
      <div class="absolute inset-0 z-2 flex flex-col pointer-events-none">
        <div class="mx-auto mt-5 bg-strong/70 px-4 py-2.5 rounded-[40px] text-sm font-medium flex items-center gap-2 border border-white/25 pointer-events-auto cursor-pointer" @click=${this._onHeaderTap}>
        <p class="text-xs text-white font-semibold">
        Powered by
        </p>
          <img src=${qrisIcon} />
        </div>

        <div class="absolute inset-x-0 px-4 flex justify-between pointer-events-auto z-3" style="bottom: ${this.bottomSheetHeight + 16}px">
          <button class="p-3 rounded-full bg-white flex items-center justify-center shadow-lg border-none cursor-pointer text-gray-700" @click=${this.toggleFlash}>
          <img src=${dayIcon} />
          </button>
          <button class="p-3 rounded-full bg-white flex items-center justify-center shadow-lg border-none cursor-pointer text-gray-700" @click=${this._openGallery}>
            <img src=${galeryIcon} />  
          </button>
          <input type="file" id="file-input" accept="image/*" class="sr-only" @change=${this._onFileSelected} />
        </div>
      </div>

      <payment-bottom-sheet
        @change-payment-method=${this._onChangePaymentMethod}
        @show-qr=${this._onShowQr}
        @qris-tap=${this._onQrisTap}
        @sheet-resize=${this._onSheetResize}
      ></payment-bottom-sheet>
    `;
  }
}

