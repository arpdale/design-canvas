import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PropField } from './PropField'

describe('PropField', () => {
  it('renders a string input and emits change events', () => {
    const onChange = vi.fn()
    render(
      <PropField
        schema={{ name: 'placeholder', kind: 'string' }}
        value="hi"
        onChange={onChange}
      />
    )
    const input = screen.getByTestId('prop-input-placeholder') as HTMLInputElement
    expect(input.value).toBe('hi')
    fireEvent.change(input, { target: { value: 'there' } })
    expect(onChange).toHaveBeenCalledWith('there')
  })

  it('renders a textarea when multiline is set', () => {
    render(
      <PropField
        schema={{ name: 'body', kind: 'string', multiline: true }}
        value=""
        onChange={() => {}}
      />
    )
    const input = screen.getByTestId('prop-input-body')
    expect(input.tagName).toBe('TEXTAREA')
  })

  it('renders a number input and emits numbers', () => {
    const onChange = vi.fn()
    render(
      <PropField
        schema={{ name: 'rows', kind: 'number', min: 1, max: 10 }}
        value={3}
        onChange={onChange}
      />
    )
    const input = screen.getByTestId('prop-input-rows')
    fireEvent.change(input, { target: { value: '5' } })
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('number input clears to undefined when emptied', () => {
    const onChange = vi.fn()
    render(
      <PropField
        schema={{ name: 'rows', kind: 'number' }}
        value={3}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByTestId('prop-input-rows'), {
      target: { value: '' },
    })
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('renders an enum select with all values and emits selection', () => {
    const onChange = vi.fn()
    render(
      <PropField
        schema={{ name: 'variant', kind: 'enum', values: ['a', 'b', 'c'] }}
        value="a"
        onChange={onChange}
      />
    )
    const select = screen.getByTestId('prop-input-variant') as HTMLSelectElement
    expect(select.options).toHaveLength(3)
    fireEvent.change(select, { target: { value: 'c' } })
    expect(onChange).toHaveBeenCalledWith('c')
  })

  it('renders a boolean checkbox and emits toggle', () => {
    const onChange = vi.fn()
    render(
      <PropField
        schema={{ name: 'disabled', kind: 'boolean' }}
        value={false}
        onChange={onChange}
      />
    )
    const cb = screen.getByTestId('prop-input-disabled') as HTMLInputElement
    expect(cb.checked).toBe(false)
    fireEvent.click(cb)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
