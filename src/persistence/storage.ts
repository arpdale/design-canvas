import { CURRENT_SCHEMA_VERSION, type StoredLibrary } from './types'

export const STORAGE_KEY = 'design-canvas:library'

/**
 * Thin wrapper around the localStorage interface so tests can inject a
 * fake (see persistence.test.ts). Also tolerates SSR / unavailable
 * storage by returning a no-op backend.
 */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function getLocalStorage(): StorageLike {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      return (globalThis as unknown as { localStorage: StorageLike })
        .localStorage
    }
  } catch {
    // Access can throw in privacy mode.
  }
  return noopStorage()
}

function noopStorage(): StorageLike {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
}

/**
 * Load a library from storage. Returns undefined if nothing stored or
 * stored data is invalid/unreadable — caller should initialize fresh.
 */
export function loadLibrary(storage: StorageLike = getLocalStorage()):
  | StoredLibrary
  | undefined {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw)
    return migrate(parsed)
  } catch {
    return undefined
  }
}

export function saveLibrary(
  library: StoredLibrary,
  storage: StorageLike = getLocalStorage()
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(library))
  } catch {
    // Quota exceeded / unavailable — fail silently. Users are one refresh
    // away from losing data anyway in MVP; proper handling is a v0.5 task.
  }
}

/**
 * Forward-compatible migration hook. Today there's only one version, so
 * this is a passthrough with shape validation. When a future version
 * introduces a breaking change, migrate() grows a case.
 */
function migrate(value: unknown): StoredLibrary | undefined {
  if (!value || typeof value !== 'object') return undefined
  const candidate = value as Partial<StoredLibrary>
  if (candidate.schemaVersion !== CURRENT_SCHEMA_VERSION) return undefined
  if (!Array.isArray(candidate.compositions)) return undefined
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    compositions: candidate.compositions,
    activeId: candidate.activeId ?? null,
  }
}
