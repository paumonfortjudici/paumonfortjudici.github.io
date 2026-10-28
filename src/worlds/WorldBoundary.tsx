// If a world chunk fails to load (offline, a bad deploy) the visitor still gets the shell, a plain message and a retry.
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { UI } from '../lib/copy'

interface Props {
  slug: string
  children: ReactNode
}

export default class WorldBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(`World "${this.props.slug}" failed to load`, error, info.componentStack)
  }

  // a failed dynamic import is cached by the browser for the rest of the page's life, so a reload is the only honest retry
  // (the hash keeps the visitor on the same folder)
  private retry = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="pm-leader pm-leader--failed" role="alert">
        <p className="pm-leader-text t-label">{UI.world.failed}</p>
        <button type="button" className="pm-leader-retry t-label" onClick={this.retry}>
          {UI.world.retry}
        </button>
      </div>
    )
  }
}
