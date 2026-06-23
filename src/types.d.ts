declare global {
  interface Window {
    wx: any
    tcsas: any
  }
}

export type Status = 'idle' | 'loading' | 'success' | 'error'
