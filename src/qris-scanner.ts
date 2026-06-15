import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import QrScanner from 'qr-scanner';
import { decode } from './utils/decode';
import { logger } from './utils/logger';

@customElement('qris-scanner')
export class QrisScanner extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      background: #000;
      position: relative;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
    }

    .video-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    video {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      display: flex;
      flex-direction: column;
      pointer-events: none;
    }

    .header-badge {
      margin: 20px auto;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
    }

    .scanner-frame-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .floating-buttons {
      position: absolute;
      left: 0;
      right: 0;
      padding: 0 32px; /* Margin/padding from the edges */
      bottom: 350px;
      display: flex;
      justify-content: space-between;
      pointer-events: auto;
      z-index: 3;
    }

    .fab {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: none;
      cursor: pointer;
      color: #333;
    }

    .bottom-sheet {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: white;
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      padding: 28px 20px 24px 20px;
      box-sizing: border-box;
      z-index: 4;
      pointer-events: auto;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
    }

    .utama-badge {
      position: absolute;
      top: -14px;
      left: 20px;
      background: #f39c12; /* Orange */
      color: white;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .payment-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #e0e0e0;
      border-radius: 16px;
      padding: 16px;
      margin-top: 4px;
    }

    .payment-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .wallet-icon-wrapper {
      background: #00a5cf; /* GoPay blue-ish */
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .payment-details {
      font-size: 15px;
      color: #555;
      font-weight: 500;
    }
    
    .payment-amount {
      color: #111;
      font-weight: 700;
    }

    .btn-change {
      color: #e50025; /* Red */
      font-weight: 700;
      font-size: 14px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-cards {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .action-card {
      flex: 1;
      border: 1px solid #e0e0e0;
      border-radius: 16px;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: none;
      cursor: pointer;
      font-weight: 700;
      font-size: 15px;
      color: #333;
    }

    .action-card svg {
      color: #333;
    }
    
    /* Decorative blobs behind icons in action cards */
    .icon-decor {
      position: relative;
      width: 54px;
      height: 54px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-decor::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: #ffe5e5;
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      z-index: -1;
    }

    .icon-decor.blue-blob::before {
      background: #e5f4ff;
    }

    .footer {
      margin-top: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      color: #888;
    }
    .footer-brand {
      font-weight: 700;
      color: #555;
    }
    .footer svg {
      color: #27ae60;
    }
  `;

  @query('#qr-video')
  videoElement!: HTMLVideoElement;

  @state()
  flashOn = false;

  @state()
  errorMessage = '';

  private mediaStream?: MediaStream;
  private scanInterval?: ReturnType<typeof setInterval>;
  private scanning = false;

  firstUpdated() {
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
      logger.add('ERROR', 'Video element not found in Shadow DOM');
      return;
    }

    logger.add('INFO', 'Starting camera...');

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      logger.add('INFO', 'Got media stream (environment camera)');
      const track = this.mediaStream.getVideoTracks()[0];
      if (track) {
        const settings = track.getSettings();
        logger.add('DEBUG', `Camera: ${track.label} | ${settings.width}x${settings.height}`);
      }

      this.videoElement.srcObject = this.mediaStream;
      await this.videoElement.play();
      logger.add('INFO', 'Video playing');

      this.startQrScanning();
    } catch (err) {
      logger.add('WARN', `Environment camera failed: ${err}`);
      console.error('Camera error:', err);
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
        logger.add('INFO', 'Fallback to user camera OK');
        this.videoElement.srcObject = this.mediaStream;
        await this.videoElement.play();
        this.startQrScanning();
      } catch (fallbackErr) {
        logger.add('ERROR', `All cameras failed: ${fallbackErr}`);
        this.errorMessage = 'Camera Error: ' + fallbackErr;
      }
    }
  }

  private startQrScanning() {
    if (this.scanning) return;
    this.scanning = true;
    logger.add('INFO', 'QR scanning started (interval: 300ms)');

    this.scanInterval = setInterval(async () => {
      if (!this.videoElement || this.videoElement.readyState < 2) return;
      try {
        const result = await QrScanner.scanImage(this.videoElement, {
          returnDetailedScanResult: true
        });
        if (result?.data) {
          logger.add('INFO', `QR decoded: ${result.data.substring(0, 80)}...`);
          decode({ data: result.data });
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
        logger.add('INFO', `Flash ${this.flashOn ? 'ON' : 'OFF'}`);
      } else {
        logger.add('WARN', 'Torch not supported on this device');
        console.warn('Torch not supported on this device');
      }
    } catch (err) {
      logger.add('ERROR', `Flash error: ${err}`);
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

  private toggleDebugLog() {
    logger.toggle();
  }

  render() {
    return html`
      ${this.errorMessage ? html`<div style="position: absolute; z-index: 999; color: white; background: rgba(255,0,0,0.8); padding: 16px; text-align: center; width: 100%; top: 40%; font-weight: bold;">${this.errorMessage}</div>` : ''}
      <div class="video-container">
        <video id="qr-video" playsinline autoplay muted></video>
      </div>
      
      <div class="overlay">
        <div class="header-badge" @click=${this._onHeaderTap} style="pointer-events: auto; cursor: pointer;">
          Powered by
          <svg width="40" height="16" viewBox="0 0 100 40" fill="white" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="30" font-family="Arial" font-weight="bold" font-size="30">QRIS</text>
          </svg>
        </div>

          <div class="scanner-frame">
          </div>
        <div class="floating-buttons">
              <button class="fab" @click=${this.toggleFlash}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#0b1e42" stroke="none"><circle cx="12" cy="12" r="5"/><path stroke="#0b1e42" stroke-width="2" stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              </button>
              <button class="fab">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#0b1e42" stroke="none"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="2.5" fill="white"/><path d="M21 15l-5-5L5 21h14c1.1 0 2-.9 2-2v-4z" fill="white"/></svg>
              </button>
        </div>
      </div>

      <div class="bottom-sheet">
        <div class="utama-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Utama
        </div>
        
        <div class="payment-card">
          <div class="payment-info">
            <div class="payment-details">
              GoPay &bull; <span class="payment-amount">Rp100.000</span>
            </div>
          </div>
          <button class="btn-change">
            Ubah
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <div class="action-cards">
          <button class="action-card">
            Tampilkan QR
          </button>
          <button class="action-card">
           
            QRIS Tap
          </button>
        </div>

        <div class="footer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6.5 2a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
          Pembayaran aman oleh <span class="footer-brand">Telkomsel</span>
        </div>
      </div>
    `;
  }
}
