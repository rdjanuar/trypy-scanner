interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

const TwLitElement = TW(LitElement);

const levelClasses: Record<LogLevel, string> = {
  INFO: 'text-[#4fc3f7] font-bold',
  WARN: 'text-[#ffb74d] font-bold',
  ERROR: 'text-[#ef5350] font-bold',
  DEBUG: 'text-[#81c784] font-bold',
};

@customElement('debug-logger')
export class DebugLogger extends TwLitElement implements ILogger {

  @state()
  private logs: LogEntry[] = [];

  private maxLogs = 100;

  constructor() {
    super();
    this.interceptConsole();
    this.interceptErrors();
  }

  private _intercepted = false;

  private interceptConsole() {
    if (this._intercepted) return;
    this._intercepted = true;
    
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

  @state()
  private open = false;

  toggle() {
    this.open = !this.open;
    if (this.open) {
      this.updateComplete.then(() => {
        requestAnimationFrame(() => {
          const list = this.shadowRoot?.querySelector('.log-list');
          if (list) list.scrollTop = list.scrollHeight;
        });
      });
    }
  }

  private clear() {
    this.logs = [];
  }

  private async copyMessage(e: Event, message: string) {
    const btn = e.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(message);
      const original = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = original; }, 1000);
    } catch {
    }
  }

  private close() {
    this.open = false;
  }

  protected render() {
    return html`
      <ui-drawer 
        .open=${this.open} 
        direction="bottom" 
        @close=${this.close}
        .ui=${{
          wrapper: 'z-[99999]',
          base: 'w-full h-[60vh] max-h-[60vh] bg-black/92 backdrop-blur-sm border-b-2 border-zinc-700 pointer-events-auto rounded-none',
          body: 'p-0 flex-1 overflow-y-auto',
          header: 'p-0',
        }}
      >
        <div slot="header" class="flex justify-between items-center py-2 px-3 bg-white/5 border-b border-zinc-800 font-mono">
          <span class="text-[#4fc3f7] text-[13px] font-bold">📋 Debug Logs (${this.logs.length})</span>
          <div class="flex gap-2">
            <button class="border-none py-1 px-2.5 rounded text-[11px] cursor-pointer text-white bg-zinc-800 hover:bg-zinc-700" @click=${this.clear}>Clear</button>
            <button class="border-none py-1 px-2.5 rounded text-[11px] cursor-pointer text-white bg-red-500 hover:bg-red-600" @click=${this.close}>✕</button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto log-list font-mono h-full">
        ${map(this.logs, (log) =>  html`
            <div class="group flex items-start gap-1 py-1 px-2 border-b border-white/5 text-[11px] leading-[1.4] break-all">
              <div class="flex-1">
                <span class="text-zinc-500">${log.timestamp}</span>
                <span class="${levelClasses[log.level]}">[${log.level}]</span>
                <span class="text-zinc-300">${log.message}</span>
              </div>
              <button
                class="shrink-0 border-none bg-transparent text-zinc-600 hover:text-zinc-300 cursor-pointer text-[11px] p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy message"
                @click=${(e: Event) => this.copyMessage(e, log.message)}
              >📋</button>
            </div>
        `)}
        </div>
      </ui-drawer>
    `;
  }
}