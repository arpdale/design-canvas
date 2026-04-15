/**
 * Drop target types and their id encoding. Ids are strings because
 * dnd-kit requires serializable droppable ids. Centralized here so the
 * encoding can't drift between the producer (RenderNode / CanvasSurface)
 * and the consumer (CanvasDndContext.onDragEnd).
 */

export type DropTarget =
  | { kind: 'root' }
  | { kind: 'container'; parentId: string }
  | {
      kind: 'gap'
      /** null means root-level gap (between top-level roots). */
      parentId: string | null
      /** Index at which a dropped node should be inserted. */
      index: number
    }

export function parseDropTarget(id: string): DropTarget | null {
  if (id === 'canvas-root') return { kind: 'root' }
  if (id.startsWith('container:')) {
    return { kind: 'container', parentId: id.slice('container:'.length) }
  }
  if (id.startsWith('gap:')) {
    // gap:{parent}:{index} — parent may be the literal "root"
    const rest = id.slice('gap:'.length)
    const lastColon = rest.lastIndexOf(':')
    if (lastColon < 0) return null
    const parentPart = rest.slice(0, lastColon)
    const indexPart = rest.slice(lastColon + 1)
    const index = Number(indexPart)
    if (!Number.isFinite(index) || index < 0) return null
    return {
      kind: 'gap',
      parentId: parentPart === 'root' ? null : parentPart,
      index,
    }
  }
  return null
}

export function dropTargetId(target: DropTarget): string {
  if (target.kind === 'root') return 'canvas-root'
  if (target.kind === 'container') return `container:${target.parentId}`
  const parent = target.parentId === null ? 'root' : target.parentId
  return `gap:${parent}:${target.index}`
}
