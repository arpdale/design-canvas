import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Sidebar } from './Sidebar'
import { CanvasStoreProvider } from './state/CanvasStoreProvider'
import { CanvasDndContext } from './dnd/CanvasDndContext'

function renderSidebar() {
  return render(
    <CanvasStoreProvider options={{ skipLoad: true, skipSave: true }}>
      <CanvasDndContext>
        <Sidebar />
      </CanvasDndContext>
    </CanvasStoreProvider>
  )
}

describe('Sidebar', () => {
  it('starts on the Components tab', () => {
    renderSidebar()
    expect(screen.getByTestId('sidebar-tab-components')).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByTestId('sidebar-tab-layers')).toHaveAttribute(
      'aria-selected',
      'false'
    )
    expect(screen.getByTestId('component-panel')).toBeInTheDocument()
  })

  it('clicking Layers switches to the Layers panel', () => {
    renderSidebar()
    act(() => {
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'))
    })
    expect(screen.getByTestId('sidebar-tab-layers')).toHaveAttribute(
      'aria-selected',
      'true'
    )
    // Empty canvas so Layers panel shows its empty state
    expect(screen.getByTestId('layers-empty')).toBeInTheDocument()
    expect(screen.queryByTestId('component-panel')).not.toBeInTheDocument()
  })

  it('switching back to Components restores the catalog', () => {
    renderSidebar()
    act(() => {
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('sidebar-tab-components'))
    })
    expect(screen.getByTestId('component-panel')).toBeInTheDocument()
  })
})
