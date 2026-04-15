import { useDndContext, useDroppable } from '@dnd-kit/core'
import { dropTargetId } from '../dnd/dropTarget'

interface GapDropZoneProps {
  /** Parent node id, or null for root-level gaps. */
  parentId: string | null
  /** Index where an incoming drop should be inserted. */
  index: number
  /** Orientation of the sibling flow; 'column' → horizontal bar, 'row' → vertical bar. */
  flow: 'row' | 'column'
}

/**
 * Sits between sibling RenderNodes. Invisible when idle. During a drag,
 * expands into a targetable slot and shows a blue insertion bar when
 * hovered — the classic Figma/Subframe indicator for "this is where
 * it'll land." Only mounts while a drag is active; the canvas stays
 * visually uncluttered at rest.
 */
export function GapDropZone({ parentId, index, flow }: GapDropZoneProps) {
  const { active } = useDndContext()
  const dragging = active !== null

  const { setNodeRef, isOver } = useDroppable({
    id: dropTargetId({ kind: 'gap', parentId, index }),
    disabled: !dragging,
  })

  if (!dragging) return null

  const isRow = flow === 'row'

  // Keep gap regions generous enough for reliable targeting — 12px in the
  // minor axis, full extent in the major axis. The visible bar is smaller,
  // but the droppable hit area is the whole strip.
  const hitArea = isRow ? 'w-3 self-stretch' : 'h-3 w-full'
  const alignment = 'flex items-center justify-center'

  const bar = isOver
    ? isRow
      ? 'w-[3px] h-[80%] rounded-full bg-blue-500'
      : 'h-[3px] w-[85%] rounded-full bg-blue-500'
    : ''

  return (
    <div
      ref={setNodeRef}
      data-testid={`gap-${parentId ?? 'root'}-${index}`}
      data-gap-index={index}
      className={`shrink-0 ${hitArea} ${alignment}`}
    >
      <div className={bar} />
    </div>
  )
}
