const TwLitElement = TW(LitElement);

@customElement('payment-selector-drawer')
export class PaymentSelectorDrawer extends TwLitElement {
  @property({ type: Boolean }) open = false;

  @state()
  private selectedMethod = 'linkaja';

  private _onClose() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private _onSelectMethod(method: string) {
    if (method === 'gopay') return; // Disabled
    this.selectedMethod = method;
  }

  private _onSubmit() {
    this.dispatchEvent(new CustomEvent('select', { 
      detail: { method: this.selectedMethod },
      bubbles: true, 
      composed: true 
    }));
    this._onClose();
  }

  protected render() {
    return html`
      <ui-drawer direction="bottom" ?open=${this.open} @close=${this._onClose}>
        <div slot="header" class="flex items-center justify-between px-4 py-4 pt-6">
          <h2 class="text-strong text-base font-semibold">Mau scan QRIS pakai apa?</h2>
          <button @click=${this._onClose} class="flex items-center justify-center size-8 rounded-full bg-page text-secondary cursor-pointer hover:bg-stroke border-none outline-none">
            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col gap-0">
          <div class="flex items-center justify-between py-4 border-b border-stroke cursor-pointer" @click=${() => this._onSelectMethod('linkaja')}>
            <div class="flex items-center gap-3">
              <div class="size-[42px] rounded-[10px] bg-[#E62129] flex flex-col items-center justify-center text-white font-bold leading-none italic shadow-sm" style="font-family: Arial, sans-serif;">
                <span class="text-[11px] mt-0.5">Link</span>
                <span class="text-[11px]">Aja!</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <div class="flex items-center gap-2">
                  <span class="text-strong font-bold">LinkAja</span>
                  <span class="bg-[#F8A031] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Utama</span>
                </div>
                <span class="text-disabled text-[13px] font-medium">Rp20.000.000</span>
              </div>
            </div>
            <input type="radio" name="paymentMethod" value="linkaja" class="size-5 accent-[#00204A] cursor-pointer" .checked=${this.selectedMethod === 'linkaja'} @change=${() => this._onSelectMethod('linkaja')} />
          </div>

          <!-- GoPay -->
          <div class="flex items-center justify-between py-4 border-b border-stroke cursor-not-allowed opacity-75">
            <div class="flex items-center gap-3">
              <div class="size-[42px] rounded-[10px] bg-[#00AED6] flex items-center justify-center text-white shadow-sm">
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-strong font-bold">GoPay</span>
                <span class="text-red-600 text-[13px] font-medium">Rp0 (Tidak Cukup)</span>
              </div>
            </div>
            <input type="radio" name="paymentMethod" value="gopay" class="appearance-none size-5 rounded-full border-[5px] border-disabled bg-stroke cursor-not-allowed" disabled />
          </div>

          <!-- DANA -->
          <div class="flex items-center justify-between py-4 border-b border-stroke cursor-pointer" @click=${() => this._onSelectMethod('dana')}>
            <div class="flex items-center gap-3">
              <div class="size-[42px] rounded-[10px] bg-[#118EEA] flex items-center justify-center text-white font-bold italic text-sm shadow-sm" style="font-family: Arial, sans-serif;">
                <svg class="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-strong font-bold">DANA</span>
                <span class="text-disabled text-[13px] font-medium">Rp500.000</span>
              </div>
            </div>
            <input type="radio" name="paymentMethod" value="dana" class="size-5 accent-[#00204A] cursor-pointer" .checked=${this.selectedMethod === 'dana'} @change=${() => this._onSelectMethod('dana')} />
          </div>

        </div>
         <div slot="footer">
            <ui-button variant="solid" color="destructive" block size="xl" @click=${this._onSubmit} class="shadow-lg" ui=${JSON.stringify({ base: 'rounded-full text-[15px]' })}>
              Pilih Pembayaran
            </ui-button>
          </div>
      </ui-drawer>
    `;
  }
}
