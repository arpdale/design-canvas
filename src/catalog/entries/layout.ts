import type { CatalogEntry, StructuralConfig } from '../types'
import type { JsonValue } from '../../composition'

/**
 * Layout primitives — Row and Stack. Not DS components; emitted as plain
 * divs with Tailwind classes. They're the structural markup a designer
 * assembles between DS components.
 *
 * Design rationale lives in docs/planning/plan.md (M9.5): option C was
 * rejected because adding Tailwind classNames to DS components produces
 * drift in exported code. Row/Stack are inert divs — a human engineer
 * would write the same thing.
 */

const GAP_CLASS: Record<string, string> = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-6',
}

function gapOf(props: Record<string, JsonValue>): string {
  const gap = typeof props.gap === 'string' ? props.gap : 'md'
  return GAP_CLASS[gap] ?? GAP_CLASS.md
}

const alignClass: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

function alignOf(props: Record<string, JsonValue>): string {
  const align = typeof props.align === 'string' ? props.align : 'stretch'
  return alignClass[align] ?? alignClass.stretch
}

const rowStructural: StructuralConfig = {
  tag: 'div',
  classes: (props) => `flex flex-row ${gapOf(props)} ${alignOf(props)}`,
}

const stackStructural: StructuralConfig = {
  tag: 'div',
  classes: (props) => `flex flex-col ${gapOf(props)} ${alignOf(props)}`,
}

export const layoutPrimitives: CatalogEntry[] = [
  {
    name: 'Row',
    displayName: 'Row',
    category: 'layout',
    tier: 1,
    acceptsChildren: true,
    defaultProps: { gap: 'md', align: 'stretch' },
    propSchema: [
      { name: 'gap', kind: 'enum', values: ['sm', 'md', 'lg'] },
      {
        name: 'align',
        kind: 'enum',
        values: ['start', 'center', 'end', 'stretch'],
      },
    ],
    structural: rowStructural,
    childFlow: 'row',
  },
  {
    name: 'Stack',
    displayName: 'Stack',
    category: 'layout',
    tier: 1,
    acceptsChildren: true,
    defaultProps: { gap: 'md', align: 'stretch' },
    propSchema: [
      { name: 'gap', kind: 'enum', values: ['sm', 'md', 'lg'] },
      {
        name: 'align',
        kind: 'enum',
        values: ['start', 'center', 'end', 'stretch'],
      },
    ],
    structural: stackStructural,
    childFlow: 'column',
  },
]
