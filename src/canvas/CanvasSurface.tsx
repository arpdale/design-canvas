import { useDroppable } from '@dnd-kit/core'
import { RenderNode } from './render/RenderNode'
import { useCanvas } from './state/canvasStoreContext'
import { dropTargetId } from './dnd/dropTarget'

export function CanvasSurface() {
  const { composition, selectedId, setSelectedId } = useCanvas()
  const { roots } = composition

  const { setNodeRef, isOver } = useDroppable({
    id: dropTargetId({ kind: 'root' }),
  })

  const clearSelectionOnBackground = () => setSelectedId(null)

  if (roots.length === 0) {
    return (
      <div
        ref={setNodeRef}
        data-testid="canvas-empty"
        onClick={clearSelectionOnBackground}
        className={[
          'mx-auto max-w-3xl min-h-full rounded-lg border-2 border-dashed flex items-center justify-center text-neutral-400 transition-colors',
          isOver
            ? 'border-blue-400 bg-blue-50 text-blue-600'
            : 'border-neutral-300 bg-white',
        ].join(' ')}
      >
        <div className="text-center p-12">
          <p className="text-sm">Canvas</p>
          <p className="text-xs mt-2">
            Drag a component from the left to start composing.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      data-testid="canvas-surface"
      onClick={clearSelectionOnBackground}
      className={[
        'mx-auto max-w-3xl min-h-full rounded-lg bg-white p-8 flex flex-col gap-6 transition-colors',
        isOver ? 'ring-2 ring-blue-300' : '',
      ].join(' ')}
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
