const TwLitElement = TW(LitElement);

@customElement('transaction-error-dialog')
export class TransactionErrorDialog extends TwLitElement {
  @property({ type: Boolean })
  open = false;

  private _handleClose() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private _handleRetry() {
    this.dispatchEvent(new CustomEvent('retry', { bubbles: true, composed: true }));
    this._handleClose();
  }

  protected render() {
    return html`
      <ui-drawer 
        ?open=${this.open} 
        direction="bottom" 
        @close=${this._handleClose}
      >
        <div class="flex flex-col items-center text-center pt-6 pb-2 px-2">
          <!-- Image Placeholder -->
          <div class="w-[200px] h-[200px] bg-gray-100 rounded-2xl mb-6 flex items-center justify-center">
            <span class="text-gray-400 text-sm">Image Placeholder</span>
          </div>
          
          <h3 class="text-lg font-bold text-strong mb-3">Gagal memproses transaksi</h3>
          
          <p class="text-secondary text-sm mb-8 px-4 leading-relaxed">
            Maaf, terjadi kesalahan saat memproses transaksi. Silakan coba lagi.
          </p>
          
          <div class="w-full">
            <ui-button 
              color="primary" 
              block 
              size="xl"
              @click=${this._handleRetry}
            >
              Coba Lagi
            </ui-button>
          </div>
        </div>
      </ui-drawer>
    `;
  }
}
