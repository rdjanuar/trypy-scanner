@customElement('home-page')
export class HomePage extends LitElement {
  protected render() {
    return html`<qris-scanner></qris-scanner>`
  }
}
