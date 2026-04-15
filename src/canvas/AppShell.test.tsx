import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders top bar with product name', () => {
    render(<AppShell />)
    expect(screen.getByTestId('topbar')).toHaveTextContent('Design Canvas')
  })

  it('renders three panes: components, canvas, inspector', () => {
    render(<AppShell />)
    expect(screen.getByTestId('panel-components')).toBeInTheDocument()
    expect(screen.getByTestId('panel-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('panel-inspector')).toBeInTheDocument()
  })
})
