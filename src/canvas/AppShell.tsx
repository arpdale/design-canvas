import { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { CanvasSurface } from './CanvasSurface'
import { InspectorPanel } from './InspectorPanel'
import { TopBar } from './TopBar'
import { CanvasDndContext } from './dnd/CanvasDndContext'
import { CanvasStoreProvider } from './state/CanvasStoreProvider'
import { useCanvas } from './state/canvasStoreContext'
import { ExportDialog } from './ExportDialog'

export function AppShell() {
  return (
    <CanvasStoreProvider>
      <AppShellContent />
    </CanvasStoreProvider>
  )
}

function AppShellContent() {
  const [exportOpen, setExportOpen] = useState(false)
  return (
    <>
      <CanvasDndContext>
        <KeyboardShortcuts />
        <div
          data-testid="app-shell"
          className="flex flex-col h-full w-full bg-neutral-50"
        >
          <TopBar onExport={() => setExportOpen(true)} />
          <div className="flex flex-1 min-h-0">
            <aside
              data-testid="panel-components"
              className="w-72 shrink-0 border-r border-neutral-200 bg-white overflow-hidden"
            >
              <Sidebar />
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
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </>
  )
}

function KeyboardShortcuts() {
  const { selectedId, remove } = useCanvas()
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key !== 'Backspace' && e.key !== 'Delete') return
      if (!selectedId) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      remove(selectedId)
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [selectedId, remove])
  return null
}
