import type { CompositionNode } from '../composition'
import { walk } from '../composition'
import { getEntry } from '../catalog'

/**
 * Walks the tree collecting every component type used. Filters to names
 * that exist in the catalog (unknown types are elided from the import,
 * and emit.ts renders them as JSX comments so the export still compiles).
 */
export function collectUsedComponents(roots: CompositionNode[]): string[] {
  const used = new Set<string>()
  walk(roots, (node) => {
    if (getEntry(node.type)) used.add(node.type)
  })
  return Array.from(used).sort()
}

export const DS_PACKAGE = '@david-richard/ds-blossom'

export function formatImport(components: string[]): string {
  if (components.length === 0) return ''
  return `import { ${components.join(', ')} } from "${DS_PACKAGE}";`
}
