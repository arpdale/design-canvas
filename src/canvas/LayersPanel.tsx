import type { CompositionNode } from '../composition'
import { getEntry } from '../catalog'
import { useCanvas } from './state/canvasStoreContext'

/**
 * Tree view of the active composition. Each node is clickable — selects
 * it in the canvas (same selectedId state). Shown as an alternative to
 * the Components panel via the left-rail tabs.
 */
export function LayersPanel() {
  const { active, selectedId, setSelectedId } = useCanvas()
  const roots = active?.roots ?? []

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
}

function LayerRow({ node, depth, selectedId, onSelect }: LayerRowProps) {
  const entry = getEntry(node.type)
  const label = entry?.displayName ?? node.type
  const isSelected = selectedId === node.id
  const hasChildren = node.children.length > 0

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
          'w-full text-left text-sm px-2 py-1 rounded-md flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-neutral-400',
          isSelected
            ? 'bg-blue-50 text-blue-900'
            : 'hover:bg-neutral-100 text-neutral-700',
        ].join(' ')}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        <span
          aria-hidden
          className={`text-[10px] text-neutral-400 w-3 inline-block text-center ${
            hasChildren ? '' : 'opacity-0'
          }`}
        >
          ▾
        </span>
        <span className="truncate">{label}</span>
      </button>
      {hasChildren ? (
        <ul className="flex flex-col gap-0.5 mt-0.5">
          {node.children.map((child) => (
            <LayerRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
