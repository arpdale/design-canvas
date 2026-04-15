import type { CatalogEntry } from '../types'

/**
 * Tier 1: trivial passthrough components. All draggable from the panel.
 * Mostly leaves or single-slot containers. See technical-approach.md.
 */
export const tier1: CatalogEntry[] = [
  {
    name: 'Button',
    category: 'input',
    tier: 1,
    acceptsChildren: false,
    textChild: true,
    defaultProps: { children: 'Button', variant: 'default', size: 'default' },
    propSchema: [
      { name: 'children', kind: 'string', label: 'Label' },
      {
        name: 'variant',
        kind: 'enum',
        values: [
          'default',
          'secondary',
          'outline',
          'ghost',
          'link',
          'destructive',
        ],
      },
      {
        name: 'size',
        kind: 'enum',
        values: ['default', 'xs', 'sm', 'lg', 'icon'],
      },
    ],
  },
  {
    name: 'Badge',
    category: 'display',
    tier: 1,
    acceptsChildren: false,
    textChild: true,
    defaultProps: { children: 'Badge', variant: 'default' },
    propSchema: [
      { name: 'children', kind: 'string', label: 'Label' },
      {
        name: 'variant',
        kind: 'enum',
        values: [
          'default',
          'secondary',
          'outline',
          'ghost',
          'link',
          'destructive',
        ],
      },
    ],
  },
  {
    name: 'Input',
    category: 'input',
    tier: 1,
    acceptsChildren: false,
    defaultProps: { placeholder: '', type: 'text' },
    propSchema: [
      { name: 'placeholder', kind: 'string' },
      {
        name: 'type',
        kind: 'enum',
        values: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'],
      },
      { name: 'disabled', kind: 'boolean' },
    ],
  },
  {
    name: 'Textarea',
    category: 'input',
    tier: 1,
    acceptsChildren: false,
    defaultProps: { placeholder: '', rows: 3 },
    propSchema: [
      { name: 'placeholder', kind: 'string' },
      { name: 'rows', kind: 'number', min: 1, max: 20 },
      { name: 'disabled', kind: 'boolean' },
    ],
  },
  {
    name: 'Label',
    category: 'typography',
    tier: 1,
    acceptsChildren: false,
    textChild: true,
    defaultProps: { children: 'Label' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Text' }],
  },
  {
    name: 'Checkbox',
    category: 'input',
    tier: 1,
    acceptsChildren: false,
    defaultProps: {},
    propSchema: [
      { name: 'disabled', kind: 'boolean' },
      { name: 'defaultChecked', kind: 'boolean' },
    ],
  },
  {
    name: 'Switch',
    category: 'input',
    tier: 1,
    acceptsChildren: false,
    defaultProps: { size: 'default' },
    propSchema: [
      { name: 'size', kind: 'enum', values: ['default', 'sm'] },
      { name: 'disabled', kind: 'boolean' },
      { name: 'defaultChecked', kind: 'boolean' },
    ],
  },
  {
    name: 'Slider',
    category: 'input',
    tier: 1,
    acceptsChildren: false,
    defaultProps: { defaultValue: [50], min: 0, max: 100, step: 1 },
    propSchema: [
      { name: 'min', kind: 'number' },
      { name: 'max', kind: 'number' },
      { name: 'step', kind: 'number', min: 1 },
      { name: 'disabled', kind: 'boolean' },
    ],
  },
  {
    name: 'Progress',
    category: 'feedback',
    tier: 1,
    acceptsChildren: false,
    defaultProps: { value: 40 },
    propSchema: [{ name: 'value', kind: 'number', min: 0, max: 100 }],
  },
  {
    name: 'Separator',
    category: 'layout',
    tier: 1,
    acceptsChildren: false,
    defaultProps: { orientation: 'horizontal' },
    propSchema: [
      {
        name: 'orientation',
        kind: 'enum',
        values: ['horizontal', 'vertical'],
      },
    ],
  },
  {
    name: 'Skeleton',
    category: 'feedback',
    tier: 1,
    acceptsChildren: false,
    defaultProps: { className: 'h-4 w-32' },
    propSchema: [{ name: 'className', kind: 'string', label: 'Class names' }],
  },
  {
    name: 'Spinner',
    category: 'feedback',
    tier: 1,
    acceptsChildren: false,
    defaultProps: {},
    propSchema: [{ name: 'className', kind: 'string', label: 'Class names' }],
  },
  {
    name: 'Toggle',
    category: 'input',
    tier: 1,
    acceptsChildren: false,
    textChild: true,
    defaultProps: { children: 'Toggle', variant: 'default', size: 'default' },
    propSchema: [
      { name: 'children', kind: 'string', label: 'Label' },
      { name: 'variant', kind: 'enum', values: ['default', 'outline'] },
      { name: 'size', kind: 'enum', values: ['default', 'sm', 'lg'] },
    ],
  },
  {
    name: 'Kbd',
    category: 'typography',
    tier: 1,
    acceptsChildren: false,
    textChild: true,
    defaultProps: { children: '⌘K' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Text' }],
  },
]
