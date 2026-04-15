import { createContext, useContext } from 'react'
import type { CanvasState } from './canvasStore'

export const CanvasStoreContext = createContext<CanvasState | null>(null)

export function useCanvas(): CanvasState {
  const ctx = useContext(CanvasStoreContext)
  if (!ctx) {
    throw new Error('useCanvas must be used inside <CanvasStoreProvider>')
  }
  return ctx
}
