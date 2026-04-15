import { createNode, type CompositionNode, type NewNodeSpec } from '../composition'
import { getEntry, type CatalogEntry } from './index'

/**
 * Builds a freshly-id'd composition subtree from a catalog entry,
 * recursively applying each entry's defaultProps + defaultChildren so
 * dropping e.g. a Card yields a real Card with Header/Title/Description/
 * Content seeded, not a bare div.
 *
 * Pure function over catalog data; no React.
 */
export function materialize(typeName: string): CompositionNode | undefined {
  const entry = getEntry(typeName)
  if (!entry) return undefined
  return createNode(specFromEntry(entry))
}

function specFromEntry(entry: CatalogEntry): NewNodeSpec {
  const spec: NewNodeSpec = {
    type: entry.name,
    props: { ...entry.defaultProps },
  }
  if (entry.defaultChildren && entry.defaultChildren.length > 0) {
    spec.children = entry.defaultChildren.map((child) => childSpec(child))
  }
  return spec
}

function childSpec(
  child: NonNullable<CatalogEntry['defaultChildren']>[number]
): NewNodeSpec {
  const entry = getEntry(child.type)
  const base: NewNodeSpec = {
    type: child.type,
    props: { ...(entry?.defaultProps ?? {}), ...(child.props ?? {}) },
    ...(child.slot !== undefined ? { slot: child.slot } : {}),
  }
  if (child.children && child.children.length > 0) {
    base.children = child.children.map(childSpec)
  }
  return base
}
