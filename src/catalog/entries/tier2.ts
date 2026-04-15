import type { CatalogEntry } from '../types'

/**
 * Tier 2: compound-but-composable. Panel-visible parents with
 * pre-seeded default children (subcomponent entries below are `hidden`).
 */
export const tier2: CatalogEntry[] = [
  // --- Card ---
  {
    name: 'Card',
    category: 'layout',
    tier: 2,
    acceptsChildren: true,
    slots: [
      { name: 'header', accepts: ['CardHeader'], order: 0 },
      { name: 'content', accepts: ['CardContent'], order: 10 },
      { name: 'footer', accepts: ['CardFooter'], order: 20 },
    ],
    defaultProps: {},
    propSchema: [],
    defaultChildren: [
      {
        type: 'CardHeader',
        slot: 'header',
        children: [
          { type: 'CardTitle', props: { children: 'Card title' } },
          { type: 'CardDescription', props: { children: 'Card description' } },
        ],
      },
      { type: 'CardContent', slot: 'content', children: [] },
    ],
  },
  {
    name: 'CardHeader',
    category: 'layout',
    tier: 2,
    acceptsChildren: true,
    hidden: true,
    defaultProps: {},
    propSchema: [],
  },
  {
    name: 'CardTitle',
    category: 'typography',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'Title' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Text' }],
  },
  {
    name: 'CardDescription',
    category: 'typography',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'Description' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Text' }],
  },
  {
    name: 'CardContent',
    category: 'layout',
    tier: 2,
    acceptsChildren: true,
    hidden: true,
    defaultProps: {},
    propSchema: [],
  },
  {
    name: 'CardFooter',
    category: 'layout',
    tier: 2,
    acceptsChildren: true,
    hidden: true,
    defaultProps: {},
    propSchema: [],
  },

  // --- Alert ---
  {
    name: 'Alert',
    category: 'feedback',
    tier: 2,
    acceptsChildren: true,
    defaultProps: { variant: 'default' },
    propSchema: [
      {
        name: 'variant',
        kind: 'enum',
        values: ['default', 'destructive'],
      },
    ],
    defaultChildren: [
      { type: 'AlertTitle', props: { children: 'Heads up!' } },
      {
        type: 'AlertDescription',
        props: { children: 'You can add components to your canvas.' },
      },
    ],
  },
  {
    name: 'AlertTitle',
    category: 'typography',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'Title' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Text' }],
  },
  {
    name: 'AlertDescription',
    category: 'typography',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'Description' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Text' }],
  },

  // --- Tabs ---
  {
    name: 'Tabs',
    category: 'nav',
    tier: 2,
    acceptsChildren: true,
    defaultProps: { defaultValue: 'tab-1' },
    propSchema: [
      { name: 'defaultValue', kind: 'string', label: 'Default tab value' },
      {
        name: 'orientation',
        kind: 'enum',
        values: ['horizontal', 'vertical'],
      },
    ],
    defaultChildren: [
      {
        type: 'TabsList',
        children: [
          {
            type: 'TabsTrigger',
            props: { value: 'tab-1', children: 'Tab 1' },
          },
          {
            type: 'TabsTrigger',
            props: { value: 'tab-2', children: 'Tab 2' },
          },
        ],
      },
      {
        type: 'TabsContent',
        props: { value: 'tab-1', children: 'Content 1' },
      },
      {
        type: 'TabsContent',
        props: { value: 'tab-2', children: 'Content 2' },
      },
    ],
  },
  {
    name: 'TabsList',
    category: 'nav',
    tier: 2,
    acceptsChildren: true,
    hidden: true,
    defaultProps: { variant: 'default' },
    propSchema: [
      { name: 'variant', kind: 'enum', values: ['default', 'line'] },
    ],
  },
  {
    name: 'TabsTrigger',
    category: 'nav',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { value: 'tab-1', children: 'Tab' },
    propSchema: [
      { name: 'value', kind: 'string' },
      { name: 'children', kind: 'string', label: 'Label' },
      { name: 'disabled', kind: 'boolean' },
    ],
  },
  {
    name: 'TabsContent',
    category: 'nav',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { value: 'tab-1', children: 'Content' },
    propSchema: [
      { name: 'value', kind: 'string' },
      { name: 'children', kind: 'string', label: 'Body' },
    ],
  },

  // --- Accordion ---
  {
    name: 'Accordion',
    category: 'nav',
    tier: 2,
    acceptsChildren: true,
    defaultProps: { type: 'single', collapsible: true },
    propSchema: [
      { name: 'type', kind: 'enum', values: ['single', 'multiple'] },
      { name: 'collapsible', kind: 'boolean' },
    ],
    defaultChildren: [
      {
        type: 'AccordionItem',
        props: { value: 'item-1' },
        children: [
          { type: 'AccordionTrigger', props: { children: 'Section 1' } },
          { type: 'AccordionContent', props: { children: 'Content 1' } },
        ],
      },
    ],
  },
  {
    name: 'AccordionItem',
    category: 'nav',
    tier: 2,
    acceptsChildren: true,
    hidden: true,
    defaultProps: { value: 'item-1' },
    propSchema: [{ name: 'value', kind: 'string' }],
  },
  {
    name: 'AccordionTrigger',
    category: 'nav',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'Trigger' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Label' }],
  },
  {
    name: 'AccordionContent',
    category: 'nav',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'Content' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Body' }],
  },

  // --- Breadcrumb ---
  {
    name: 'Breadcrumb',
    category: 'nav',
    tier: 2,
    acceptsChildren: true,
    defaultProps: {},
    propSchema: [],
    defaultChildren: [
      {
        type: 'BreadcrumbList',
        children: [
          {
            type: 'BreadcrumbItem',
            children: [
              {
                type: 'BreadcrumbLink',
                props: { href: '#', children: 'Home' },
              },
            ],
          },
          { type: 'BreadcrumbSeparator', children: [] },
          {
            type: 'BreadcrumbItem',
            children: [
              { type: 'BreadcrumbPage', props: { children: 'Current' } },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'BreadcrumbList',
    category: 'nav',
    tier: 2,
    acceptsChildren: true,
    hidden: true,
    defaultProps: {},
    propSchema: [],
  },
  {
    name: 'BreadcrumbItem',
    category: 'nav',
    tier: 2,
    acceptsChildren: true,
    hidden: true,
    defaultProps: {},
    propSchema: [],
  },
  {
    name: 'BreadcrumbLink',
    category: 'nav',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { href: '#', children: 'Link' },
    propSchema: [
      { name: 'href', kind: 'string' },
      { name: 'children', kind: 'string', label: 'Label' },
    ],
  },
  {
    name: 'BreadcrumbPage',
    category: 'nav',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'Current' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Label' }],
  },
  {
    name: 'BreadcrumbSeparator',
    category: 'nav',
    tier: 2,
    acceptsChildren: false,
    hidden: true,
    defaultProps: {},
    propSchema: [],
  },

  // --- Avatar ---
  {
    name: 'Avatar',
    category: 'display',
    tier: 2,
    acceptsChildren: true,
    defaultProps: { size: 'default' },
    propSchema: [
      { name: 'size', kind: 'enum', values: ['default', 'sm', 'lg'] },
    ],
    defaultChildren: [
      { type: 'AvatarFallback', props: { children: 'DC' } },
    ],
  },
  {
    name: 'AvatarImage',
    category: 'display',
    tier: 2,
    acceptsChildren: false,
    hidden: true,
    defaultProps: { src: '', alt: '' },
    propSchema: [
      { name: 'src', kind: 'string' },
      { name: 'alt', kind: 'string' },
    ],
  },
  {
    name: 'AvatarFallback',
    category: 'display',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'DC' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Initials' }],
  },

  // --- Field (DS-specific form field wrapper) ---
  {
    name: 'Field',
    category: 'input',
    tier: 2,
    acceptsChildren: true,
    defaultProps: { orientation: 'vertical' },
    propSchema: [
      {
        name: 'orientation',
        kind: 'enum',
        values: ['vertical', 'horizontal', 'responsive'],
      },
    ],
    defaultChildren: [
      { type: 'FieldLabel', props: { children: 'Label' } },
      { type: 'Input', props: { placeholder: 'Value' } },
      { type: 'FieldDescription', props: { children: 'Helper text' } },
    ],
  },
  {
    name: 'FieldLabel',
    category: 'typography',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'Label' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Text' }],
  },
  {
    name: 'FieldDescription',
    category: 'typography',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'Helper text' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Text' }],
  },

  // --- InputGroup ---
  {
    name: 'InputGroup',
    category: 'input',
    tier: 2,
    acceptsChildren: true,
    defaultProps: {},
    propSchema: [],
    defaultChildren: [
      {
        type: 'InputGroupAddon',
        props: { align: 'inline-start', children: '@' },
      },
      { type: 'InputGroupInput', props: { placeholder: 'username' } },
    ],
  },
  {
    name: 'InputGroupAddon',
    category: 'input',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { align: 'inline-start', children: '@' },
    propSchema: [
      {
        name: 'align',
        kind: 'enum',
        values: ['inline-start', 'inline-end', 'block-start', 'block-end'],
      },
      { name: 'children', kind: 'string', label: 'Text' },
    ],
  },
  {
    name: 'InputGroupInput',
    category: 'input',
    tier: 2,
    acceptsChildren: false,
    hidden: true,
    defaultProps: { placeholder: '' },
    propSchema: [{ name: 'placeholder', kind: 'string' }],
  },
  // --- ButtonGroup ---
  {
    name: 'ButtonGroup',
    category: 'layout',
    tier: 2,
    acceptsChildren: true,
    childFlow: 'row',
    defaultProps: { orientation: 'horizontal' },
    propSchema: [
      {
        name: 'orientation',
        kind: 'enum',
        values: ['horizontal', 'vertical'],
      },
    ],
    defaultChildren: [
      { type: 'Button', props: { children: 'Cancel', variant: 'outline' } },
      { type: 'Button', props: { children: 'Submit', variant: 'default' } },
    ],
  },

  {
    name: 'InputGroupText',
    category: 'input',
    tier: 2,
    acceptsChildren: false,
    textChild: true,
    hidden: true,
    defaultProps: { children: 'Text' },
    propSchema: [{ name: 'children', kind: 'string', label: 'Text' }],
  },
]
