import { createContext } from '@lit/context';

export interface AppRouter {
  goto(path: string): void;
}

export const routerContext = createContext<AppRouter>('router');
