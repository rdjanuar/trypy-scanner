import type { AppRouter } from '../contexts/router.context';

const TwLitElement = TW(LitElement);

@customElement('payment-bottom-sheet')
export class PaymentBottomSheet extends TwLitElement {

  @consume({context: loggerContext})
  @property({attribute: false})
  public logger?: ILogger

  @consume({ context: routerContext })
  @property({ attribute: false })
  private router?: AppRouter

  static styles = css`
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
  `;

  @property({ type: String })
  paymentMethod = 'GoPay';

  @property({ type: String })
  balance = 'Rp100.000';

  private _onUbahClick() {
    logger.add('DEBUG', 'Change Payment Method clicked')
    this.dispatchEvent(new CustomEvent('change-payment-method', { bubbles: true, composed: true }));
  }

  private _onTampilkanQrClick() {
    logger.add('DEBUG', 'QR Clicked')
    this.dispatchEvent(new CustomEvent('show-qr', { bubbles: true, composed: true }));
  }

  private _onQrisTapClick() {
    logger.add('DEBUG', 'Qris Tap Click')
    this.router?.goto('/about')
    this.dispatchEvent(new CustomEvent('qris-tap', { bubbles: true, composed: true }));
  }

  protected render() {
    return html`
      <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl pt-7 px-5 pb-6 z-4 pointer-events-auto shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div class="absolute -top-3.5 left-5 bg-amber-500 text-white py-1.5 px-3.5 rounded-lg text-[13px] font-semibold flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Utama
        </div>
        
        <div class="flex items-center justify-between border border-gray-300 rounded-2xl p-4 mt-1">
          <div class="flex items-center gap-3">
            <div class="bg-[#00a5cf] text-white w-8 h-8 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5.242 7.222M5 15a2 2 0 0 0 2 2h15V9H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2z"/></svg>
            </div>
            <div class="text-[15px] text-gray-500 font-medium">
              ${this.paymentMethod} &bull; <span class="text-gray-900 font-bold">${this.balance}</span>
            </div>
          </div>
          <button class="text-[#e50025] font-bold text-sm bg-transparent border-none cursor-pointer flex items-center gap-1" @click=${this._onUbahClick}>
            Ubah
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        <div class="flex gap-3 mt-4">
          <button class="flex-1 border border-gray-300 rounded-2xl py-6 px-4 flex flex-col items-center justify-center gap-3 bg-transparent cursor-pointer font-bold text-[15px] text-gray-700" @click=${this._onTampilkanQrClick}>
            <div class="icon-decor relative w-[54px] h-[54px] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/><rect width="6" height="6" x="9" y="8" rx="1"/></svg>
            </div>
            Tampilkan QR
          </button>
          <button class="flex-1 border border-gray-300 rounded-2xl py-6 px-4 flex flex-col items-center justify-center gap-3 bg-transparent cursor-pointer font-bold text-[15px] text-gray-700" @click=${this._onQrisTapClick}>
            <div class="icon-decor blue-blob relative w-[54px] h-[54px] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/><path d="M18 7a5 5 0 0 1 0 10"/><path d="M20 5a9 9 0 0 1 0 14"/></svg>
            </div>
            QRIS Tap
          </button>
        </div>

        <div class="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-gray-400">
          <svg class="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6.5 2a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
          Pembayaran aman oleh <span class="font-bold text-gray-500">Telkomsel</span>
        </div>
      </div>
    `;
  }
}
