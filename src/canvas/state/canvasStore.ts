import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createComposition,
  insertNode,
  moveNode,
  removeNode,
  renameComposition,
  updateProp,
  type Composition,
  type CompositionNode,
  type JsonValue,
  type NodeId,
} from '../../composition'
import {
  CURRENT_SCHEMA_VERSION,
  loadLibrary,
  saveLibrary,
  type StoredLibrary,
} from '../../persistence'

/**
 * React-side state for the canvas. Now owns a library of named
 * compositions backed by localStorage, plus ephemeral selection state.
 * All tree mutations still go through the pure composition module —
 * this hook is only a React adapter.
 */

export interface CanvasState {
  /** All saved compositions in the library. */
  compositions: Composition[]
  /** Id of the active composition, or null if the library is empty. */
  activeId: string | null
  /** The active Composition, or null. */
  active: Composition | null
  /** Selected node id within the active composition. */
  selectedId: NodeId | null
  setSelectedId: (id: NodeId | null) => void

  // Library operations
  createNew: (name?: string) => void
  renameActive: (name: string) => void
  deleteComposition: (id: string) => void
  switchTo: (id: string) => void

  // Tree operations (scoped to active composition)
  insertAt: (parentId: NodeId | null, index: number, node: CompositionNode) => void
  moveTo: (id: NodeId, parentId: NodeId | null, index: number) => void
  updateProp: (id: NodeId, propName: string, value: JsonValue | undefined) => void
  remove: (id: NodeId) => void
}

const AUTOSAVE_DEBOUNCE_MS = 250

/** Options for test harnesses. */
export interface UseCanvasStoreOptions {
  /** Skip auto-loading from localStorage (unit tests). */
  skipLoad?: boolean
  /** Skip auto-saving to localStorage (unit tests). */
  skipSave?: boolean
  /** Seed the library with these compositions (unit tests). */
  initialLibrary?: StoredLibrary
}

export function useCanvasStore(opts: UseCanvasStoreOptions = {}): CanvasState {
  const [library, setLibrary] = useState<StoredLibrary>(() => {
    if (opts.initialLibrary) return opts.initialLibrary
    if (opts.skipLoad) return emptyLibrary()
    return loadLibrary() ?? emptyLibrary()
  })
  const [selectedId, setSelectedId] = useState<NodeId | null>(null)

  // Auto-save. Debounced so rapid mutations don't thrash localStorage.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (opts.skipSave) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveLibrary(library)
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [library, opts.skipSave])

  const active = useMemo(
    () => library.compositions.find((c) => c.id === library.activeId) ?? null,
    [library]
  )

  // Mutate the active composition by applying fn.
  const mutateActive = useCallback(
    (fn: (c: Composition) => Composition) => {
      setLibrary((lib) => {
        if (!lib.activeId) return lib
        const compositions = lib.compositions.map((c) =>
          c.id === lib.activeId ? fn(c) : c
        )
        return { ...lib, compositions }
      })
    },
    []
  )

  const createNew = useCallback((name = 'Untitled') => {
    setLibrary((lib) => {
      const c = createComposition(name)
      return {
        ...lib,
        compositions: [...lib.compositions, c],
        activeId: c.id,
      }
    })
    setSelectedId(null)
  }, [])

  const renameActive = useCallback((name: string) => {
    mutateActive((c) => renameComposition(c, name))
  }, [mutateActive])

  const deleteComposition = useCallback((id: string) => {
    setLibrary((lib) => {
      const remaining = lib.compositions.filter((c) => c.id !== id)
      const activeId =
        lib.activeId === id ? (remaining[0]?.id ?? null) : lib.activeId
      return { ...lib, compositions: remaining, activeId }
    })
    setSelectedId(null)
  }, [])

  const switchTo = useCallback((id: string) => {
    setLibrary((lib) => {
      if (!lib.compositions.some((c) => c.id === id)) return lib
      return { ...lib, activeId: id }
    })
    setSelectedId(null)
  }, [])

  const insertAt = useCallback(
    (parentId: NodeId | null, index: number, node: CompositionNode) => {
      mutateActive((c) => insertNode(c, parentId, index, node))
    },
    [mutateActive]
  )

  const moveTo = useCallback(
    (id: NodeId, parentId: NodeId | null, index: number) => {
      mutateActive((c) => moveNode(c, id, parentId, index))
    },
    [mutateActive]
  )

  const setProp = useCallback(
    (id: NodeId, propName: string, value: JsonValue | undefined) => {
      mutateActive((c) => updateProp(c, id, propName, value))
    },
    [mutateActive]
  )

  const remove = useCallback(
    (id: NodeId) => {
      mutateActive((c) => removeNode(c, id))
      setSelectedId((prev) => (prev === id ? null : prev))
    },
    [mutateActive]
  )

  return useMemo(
    () => ({
      compositions: library.compositions,
      activeId: library.activeId,
      active,
      selectedId,
      setSelectedId,
      createNew,
      renameActive,
      deleteComposition,
      switchTo,
      insertAt,
      moveTo,
      updateProp: setProp,
      remove,
    }),
    [
      library,
      active,
      selectedId,
      createNew,
      renameActive,
      deleteComposition,
      switchTo,
      insertAt,
      moveTo,
      setProp,
      remove,
    ]
  )
}

function emptyLibrary(): StoredLibrary {
  const first = createComposition('Untitled')
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    compositions: [first],
    activeId: first.id,
  }
}
