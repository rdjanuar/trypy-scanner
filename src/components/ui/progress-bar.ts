import { type VariantProps } from 'tailwind-variants';
import { progressBarTheme } from '../../themes/progress-bar';
import type { ExtractUi } from '../../libs/tv';

const TwLitElement = TW(LitElement);

const progressBarTv = tv({
  extend: progressBarTheme
});

type ProgressBarVariants = VariantProps<typeof progressBarTv>;
type ProgressBarUi = ExtractUi<typeof progressBarTv>;

@customElement('ui-progress-bar')
export class UiProgressBar extends TwLitElement {
  @property({ type: Number }) value = 0;
  @property({ type: Number }) max = 100;
  @property({ type: String }) size: ProgressBarVariants['size'] = 'md';
  @property({ type: Object }) ui: Partial<ProgressBarUi> = {};

  protected render() {
    const theme = progressBarTv({
      size: this.size,
    });

    const percentage = Math.min(100, Math.max(0, (this.value / this.max) * 100));

    return html`
      <div class=${theme.base({ class: [this.ui?.base] })} role="progressbar" aria-valuenow=${this.value} aria-valuemin="0" aria-valuemax=${this.max}>
        <div 
          class=${theme.indicator({ class: [this.ui?.indicator] })} 
          style=${`width: ${percentage}%`}
        ></div>
      </div>
    `;
  }
}
