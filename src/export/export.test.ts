import { describe, it, expect } from 'vitest'
import {
  collectUsedComponents,
  DS_PACKAGE,
  emitNode,
  exportComposition,
  toComponentName,
  toFilename,
} from './index'
import {
  createComposition,
  createNode,
  insertNode,
} from '../composition'

describe('toComponentName', () => {
  it('PascalCases multi-word names', () => {
    expect(toComponentName('login page')).toBe('LoginPage')
    expect(toComponentName('sign-in screen')).toBe('SignInScreen')
    expect(toComponentName('  foo_bar baz  ')).toBe('FooBarBaz')
  })

  it('preserves already-valid identifiers', () => {
    expect(toComponentName('LoginPage')).toBe('LoginPage')
  })

  it('strips invalid characters', () => {
    expect(toComponentName('login!page?')).toBe('LoginPage')
  })

  it('prefixes C when input starts with a digit', () => {
    expect(toComponentName('404 page')).toBe('C404Page')
  })

  it('falls back when input is empty or all garbage', () => {
    expect(toComponentName('')).toBe('UntitledScreen')
    expect(toComponentName('!!!')).toBe('UntitledScreen')
  })
})

describe('toFilename', () => {
  it('appends .tsx', () => {
    expect(toFilename('LoginPage')).toBe('LoginPage.tsx')
  })
})

describe('collectUsedComponents', () => {
  it('returns all unique component types, sorted', () => {
    let c = createComposition('x')
    c = insertNode(
      c,
      null,
      0,
      createNode({
        type: 'Card',
        children: [
          {
            type: 'CardContent',
            children: [
              { type: 'Input' },
              { type: 'Button', props: { children: 'OK' } },
              { type: 'Button', props: { children: 'Cancel' } },
            ],
          },
        ],
      })
    )
    expect(collectUsedComponents(c.roots)).toEqual([
      'Button',
      'Card',
      'CardContent',
      'Input',
    ])
  })

  it('skips unknown components (not in catalog)', () => {
    let c = createComposition('x')
    c = insertNode(c, null, 0, createNode({ type: 'Unknown' }))
    expect(collectUsedComponents(c.roots)).toEqual([])
  })
})

describe('emitNode — props', () => {
  it('string props use JSON-quoted values', () => {
    const n = createNode({ type: 'Input', props: { placeholder: 'Email' } })
    expect(emitNode(n)).toContain('placeholder="Email"')
  })

  it('boolean true is emitted as a bare prop', () => {
    const n = createNode({ type: 'Input', props: { disabled: true } })
    expect(emitNode(n)).toContain(' disabled')
    expect(emitNode(n)).not.toContain('disabled={true}')
  })

  it('boolean false is emitted as explicit expression', () => {
    const n = createNode({ type: 'Input', props: { disabled: false } })
    expect(emitNode(n)).toContain('disabled={false}')
  })

  it('number props use brace expression', () => {
    const n = createNode({ type: 'Progress', props: { value: 42 } })
    expect(emitNode(n)).toContain('value={42}')
  })

  it('array props are JSON-embedded', () => {
    const n = createNode({
      type: 'Slider',
      props: { defaultValue: [50], min: 0, max: 100, step: 1 },
    })
    expect(emitNode(n)).toContain('defaultValue={[50]}')
  })

  it('text-child components emit children as JSX text, not prop', () => {
    const n = createNode({
      type: 'Button',
      props: { children: 'Sign in', variant: 'default' },
    })
    const out = emitNode(n)
    expect(out).toContain('>Sign in</Button>')
    expect(out).not.toContain('children="Sign in"')
  })

  it('unknown components become JSX comments', () => {
    const n = createNode({ type: 'NotRealComponent' })
    expect(emitNode(n)).toBe('{/* unknown component: NotRealComponent */}')
  })

  it('escapes literal braces and angle brackets in text children', () => {
    const n = createNode({
      type: 'Button',
      props: { children: 'a < b && {x}' },
    })
    const out = emitNode(n)
    expect(out).toContain('&lt;')
    expect(out).toContain('&#123;')
    expect(out).toContain('&#125;')
    expect(out).toContain('&amp;')
  })
})

describe('exportComposition — integration', () => {
  it('produces a self-contained .tsx with an import + named function', async () => {
    let c = createComposition('LoginPage')
    c = insertNode(
      c,
      null,
      0,
      createNode({
        type: 'Card',
        children: [
          {
            type: 'CardContent',
            slot: 'content',
            children: [
              {
                type: 'Input',
                props: { type: 'email', placeholder: 'you@domain.com' },
              },
              {
                type: 'Input',
                props: { type: 'password', placeholder: '••••••••' },
              },
              {
                type: 'Button',
                props: { children: 'Sign in', variant: 'default' },
              },
            ],
          },
        ],
      })
    )

    const result = await exportComposition(c)
    expect(result.componentName).toBe('LoginPage')
    expect(result.filename).toBe('LoginPage.tsx')
    expect(result.source).toContain(
      `import { Button, Card, CardContent, Input } from "${DS_PACKAGE}";`
    )
    expect(result.source).toMatch(/export function LoginPage\(\)/)
    expect(result.source).toContain('Sign in')
    // No stray unknown-component comments
    expect(result.source).not.toContain('unknown component')
  })

  it('empty composition emits a Fragment body (still compilable)', async () => {
    const c = createComposition('Empty')
    const result = await exportComposition(c)
    expect(result.source).toContain('export function Empty()')
    expect(result.source).toContain('<></>')
  })

  it('multi-root composition wraps in a Fragment', async () => {
    let c = createComposition('TwoThings')
    c = insertNode(c, null, 0, createNode({ type: 'Input' }))
    c = insertNode(
      c,
      null,
      1,
      createNode({ type: 'Button', props: { children: 'Go' } })
    )
    const result = await exportComposition(c)
    expect(result.source).toMatch(/<>/)
    expect(result.source).toMatch(/<\/>/)
  })

  it('only imports components that are actually used', async () => {
    let c = createComposition('x')
    c = insertNode(c, null, 0, createNode({ type: 'Button' }))
    const result = await exportComposition(c)
    expect(result.source).toContain('import { Button }')
    expect(result.source).not.toContain('Card')
  })
})
