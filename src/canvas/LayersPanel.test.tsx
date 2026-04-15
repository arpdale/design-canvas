import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useEffect } from 'react'
import { LayersPanel } from './LayersPanel'
import { CanvasStoreProvider } from './state/CanvasStoreProvider'
import { useCanvas } from './state/canvasStoreContext'
import {
  createComposition,
  createNode,
  insertNode,
  type Composition,
} from '../composition'
import { CURRENT_SCHEMA_VERSION } from '../persistence'

function Harness({
  initial,
  selectId,
}: {
  initial: Composition
  selectId?: string
}) {
  return (
    <CanvasStoreProvider
      options={{
        skipLoad: true,
        skipSave: true,
        initialLibrary: {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          compositions: [initial],
          activeId: initial.id,
        },
      }}
    >
      <Selector selectId={selectId} />
      <LayersPanel />
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
  let c = createComposition('X')
  const card = createNode({
    type: 'Card',
    children: [
      {
        type: 'CardContent',
        children: [
          { type: 'Input', props: { placeholder: 'Email' } },
          { type: 'Button', props: { children: 'OK' } },
        ],
      },
    ],
  })
  c = insertNode(c, null, 0, card)
  return { c, card, content: card.children[0], input: card.children[0].children[0], button: card.children[0].children[1] }
}

describe('LayersPanel', () => {
  it('shows empty state when composition has no roots', () => {
    const c = createComposition('X')
    render(<Harness initial={c} />)
    expect(screen.getByTestId('layers-empty')).toBeInTheDocument()
  })

  it('renders one row per node in the tree', () => {
    const { c, card, content, input, button } = seed()
    render(<Harness initial={c} />)
    expect(screen.getByTestId(`layer-${card.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`layer-${content.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`layer-${input.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`layer-${button.id}`)).toBeInTheDocument()
  })

  it('clicking a layer selects that node', () => {
    const { c, input } = seed()
    render(<Harness initial={c} selectId={undefined} />)
    act(() => {
      fireEvent.click(screen.getByTestId(`layer-${input.id}`))
    })
    // Selection is reflected in the row's style (bg-blue-50)
    expect(screen.getByTestId(`layer-${input.id}`).className).toMatch(/bg-blue-50/)
  })

  it('selected layer reflects external selection', () => {
    const { c, button } = seed()
    render(<Harness initial={c} selectId={button.id} />)
    expect(screen.getByTestId(`layer-${button.id}`).className).toMatch(/bg-blue-50/)
  })

  it('indents children deeper than their parents', () => {
    const { c, card, input } = seed()
    render(<Harness initial={c} />)
    const cardPad = screen
      .getByTestId(`layer-${card.id}`)
      .style.paddingLeft
    const inputPad = screen
      .getByTestId(`layer-${input.id}`)
      .style.paddingLeft
    expect(parseInt(inputPad)).toBeGreaterThan(parseInt(cardPad))
  })
})
