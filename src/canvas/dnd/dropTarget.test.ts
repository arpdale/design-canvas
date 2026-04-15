import { describe, it, expect } from 'vitest'
import { dropTargetId, parseDropTarget } from './dropTarget'

describe('dropTarget serialization', () => {
  it('round-trips root target', () => {
    const id = dropTargetId({ kind: 'root' })
    expect(parseDropTarget(id)).toEqual({ kind: 'root' })
  })

  it('round-trips container target', () => {
    const id = dropTargetId({ kind: 'container', parentId: 'abc123' })
    expect(parseDropTarget(id)).toEqual({
      kind: 'container',
      parentId: 'abc123',
    })
  })

  it('returns null for unknown ids', () => {
    expect(parseDropTarget('nonsense')).toBeNull()
  })
})
