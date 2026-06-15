import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

@customElement('debug-logger')
export class DebugLogger extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 60%;
      z-index: 99999;
      font-family: 'Menlo', 'Consolas', monospace;
      display: none;
    }

    :host([open]) {
      display: flex;
      flex-direction: column;
    }

    .panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: rgba(0, 0, 0, 0.92);
      backdrop-filter: blur(8px);
      border-bottom: 2px solid #444;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: rgba(255,255,255,0.05);
      border-bottom: 1px solid #333;
    }

    .header-label {
      color: #4fc3f7;
      font-size: 13px;
      font-weight: bold;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      border: none;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      color: #fff;
    }

    .btn-clear { background: #333; }
    .btn-close { background: #ef5350; }

    .log-list {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    .log-entry {
      padding: 4px 8px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 11px;
      line-height: 1.4;
      word-break: break-all;
    }

    .ts { color: #888; }
    .msg { color: #e0e0e0; }
    .level-INFO { color: #4fc3f7; font-weight: bold; }
    .level-WARN { color: #ffb74d; font-weight: bold; }
    .level-ERROR { color: #ef5350; font-weight: bold; }
    .level-DEBUG { color: #81c784; font-weight: bold; }
  `;

  @state()
  private logs: LogEntry[] = [];

  private maxLogs = 100;

  connectedCallback() {
    super.connectedCallback();
    this.interceptConsole();
    this.interceptErrors();
  }

  private interceptConsole() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args: any[]) => {
      this.add('INFO', args.map(a => this.stringify(a)).join(' '));
      originalLog.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      this.add('WARN', args.map(a => this.stringify(a)).join(' '));
      originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      this.add('ERROR', args.map(a => this.stringify(a)).join(' '));
      originalError.apply(console, args);
    };
  }

  private interceptErrors() {
    window.addEventListener('error', (e) => {
      this.add('ERROR', `[Uncaught] ${e.message} at ${e.filename}:${e.lineno}`);
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.add('ERROR', `[UnhandledPromise] ${this.stringify(e.reason)}`);
    });
  }

  private stringify(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    try {
      return JSON.stringify(value, null, 0);
    } catch {
      return String(value);
    }
  }

  private getTime(): string {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  }

  add(level: LogLevel, message: string) {
    const entry: LogEntry = { timestamp: this.getTime(), level, message };
    this.logs = [...this.logs, entry].slice(-this.maxLogs);
  }

  toggle() {
    if (this.hasAttribute('open')) {
      this.removeAttribute('open');
    } else {
      this.setAttribute('open', '');
      this.updateComplete.then(() => {
        const list = this.shadowRoot?.querySelector('.log-list');
        if (list) list.scrollTop = list.scrollHeight;
      });
    }
  }

  private clear() {
    this.logs = [];
  }

  private close() {
    this.removeAttribute('open');
  }

  render() {
    return html`
      <div class="panel">
        <div class="header">
          <span class="header-label">📋 Debug Logs (${this.logs.length})</span>
          <div class="actions">
            <button class="btn btn-clear" @click=${this.clear}>Clear</button>
            <button class="btn btn-close" @click=${this.close}>✕</button>
          </div>
        </div>
        <div class="log-list">
          ${this.logs.map(entry => html`
            <div class="log-entry">
              <span class="ts">${entry.timestamp}</span>
              <span class="level-${entry.level}">[${entry.level}]</span>
              <span class="msg">${entry.message}</span>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}

// Singleton instance — gets created when imported and appended to body
let _instance: DebugLogger | null = null;

function getInstance(): DebugLogger {
  if (!_instance) {
    _instance = document.createElement('debug-logger') as DebugLogger;
    document.body.appendChild(_instance);
  }
  return _instance;
}

export const logger = {
  add(level: LogLevel, message: string) {
    getInstance().add(level, message);
  },
  toggle() {
    getInstance().toggle();
  }
};

// Expose globally for TCMPP / browser console
(window as any).__debugLogger = logger;
