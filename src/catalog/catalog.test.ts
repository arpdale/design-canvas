import { describe, expect, it } from 'vitest'
import { catalog, getEntry, panelEntries } from './index'
import type { CatalogEntry, PropSchema } from './types'

const entries = Object.values(catalog)

describe('catalog — shape', () => {
  it('has at least 35 entries (Tier 1 + Tier 2)', () => {
    expect(entries.length).toBeGreaterThanOrEqual(35)
  })

  it('panel exposes at least 14 draggable entries', () => {
    expect(panelEntries().length).toBeGreaterThanOrEqual(14)
  })

  it('panel entries are never hidden', () => {
    for (const e of panelEntries()) {
      expect(e.hidden).not.toBe(true)
    }
  })

  it('every entry has a tier of 1 or 2 (Tier 3 deferred)', () => {
    for (const e of entries) {
      expect([1, 2]).toContain(e.tier)
    }
  })

  it('entry names are unique', () => {
    const names = entries.map((e) => e.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('catalog — defaultProps validity', () => {
  function validate(entry: CatalogEntry) {
    for (const schema of entry.propSchema) {
      const value = entry.defaultProps[schema.name]
      if (value === undefined) continue // prop may be optional
      assertValid(entry.name, schema, value)
    }
  }

  function assertValid(
    entryName: string,
    schema: PropSchema,
    value: unknown
  ) {
    const ctx = `${entryName}.${schema.name}`
    switch (schema.kind) {
      case 'string':
        expect(typeof value, ctx).toBe('string')
        break
      case 'number':
        expect(typeof value, ctx).toBe('number')
        if (schema.min !== undefined) {
          expect(value as number).toBeGreaterThanOrEqual(schema.min)
        }
        if (schema.max !== undefined) {
          expect(value as number).toBeLessThanOrEqual(schema.max)
        }
        break
      case 'boolean':
        expect(typeof value, ctx).toBe('boolean')
        break
      case 'enum':
        expect(schema.values, ctx).toContain(value)
        break
    }
  }

  for (const entry of entries) {
    it(`${entry.name}: defaultProps satisfy propSchema`, () => {
      validate(entry)
    })
  }
})

describe('catalog — defaultProps are JSON-serializable', () => {
  for (const entry of entries) {
    it(`${entry.name}: defaults round-trip through JSON`, () => {
      const restored = JSON.parse(JSON.stringify(entry.defaultProps))
      expect(restored).toEqual(entry.defaultProps)
    })
  }
})

describe('catalog — slot and subcomponent references', () => {
  it('every slot.accepts name refers to a real catalog entry', () => {
    for (const entry of entries) {
      if (!entry.slots) continue
      for (const slot of entry.slots) {
        if (!slot.accepts) continue
        for (const childName of slot.accepts) {
          expect(
            catalog[childName],
            `${entry.name} slot "${slot.name}" accepts unknown component "${childName}"`
          ).toBeDefined()
        }
      }
    }
  })

  it('every defaultChildren type refers to a real catalog entry', () => {
    function walk(children: NonNullable<CatalogEntry['defaultChildren']>) {
      for (const c of children) {
        expect(catalog[c.type], `unknown subcomponent ${c.type}`).toBeDefined()
        if (c.children) walk(c.children)
      }
    }
    for (const entry of entries) {
      if (entry.defaultChildren) walk(entry.defaultChildren)
    }
  })
})

describe('catalog — text-child invariant', () => {
  it('textChild entries carry a string `children` default + schema', () => {
    for (const e of entries) {
      if (!e.textChild) continue
      expect(typeof e.defaultProps.children, `${e.name}`).toBe('string')
      const hasChildrenSchema = e.propSchema.some(
        (s) => s.name === 'children' && s.kind === 'string'
      )
      expect(hasChildrenSchema, `${e.name} missing children schema`).toBe(true)
    }
  })

  it('textChild entries never accept component children', () => {
    for (const e of entries) {
      if (e.textChild) expect(e.acceptsChildren).toBe(false)
    }
  })
})

describe('catalog — lookup', () => {
  it('getEntry returns a known entry', () => {
    expect(getEntry('Button')).toBeDefined()
    expect(getEntry('Button')!.name).toBe('Button')
  })

  it('getEntry returns undefined for unknown', () => {
    expect(getEntry('NotARealComponent')).toBeUndefined()
  })

  it('login demo requirements are all present', () => {
    for (const name of [
      'Card',
      'CardHeader',
      'CardTitle',
      'CardDescription',
      'CardContent',
      'CardFooter',
      'Input',
      'Label',
      'Button',
    ]) {
      expect(getEntry(name), name).toBeDefined()
    }
  })
})
