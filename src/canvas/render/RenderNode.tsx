import { createElement, type PointerEvent, type MouseEvent } from 'react'
import type { CompositionNode } from '../../composition'
import { getEntry } from '../../catalog'
import { getComponent } from './registry'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'

interface RenderNodeProps {
  node: CompositionNode
  selectedId: string | null
  onSelect: (id: string) => void
}

/**
 * Renders a single composition node as a live DS component, wrapped in:
 *   - An error boundary (per-component, per technical-approach.md)
 *   - An edit-mode selection wrapper that intercepts pointer events so
 *     buttons don't fire, inputs don't steal focus, links don't navigate
 *
 * Pure presentation — delegates selection and tree state to its caller.
 * Never imports from src/composition/ mutation APIs; state lives above.
 */
export function RenderNode({ node, selectedId, onSelect }: RenderNodeProps) {
  const entry = getEntry(node.type)
  const Component = getComponent(node.type)

  // Edit-mode event interception: swallow native pointer behavior so the
  // canvas is a selection surface, not a live interactive UI.
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
  }
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onSelect(node.id)
  }

  const isSelected = selectedId === node.id
  const wrapperClass = [
    'relative inline-block max-w-full',
    isSelected ? 'outline outline-2 outline-offset-2 outline-blue-500' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (!entry || !Component) {
    return (
      <div
        data-testid={`render-unknown-${node.id}`}
        data-node-id={node.id}
        className="inline-flex items-center gap-2 px-2 py-1 rounded border border-amber-300 bg-amber-50 text-xs text-amber-900"
      >
        <span className="font-mono">{node.type}</span>
        <span className="text-amber-700">unknown component</span>
      </div>
    )
  }

  // Render children. Text-child components use props.children as a string;
  // container components render their children as nested RenderNodes.
  let renderedChildren: React.ReactNode = null
  if (entry.textChild) {
    renderedChildren = (node.props.children as string | undefined) ?? ''
  } else if (node.children.length > 0) {
    renderedChildren = node.children.map((child) => (
      <RenderNode
        key={child.id}
        node={child}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    ))
  }

  // Build the props we actually pass to the DS component. For text-child
  // components, `children` is synthesized from the string prop, so we
  // must drop it from the spread.
  const { children: _dropChildren, ...propsForDS } = node.props
  void _dropChildren

  return (
    <div
      data-testid={`render-node-${node.id}`}
      data-node-id={node.id}
      data-node-type={node.type}
      className={wrapperClass}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
    >
      <ComponentErrorBoundary nodeId={node.id} nodeType={node.type}>
        {createElement(Component, propsForDS, renderedChildren)}
      </ComponentErrorBoundary>
    </div>
  )
}
