import { Router } from '@lit-labs/router';
import type { AppRouter } from './contexts/router.context';
import './pages/index'

const TwLitElement = TW(LitElement);

@customElement('app-root')
export class AppRoot extends TwLitElement {
  private router = new Router(this, [
    {
      path: '/',
      render: () => html`<home-page></home-page>`,
    },
    {
      path: '/about',
      render: () => html`<p class="text-red-500">about</p>`
    }
  ]);

  @provide({ context: routerContext })
  private appRouter: AppRouter = {
    goto: (path: string) => {
      const navigate = () => {
        window.history.pushState({}, '', path);
        this.router.goto(path);
      };

      if (document.startViewTransition) {
        document.startViewTransition(() => navigate());
      } else {
        navigate();
      }
    }
  };

  protected render() {
    void this.appRouter;
    return html`${this.router.outlet()}`;
  }
}
