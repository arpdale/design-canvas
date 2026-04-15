import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act, render } from '@testing-library/react'
import { useCanvasStore } from './canvasStore'
import { createNode } from '../../composition'
import { STORAGE_KEY } from '../../persistence'

interface Handle {
  store: ReturnType<typeof useCanvasStore>
}

function Harness({ onMount }: { onMount: (h: Handle) => void }) {
  const store = useCanvasStore()
  onMount({ store })
  return null
}

describe('useCanvasStore (integration)', () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY)
  })
  afterEach(() => {
    window.localStorage.removeItem(STORAGE_KEY)
  })

  it('initializes with a single "Untitled" composition when storage is empty', () => {
    let h: Handle | null = null
    render(<Harness onMount={(handle) => (h = handle)} />)
    expect(h!.store.compositions).toHaveLength(1)
    expect(h!.store.active?.name).toBe('Untitled')
    expect(h!.store.activeId).toBe(h!.store.compositions[0].id)
  })

  it('auto-saves after debounce', async () => {
    let h: Handle | null = null
    render(<Harness onMount={(handle) => (h = handle)} />)
    const btn = createNode({ type: 'Button' })
    act(() => {
      h!.store.insertAt(null, 0, btn)
    })
    // Wait for debounce (250ms) + margin
    await new Promise((r) => setTimeout(r, 350))
    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.schemaVersion).toBe(1)
    expect(parsed.compositions[0].roots).toHaveLength(1)
    expect(parsed.compositions[0].roots[0].type).toBe('Button')
  })

  it('loads existing library from storage on mount', () => {
    const seed = {
      schemaVersion: 1,
      compositions: [
        {
          id: 'seed-comp',
          name: 'Saved',
          roots: [],
          updatedAt: 0,
        },
      ],
      activeId: 'seed-comp',
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))

    let h: Handle | null = null
    render(<Harness onMount={(handle) => (h = handle)} />)
    expect(h!.store.active?.name).toBe('Saved')
    expect(h!.store.activeId).toBe('seed-comp')
  })
})
