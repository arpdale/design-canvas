import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ComponentPanel } from './ComponentPanel'
import { CanvasDndContext } from './dnd/CanvasDndContext'
import { panelEntries } from '../catalog'

function renderPanel() {
  return render(
    <CanvasDndContext>
      <ComponentPanel />
    </CanvasDndContext>
  )
}

describe('ComponentPanel', () => {
  it('renders every panel-visible catalog entry as a draggable item', () => {
    renderPanel()
    for (const entry of panelEntries()) {
      expect(
        screen.getByTestId(`panel-item-${entry.name}`),
        entry.name
      ).toBeInTheDocument()
    }
  })

  it('never renders hidden subcomponents as panel items', () => {
    renderPanel()
    // CardHeader is hidden — should not appear as a draggable.
    expect(
      screen.queryByTestId('panel-item-CardHeader')
    ).not.toBeInTheDocument()
  })

  it('groups items by category', () => {
    renderPanel()
    // Layout contains Card and Separator; both should be under layout group.
    const layoutGroup = screen.getByTestId('component-panel-group-layout')
    expect(within(layoutGroup).getByTestId('panel-item-Card')).toBeInTheDocument()
    expect(
      within(layoutGroup).getByTestId('panel-item-Separator')
    ).toBeInTheDocument()
  })

  it('filters items by search query (case-insensitive, partial match)', () => {
    renderPanel()
    const search = screen.getByTestId('component-panel-search')
    fireEvent.change(search, { target: { value: 'but' } })
    expect(screen.getByTestId('panel-item-Button')).toBeInTheDocument()
    expect(screen.queryByTestId('panel-item-Input')).not.toBeInTheDocument()
  })

  it('shows an empty state when no items match', () => {
    renderPanel()
    const search = screen.getByTestId('component-panel-search')
    fireEvent.change(search, { target: { value: 'zzz-no-match' } })
    expect(screen.getByTestId('component-panel-empty')).toBeInTheDocument()
  })

  it('resets to full list when search is cleared', () => {
    renderPanel()
    const search = screen.getByTestId('component-panel-search')
    fireEvent.change(search, { target: { value: 'but' } })
    expect(screen.queryByTestId('panel-item-Input')).not.toBeInTheDocument()
    fireEvent.change(search, { target: { value: '' } })
    expect(screen.getByTestId('panel-item-Input')).toBeInTheDocument()
  })
})
