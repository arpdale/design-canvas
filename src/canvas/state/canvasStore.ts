import { useCallback, useMemo, useState } from 'react'
import {
  createComposition,
  insertNode,
  removeNode,
  type Composition,
  type CompositionNode,
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
  insertRoot: (node: CompositionNode) => void
  remove: (id: NodeId) => void
}

export function useCanvasStore(initial?: Composition): CanvasState {
  const [composition, setComposition] = useState<Composition>(
    () => initial ?? createComposition('Untitled')
  )
  const [selectedId, setSelectedId] = useState<NodeId | null>(null)

  const insertRoot = useCallback((node: CompositionNode) => {
    setComposition((c) => insertNode(c, null, c.roots.length, node))
  }, [])

  const remove = useCallback(
    (id: NodeId) => {
      setComposition((c) => removeNode(c, id))
      setSelectedId((prev) => (prev === id ? null : prev))
    },
    []
  )

  return useMemo(
    () => ({
      composition,
      selectedId,
      setComposition,
      setSelectedId,
      insertRoot,
      remove,
    }),
    [composition, selectedId, insertRoot, remove]
  )
}
