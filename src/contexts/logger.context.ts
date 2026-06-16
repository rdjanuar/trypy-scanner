import { createContext } from '@lit/context';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface ILogger {
  add(level: LogLevel, message: string): void;
  toggle(): void;
}

export const loggerContext = createContext<ILogger>('logger');
