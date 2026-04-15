import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TopBar } from './TopBar'
import { CanvasStoreProvider } from './state/CanvasStoreProvider'
import { STORAGE_KEY } from '../persistence'

function renderTopBar() {
  return render(
    <CanvasStoreProvider options={{ skipLoad: true, skipSave: true }}>
      <TopBar onExport={() => {}} />
    </CanvasStoreProvider>
  )
}

describe('TopBar', () => {
  beforeEach(() => {
    // Defense — some tests use skipSave, but confirm no cross-test leak.
    window.localStorage.removeItem(STORAGE_KEY)
  })

  it('renders the product name and the active composition name', () => {
    renderTopBar()
    expect(screen.getByTestId('topbar')).toHaveTextContent('Design Canvas')
    const name = screen.getByTestId('composition-name') as HTMLInputElement
    expect(name.value).toBe('Untitled')
  })

  it('renaming the composition updates the input on blur', () => {
    renderTopBar()
    const name = screen.getByTestId('composition-name') as HTMLInputElement
    act(() => {
      fireEvent.change(name, { target: { value: 'LoginPage' } })
      fireEvent.blur(name)
    })
    expect(name.value).toBe('LoginPage')
  })

  it('clicking New creates an additional composition and switches to it', () => {
    renderTopBar()
    act(() => {
      fireEvent.click(screen.getByTestId('composition-new'))
    })
    const name = screen.getByTestId('composition-name') as HTMLInputElement
    expect(name.value).toBe('Untitled')
    // Switcher appears when there is more than one
    expect(screen.getByTestId('composition-switcher')).toBeInTheDocument()
  })

  it('switcher lists all compositions and can switch', () => {
    renderTopBar()
    act(() => {
      fireEvent.click(screen.getByTestId('composition-new'))
      fireEvent.click(screen.getByTestId('composition-new'))
    })
    const switcher = screen.getByTestId(
      'composition-switcher'
    ) as HTMLSelectElement
    expect(switcher.options.length).toBe(3)
    const firstId = switcher.options[0].value
    act(() => {
      fireEvent.change(switcher, { target: { value: firstId } })
    })
    expect(switcher.value).toBe(firstId)
  })
})
