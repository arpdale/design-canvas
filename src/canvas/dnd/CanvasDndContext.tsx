import { DndContext, type DndContextProps } from '@dnd-kit/core'
import type { ReactNode } from 'react'

interface CanvasDndContextProps {
  children: ReactNode
  /** Optional DnD lifecycle handlers. Drop handling lands in M6. */
  onDragStart?: DndContextProps['onDragStart']
  onDragEnd?: DndContextProps['onDragEnd']
  onDragCancel?: DndContextProps['onDragCancel']
}

/**
 * Top-level DnD provider wired at the AppShell. Wraps every pane so the
 * component panel (drag source) and the canvas (drop target, M6) share
 * one context.
 */
export function CanvasDndContext({
  children,
  onDragStart,
  onDragEnd,
  onDragCancel,
}: CanvasDndContextProps) {
  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
    </DndContext>
  )
}
