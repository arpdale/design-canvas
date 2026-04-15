import { describe, it, expect } from 'vitest'
import { materialize } from './index'

describe('catalog — materialize', () => {
  it('returns undefined for unknown types', () => {
    expect(materialize('NotAComponent')).toBeUndefined()
  })

  it('creates a leaf with defaults applied', () => {
    const node = materialize('Button')!
    expect(node.type).toBe('Button')
    expect(node.props.children).toBe('Button')
    expect(node.props.variant).toBe('default')
    expect(node.children).toEqual([])
    expect(typeof node.id).toBe('string')
  })

  it('seeds a Card with Header + Content subtree', () => {
    const card = materialize('Card')!
    expect(card.type).toBe('Card')
    expect(card.children).toHaveLength(2)
    const [header, content] = card.children
    expect(header.type).toBe('CardHeader')
    expect(header.slot).toBe('header')
    expect(content.type).toBe('CardContent')
    expect(content.slot).toBe('content')
    // Header has title + description seeded
    expect(header.children.map((c) => c.type)).toEqual([
      'CardTitle',
      'CardDescription',
    ])
  })

  it('every materialized subtree is JSON-serializable', () => {
    for (const type of ['Card', 'Tabs', 'Accordion', 'Breadcrumb']) {
      const node = materialize(type)!
      expect(JSON.parse(JSON.stringify(node))).toEqual(node)
    }
  })

  it('materialized nodes have unique ids across the subtree', () => {
    const card = materialize('Card')!
    const ids = new Set<string>()
    function collect(n: typeof card) {
      ids.add(n.id)
      for (const c of n.children) collect(c)
    }
    collect(card)
    // Card + Header + Title + Description + Content = 5 nodes
    expect(ids.size).toBe(5)
  })
})
