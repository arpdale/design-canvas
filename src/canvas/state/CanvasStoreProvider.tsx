import type { ReactNode } from 'react'
import { useCanvasStore } from './canvasStore'
import type { Composition } from '../../composition'
import { CanvasStoreContext } from './canvasStoreContext'

export function CanvasStoreProvider({
  initial,
  children,
}: {
  initial?: Composition
  children: ReactNode
}) {
  const store = useCanvasStore(initial)
  return (
    <CanvasStoreContext.Provider value={store}>
      {children}
    </CanvasStoreContext.Provider>
  )
}
