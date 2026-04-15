import { RenderNode } from './render/RenderNode'
import { useCanvas } from './state/canvasStoreContext'

export function CanvasSurface() {
  const { composition, selectedId, setSelectedId } = useCanvas()
  const { roots } = composition

  const clearSelectionOnBackground = () => setSelectedId(null)

  if (roots.length === 0) {
    return (
      <div
        data-testid="canvas-empty"
        onClick={clearSelectionOnBackground}
        className="mx-auto max-w-3xl min-h-full rounded-lg border-2 border-dashed border-neutral-300 bg-white flex items-center justify-center text-neutral-400"
      >
        <div className="text-center p-12">
          <p className="text-sm">Canvas</p>
          <p className="text-xs mt-2">
            Drag components from the panel to start composing.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid="canvas-surface"
      onClick={clearSelectionOnBackground}
      className="mx-auto max-w-3xl min-h-full rounded-lg bg-white p-8 flex flex-col gap-6"
    >
      {roots.map((node) => (
        <RenderNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      ))}
    </div>
  )
}
