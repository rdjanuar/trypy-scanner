import type { AppRouter } from './contexts/router.context'
import './pages/index'
import './pages/payment'

const TwLitElement = TW(LitElement)

@customElement('app-root')
export class AppRoot extends TwLitElement {
  private router = new Router(this, [
    {
      path: '/',
      render: () => html`<home-page></home-page>`,
    },
    {
      path: '/payment',
      render: () => {
        const querParams = Object.fromEntries(new URLSearchParams(window.location.search))

        return html`<payment-page .query=${querParams}></payment-page>`
      },
    },
  ])

  @provide({ context: routerContext })
  private appRouter: AppRouter = {
    goto: (path: string) => {
      const navigate = () => {
        window.history.pushState({}, '', path)
        this.router.goto(path)
      }

      if (document.startViewTransition) {
        document.startViewTransition(() => navigate())
      } else {
        navigate()
      }
    },
  }

  protected render() {
    void this.appRouter
    return html`${this.router.outlet()}`
  }
}
