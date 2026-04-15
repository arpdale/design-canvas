import { useDroppable } from '@dnd-kit/core'
import { RenderNode } from './render/RenderNode'
import { useCanvas } from './state/canvasStoreContext'
import { dropTargetId } from './dnd/dropTarget'

export function CanvasSurface() {
  const { active, selectedId, setSelectedId } = useCanvas()
  const roots = active?.roots ?? []

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
          'mx-auto max-w-3xl min-h-full rounded-lg border-2 border-dashed flex items-center justify-center transition-colors',
          isOver
            ? 'border-blue-400 bg-blue-50 text-blue-700'
            : 'border-neutral-300 bg-white text-neutral-400',
        ].join(' ')}
      >
        <div className="text-center p-12 max-w-sm">
          <p className="text-sm font-medium">
            {isOver ? 'Drop to place here' : 'Your canvas is empty'}
          </p>
          <p className="text-xs mt-2 leading-relaxed">
            Drag a component from the left panel to start composing. Nest by
            dropping onto a container.
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
        'mx-auto max-w-3xl min-h-full rounded-lg bg-white p-8 flex flex-col gap-6 transition-shadow',
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
