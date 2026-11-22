import { Component, type ReactNode } from 'react'
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return (<div style={{ padding: 16, fontFamily: 'sans-serif' }}><h2>GroceryOS error</h2>
      <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>{this.state.error.message}{'\n'}{this.state.error.stack}</pre></div>)
  }
}
