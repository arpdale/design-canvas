import * as DS from '@david-richard/ds-blossom'
import type { ComponentType } from 'react'

/**
 * Maps catalog `name` → the actual DS component. The registry is derived
 * at module load time from the namespace import; if a catalog entry names
 * a component the DS doesn't export, `getComponent` returns undefined and
 * the render layer shows an error tile.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = DS as unknown as Record<string, ComponentType<any>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getComponent(name: string): ComponentType<any> | undefined {
  const cmp = registry[name]
  return typeof cmp === 'function' || typeof cmp === 'object' ? cmp : undefined
}
