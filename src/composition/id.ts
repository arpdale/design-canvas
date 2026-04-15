import { nanoid } from 'nanoid'

/**
 * Generates a stable node id. Short (10 chars) — tree diffs and exports
 * read better without long uuids.
 */
export function newNodeId(): string {
  return nanoid(10)
}

/**
 * Generates a composition id. Slightly longer for collision safety across
 * a user's full composition list.
 */
export function newCompositionId(): string {
  return nanoid(14)
}
