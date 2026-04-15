import { findNode } from '../composition'
import { getEntry } from '../catalog'
import { useCanvas } from './state/canvasStoreContext'
import { PropField } from './inspector/PropField'

export function InspectorPanel() {
  const { composition, selectedId, updateProp, remove } = useCanvas()

  if (!selectedId) {
    return (
      <div className="p-4" data-testid="inspector-empty">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Inspector
        </h2>
        <p className="text-sm text-neutral-400">
          Select a component to edit its properties.
        </p>
      </div>
    )
  }

  const node = findNode(composition.roots, selectedId)
  const entry = node ? getEntry(node.type) : undefined

  if (!node || !entry) {
    return (
      <div className="p-4" data-testid="inspector-missing">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Inspector
        </h2>
        <p className="text-sm text-neutral-400">
          The selected component is no longer in the tree.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-4" data-testid="inspector-panel">
      <div>
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
          Inspector
        </h2>
        <p className="text-sm font-medium text-neutral-900">
          {entry.displayName ?? entry.name}
        </p>
        <p className="text-xs text-neutral-400 font-mono">{node.id}</p>
      </div>

      {entry.propSchema.length === 0 ? (
        <p className="text-xs text-neutral-400">
          This component has no editable props.
        </p>
      ) : (
        <div className="flex flex-col gap-3" data-testid="inspector-fields">
          {entry.propSchema.map((schema) => (
            <PropField
              key={schema.name}
              schema={schema}
              value={node.props[schema.name]}
              onChange={(value) => updateProp(node.id, schema.name, value)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => remove(node.id)}
        data-testid="inspector-delete"
        className="mt-2 px-2 py-1.5 text-sm rounded-md border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
      >
        Delete
      </button>
    </div>
  )
}
