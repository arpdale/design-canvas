/**
 * Component catalog types. Like src/composition/, this module is pure data —
 * no React imports. The catalog describes DS components to the canvas;
 * the canvas consumes it at render time.
 */

import type { JsonValue } from '../composition/types'

export type PropSchema =
  | StringProp
  | NumberProp
  | EnumProp
  | BooleanProp

export interface PropBase {
  name: string
  label?: string
  /** Shown under the field in the inspector. */
  hint?: string
}

export interface StringProp extends PropBase {
  kind: 'string'
  placeholder?: string
  /** When true, renders a textarea instead of an input. */
  multiline?: boolean
}

export interface NumberProp extends PropBase {
  kind: 'number'
  min?: number
  max?: number
  step?: number
}

export interface EnumProp extends PropBase {
  kind: 'enum'
  values: string[]
}

export interface BooleanProp extends PropBase {
  kind: 'boolean'
}

export type CatalogCategory =
  | 'input'
  | 'layout'
  | 'display'
  | 'feedback'
  | 'nav'
  | 'typography'

export interface SlotSpec {
  /** Slot identifier stored on child nodes as `node.slot`. */
  name: string
  /** Catalog `name` values allowed in this slot. Empty = any. */
  accepts?: string[]
  /**
   * Rendering order hint (lower first). Cards usually want
   * header (0) → content (10) → footer (20).
   */
  order: number
  /** True if multiple children may occupy this slot. */
  multiple?: boolean
}

export interface CatalogEntry {
  /** Must match a named export from @david-richard/ds-blossom. */
  name: string
  /** Human label for the panel (defaults to `name`). */
  displayName?: string
  category: CatalogCategory
  /**
   * 1 = trivial passthrough; 2 = compound with slots; 3 = stateful
   * (deferred to v0.5 — not included in MVP catalog).
   */
  tier: 1 | 2 | 3
  /**
   * True if this component renders children as generic slot content
   * (e.g. a CardContent accepting any children). False for leaves
   * (Button, Input) or strict-slot parents (Card, which requires
   * structured subcomponents).
   */
  acceptsChildren: boolean
  /**
   * For compound parents. The canvas enforces slot order + accepts rules.
   * Undefined for leaves and generic-children components.
   */
  slots?: SlotSpec[]
  /**
   * Applied when a node of this type is created. Must be JSON-serializable.
   */
  defaultProps: Record<string, JsonValue>
  /**
   * Props editable in the inspector. Props omitted here are not shown in
   * the UI but may still carry defaults.
   */
  propSchema: PropSchema[]
  /**
   * If set, this component expects a literal text child (no component
   * children). The catalog panel inserts a `children` prop in defaultProps
   * that is a plain string, edited as a `string` PropSchema under the
   * same key.
   */
  textChild?: boolean
  /**
   * If true, this entry exists in the catalog for render/export purposes
   * but is not shown as a draggable item in the component panel. Used for
   * subcomponents (e.g. CardHeader) that are only inserted as part of a
   * compound parent's default seed.
   */
  hidden?: boolean
  /**
   * For compound parents: default child subtree seeded when the component
   * is added. Lets us drop a Card with its typical structure rather than
   * a bare Card the user must then populate by hand.
   */
  defaultChildren?: Array<{
    type: string
    slot?: string
    props?: Record<string, JsonValue>
    children?: CatalogEntry['defaultChildren']
  }>
  /**
   * Structural entries are emitted as plain HTML (e.g. a div with Tailwind
   * classes), not imported from the DS. Used for layout primitives like
   * Row and Stack. See technical-approach.md — layout primitives are
   * intentionally not DS components; they're markup the designer assembles
   * between DS components.
   */
  structural?: StructuralConfig
  /**
   * Hint for the canvas's reorder indicators: are this entry's children
   * arranged horizontally or vertically? Affects only the orientation of
   * the insertion bar between siblings. Defaults to 'column' for normal
   * containers and 'row' only for Row-style flex containers.
   */
  childFlow?: 'row' | 'column'
}

export interface StructuralConfig {
  /** HTML tag to render / emit. */
  tag: 'div' | 'span'
  /** Computes the className string from the current props. */
  classes: (props: Record<string, JsonValue>) => string
}

export type Catalog = Record<string, CatalogEntry>
