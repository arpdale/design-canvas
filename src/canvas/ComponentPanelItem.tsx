import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { CatalogEntry } from '../catalog'

interface ComponentPanelItemProps {
  entry: CatalogEntry
}

/**
 * A draggable tile in the component panel. Carries `{ kind: 'panel-item',
 * type: <catalog name> }` as `data.current` so the canvas (M6) can
 * distinguish panel drags from reorder drags.
 */
export function ComponentPanelItem({ entry }: ComponentPanelItemProps) {
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

  return (
    <button
      ref={setNodeRef}
      style={style}
      data-testid={`panel-item-${entry.name}`}
      className="w-full text-left px-2 py-1.5 rounded-md border border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50 text-sm text-neutral-800 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-400"
      {...listeners}
      {...attributes}
    >
      {label}
    </button>
  )
}
