const TwLitElement = TW(LitElement)

@customElement('transaction-page')
export class TransactionPage extends TwLitElement {
  @provide({ context: loggerContext })
  logger: ILogger = logger

  protected render(): unknown {
    return html`<div class="text-red-500">Transaction page</div>`
  }
}
