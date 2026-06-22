let _instance: DebugLogger | undefined

function getInstance(): DebugLogger {
  if (!_instance) {
    _instance = document.createElement('debug-logger') as DebugLogger

    document.body.appendChild(_instance)
    return _instance
  }
  return _instance
}

export const logger: ILogger = {
  add(level: LogLevel, message: string) {
    getInstance().add(level, message)
  },
  toggle() {
    getInstance().toggle()
  },
}

;(window as any).__debugLogger = logger
