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

  // Strict slot-aware drops: a compound parent (one whose catalog entry
  // seeds children — Card, Tabs, Accordion, etc.) is *not* a drop target
  // at its own wrapper level. Drops route into its visible subcomponents
  // (CardContent, TabsContent, …) whose own acceptsChildren handles the
  // routing. This prevents structural mistakes like dropping a Field as
  // a direct child of Card.
  const isCompound = !!entry?.defaultChildren?.length
  const acceptsDrop = entry?.acceptsChildren === true && !isCompound
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
    // Dashed accent outline when a drop is in progress over a valid container
    // — reads as "this is where it'll land."
    isOver && acceptsDrop
      ? 'outline-dashed outline-2 outline-offset-2 outline-blue-400 bg-blue-50/40'
      : '',
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

  // Render children. Non-compound containers interleave GapDropZones so
  // users can drop between siblings; compound parents (Card, Tabs, …)
  // skip gaps so random components can't be injected between their DS
  // structural children (CardHeader / CardContent / CardFooter).
  const childFlow = entry.childFlow ?? 'column'
  const showGaps = !isCompound
  let renderedChildren: ReactNode = null
  if (entry.textChild) {
    renderedChildren = (node.props.children as string | undefined) ?? ''
  } else if (node.children.length > 0) {
    if (!showGaps) {
      renderedChildren = node.children.map((child) => (
        <RenderNode
          key={child.id}
          node={child}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))
    } else {
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
