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

  it('round-trips root-level gap target', () => {
    const id = dropTargetId({ kind: 'gap', parentId: null, index: 3 })
    expect(id).toBe('gap:root:3')
    expect(parseDropTarget(id)).toEqual({
      kind: 'gap',
      parentId: null,
      index: 3,
    })
  })

  it('round-trips container gap target', () => {
    const id = dropTargetId({ kind: 'gap', parentId: 'abc123', index: 0 })
    expect(id).toBe('gap:abc123:0')
    expect(parseDropTarget(id)).toEqual({
      kind: 'gap',
      parentId: 'abc123',
      index: 0,
    })
  })

  it('rejects gap with negative or non-numeric index', () => {
    expect(parseDropTarget('gap:x:-1')).toBeNull()
    expect(parseDropTarget('gap:x:abc')).toBeNull()
  })
})
