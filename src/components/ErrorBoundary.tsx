import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State { error: Error | null; stack?: string }

/** Menangkap error render agar tidak menghasilkan layar putih kosong. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[HMTE] Error render:', error, info.componentStack)
    this.setState({ stack: info.componentStack ?? undefined })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '40px auto' }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Terjadi kesalahan saat menampilkan halaman</h1>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#fef2f2', color: '#991b1b', padding: 12, borderRadius: 8, fontSize: 13 }}>
          {this.state.error.message}
          {this.state.stack}
        </pre>
        <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 16px' }}>Muat ulang</button>
      </div>
    )
  }
}
