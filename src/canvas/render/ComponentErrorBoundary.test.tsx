import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'

function Exploder(): React.ReactElement {
  throw new Error('kaboom')
}

describe('ComponentErrorBoundary', () => {
  // Silence React's own console.error output for expected throws.
  let errSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    errSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('renders children when no error', () => {
    render(
      <ComponentErrorBoundary nodeId="a" nodeType="Button">
        <span>ok</span>
      </ComponentErrorBoundary>
    )
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('shows an error tile when child throws, keeping the boundary mounted', () => {
    render(
      <ComponentErrorBoundary nodeId="a" nodeType="Button">
        <Exploder />
      </ComponentErrorBoundary>
    )
    expect(screen.getByTestId('render-error-a')).toBeInTheDocument()
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('render failed')).toBeInTheDocument()
  })

  it('one broken boundary does not take down siblings', () => {
    render(
      <>
        <ComponentErrorBoundary nodeId="a" nodeType="Boom">
          <Exploder />
        </ComponentErrorBoundary>
        <ComponentErrorBoundary nodeId="b" nodeType="OK">
          <span>still here</span>
        </ComponentErrorBoundary>
      </>
    )
    expect(screen.getByTestId('render-error-a')).toBeInTheDocument()
    expect(screen.getByText('still here')).toBeInTheDocument()
  })
})
