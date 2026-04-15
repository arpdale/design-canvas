/**
 * The composition state tree. Must remain JSON-serializable at all times.
 *
 * Invariant (enforced by tests + lint): this module imports nothing from
 * React. Composition state is pure data. See docs/planning/technical-approach.md
 * §5 for the load-bearing constraint.
 */

export type NodeId = string

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export interface CompositionNode {
  id: NodeId
  /** Component export name, matches an entry in the catalog (e.g. "Button"). */
  type: string
  /** Prop values. Must be JSON-serializable. */
  props: Record<string, JsonValue>
  /** Child nodes, in order. Empty for leaves. */
  children: CompositionNode[]
  /**
   * For compound components, the slot this node occupies in its parent
   * (e.g. "header", "content", "footer"). Undefined for top-level or
   * single-slot parents.
   */
  slot?: string
}

export interface Composition {
  id: string
  name: string
  /** Root nodes. Typically one, but the model allows multiple. */
  roots: CompositionNode[]
  /** Unix ms timestamp of last mutation. */
  updatedAt: number
}
