import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useEffect } from 'react'
import { InspectorPanel } from './InspectorPanel'
import { CanvasStoreProvider } from './state/CanvasStoreProvider'
import { useCanvas } from './state/canvasStoreContext'
import {
  createComposition,
  createNode,
  insertNode,
  type Composition,
} from '../composition'

/**
 * Harness that seeds a composition and optionally selects a node.
 * Keeps the render side pure; no DnD context needed — InspectorPanel
 * doesn't use dnd-kit.
 */
function Harness({
  initial,
  selectId,
}: {
  initial: Composition
  selectId?: string
}) {
  return (
    <CanvasStoreProvider initial={initial}>
      <Selector selectId={selectId} />
      <InspectorPanel />
    </CanvasStoreProvider>
  )
}

function Selector({ selectId }: { selectId?: string }) {
  const { setSelectedId } = useCanvas()
  useEffect(() => {
    if (selectId) setSelectedId(selectId)
  }, [selectId, setSelectedId])
  return null
}

function seed() {
  const button = createNode({
    type: 'Button',
    props: { children: 'Sign in', variant: 'default' },
  })
  const input = createNode({
    type: 'Input',
    props: { placeholder: 'Email', type: 'text' },
  })
  let c = createComposition('X')
  c = insertNode(c, null, 0, button)
  c = insertNode(c, null, 1, input)
  return { c, button, input }
}

describe('InspectorPanel', () => {
  it('shows the empty state when nothing is selected', () => {
    const { c } = seed()
    render(<Harness initial={c} />)
    expect(screen.getByTestId('inspector-empty')).toBeInTheDocument()
  })

  it('renders a prop field per schema entry for the selected node', () => {
    const { c, button } = seed()
    render(<Harness initial={c} selectId={button.id} />)
    expect(screen.getByTestId('inspector-panel')).toBeInTheDocument()
    // Button schema: children (string), variant (enum), size (enum)
    expect(screen.getByTestId('prop-field-children')).toBeInTheDocument()
    expect(screen.getByTestId('prop-field-variant')).toBeInTheDocument()
    expect(screen.getByTestId('prop-field-size')).toBeInTheDocument()
  })

  it('prefills inputs from the node\'s current props', () => {
    const { c, input } = seed()
    render(<Harness initial={c} selectId={input.id} />)
    const placeholder = screen.getByTestId(
      'prop-input-placeholder'
    ) as HTMLInputElement
    expect(placeholder.value).toBe('Email')
    const type = screen.getByTestId('prop-input-type') as HTMLSelectElement
    expect(type.value).toBe('text')
  })

  it('changing an enum prop updates the tree', () => {
    const { c, input } = seed()
    render(<Harness initial={c} selectId={input.id} />)
    const type = screen.getByTestId('prop-input-type') as HTMLSelectElement
    act(() => {
      fireEvent.change(type, { target: { value: 'password' } })
    })
    expect(
      (screen.getByTestId('prop-input-type') as HTMLSelectElement).value
    ).toBe('password')
  })

  it('delete button removes the selected node and clears selection', () => {
    const { c, button } = seed()
    render(<Harness initial={c} selectId={button.id} />)
    act(() => {
      fireEvent.click(screen.getByTestId('inspector-delete'))
    })
    expect(screen.getByTestId('inspector-empty')).toBeInTheDocument()
  })
})
