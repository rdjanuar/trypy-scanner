import QrScanner from 'qr-scanner';

const TwLitElement = TW(LitElement)

@customElement('qris-scanner')
export class QrisScanner extends TwLitElement {
  @provide({ context: loggerContext })
  logger: ILogger = logger;

  @state()
  private scannedQrData = '';

  private _decodeTask = new Task(this, {
    task: async ([qrData]) => {
      if (!qrData) return;
      this.logger.add('INFO', `Processing QR data: ${qrData.substring(0, 80)}...`);
      this.stopCamera();
      await decode({ data: qrData }, this.logger);
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

  private mediaStream?: MediaStream;
  private scanInterval?: ReturnType<typeof setInterval>;

  firstUpdated() {
    logger.add('DEBUG', `User Agent ${JSON.stringify(window.navigator.userAgent)}`)
    logger.add('DEBUG', `Navigator ${JSON.stringify(window.navigator, null, 2)}`)
    setTimeout(() => {
      this.startCamera();
    }, 300);
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
    this.scannedQrData = '';
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

  private _tapCount = 0;
  private _tapTimer?: ReturnType<typeof setTimeout>;

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
          <div class="absolute inset-0 z-9 bg-black/70 flex flex-col items-center justify-center text-white font-bold gap-3">
            <svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Memproses Pembayaran...</span>
          </div>
        `,
        error: (err: any) => html`
          <div class="absolute z-999 text-white bg-red-600/80 p-4 text-center w-full top-[45%] font-bold">
            Gagal memproses QR: ${err.message || err}
          </div>
        `
      })}

      <div class="absolute inset-0 z-1">
        <video id="qr-video" playsinline autoplay muted></video>
      </div>
      
      <div class="absolute inset-0 z-2 flex flex-col pointer-events-none">
        <div class="mx-auto mt-5 bg-black/60 text-white py-2 px-4 rounded-[20px] text-sm font-medium flex items-center gap-2 border border-white/20 backdrop-blur-sm pointer-events-auto cursor-pointer" @click=${this._onHeaderTap}>
          Powered by
          <svg width="40" height="16" viewBox="0 0 100 40" fill="white" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="30" font-family="Arial" font-weight="bold" font-size="30">QRIS</text>
          </svg>
        </div>

        <div class="absolute inset-x-0 bottom-[350px] px-8 flex justify-between pointer-events-auto z-3">
          <button class="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border-none cursor-pointer text-gray-700" @click=${this.toggleFlash}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#0b1e42" stroke="none"><circle cx="12" cy="12" r="5"/><path stroke="#0b1e42" stroke-width="2" stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          </button>
          <button class="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border-none cursor-pointer text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#0b1e42" stroke="none"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="2.5" fill="white"/><path d="M21 15l-5-5L5 21h14c1.1 0 2-.9 2-2v-4z" fill="white"/></svg>
          </button>
        </div>
      </div>

      <payment-bottom-sheet
        @change-payment-method=${this._onChangePaymentMethod}
        @show-qr=${this._onShowQr}
        @qris-tap=${this._onQrisTap}
      ></payment-bottom-sheet>
    `;
  }
}

