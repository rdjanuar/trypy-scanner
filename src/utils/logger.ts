type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private panel: HTMLElement | null = null;
  private logList: HTMLElement | null = null;
  private visible = false;

  constructor() {
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
    const entry: LogEntry = {
      timestamp: this.getTime(),
      level,
      message
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.visible && this.logList) {
      this.appendLogEntry(entry);
      this.logList.scrollTop = this.logList.scrollHeight;
    }
  }

  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case 'INFO': return '#4fc3f7';
      case 'WARN': return '#ffb74d';
      case 'ERROR': return '#ef5350';
      case 'DEBUG': return '#81c784';
    }
  }

  private appendLogEntry(entry: LogEntry) {
    if (!this.logList) return;
    const line = document.createElement('div');
    line.style.cssText = `
      padding: 4px 8px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 11px;
      line-height: 1.4;
      word-break: break-all;
    `;
    line.innerHTML = `
      <span style="color:#888">${entry.timestamp}</span>
      <span style="color:${this.getLevelColor(entry.level)};font-weight:bold">[${entry.level}]</span>
      <span style="color:#e0e0e0">${entry.message.replace(/</g, '&lt;')}</span>
    `;
    this.logList.appendChild(line);
  }

  private createPanel() {
    if (this.panel) return;

    this.panel = document.createElement('div');
    this.panel.id = 'debug-log-panel';
    this.panel.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 60%;
      background: rgba(0, 0, 0, 0.92);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      font-family: 'Menlo', 'Consolas', monospace;
      backdrop-filter: blur(8px);
      border-bottom: 2px solid #444;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: rgba(255,255,255,0.05);
      border-bottom: 1px solid #333;
    `;
    header.innerHTML = `<span style="color:#4fc3f7;font-size:13px;font-weight:bold">📋 Debug Logs (${this.logs.length})</span>`;

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.cssText = 'background:#333;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:11px;cursor:pointer;';
    clearBtn.onclick = () => this.clear();

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background:#ef5350;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:11px;cursor:pointer;';
    closeBtn.onclick = () => this.hide();

    actions.appendChild(clearBtn);
    actions.appendChild(closeBtn);
    header.appendChild(actions);
    this.panel.appendChild(header);

    // Log list
    this.logList = document.createElement('div');
    this.logList.style.cssText = `
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    `;
    this.panel.appendChild(this.logList);

    document.body.appendChild(this.panel);
  }

  show() {
    this.createPanel();
    if (this.panel) this.panel.style.display = 'flex';
    this.visible = true;

    // Render all existing logs
    if (this.logList) {
      this.logList.innerHTML = '';
      this.logs.forEach(entry => this.appendLogEntry(entry));
      this.logList.scrollTop = this.logList.scrollHeight;
    }
  }

  hide() {
    if (this.panel) this.panel.style.display = 'none';
    this.visible = false;
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  clear() {
    this.logs = [];
    if (this.logList) this.logList.innerHTML = '';
  }
}

export const logger = new Logger();

// Expose globally so you can call it from TCMPP or browser console
(window as any).__debugLogger = logger;
