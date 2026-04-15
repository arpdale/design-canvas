import {
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core'

/**
 * Collision strategy tuned for the canvas:
 *   - Prefer `pointerWithin` (where the user's cursor is) so insertion
 *     indicators map to the pointer position, not to where the dragged
 *     rect happens to overlap.
 *   - If pointerWithin finds a gap, that wins — the whole point of gaps
 *     is to claim specific insertion indices.
 *   - Fall back to rectIntersection for edge cases where pointerWithin
 *     returns nothing (e.g. pointer outside any droppable).
 */
export const gapAwareCollision: CollisionDetection = (args) => {
  const within = pointerWithin(args)
  const gapInWithin = within.find((c) => String(c.id).startsWith('gap:'))
  if (gapInWithin) return [gapInWithin]
  if (within.length > 0) return within

  const rects = rectIntersection(args)
  const gapInRects = rects.find((c) => String(c.id).startsWith('gap:'))
  return gapInRects ? [gapInRects] : rects
}
