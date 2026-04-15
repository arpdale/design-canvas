import type { Composition } from '../composition'

/**
 * Shape persisted to localStorage. Versioned so we can migrate if the
 * composition schema evolves without wiping users.
 */
export interface StoredLibrary {
  /** Bump when the persisted shape changes; migration logic in storage.ts. */
  schemaVersion: 1
  compositions: Composition[]
  /** Id of the composition that should open on boot. */
  activeId: string | null
}

export const CURRENT_SCHEMA_VERSION = 1 as const
