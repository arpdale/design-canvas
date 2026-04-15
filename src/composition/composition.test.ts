import { describe, expect, it } from 'vitest'
import {
  createComposition,
  createNode,
  findNode,
  findParent,
  insertNode,
  moveNode,
  removeNode,
  renameComposition,
  replaceProps,
  updateProp,
  walk,
} from './index'

describe('composition — serialization invariant', () => {
  it('a populated composition survives JSON round-trip byte-for-byte', () => {
    let c = createComposition('LoginPage')
    const card = createNode({
      type: 'Card',
      children: [
        {
          type: 'CardContent',
          slot: 'content',
          children: [
            { type: 'Input', props: { type: 'email', placeholder: 'Email' } },
            {
              type: 'Input',
              props: { type: 'password', placeholder: 'Password' },
            },
            { type: 'Button', props: { variant: 'default' } },
          ],
        },
      ],
    })
    c = insertNode(c, null, 0, card)

    const json = JSON.stringify(c)
    const restored = JSON.parse(json)
    expect(restored).toEqual(c)
    expect(JSON.stringify(restored)).toBe(json)
  })

  it('rejects non-JSON values by construction — state type is JsonValue', () => {
    // This is a TS-level guarantee. We assert runtime: no function or symbol
    // should ever appear after serialization.
    const c = createComposition('x')
    const node = createNode({ type: 'Button', props: { label: 'Hi' } })
    const updated = insertNode(c, null, 0, node)
    const roundTripped = JSON.parse(JSON.stringify(updated))
    walk(roundTripped.roots, (n) => {
      for (const v of Object.values(n.props)) {
        expect(typeof v).not.toBe('function')
        expect(typeof v).not.toBe('symbol')
      }
    })
  })
})

describe('composition — mutation purity', () => {
  it('mutations return new objects without mutating inputs', () => {
    const original = createComposition('X')
    const snapshot = JSON.parse(JSON.stringify(original))
    const node = createNode({ type: 'Button' })

    const afterInsert = insertNode(original, null, 0, node)
    expect(original).toEqual(snapshot)
    expect(afterInsert).not.toBe(original)
    expect(afterInsert.roots).toHaveLength(1)
    expect(original.roots).toHaveLength(0)
  })

  it('updatedAt is bumped on every mutation', async () => {
    const c0 = createComposition('X')
    await new Promise((r) => setTimeout(r, 2))
    const c1 = insertNode(c0, null, 0, createNode({ type: 'Button' }))
    expect(c1.updatedAt).toBeGreaterThan(c0.updatedAt)
  })
})

describe('composition — insertNode', () => {
  it('inserts a root at index 0', () => {
    let c = createComposition('X')
    c = insertNode(c, null, 0, createNode({ type: 'Card' }))
    expect(c.roots).toHaveLength(1)
    expect(c.roots[0].type).toBe('Card')
  })

  it('inserts as a child of an existing node', () => {
    let c = createComposition('X')
    const card = createNode({ type: 'Card' })
    c = insertNode(c, null, 0, card)
    c = insertNode(c, card.id, 0, createNode({ type: 'Input' }))
    expect(c.roots[0].children).toHaveLength(1)
    expect(c.roots[0].children[0].type).toBe('Input')
  })

  it('clamps out-of-range index to end of list', () => {
    let c = createComposition('X')
    c = insertNode(c, null, 0, createNode({ type: 'A' }))
    c = insertNode(c, null, 99, createNode({ type: 'B' }))
    expect(c.roots.map((n) => n.type)).toEqual(['A', 'B'])
  })

  it('no-op when parentId does not exist', () => {
    const c0 = createComposition('X')
    const c1 = insertNode(c0, 'missing', 0, createNode({ type: 'X' }))
    expect(c1.roots).toHaveLength(0)
  })
})

describe('composition — removeNode', () => {
  it('removes a root', () => {
    let c = createComposition('X')
    const a = createNode({ type: 'A' })
    c = insertNode(c, null, 0, a)
    c = removeNode(c, a.id)
    expect(c.roots).toHaveLength(0)
  })

  it('removes a deeply nested child', () => {
    let c = createComposition('X')
    const card = createNode({
      type: 'Card',
      children: [{ type: 'Content', children: [{ type: 'Input' }] }],
    })
    c = insertNode(c, null, 0, card)
    const innerInput = findNode(c.roots, card.children[0].children[0].id)!
    c = removeNode(c, innerInput.id)
    expect(c.roots[0].children[0].children).toHaveLength(0)
  })

  it('no-op when id not found', () => {
    const c0 = createComposition('X')
    const c1 = removeNode(c0, 'missing')
    expect(c1.roots).toEqual(c0.roots)
  })
})

describe('composition — moveNode', () => {
  it('moves a root into a child slot', () => {
    let c = createComposition('X')
    const card = createNode({ type: 'Card' })
    const btn = createNode({ type: 'Button' })
    c = insertNode(c, null, 0, card)
    c = insertNode(c, null, 1, btn)
    c = moveNode(c, btn.id, card.id, 0)
    expect(c.roots).toHaveLength(1)
    expect(c.roots[0].children[0].id).toBe(btn.id)
  })

  it('reorders siblings', () => {
    let c = createComposition('X')
    const a = createNode({ type: 'A' })
    const b = createNode({ type: 'B' })
    c = insertNode(c, null, 0, a)
    c = insertNode(c, null, 1, b)
    c = moveNode(c, b.id, null, 0)
    expect(c.roots.map((n) => n.id)).toEqual([b.id, a.id])
  })

  it('same-parent reorder uses pre-move intent indices (rightward)', () => {
    // Pre-move list: [a, b, c, d, e]. Drag `c` to gap 4 (between d and e).
    // The user expects: [a, b, d, c, e].
    let comp = createComposition('X')
    const a = createNode({ type: 'A' })
    const b = createNode({ type: 'B' })
    const c = createNode({ type: 'C' })
    const d = createNode({ type: 'D' })
    const e = createNode({ type: 'E' })
    for (const [i, n] of [a, b, c, d, e].entries()) {
      comp = insertNode(comp, null, i, n)
    }
    comp = moveNode(comp, c.id, null, 4)
    expect(comp.roots.map((n) => n.id)).toEqual([a.id, b.id, d.id, c.id, e.id])
  })

  it('same-parent reorder leftward uses the literal index', () => {
    // Pre-move: [a, b, c, d]. Move `d` to gap 1 → [a, d, b, c].
    let comp = createComposition('X')
    const a = createNode({ type: 'A' })
    const b = createNode({ type: 'B' })
    const c = createNode({ type: 'C' })
    const d = createNode({ type: 'D' })
    for (const [i, n] of [a, b, c, d].entries()) {
      comp = insertNode(comp, null, i, n)
    }
    comp = moveNode(comp, d.id, null, 1)
    expect(comp.roots.map((n) => n.id)).toEqual([a.id, d.id, b.id, c.id])
  })

  it('same-parent reorder to current position is a no-op', () => {
    let comp = createComposition('X')
    const a = createNode({ type: 'A' })
    const b = createNode({ type: 'B' })
    const c = createNode({ type: 'C' })
    for (const [i, n] of [a, b, c].entries()) {
      comp = insertNode(comp, null, i, n)
    }
    // `b` is at index 1; moving it to gap 1 means "don't move."
    comp = moveNode(comp, b.id, null, 1)
    expect(comp.roots.map((n) => n.id)).toEqual([a.id, b.id, c.id])
  })

  it('rejects moving a node into its own subtree', () => {
    let c = createComposition('X')
    const card = createNode({
      type: 'Card',
      children: [{ type: 'Content' }],
    })
    c = insertNode(c, null, 0, card)
    const content = card.children[0]
    const before = JSON.parse(JSON.stringify(c))
    c = moveNode(c, card.id, content.id, 0)
    expect(c).toEqual(before) // unchanged
  })
})

describe('composition — updateProp / replaceProps', () => {
  it('updateProp sets a single prop', () => {
    let c = createComposition('X')
    const btn = createNode({ type: 'Button', props: { variant: 'default' } })
    c = insertNode(c, null, 0, btn)
    c = updateProp(c, btn.id, 'variant', 'destructive')
    expect(findNode(c.roots, btn.id)!.props.variant).toBe('destructive')
  })

  it('updateProp with undefined deletes the prop', () => {
    let c = createComposition('X')
    const btn = createNode({ type: 'Button', props: { variant: 'default' } })
    c = insertNode(c, null, 0, btn)
    c = updateProp(c, btn.id, 'variant', undefined)
    expect(findNode(c.roots, btn.id)!.props).not.toHaveProperty('variant')
  })

  it('replaceProps swaps the whole bag', () => {
    let c = createComposition('X')
    const btn = createNode({
      type: 'Button',
      props: { variant: 'default', size: 'sm' },
    })
    c = insertNode(c, null, 0, btn)
    c = replaceProps(c, btn.id, { variant: 'destructive' })
    expect(findNode(c.roots, btn.id)!.props).toEqual({ variant: 'destructive' })
  })
})

describe('composition — traversal', () => {
  it('findParent returns parent and index', () => {
    let c = createComposition('X')
    const card = createNode({ type: 'Card', children: [{ type: 'Input' }] })
    c = insertNode(c, null, 0, card)
    const inputId = card.children[0].id
    const found = findParent(c.roots, inputId)!
    expect(found.parent.id).toBe(card.id)
    expect(found.index).toBe(0)
  })

  it('findParent returns undefined for roots', () => {
    let c = createComposition('X')
    const a = createNode({ type: 'A' })
    c = insertNode(c, null, 0, a)
    expect(findParent(c.roots, a.id)).toBeUndefined()
  })

  it('walk visits every node with correct depth', () => {
    let c = createComposition('X')
    const card = createNode({
      type: 'Card',
      children: [{ type: 'Content', children: [{ type: 'Input' }] }],
    })
    c = insertNode(c, null, 0, card)
    const depths: number[] = []
    walk(c.roots, (_, d) => {
      depths.push(d)
    })
    expect(depths).toEqual([0, 1, 2])
  })

  it('walk stops when visitor returns false', () => {
    let c = createComposition('X')
    c = insertNode(c, null, 0, createNode({ type: 'A' }))
    c = insertNode(c, null, 1, createNode({ type: 'B' }))
    const visited: string[] = []
    walk(c.roots, (n) => {
      visited.push(n.type)
      if (n.type === 'A') return false
    })
    expect(visited).toEqual(['A'])
  })
})

describe('composition — rename', () => {
  it('renameComposition updates name and bumps updatedAt', async () => {
    const c0 = createComposition('Old')
    await new Promise((r) => setTimeout(r, 2))
    const c1 = renameComposition(c0, 'New')
    expect(c1.name).toBe('New')
    expect(c1.updatedAt).toBeGreaterThan(c0.updatedAt)
  })
})
