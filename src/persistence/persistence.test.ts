import { describe, it, expect } from 'vitest'
import {
  CURRENT_SCHEMA_VERSION,
  STORAGE_KEY,
  loadLibrary,
  saveLibrary,
  type StorageLike,
  type StoredLibrary,
} from './index'
import { createComposition, createNode, insertNode } from '../composition'

function memoryStorage(): StorageLike {
  const store = new Map<string, string>()
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, v),
    removeItem: (k) => void store.delete(k),
  }
}

function sampleLibrary(): StoredLibrary {
  let c = createComposition('LoginPage')
  c = insertNode(c, null, 0, createNode({ type: 'Card' }))
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    compositions: [c],
    activeId: c.id,
  }
}

describe('persistence', () => {
  it('round-trips a library through save → load', () => {
    const storage = memoryStorage()
    const lib = sampleLibrary()
    saveLibrary(lib, storage)
    expect(loadLibrary(storage)).toEqual(lib)
  })

  it('returns undefined when storage is empty', () => {
    expect(loadLibrary(memoryStorage())).toBeUndefined()
  })

  it('returns undefined when stored data is invalid JSON', () => {
    const storage = memoryStorage()
    storage.setItem(STORAGE_KEY, '{not json')
    expect(loadLibrary(storage)).toBeUndefined()
  })

  it('returns undefined when stored data has wrong schemaVersion', () => {
    const storage = memoryStorage()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, compositions: [], activeId: null })
    )
    expect(loadLibrary(storage)).toBeUndefined()
  })

  it('returns undefined when compositions is not an array', () => {
    const storage = memoryStorage()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        compositions: 'nope',
        activeId: null,
      })
    )
    expect(loadLibrary(storage)).toBeUndefined()
  })

  it('tolerates missing activeId (treats as null)', () => {
    const storage = memoryStorage()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        compositions: [],
      })
    )
    expect(loadLibrary(storage)).toEqual({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      compositions: [],
      activeId: null,
    })
  })

  it('saveLibrary does not throw when storage rejects writes', () => {
    const rejecting: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota exceeded')
      },
      removeItem: () => {},
    }
    expect(() => saveLibrary(sampleLibrary(), rejecting)).not.toThrow()
  })
})
