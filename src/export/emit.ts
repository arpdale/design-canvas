import type { CompositionNode, JsonValue } from '../composition'
import { getEntry } from '../catalog'

/**
 * Emit a composition subtree as a JSX string (unformatted — prettier
 * pass happens in index.ts). Unknown component types render as JSX
 * comments so the export still parses.
 */
export function emitNode(node: CompositionNode): string {
  const entry = getEntry(node.type)
  if (!entry) {
    return `{/* unknown component: ${node.type} */}`
  }

  const propAttrs = emitProps(node.props, entry.textChild === true)
  const tagStart = `<${node.type}${propAttrs ? ' ' + propAttrs : ''}`

  if (entry.textChild) {
    const text = typeof node.props.children === 'string' ? node.props.children : ''
    // Always wrap text in a JSX expression for braces characters or
    // empty strings; plain text is safe otherwise.
    const body = text === '' ? '' : escapeJsxText(text)
    if (body === '') return `${tagStart} />`
    return `${tagStart}>${body}</${node.type}>`
  }

  if (node.children.length === 0) {
    // Container with no children: self-close for cleanliness.
    if (entry.acceptsChildren) return `${tagStart} />`
    return `${tagStart} />`
  }

  const childrenJsx = node.children.map(emitNode).join('\n')
  return `${tagStart}>\n${childrenJsx}\n</${node.type}>`
}

/**
 * Build the attribute list for a node. Skips `children` (handled
 * separately for text-child components) and skips props whose value
 * is undefined. Values that match the catalog's defaultProps are still
 * emitted so the output is explicit and grep-able; that's a POC choice.
 */
function emitProps(
  props: Record<string, JsonValue>,
  isTextChild: boolean
): string {
  const attrs: string[] = []
  for (const [name, value] of Object.entries(props)) {
    if (value === undefined) continue
    if (isTextChild && name === 'children') continue
    const emitted = emitPropValue(name, value)
    if (emitted !== null) attrs.push(emitted)
  }
  return attrs.join(' ')
}

function emitPropValue(name: string, value: JsonValue): string | null {
  if (typeof value === 'string') {
    return `${name}=${JSON.stringify(value)}`
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    if (value === true) return name
    if (value === false) return `${name}={false}`
    return `${name}={${value}}`
  }
  if (value === null) return `${name}={null}`
  // Arrays / objects — emit as JSON expression. Safe because JsonValue
  // excludes functions / undefined / React nodes.
  return `${name}={${JSON.stringify(value)}}`
}

/**
 * Escape literal text when rendered as JSX children. Braces and the
 * < character must be escaped; everything else is safe in JSX text.
 */
function escapeJsxText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
}
