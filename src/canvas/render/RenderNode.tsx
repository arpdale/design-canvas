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
import { GapDropZone } from './GapDropZone'

interface RenderNodeProps {
  node: CompositionNode
  selectedId: string | null
  onSelect: (id: string) => void
}

export function RenderNode({ node, selectedId, onSelect }: RenderNodeProps) {
  const entry = getEntry(node.type)

  const {
    setNodeRef: setDragRef,
    listeners,
    attributes,
    isDragging,
  } = useDraggable({
    id: `node:${node.id}`,
    data: { kind: 'node', id: node.id, type: node.type },
  })

  const acceptsDrop = entry?.acceptsChildren === true
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dropTargetId({ kind: 'container', parentId: node.id }),
    disabled: !acceptsDrop,
  })

  const setRef = (el: HTMLDivElement | null) => {
    setDragRef(el)
    setDropRef(el)
  }

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
    isOver && acceptsDrop ? 'ring-2 ring-blue-300 bg-blue-50/40' : '',
    isDragging ? 'opacity-40' : '',
  ]
    .filter(Boolean)
    .join(' ')

  // Unknown component — amber tile.
  if (!entry) {
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

  // Render children — interleave GapDropZones so users can drop between
  // siblings (reorder / insert). Gaps are only visible during a drag.
  const childFlow = entry.childFlow ?? 'column'
  let renderedChildren: ReactNode = null
  if (entry.textChild) {
    renderedChildren = (node.props.children as string | undefined) ?? ''
  } else if (node.children.length > 0) {
    const interleaved: ReactNode[] = []
    for (let i = 0; i < node.children.length; i++) {
      interleaved.push(
        <GapDropZone
          key={`gap-${i}`}
          parentId={node.id}
          index={i}
          flow={childFlow}
        />
      )
      interleaved.push(
        <RenderNode
          key={node.children[i].id}
          node={node.children[i]}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )
    }
    interleaved.push(
      <GapDropZone
        key={`gap-end`}
        parentId={node.id}
        index={node.children.length}
        flow={childFlow}
      />
    )
    renderedChildren = interleaved
  }

  // Structural entries (Row, Stack): render as plain HTML with computed
  // classes. Not DS components. Empty ones get a min drop-target size in
  // the canvas only — the export keeps the classes clean.
  if (entry.structural) {
    const { tag, classes } = entry.structural
    const canvasOnly = node.children.length === 0 ? 'min-h-10 min-w-24' : ''
    const composed = [classes(node.props), canvasOnly, wrapperClass]
      .filter(Boolean)
      .join(' ')
    return createElement(
      tag,
      {
        ref: setRef,
        'data-testid': `render-node-${node.id}`,
        'data-node-id': node.id,
        'data-node-type': node.type,
        className: composed,
        onClick: handleClick,
        onPointerDown: handlePointerDown,
        ...listeners,
        ...attributes,
      },
      renderedChildren
    )
  }

  // DS-backed entries.
  const Component = getComponent(node.type)
  if (!Component) {
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
