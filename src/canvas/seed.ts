import {
  createComposition,
  createNode,
  insertNode,
  type Composition,
} from '../composition'

/**
 * Seed composition used for M5 dev/E2E — approximates the login demo so
 * we can visually verify rendering before M6 wires drag-and-drop.
 * Removed in M8 when persistence provides a real empty-state default.
 */
export function loginSeed(): Composition {
  let c = createComposition('Login seed')
  const card = createNode({
    type: 'Card',
    children: [
      {
        type: 'CardHeader',
        slot: 'header',
        children: [
          { type: 'CardTitle', props: { children: 'Welcome back' } },
          {
            type: 'CardDescription',
            props: { children: 'Sign in to your account.' },
          },
        ],
      },
      {
        type: 'CardContent',
        slot: 'content',
        children: [
          { type: 'Label', props: { children: 'Email' } },
          { type: 'Input', props: { type: 'email', placeholder: 'you@domain.com' } },
          { type: 'Label', props: { children: 'Password' } },
          {
            type: 'Input',
            props: { type: 'password', placeholder: '••••••••' },
          },
          { type: 'Button', props: { children: 'Sign in', variant: 'default' } },
        ],
      },
    ],
  })
  c = insertNode(c, null, 0, card)
  return c
}
