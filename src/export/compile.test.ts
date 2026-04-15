import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { exportComposition } from './index'
import {
  createComposition,
  createNode,
  insertNode,
  type Composition,
} from '../composition'

/**
 * Non-negotiable thesis test: an emitted composition must compile
 * unchanged against the installed @david-richard/ds-blossom package.
 *
 * We write the generated .tsx into e2e/fixtures/compile/__generated__.tsx
 * and spawn `tsc --noEmit -p e2e/fixtures/compile` to check it. The
 * fixture's tsconfig.json is pre-configured to resolve the DS package
 * from the project's node_modules.
 */
const FIXTURE_DIR = resolve(__dirname, '../../e2e/fixtures/compile')
const GENERATED = resolve(FIXTURE_DIR, '__generated__.tsx')

function compile(composition: Composition) {
  return exportComposition(composition).then((result) => {
    writeFileSync(GENERATED, result.source, 'utf-8')
    try {
      const proc = spawnSync(
        'npx',
        ['--no-install', 'tsc', '--noEmit', '-p', FIXTURE_DIR],
        { encoding: 'utf-8' }
      )
      return { result, proc }
    } finally {
      if (existsSync(GENERATED)) unlinkSync(GENERATED)
    }
  })
}

describe('exportComposition — external compile', () => {
  it('a login-shaped composition compiles against the installed DS', async () => {
    let c = createComposition('LoginPage')
    c = insertNode(
      c,
      null,
      0,
      createNode({
        type: 'Card',
        children: [
          {
            type: 'CardHeader',
            slot: 'header',
            children: [
              { type: 'CardTitle', props: { children: 'Welcome back' } },
              {
                type: 'CardDescription',
                props: { children: 'Sign in to your account.' },
              },
            ],
          },
          {
            type: 'CardContent',
            slot: 'content',
            children: [
              { type: 'Label', props: { children: 'Email' } },
              {
                type: 'Input',
                props: { type: 'email', placeholder: 'you@domain.com' },
              },
              { type: 'Label', props: { children: 'Password' } },
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

    const { result, proc } = await compile(c)
    if (proc.status !== 0) {
      // Surface the generated source + compiler output on failure.
      console.error('=== generated source ===\n' + result.source)
      console.error('=== tsc stdout ===\n' + proc.stdout)
      console.error('=== tsc stderr ===\n' + proc.stderr)
    }
    expect(proc.status).toBe(0)
  }, 30_000)

  it('a Row with two Buttons compiles (layout primitive gate)', async () => {
    let c = createComposition('CancelSubmit')
    c = insertNode(
      c,
      null,
      0,
      createNode({
        type: 'Row',
        props: { gap: 'md', align: 'center' },
        children: [
          { type: 'Button', props: { children: 'Cancel', variant: 'outline' } },
          { type: 'Button', props: { children: 'Submit', variant: 'default' } },
        ],
      })
    )
    const { result, proc } = await compile(c)
    if (proc.status !== 0) {
      console.error(result.source)
      console.error(proc.stderr)
    }
    expect(proc.status).toBe(0)
  }, 30_000)

  it('a ButtonGroup with two Buttons compiles (DS grouping primitive)', async () => {
    let c = createComposition('ButtonsGrouped')
    c = insertNode(
      c,
      null,
      0,
      createNode({
        type: 'ButtonGroup',
        props: { orientation: 'horizontal' },
        children: [
          { type: 'Button', props: { children: 'Back', variant: 'outline' } },
          { type: 'Button', props: { children: 'Next', variant: 'default' } },
        ],
      })
    )
    const { result, proc } = await compile(c)
    if (proc.status !== 0) {
      console.error(result.source)
      console.error(proc.stderr)
    }
    expect(proc.status).toBe(0)
  }, 30_000)

  it('a simple Button composition compiles', async () => {
    let c = createComposition('Hello')
    c = insertNode(
      c,
      null,
      0,
      createNode({ type: 'Button', props: { children: 'Hi', variant: 'default' } })
    )
    const { result, proc } = await compile(c)
    if (proc.status !== 0) {
      console.error(result.source)
      console.error(proc.stderr)
    }
    expect(proc.status).toBe(0)
  }, 30_000)
})
