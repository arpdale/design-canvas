export type DropTarget =
  | { kind: 'root' }
  | { kind: 'container'; parentId: string }

export function parseDropTarget(id: string): DropTarget | null {
  if (id === 'canvas-root') return { kind: 'root' }
  if (id.startsWith('container:')) {
    return { kind: 'container', parentId: id.slice('container:'.length) }
  }
  return null
}

export function dropTargetId(target: DropTarget): string {
  return target.kind === 'root' ? 'canvas-root' : `container:${target.parentId}`
}
