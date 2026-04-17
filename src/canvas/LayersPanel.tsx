import { useState } from 'react'
import type { CompositionNode } from '../composition'
import { getEntry } from '../catalog'
import { useCanvas } from './state/canvasStoreContext'

/**
 * Tree view of the active composition. Each node is clickable — selects
 * it in the canvas. Rows with children get a chevron that toggles
 * expansion (file-tree style). Expansion state is panel-local.
 */
export function LayersPanel() {
  const { active, selectedId, setSelectedId } = useCanvas()
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const roots = active?.roots ?? []

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (roots.length === 0) {
    return (
      <div className="p-3" data-testid="layers-empty">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Layers
        </h2>
        <p className="text-sm text-neutral-400">
          Nothing on the canvas yet.
        </p>
      </div>
    )
  }

  return (
    <div className="p-3" data-testid="layers-panel">
      <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
        Layers
      </h2>
      <ul className="flex flex-col gap-0.5">
        {roots.map((node) => (
          <LayerRow
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={setSelectedId}
            collapsed={collapsed}
            onToggle={toggle}
          />
        ))}
      </ul>
    </div>
  )
}

interface LayerRowProps {
  node: CompositionNode
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
  collapsed: Set<string>
  onToggle: (id: string) => void
}

function LayerRow({
  node,
  depth,
  selectedId,
  onSelect,
  collapsed,
  onToggle,
}: LayerRowProps) {
  const entry = getEntry(node.type)
  const label = entry?.displayName ?? node.type
  const isSelected = selectedId === node.id
  const hasChildren = node.children.length > 0
  const isCollapsed = collapsed.has(node.id)

  return (
    <li>
      <button
        type="button"
        data-testid={`layer-${node.id}`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(node.id)
        }}
        className={[
          'w-full text-left text-sm px-2 py-1 rounded-md flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-neutral-400',
          isSelected
            ? 'bg-blue-50 text-blue-900'
            : 'hover:bg-neutral-100 text-neutral-700',
        ].join(' ')}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {hasChildren ? (
          <span
            role="button"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            data-testid={`layer-toggle-${node.id}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={[
              'w-4 h-4 inline-flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-transform shrink-0',
              isCollapsed ? '' : 'rotate-90',
            ].join(' ')}
          >
            ▸
          </span>
        ) : (
          <span aria-hidden className="w-4 h-4 shrink-0" />
        )}
        <span className="truncate">{label}</span>
      </button>
      {hasChildren && !isCollapsed ? (
        <ul className="flex flex-col gap-0.5 mt-0.5">
          {node.children.map((child) => (
            <LayerRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              collapsed={collapsed}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
