import connectIlustrationJson from '../assets/lotties/connected-success.json'

const TwLitElement = TW(LitElement)

@customElement('payment-page')
export class PaymentPage extends TwLitElement {
  @provide({ context: loggerContext })
  logger: ILogger = logger

  @property({ type: Object })
  query = {} as Record<string, any>

  private onNavigate() {
    logger.add('INFO', 'Navigate Clicked')
    const wx = window.wx.miniProgram
    wx.reLaunch({
      url: '/pages/finance/index',
      success: () => {
        logger.add('DEBUG', 'Success Navigate to miniProgram')
      },
      fail: () => {
        logger.add('ERROR', 'Fail Navigate to miniProgram')
        wx.switchTab({
          url: '/pages/finance/index',
        })
      },
    })
  }

  firstUpdated() {
    if (window.wx?.miniProgram?.sendWebviewEvent) {
      logger.add('DEBUG', 'sendWebviewEvent QR readyState')
      window.wx.miniProgram.sendWebviewEvent({
        scope: 'payment_success',
        action: 'request_auth_code',
        payload: {
          authCode: this.query.authCode,
        },
      })
    } else {
      logger.add('ERROR', 'Failed to send QR: window.wx.miniProgram.sendWebviewEvent is undefined')
    }
  }

  protected render() {
    return html`
      <div class="h-dvh flex flex-col">
        <div class="flex-1 h-full justify-center items-center flex-col flex">
          <div class="mb-1">
            <lottie-animation .animationData=${connectIlustrationJson} width="350px" height="350px"></lottie-animation>
          </div>
          <h1 class="text-base font-semibold text-center text-primary">
            ${uppercaseFirstLetter(this.query.payment_info)} Telah terhubung
          </h1>
          <p class="whitespace-pre-line text-center text-sm text-secondary">
            ${`Sekarang pembayaran jadi lebih mudah di \n transaksi berikutnya`}
          </p>
        </div>
        <div class="w-full pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 px-4">
          <ui-button block size="xl" @click=${this.onNavigate}> Kembali Ke Keuangan </ui-button>
        </div>
      </div>
    `
  }
}
