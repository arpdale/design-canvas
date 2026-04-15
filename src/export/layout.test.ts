import { describe, it, expect } from 'vitest'
import {
  collectUsedComponents,
  emitNode,
  exportComposition,
} from './index'
import {
  createComposition,
  createNode,
  insertNode,
} from '../composition'

describe('export — layout primitives', () => {
  it('Row emits as a div with flex classes, not an import', () => {
    const row = createNode({
      type: 'Row',
      props: { gap: 'md', align: 'stretch' },
      children: [
        { type: 'Button', props: { children: 'Cancel', variant: 'outline' } },
        { type: 'Button', props: { children: 'Submit', variant: 'default' } },
      ],
    })
    const out = emitNode(row)
    expect(out).toMatch(/^<div className="/)
    expect(out).toContain('flex')
    expect(out).toContain('flex-row')
    expect(out).toContain('gap-3')
    expect(out).toContain('Cancel')
    expect(out).toContain('Submit')
  })

  it('Stack emits as a flex-col div', () => {
    const stack = createNode({
      type: 'Stack',
      props: { gap: 'lg', align: 'start' },
      children: [{ type: 'Button', props: { children: 'Only' } }],
    })
    const out = emitNode(stack)
    expect(out).toContain('flex-col')
    expect(out).toContain('gap-6')
    expect(out).toContain('items-start')
  })

  it('collectUsedComponents skips structural entries (Row/Stack)', () => {
    let c = createComposition('x')
    c = insertNode(
      c,
      null,
      0,
      createNode({
        type: 'Row',
        children: [{ type: 'Button', props: { children: 'A' } }],
      })
    )
    // Only Button should be imported; Row is structural.
    expect(collectUsedComponents(c.roots)).toEqual(['Button'])
  })

  it('full export with Row does not import Row', async () => {
    let c = createComposition('TwoButtons')
    c = insertNode(
      c,
      null,
      0,
      createNode({
        type: 'Row',
        props: { gap: 'md', align: 'stretch' },
        children: [
          { type: 'Button', props: { children: 'Cancel', variant: 'outline' } },
          { type: 'Button', props: { children: 'Submit', variant: 'default' } },
        ],
      })
    )
    const result = await exportComposition(c)
    expect(result.source).toContain('import { Button }')
    expect(result.source).not.toContain(', Row }')
    expect(result.source).not.toContain('{ Row }')
    expect(result.source).toContain('<div className=')
    expect(result.source).toContain('flex')
  })

  it('ButtonGroup IS imported (it is a real DS component)', async () => {
    let c = createComposition('x')
    c = insertNode(
      c,
      null,
      0,
      createNode({
        type: 'ButtonGroup',
        props: { orientation: 'horizontal' },
        children: [
          { type: 'Button', props: { children: 'Cancel' } },
          { type: 'Button', props: { children: 'Submit' } },
        ],
      })
    )
    const result = await exportComposition(c)
    expect(result.source).toContain('ButtonGroup')
    expect(result.source).toMatch(/import \{[^}]*ButtonGroup[^}]*\}/)
  })
})
