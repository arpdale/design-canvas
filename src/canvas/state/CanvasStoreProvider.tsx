import type { ReactNode } from 'react'
import { useCanvasStore, type UseCanvasStoreOptions } from './canvasStore'
import { CanvasStoreContext } from './canvasStoreContext'

export function CanvasStoreProvider({
  options,
  children,
}: {
  /** Test-only options; not passed in production. */
  options?: UseCanvasStoreOptions
  children: ReactNode
}) {
  const store = useCanvasStore(options)
  return (
    <CanvasStoreContext.Provider value={store}>
      {children}
    </CanvasStoreContext.Provider>
  )
}
