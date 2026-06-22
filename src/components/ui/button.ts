import { type VariantProps } from 'tailwind-variants'
import { buttonTheme } from '../../themes/button'
import type { ExtractUi } from '../../libs/tv'

const TwLitElement = TW(LitElement)

const buttonTv = tv({
  extend: buttonTheme,
})

type ButtonVariants = VariantProps<typeof buttonTv>
type ButtonUi = ExtractUi<typeof buttonTv>

@customElement('ui-button')
export class UiButton extends TwLitElement {
  @property({ type: String }) variant: ButtonVariants['variant'] = 'solid'
  @property({ type: String }) color: ButtonVariants['color'] = 'primary'
  @property({ type: String }) size: ButtonVariants['size'] = 'md'
  @property({ type: Boolean }) block = false
  @property({ type: Boolean }) disabled = false
  @property({ type: Boolean }) loading = false
  @property({ type: Boolean, attribute: 'loading-auto' }) loadingAuto = false
  @property({ type: String }) type: 'button' | 'submit' | 'reset' = 'button'
  @property({ type: Object }) ui: Partial<ButtonUi> = {}

  @state() private _internalLoading = false

  private get _isPending() {
    return this.loading || this._internalLoading
  }

  private async _handleClick(e: Event) {
    if (this._isPending || this.disabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    if (this.loadingAuto) {
      this._internalLoading = true
      try {
        const detail = { event: e, complete: Promise.resolve() }
        const customEvent = new CustomEvent('button-click', {
          detail,
          bubbles: true,
          composed: true,
        })
        this.dispatchEvent(customEvent)
        await detail.complete
      } finally {
        this._internalLoading = false
      }
    }
  }

  protected render() {
    const theme = buttonTv({
      variant: this.variant,
      color: this.color,
      size: this.size,
      block: this.block,
      disabled: this.disabled,
      loading: this._isPending,
    })

    const loadingIconSvg = html`
      <svg
        class=${theme.loadingIcon({ class: this.ui?.loadingIcon })}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    `

    return html`
      <button
        data-slot="button"
        class=${theme.base({ class: [this.ui?.base] })}
        ?disabled=${this.disabled || this._isPending}
        type=${this.type}
        @click=${this._handleClick}
      >
        ${this._isPending ? loadingIconSvg : html`<slot name="leading"></slot>`}
        <slot></slot>
        <slot name="trailing"></slot>
      </button>
    `
  }
}
