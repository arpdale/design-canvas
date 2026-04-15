import { useCallback, useMemo, useState } from 'react'
import {
  createComposition,
  insertNode,
  moveNode,
  removeNode,
  updateProp,
  type Composition,
  type CompositionNode,
  type JsonValue,
  type NodeId,
} from '../../composition'

/**
 * React-side state for the canvas. Wraps the pure composition module and
 * holds ephemeral UI state (selection). Everything that mutates the tree
 * goes through the pure mutation API — this hook is only a React adapter.
 *
 * Load-bearing constraint (technical-approach.md §5): this file may import
 * from src/composition/ but src/composition/ must never import from here.
 */

export interface CanvasState {
  composition: Composition
  selectedId: NodeId | null
  setComposition: (c: Composition) => void
  setSelectedId: (id: NodeId | null) => void

  /** Insert a new subtree (from the panel) at the given location. */
  insertAt: (parentId: NodeId | null, index: number, node: CompositionNode) => void
  /** Move an existing node to a new parent/index. */
  moveTo: (id: NodeId, parentId: NodeId | null, index: number) => void
  /** Update a single prop on a node. Pass undefined to delete the prop. */
  updateProp: (id: NodeId, propName: string, value: JsonValue | undefined) => void
  /** Remove a node from the tree. Clears selection if the node was selected. */
  remove: (id: NodeId) => void
}

export function useCanvasStore(initial?: Composition): CanvasState {
  const [composition, setComposition] = useState<Composition>(
    () => initial ?? createComposition('Untitled')
  )
  const [selectedId, setSelectedId] = useState<NodeId | null>(null)

  const insertAt = useCallback(
    (parentId: NodeId | null, index: number, node: CompositionNode) => {
      setComposition((c) => insertNode(c, parentId, index, node))
    },
    []
  )

  const moveTo = useCallback(
    (id: NodeId, parentId: NodeId | null, index: number) => {
      setComposition((c) => moveNode(c, id, parentId, index))
    },
    []
  )

  const remove = useCallback((id: NodeId) => {
    setComposition((c) => removeNode(c, id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }, [])

  const setProp = useCallback(
    (id: NodeId, propName: string, value: JsonValue | undefined) => {
      setComposition((c) => updateProp(c, id, propName, value))
    },
    []
  )

  return useMemo(
    () => ({
      composition,
      selectedId,
      setComposition,
      setSelectedId,
      insertAt,
      moveTo,
      updateProp: setProp,
      remove,
    }),
    [composition, selectedId, insertAt, moveTo, setProp, remove]
  )
}
