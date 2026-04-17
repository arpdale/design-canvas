import {
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useCanvas } from '../state/canvasStoreContext'
import { getEntry, materialize } from '../../catalog'
import { findNode } from '../../composition'
import { parseDropTarget } from './dropTarget'
import { gapAwareCollision } from './collision'
import { StaticNode } from '../ComponentTile'
import { ComponentErrorBoundary } from '../render/ComponentErrorBoundary'

interface CanvasDndContextProps {
  children: ReactNode
}

type ActiveDrag =
  | { kind: 'panel-item'; type: string }
  | { kind: 'node'; id: string; type: string }
  | null

/**
 * Top-level DnD provider. Owns drop routing and renders the drag overlay
 * (a miniature of the actual component being dragged).
 */
export function CanvasDndContext({ children }: CanvasDndContextProps) {
  const {
    active: activeComposition,
    insertAt,
    moveTo,
    setSelectedId,
  } = useCanvas()
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
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
      } else if (target.kind === 'container') {
        insertAt(target.parentId, Number.MAX_SAFE_INTEGER, node)
      } else {
        insertAt(target.parentId, target.index, node)
      }
      setSelectedId(node.id)
    } else if (data.kind === 'node') {
      if (target.kind === 'root') {
        moveTo(data.id, null, activeComposition?.roots.length ?? 0)
      } else if (target.kind === 'container') {
        if (target.parentId === data.id) return
        moveTo(data.id, target.parentId, Number.MAX_SAFE_INTEGER)
      } else {
        if (target.parentId === data.id) return
        moveTo(data.id, target.parentId, target.index)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={gapAwareCollision}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeDrag ? (
              <DragPreview active={activeDrag} composition={activeComposition} />
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}

function DragPreview({
  active,
  composition,
}: {
  active: NonNullable<ActiveDrag>
  composition: { roots: { id: string; type: string; props: Record<string, unknown>; children: unknown[]; slot?: string }[] } | null
}) {
  // Resolve the composition node to render as the preview.
  // - panel-item: materialize from catalog defaults.
  // - node: look up the real node in the current composition.
  let node: ReturnType<typeof materialize> | undefined
  if (active.kind === 'panel-item') {
    node = materialize(active.type)
  } else if (composition) {
    // Cast is safe — we pass the real Composition above, typing simplified
    // to avoid pulling the full Composition type onto this prop.
    node = findNode(
      composition.roots as unknown as import('../../composition').CompositionNode[],
      active.id
    )
  }

  const label =
    getEntry(active.type)?.displayName ?? active.type ?? 'Component'

  return (
    <div
      data-testid="drag-preview"
      className="pointer-events-none inline-flex flex-col items-stretch gap-1"
    >
      <div className="inline-flex items-center justify-center p-2 rounded-md border border-neutral-200 bg-white shadow-lg [&_*]:text-[11px] max-w-[200px] max-h-[140px] overflow-hidden">
        {node ? (
          <ComponentErrorBoundary
            nodeId={`preview-${active.type}`}
            nodeType={active.type}
          >
            <StaticNode node={node} />
          </ComponentErrorBoundary>
        ) : (
          <span className="text-[11px] text-neutral-500 font-medium">
            {label}
          </span>
        )}
      </div>
      <span className="text-[10px] text-center text-neutral-500 bg-white/70 px-1 rounded">
        {label}
      </span>
    </div>
  )
}
