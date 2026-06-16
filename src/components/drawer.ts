import { drawerTheme } from '../themes/drawer';

const TwLitElement = TW(LitElement);

const drawerTv = tv({
  extend: drawerTheme
})

@customElement('ui-drawer')
export class UiDrawer extends TwLitElement {
  @property({ type: String }) direction: 'right' | 'left' | 'top' | 'bottom' = 'right';
  @property({ type: String }) title = '';
  @property({ type: String }) description = '';
  @property({ type: Boolean }) overlay = true;
  @property({ type: Boolean }) dismissible = true;
  @property({ type: Boolean }) open = false;
  @property({ type: Object }) ui: ExtractUi<typeof drawerTheme> = {};
  @property() portal: boolean | string | HTMLElement = false;

  @state() private _renderState = false;

  willUpdate(changedProperties: Map<string, any>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        this._renderState = true;
      }
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('open')) {
      if (!this.open) {
        setTimeout(() => {
          this._renderState = false;
        }, 300);
      }
    }
  }

  private close() {
    if (this.dismissible) {
      this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    }
  }

  private renderContent() {
    const theme = drawerTv({ 
      direction: this.direction, 
      isOpen: this.open,
    });

    return html`
      <div class=${theme.wrapper({
        class: this.ui?.wrapper
      })}>
        ${this.overlay ? html`
          <div class=${theme.overlay({
            class: this.ui?.overlay
          })} @click=${this.close}></div>
        ` : nothing}
        
        <div class=${theme.base({
          class: this.ui?.base
        })} role="dialog" aria-modal="true">
          <slot name="header">
            ${this.title || this.description ? html`
              <div class=${theme.header({
                class: this.ui?.header
              })}>
                <slot name="title">
                  ${this.title ? html`<h2 class=${theme.title({
                    class: this.ui?.title
                  })}>${this.title}</h2>` : nothing}
                </slot>
                <slot name="description">
                  ${this.description ? html`<p class=${theme.description({
                    class: this.ui?.description
                  })}>${this.description}</p>` : nothing}
                </slot>
              </div>
            ` : nothing}
          </slot>

          <div class=${theme.body({
            class: this.ui?.body
          })}>
            <slot></slot>
            <slot name="body"></slot>
          </div>
        </div>
      </div>
    `;
  }

  protected render() {
    if (!this.open && !this._renderState) {
      return nothing;
    }

    if (this.portal === false) {
      return this.renderContent();
    }

    return html`${portal(this.renderContent(), this.portal)}`;
  }
}
