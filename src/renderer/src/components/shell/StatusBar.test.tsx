import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBar } from './StatusBar'

describe('StatusBar', () => {
  it('shows no item count when wsItemCount is 0', () => {
    render(<StatusBar wsItemCount={0} />)
    expect(screen.queryByText(/\d+ item/)).toBeNull()
  })

  it('shows "1 item" (singular) when count is 1', () => {
    render(<StatusBar wsItemCount={1} />)
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('shows "N items" (plural) when count > 1', () => {
    render(<StatusBar wsItemCount={5} />)
    expect(screen.getByText('5 items')).toBeInTheDocument()
  })

  it('shows keyboard shortcut hints', () => {
    render(<StatusBar wsItemCount={0} />)
    expect(screen.getByText(/Library/)).toBeInTheDocument()
    expect(screen.getByText(/Working Set/)).toBeInTheDocument()
  })

  it('shows separator only when count > 0', () => {
    const { container, rerender } = render(<StatusBar wsItemCount={0} />)
    expect(container.querySelector('.status-bar__sep')).toBeNull()
    rerender(<StatusBar wsItemCount={2} />)
    expect(container.querySelector('.status-bar__sep')).toBeInTheDocument()
  })
})
