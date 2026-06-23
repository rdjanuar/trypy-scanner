const TwLitElement = TW(LitElement)

@customElement('transaction-page')
export class TransactionPage extends TwLitElement {
  @provide({ context: loggerContext })
  logger: ILogger = logger
}
