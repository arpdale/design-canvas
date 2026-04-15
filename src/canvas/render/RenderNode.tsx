import {
  createElement,
  type PointerEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { CompositionNode } from '../../composition'
import { getEntry } from '../../catalog'
import { getComponent } from './registry'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { dropTargetId } from '../dnd/dropTarget'

interface RenderNodeProps {
  node: CompositionNode
  selectedId: string | null
  onSelect: (id: string) => void
}

export function RenderNode({ node, selectedId, onSelect }: RenderNodeProps) {
  const entry = getEntry(node.type)
  const Component = getComponent(node.type)

  // Make every rendered node a drag source (for reorder/move).
  const {
    setNodeRef: setDragRef,
    listeners,
    attributes,
    isDragging,
  } = useDraggable({
    id: `node:${node.id}`,
    data: { kind: 'node', id: node.id, type: node.type },
  })

  // Compound containers and generic-children containers are drop targets.
  const acceptsDrop = entry?.acceptsChildren === true
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dropTargetId({ kind: 'container', parentId: node.id }),
    disabled: !acceptsDrop,
  })

  // Merge drag + drop refs onto the same wrapper.
  const setRef = (el: HTMLDivElement | null) => {
    setDragRef(el)
    setDropRef(el)
  }

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Let dnd-kit's listeners handle drag activation; only block the native
    // default (focus theft, text selection).
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
    isOver && acceptsDrop ? 'ring-2 ring-blue-300 bg-blue-50/40' : '',
    isDragging ? 'opacity-40' : '',
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

  let renderedChildren: ReactNode = null
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

  const { children: _dropChildren, ...propsForDS } = node.props
  void _dropChildren

  return (
    <div
      ref={setRef}
      data-testid={`render-node-${node.id}`}
      data-node-id={node.id}
      data-node-type={node.type}
      className={wrapperClass}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      {...listeners}
      {...attributes}
    >
      <ComponentErrorBoundary nodeId={node.id} nodeType={node.type}>
        {createElement(Component, propsForDS, renderedChildren)}
      </ComponentErrorBoundary>
    </div>
  )
}
