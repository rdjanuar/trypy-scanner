import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import QrScanner from 'qr-scanner';
import { decode } from './utils/decode';


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
      width: 100%;
      height: 100%;
      object-fit: cover;
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
      margin-bottom: 200px; /* Leave space for bottom sheet */
    }

    .scanner-frame {
      width: 250px;
      height: 250px;
      position: relative;
      /* Box shadow to create dark overlay outside the frame */
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      border-radius: 12px;
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

  private qrScanner?: QrScanner;

  firstUpdated() {
    this.initScanner();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.qrScanner?.destroy();
  }

  private initScanner() {
    if (!this.videoElement) return;

    this.qrScanner = new QrScanner(
      this.videoElement,
        (result) => {
        decode({
          data: result.data,
        })
        console.log('Decoded QR code:', result.data);
        this.dispatchEvent(new CustomEvent('qr-scanned', { detail: result.data }));
      },
      {
        highlightScanRegion: false,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        preferredCamera: 'environment'
      }
    );

    this.qrScanner.start().catch((err) => {
      console.error('Failed to start scanner with environment camera, trying user camera...', err);
      this.qrScanner?.setCamera('user').catch(fallbackErr => {
         console.error('Failed to start user camera:', fallbackErr);
         alert('Unable to access camera. Please ensure permissions are granted. Error: ' + fallbackErr);
      });
    });
  }

  private toggleFlash() {
    if (this.qrScanner) {
      if (this.flashOn) {
        this.qrScanner.turnFlashOff();
        this.flashOn = false;
      } else {
        this.qrScanner.turnFlashOn().then(() => {
          this.flashOn = true;
        }).catch(err => console.warn('Flash not supported', err));
      }
    }
  }

  render() {
    return html`
      <div class="video-container">
        <video id="qr-video"></video>
      </div>
      
      <div class="overlay">
        <div class="header-badge">
          Powered by
          <svg width="40" height="16" viewBox="0 0 100 40" fill="white" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="30" font-family="Arial" font-weight="bold" font-size="30">QRIS</text>
          </svg>
        </div>

        <div class="scanner-frame-wrapper">
          <div class="scanner-frame">
          </div>
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
            <div class="wallet-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5.242 7.222M5 15a2 2 0 0 0 2 2h15V9H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2z"/></svg>
            </div>
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
            <div class="icon-decor">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/><rect width="6" height="6" x="9" y="8" rx="1"/></svg>
            </div>
            Tampilkan QR
          </button>
          <button class="action-card">
            <div class="icon-decor blue-blob">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/><path d="M18 7a5 5 0 0 1 0 10"/><path d="M20 5a9 9 0 0 1 0 14"/></svg>
            </div>
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
