import type { CompositionNode, NodeId } from './types'

/**
 * Finds a node by id anywhere in the tree. Returns undefined if not found.
 * Does not mutate. Safe to call with draft (immer) or plain nodes.
 */
export function findNode(
  roots: CompositionNode[],
  id: NodeId
): CompositionNode | undefined {
  for (const root of roots) {
    const found = findInSubtree(root, id)
    if (found) return found
  }
  return undefined
}

function findInSubtree(
  node: CompositionNode,
  id: NodeId
): CompositionNode | undefined {
  if (node.id === id) return node
  for (const child of node.children) {
    const found = findInSubtree(child, id)
    if (found) return found
  }
  return undefined
}

/**
 * Finds the parent node of the given id, plus the index of the child.
 * Returns undefined if the id is a root (or not found).
 */
export function findParent(
  roots: CompositionNode[],
  id: NodeId
): { parent: CompositionNode; index: number } | undefined {
  for (const root of roots) {
    const result = findParentInSubtree(root, id)
    if (result) return result
  }
  return undefined
}

function findParentInSubtree(
  node: CompositionNode,
  id: NodeId
): { parent: CompositionNode; index: number } | undefined {
  for (let i = 0; i < node.children.length; i++) {
    if (node.children[i].id === id) {
      return { parent: node, index: i }
    }
    const deeper = findParentInSubtree(node.children[i], id)
    if (deeper) return deeper
  }
  return undefined
}

/**
 * Walks every node in the tree, depth-first. Visitor receives the node
 * and its depth (0 for roots). Return false to stop walking.
 */
export function walk(
  roots: CompositionNode[],
  visit: (node: CompositionNode, depth: number) => void | false
): void {
  for (const root of roots) {
    if (walkSubtree(root, 0, visit) === false) return
  }
}

function walkSubtree(
  node: CompositionNode,
  depth: number,
  visit: (node: CompositionNode, depth: number) => void | false
): void | false {
  if (visit(node, depth) === false) return false
  for (const child of node.children) {
    if (walkSubtree(child, depth + 1, visit) === false) return false
  }
}
