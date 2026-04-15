import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  /** Node id being rendered — surfaced in the error state for debugging. */
  nodeId: string
  /** Catalog type name — helps identify which component threw. */
  nodeType: string
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Wraps every rendered DS component. When a component throws, this boundary
 * shows a small error tile instead of crashing the canvas — the rest of
 * the tree keeps rendering.
 *
 * This is the mitigation that makes Model A safe at MVP scale
 * (technical-approach.md §6).
 */
export class ComponentErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep this minimal — no secrets, per SECURITY.md.
    console.warn(
      `[canvas] component "${this.props.nodeType}" (${this.props.nodeId}) failed to render:`,
      error.message,
      info.componentStack
    )
  }

  render() {
    if (this.state.error) {
      return (
        <div
          data-testid={`render-error-${this.props.nodeId}`}
          data-node-id={this.props.nodeId}
          className="inline-flex items-center gap-2 px-2 py-1 rounded border border-red-300 bg-red-50 text-xs text-red-800"
        >
          <span className="font-mono">{this.props.nodeType}</span>
          <span className="text-red-500">render failed</span>
        </div>
      )
    }
    return this.props.children
  }
}
