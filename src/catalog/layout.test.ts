import { describe, it, expect } from 'vitest'
import { catalog, getEntry, materialize, panelEntries } from './index'

describe('layout primitives', () => {
  it('Row and Stack are registered', () => {
    expect(getEntry('Row')).toBeDefined()
    expect(getEntry('Stack')).toBeDefined()
  })

  it('Row and Stack are marked structural', () => {
    expect(getEntry('Row')!.structural).toBeDefined()
    expect(getEntry('Stack')!.structural).toBeDefined()
  })

  it('Row classes include flex-row; Stack classes include flex-col', () => {
    const rowClasses = getEntry('Row')!.structural!.classes({ gap: 'md' })
    expect(rowClasses).toMatch(/flex\b/)
    expect(rowClasses).toMatch(/flex-row/)

    const stackClasses = getEntry('Stack')!.structural!.classes({ gap: 'md' })
    expect(stackClasses).toMatch(/flex-col/)
  })

  it('gap prop maps to Tailwind gap classes', () => {
    const row = getEntry('Row')!.structural!
    expect(row.classes({ gap: 'sm' })).toContain('gap-2')
    expect(row.classes({ gap: 'md' })).toContain('gap-3')
    expect(row.classes({ gap: 'lg' })).toContain('gap-6')
  })

  it('unknown gap falls back to md', () => {
    const row = getEntry('Row')!.structural!
    expect(row.classes({ gap: 'huge' })).toContain('gap-3')
  })

  it('both appear in the panel (not hidden)', () => {
    const names = panelEntries().map((e) => e.name)
    expect(names).toContain('Row')
    expect(names).toContain('Stack')
  })

  it('materialize creates a Row with default props', () => {
    const node = materialize('Row')!
    expect(node.type).toBe('Row')
    expect(node.props.gap).toBe('md')
    expect(node.children).toEqual([])
  })
})

describe('ButtonGroup', () => {
  it('is registered and seeds two Buttons', () => {
    expect(catalog['ButtonGroup']).toBeDefined()
    const bg = materialize('ButtonGroup')!
    expect(bg.children).toHaveLength(2)
    expect(bg.children.map((c) => c.type)).toEqual(['Button', 'Button'])
    expect(bg.props.orientation).toBe('horizontal')
  })
})
