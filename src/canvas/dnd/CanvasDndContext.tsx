import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useCanvas } from '../state/canvasStoreContext'
import { materialize } from '../../catalog'
import { parseDropTarget } from './dropTarget'

interface CanvasDndContextProps {
  children: ReactNode
}

type ActiveDrag =
  | { kind: 'panel-item'; type: string }
  | { kind: 'node'; id: string; type: string }
  | null

/**
 * Top-level DnD provider. Owns drop routing for:
 *   - panel-item → canvas root  (insert new node at end of roots)
 *   - panel-item → container    (insert new node at end of container)
 *   - node → canvas root        (move root / move existing into roots)
 *   - node → container          (move into container)
 *
 * Drop-target ids follow the convention:
 *   `canvas-root`          → insert as root
 *   `container:<nodeId>`   → insert as last child of that container
 */
export function CanvasDndContext({ children }: CanvasDndContextProps) {
  const { active: activeComposition, insertAt, moveTo, setSelectedId } =
    useCanvas()
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as
      | { kind: 'panel-item'; type: string }
      | { kind: 'node'; id: string; type: string }
      | undefined
    setActiveDrag(data ?? null)
  }

  const onDragCancel = () => setActiveDrag(null)

  const onDragEnd = (e: DragEndEvent) => {
    setActiveDrag(null)
    const overId = e.over?.id
    const data = e.active.data.current as
      | { kind: 'panel-item'; type: string }
      | { kind: 'node'; id: string; type: string }
      | undefined
    if (!overId || !data) return

    const target = parseDropTarget(String(overId))
    if (!target) return

    if (data.kind === 'panel-item') {
      const node = materialize(data.type)
      if (!node) return
      if (target.kind === 'root') {
        insertAt(null, activeComposition?.roots.length ?? 0, node)
      } else {
        // appending to a container
        insertAt(target.parentId, Number.MAX_SAFE_INTEGER, node)
      }
      setSelectedId(node.id)
    } else if (data.kind === 'node') {
      if (target.kind === 'root') {
        moveTo(data.id, null, activeComposition?.roots.length ?? 0)
      } else {
        // reject moving into self (composition module also rejects cycles)
        if (target.parentId === data.id) return
        moveTo(data.id, target.parentId, Number.MAX_SAFE_INTEGER)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeDrag ? (
              <DragPreview label={describeDrag(activeDrag)} />
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}

function describeDrag(active: NonNullable<ActiveDrag>): string {
  return active.kind === 'panel-item' ? active.type : active.type
}

function DragPreview({ label }: { label: string }) {
  return (
    <div className="px-3 py-1.5 rounded-md border border-blue-400 bg-blue-50 text-sm text-blue-900 shadow-md pointer-events-none">
      {label}
    </div>
  )
}

