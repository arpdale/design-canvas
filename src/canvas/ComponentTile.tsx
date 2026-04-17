import { createElement } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { CatalogEntry } from '../catalog'
import { getEntry, materialize } from '../catalog'
import { ComponentErrorBoundary } from './render/ComponentErrorBoundary'
import { getComponent } from './render/registry'
import type { CompositionNode } from '../composition'

interface ComponentTileProps {
  entry: CatalogEntry
}

/**
 * Draggable tile in the component panel. Renders a live miniature of
 * the component inside a square tile with the label underneath — so
 * designers can visually recognize what they're picking up, not just
 * read a name. Wrapped in an error boundary so a broken preview degrades
 * to a name-only tile instead of crashing the panel.
 */
export function ComponentTile({ entry }: ComponentTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `panel:${entry.name}`,
      data: { kind: 'panel-item', type: entry.name },
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  const label = entry.displayName ?? entry.name

  // Outer element is a div (not a button) because some tile previews
  // render real DS Buttons inside — nested <button> elements are invalid
  // HTML and break pointer event handling.
  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`panel-item-${entry.name}`}
      className="group flex flex-col items-stretch gap-1 cursor-grab active:cursor-grabbing focus:outline-none"
      {...listeners}
      {...attributes}
    >
      <div className="h-20 w-full rounded-md border border-neutral-200 bg-white overflow-hidden flex items-center justify-center p-2 transition-colors group-hover:border-neutral-400 group-focus-visible:ring-2 group-focus-visible:ring-neutral-400">
        <ComponentErrorBoundary
          nodeId={`tile-${entry.name}`}
          nodeType={entry.name}
        >
          <TilePreview entry={entry} />
        </ComponentErrorBoundary>
      </div>
      <span className="text-[11px] text-neutral-600 text-center truncate">
        {label}
      </span>
    </div>
  )
}

function TilePreview({ entry }: { entry: CatalogEntry }) {
  if (entry.structural) {
    return <StructuralPreview entry={entry} />
  }
  const node = materialize(entry.name)
  if (!node) return <NameOnlyPreview label={entry.displayName ?? entry.name} />
  // Belt-and-suspenders pointer-events lockdown: the outer wrapper AND
  // every descendant is event-inert, so even a real DS <input> inside the
  // preview can't steal focus / pointer events from the draggable tile.
  return (
    <div
      aria-hidden
      className="pointer-events-none max-w-full max-h-full overflow-hidden flex items-center justify-center [&_*]:text-[11px] [&_*]:pointer-events-none [&_*]:cursor-grab"
    >
      <StaticNode node={node} />
    </div>
  )
}

function StructuralPreview({ entry }: { entry: CatalogEntry }) {
  const isRow = entry.childFlow === 'row'
  return (
    <div
      aria-hidden
      className={[
        'pointer-events-none flex gap-1 items-center justify-center text-neutral-400',
        isRow ? 'flex-row' : 'flex-col',
      ].join(' ')}
    >
      <div className="w-5 h-2 rounded-sm bg-neutral-200" />
      <div className="w-5 h-2 rounded-sm bg-neutral-300" />
      <div className="w-5 h-2 rounded-sm bg-neutral-200" />
    </div>
  )
}

function NameOnlyPreview({ label }: { label: string }) {
  return (
    <span className="text-[11px] text-neutral-500 font-medium truncate">
      {label}
    </span>
  )
}

/**
 * Non-interactive recursive renderer: reads a composition node and
 * outputs real DS components with no wrappers, drop zones, or selection
 * handling. Used for panel tile previews and drag overlays.
 */
export function StaticNode({ node }: { node: CompositionNode }) {
  const entry = getEntry(node.type)
  if (!entry) {
    return <span className="text-[10px] text-neutral-400">{node.type}</span>
  }

  if (entry.structural) {
    const { tag, classes } = entry.structural
    return createElement(
      tag,
      { className: classes(node.props) },
      node.children.map((c) => <StaticNode key={c.id} node={c} />)
    )
  }

  const Component = getComponent(node.type)
  if (!Component) {
    return <span className="text-[10px] text-neutral-400">{node.type}</span>
  }

  const { children: _c, ...rest } = node.props
  void _c

  if (entry.textChild) {
    const text = typeof node.props.children === 'string' ? node.props.children : ''
    return createElement(Component, rest, text)
  }
  if (node.children.length === 0) {
    return createElement(Component, rest)
  }
  return createElement(
    Component,
    rest,
    node.children.map((c) => <StaticNode key={c.id} node={c} />)
  )
}
