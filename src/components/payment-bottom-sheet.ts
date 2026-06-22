import secureIcon from '../assets/icons/secure.svg'

const TwLitElement = TW(LitElement)

@customElement('payment-bottom-sheet')
export class PaymentBottomSheet extends TwLitElement {
  @consume({ context: loggerContext })
  @property({ attribute: false })
  public logger?: ILogger

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
  `

  @property({ type: String })
  paymentMethod = 'GoPay'

  @property({ type: Number })
  balance = 100000

  private _resizeObserver?: ResizeObserver

  @query('.sheet-root')
  private sheetRoot!: HTMLDivElement

  firstUpdated() {
    if (this.sheetRoot) {
      this._resizeObserver = new ResizeObserver(([entry]) => {
        const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
        this.dispatchEvent(
          new CustomEvent('sheet-resize', {
            detail: { height },
            bubbles: true,
            composed: true,
          }),
        )
      })
      this._resizeObserver.observe(this.sheetRoot)
    }
  }

  @state()
  isDrawerOpen = false

  private _onUbahClick() {
    logger.add('DEBUG', 'Change Payment Method clicked')
    this.isDrawerOpen = true
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._resizeObserver?.disconnect()
  }

  protected render() {
    return html`
      <div
        class="sheet-root absolute bottom-0 left-0 w-full bg-white rounded-t-2xl px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-4 pointer-events-auto shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      >
        <div class="px-3 py-4 relative border border-stroke rounded-2xl">
          <div class="flex justify-between items-center">
            <div class="flex gap-3 items-center">
              <div class="size-6 bg-red-500"></div>
              <div class="flex gap-1.5 items-center">
                <p class="text-strong text-xs font-semibold">LinkAja</p>
                <div class="size-1.5 rounded-full bg-disabled"></div>
                <p class="text-strong text-xs font-semibold">${formatRupiah(this.balance)}</p>
              </div>
            </div>
            <ui-button variant="ghost" @click="${this._onUbahClick}">Ubah</ui-button>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-center gap-1">
          <img src=${secureIcon} />
          <p class="text-secondary text-xs">Pembayaran aman oleh <span class="font-bold">Telkomsel</span></p>
        </div>
      </div>

      <payment-selector-drawer
        ?open=${this.isDrawerOpen}
        @close=${() => (this.isDrawerOpen = false)}
        @select=${(e: CustomEvent) => {
          this.logger?.add('INFO', `Selected payment method: ${e.detail.method}`)
        }}
      ></payment-selector-drawer>
    `
  }
}
