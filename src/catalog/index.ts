import type { Catalog, CatalogEntry } from './types'
import { tier1 } from './entries/tier1'
import { tier2 } from './entries/tier2'

export type {
  Catalog,
  CatalogCategory,
  CatalogEntry,
  PropSchema,
  StringProp,
  NumberProp,
  EnumProp,
  BooleanProp,
  SlotSpec,
} from './types'

const allEntries: CatalogEntry[] = [...tier1, ...tier2]

/**
 * Indexed catalog, keyed by `name` (matches the DS export name).
 */
export const catalog: Catalog = Object.freeze(
  allEntries.reduce<Catalog>((acc, entry) => {
    acc[entry.name] = entry
    return acc
  }, {})
)

/**
 * Entries shown in the component panel (top-level, draggable).
 * Excludes hidden subcomponents.
 */
export function panelEntries(): CatalogEntry[] {
  return allEntries.filter((e) => !e.hidden)
}

/**
 * Look up a catalog entry by type name. Returns undefined if unknown.
 */
export function getEntry(name: string): CatalogEntry | undefined {
  return catalog[name]
}
