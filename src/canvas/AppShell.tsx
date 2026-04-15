import { ComponentPanel } from './ComponentPanel'
import { CanvasSurface } from './CanvasSurface'
import { InspectorPanel } from './InspectorPanel'
import { TopBar } from './TopBar'
import { CanvasDndContext } from './dnd/CanvasDndContext'
import { CanvasStoreProvider } from './state/CanvasStoreProvider'
import { loginSeed } from './seed'

export function AppShell() {
  return (
    <CanvasStoreProvider initial={loginSeed()}>
      <CanvasDndContext>
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
