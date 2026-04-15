import { useEffect } from 'react'
import { ComponentPanel } from './ComponentPanel'
import { CanvasSurface } from './CanvasSurface'
import { InspectorPanel } from './InspectorPanel'
import { TopBar } from './TopBar'
import { CanvasDndContext } from './dnd/CanvasDndContext'
import { CanvasStoreProvider } from './state/CanvasStoreProvider'
import { useCanvas } from './state/canvasStoreContext'

export function AppShell() {
  return (
    <CanvasStoreProvider>
      <CanvasDndContext>
        <KeyboardShortcuts />
        <div
          data-testid="app-shell"
          className="flex flex-col h-full w-full bg-neutral-50"
        >
          <TopBar />
          <div className="flex flex-1 min-h-0">
            <aside
              data-testid="panel-components"
              className="w-64 shrink-0 border-r border-neutral-200 bg-white overflow-y-auto"
            >
              <ComponentPanel />
            </aside>
            <main
              data-testid="panel-canvas"
              className="flex-1 min-w-0 overflow-auto bg-neutral-100 p-8"
            >
              <CanvasSurface />
            </main>
            <aside
              data-testid="panel-inspector"
              className="w-80 shrink-0 border-l border-neutral-200 bg-white overflow-y-auto"
            >
              <InspectorPanel />
            </aside>
          </div>
        </div>
      </CanvasDndContext>
    </CanvasStoreProvider>
  )
}

function KeyboardShortcuts() {
  const { selectedId, remove } = useCanvas()
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key !== 'Backspace' && e.key !== 'Delete') return
      if (!selectedId) return
      // Don't hijack when focus is in a real input/textarea (unused today
      // given edit-mode interception, but belt-and-suspenders for later).
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      remove(selectedId)
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [selectedId, remove])
  return null
}
