import type { CompositionNode } from '../composition'
import { walk } from '../composition'
import { getEntry } from '../catalog'

/**
 * Walks the tree collecting every component type used. Only DS-backed
 * entries contribute to the import line; structural entries (Row, Stack)
 * emit as divs and don't need importing. Unknown types are elided.
 */
export function collectUsedComponents(roots: CompositionNode[]): string[] {
  const used = new Set<string>()
  walk(roots, (node) => {
    const entry = getEntry(node.type)
    if (entry && !entry.structural) used.add(node.type)
  })
  return Array.from(used).sort()
}

export const DS_PACKAGE = '@david-richard/ds-blossom'

export function formatImport(components: string[]): string {
  if (components.length === 0) return ''
  return `import { ${components.join(', ')} } from "${DS_PACKAGE}";`
}
