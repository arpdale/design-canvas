import { produce } from 'immer'
import type { Composition, CompositionNode, JsonValue, NodeId } from './types'
import { newCompositionId, newNodeId } from './id'
import { findNode, findParent } from './traverse'

/**
 * All mutations return a new Composition. No mutation mutates its inputs.
 * Every mutation bumps `updatedAt`.
 *
 * This module is deliberately free of React. See technical-approach.md §5.
 */

export function createComposition(name: string): Composition {
  return {
    id: newCompositionId(),
    name,
    roots: [],
    updatedAt: Date.now(),
  }
}

export function renameComposition(c: Composition, name: string): Composition {
  return produce(c, (draft) => {
    draft.name = name
    draft.updatedAt = Date.now()
  })
}

export interface NewNodeSpec {
  type: string
  props?: Record<string, JsonValue>
  slot?: string
  children?: NewNodeSpec[]
}

export function createNode(spec: NewNodeSpec): CompositionNode {
  return {
    id: newNodeId(),
    type: spec.type,
    props: spec.props ? { ...spec.props } : {},
    children: (spec.children ?? []).map(createNode),
    ...(spec.slot !== undefined ? { slot: spec.slot } : {}),
  }
}

/**
 * Inserts `node` as a child of `parentId` at `index`. If `parentId` is null,
 * inserts as a root at `index`. Index beyond the list appends.
 */
export function insertNode(
  c: Composition,
  parentId: NodeId | null,
  index: number,
  node: CompositionNode
): Composition {
  return produce(c, (draft) => {
    const target =
      parentId === null ? draft.roots : findNode(draft.roots, parentId)?.children
    if (!target) return
    const clamped = Math.max(0, Math.min(index, target.length))
    target.splice(clamped, 0, node as CompositionNode)
    draft.updatedAt = Date.now()
  })
}

/**
 * Removes a node by id. No-op if not found.
 */
export function removeNode(c: Composition, id: NodeId): Composition {
  return produce(c, (draft) => {
    // Is it a root?
    const rootIdx = draft.roots.findIndex((n) => n.id === id)
    if (rootIdx >= 0) {
      draft.roots.splice(rootIdx, 1)
      draft.updatedAt = Date.now()
      return
    }
    const found = findParent(draft.roots, id)
    if (!found) return
    found.parent.children.splice(found.index, 1)
    draft.updatedAt = Date.now()
  })
}

/**
 * Moves a node to a new parent and index. If `newParentId` is null, moves
 * to roots. Moving a node into its own subtree is rejected (no-op).
 */
export function moveNode(
  c: Composition,
  id: NodeId,
  newParentId: NodeId | null,
  newIndex: number
): Composition {
  return produce(c, (draft) => {
    // Reject: moving into own subtree
    if (newParentId !== null) {
      const source = findNode(draft.roots, id)
      if (source && findNode([source], newParentId)) return
    }

    // Remove from current location
    let node: CompositionNode | undefined
    const rootIdx = draft.roots.findIndex((n) => n.id === id)
    if (rootIdx >= 0) {
      node = draft.roots.splice(rootIdx, 1)[0]
    } else {
      const parent = findParent(draft.roots, id)
      if (!parent) return
      node = parent.parent.children.splice(parent.index, 1)[0]
    }
    if (!node) return

    // Insert at new location
    const target =
      newParentId === null
        ? draft.roots
        : findNode(draft.roots, newParentId)?.children
    if (!target) {
      // Target vanished — drop to roots to avoid data loss
      draft.roots.push(node)
    } else {
      const clamped = Math.max(0, Math.min(newIndex, target.length))
      target.splice(clamped, 0, node)
    }
    draft.updatedAt = Date.now()
  })
}

/**
 * Updates a single prop on a node. Passing `undefined` removes the prop.
 */
export function updateProp(
  c: Composition,
  id: NodeId,
  propName: string,
  value: JsonValue | undefined
): Composition {
  return produce(c, (draft) => {
    const node = findNode(draft.roots, id)
    if (!node) return
    if (value === undefined) {
      delete node.props[propName]
    } else {
      node.props[propName] = value
    }
    draft.updatedAt = Date.now()
  })
}

/**
 * Replaces a node's entire prop bag. Used for bulk edits (e.g. variant
 * switch that resets related props).
 */
export function replaceProps(
  c: Composition,
  id: NodeId,
  props: Record<string, JsonValue>
): Composition {
  return produce(c, (draft) => {
    const node = findNode(draft.roots, id)
    if (!node) return
    node.props = { ...props }
    draft.updatedAt = Date.now()
  })
}
