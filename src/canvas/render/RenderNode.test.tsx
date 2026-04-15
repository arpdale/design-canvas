import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RenderNode } from './RenderNode'
import {
  createComposition,
  createNode,
  insertNode,
} from '../../composition'

describe('RenderNode', () => {
  it('renders a leaf DS component (Button with text child)', () => {
    const node = createNode({
      type: 'Button',
      props: { children: 'Sign in', variant: 'default' },
    })
    render(
      <RenderNode node={node} selectedId={null} onSelect={() => {}} />
    )
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByTestId(`render-node-${node.id}`)).toBeInTheDocument()
  })

  it('renders nested children recursively', () => {
    let c = createComposition('x')
    const card = createNode({
      type: 'Card',
      children: [
        {
          type: 'CardContent',
          slot: 'content',
          children: [{ type: 'Button', props: { children: 'Click' } }],
        },
      ],
    })
    c = insertNode(c, null, 0, card)
    render(
      <RenderNode
        node={c.roots[0]}
        selectedId={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText('Click')).toBeInTheDocument()
  })

  it('calls onSelect with node id on click', () => {
    const node = createNode({ type: 'Button', props: { children: 'X' } })
    const onSelect = vi.fn()
    render(
      <RenderNode node={node} selectedId={null} onSelect={onSelect} />
    )
    fireEvent.click(screen.getByTestId(`render-node-${node.id}`))
    expect(onSelect).toHaveBeenCalledWith(node.id)
  })

  it('shows the "unknown component" tile when type is not in catalog', () => {
    const node = createNode({ type: 'TotallyFakeComponent' })
    render(
      <RenderNode node={node} selectedId={null} onSelect={() => {}} />
    )
    expect(
      screen.getByTestId(`render-unknown-${node.id}`)
    ).toBeInTheDocument()
  })

  it('applies selection outline when selectedId matches', () => {
    const node = createNode({ type: 'Button', props: { children: 'X' } })
    const { rerender } = render(
      <RenderNode node={node} selectedId={null} onSelect={() => {}} />
    )
    expect(screen.getByTestId(`render-node-${node.id}`).className).not.toMatch(
      /outline-blue-500/
    )
    rerender(
      <RenderNode node={node} selectedId={node.id} onSelect={() => {}} />
    )
    expect(screen.getByTestId(`render-node-${node.id}`).className).toMatch(
      /outline-blue-500/
    )
  })
})
