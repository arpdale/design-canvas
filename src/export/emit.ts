import type { CompositionNode, JsonValue } from '../composition'
import { getEntry } from '../catalog'

/**
 * Emit a composition subtree as a JSX string (unformatted — prettier
 * pass happens in index.ts). Unknown component types render as JSX
 * comments so the export still parses. Structural entries (Row, Stack)
 * emit as HTML with computed classNames — they're not DS components.
 */
export function emitNode(node: CompositionNode): string {
  const entry = getEntry(node.type)
  if (!entry) {
    return `{/* unknown component: ${node.type} */}`
  }

  // Structural (Row / Stack): emit as HTML, not as a DS component.
  if (entry.structural) {
    const { tag, classes } = entry.structural
    const className = classes(node.props)
    if (node.children.length === 0) {
      return `<${tag} className=${JSON.stringify(className)} />`
    }
    const childJsx = node.children.map(emitNode).join('\n')
    return `<${tag} className=${JSON.stringify(className)}>\n${childJsx}\n</${tag}>`
  }

  const propAttrs = emitProps(node.props, entry.textChild === true)
  const tagStart = `<${node.type}${propAttrs ? ' ' + propAttrs : ''}`

  if (entry.textChild) {
    const text = typeof node.props.children === 'string' ? node.props.children : ''
    const body = text === '' ? '' : escapeJsxText(text)
    if (body === '') return `${tagStart} />`
    return `${tagStart}>${body}</${node.type}>`
  }

  if (node.children.length === 0) {
    return `${tagStart} />`
  }

  const childrenJsx = node.children.map(emitNode).join('\n')
  return `${tagStart}>\n${childrenJsx}\n</${node.type}>`
}

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
  return `${name}={${JSON.stringify(value)}}`
}

function escapeJsxText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
}
