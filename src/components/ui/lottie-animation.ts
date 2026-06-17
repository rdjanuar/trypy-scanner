import lottie from 'lottie-web/build/player/lottie_light.js';

@customElement('lottie-animation')
export class LottieAnimation extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 300px;
      height: 300px;
    }
    #lottie-container {
      width: 100%;
      height: 100%;
    }
  `;

  @property({ type: String })
  src = '';

  @property({ type: Object })
  animationData?: any;

  containerRef = createRef<HTMLDivElement>();
  animationInstance: any = null;

  firstUpdated() {
    if (!this.containerRef.value) return;
    
    const config: any = {
      container: this.containerRef.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
    };

    if (this.animationData) {
      config.animationData = this.animationData;
    } else if (this.src) {
      config.path = this.src;
    }

    this.animationInstance = lottie.loadAnimation(config);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.animationInstance) {
      this.animationInstance.destroy(); 
    }
  }

  render() {
    return html`<div ${ref(this.containerRef)} id="lottie-container"></div>`;
  }
}
