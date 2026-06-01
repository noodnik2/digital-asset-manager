import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkingSetItem } from './WorkingSetItem'
import type { WorkingSetItem as WsItem } from '@shared/appservices'

const baseItem: WsItem = {
  assetId: '1',
  filename: 'groove-01',
  extension: 'mid',
  fileType: 'MIDI',
  duration: 218,
}

describe('WorkingSetItem', () => {
  it('renders filename and type badge', () => {
    render(<WorkingSetItem item={baseItem} onRemove={() => {}} />)
    expect(screen.getByText('groove-01')).toBeInTheDocument()
    expect(screen.getByText('MIDI')).toBeInTheDocument()
  })

  it('renders formatted duration (218s → 3:38)', () => {
    render(<WorkingSetItem item={baseItem} onRemove={() => {}} />)
    expect(screen.getByText('3:38')).toBeInTheDocument()
  })

  it('renders 0-second duration as 0:00', () => {
    render(<WorkingSetItem item={{ ...baseItem, duration: 0 }} onRemove={() => {}} />)
    expect(screen.getByText('0:00')).toBeInTheDocument()
  })

  it('does not render duration when null', () => {
    render(<WorkingSetItem item={{ ...baseItem, duration: null }} onRemove={() => {}} />)
    expect(screen.queryByText(/:/)).toBeNull()
  })

  it('calls onRemove with assetId when remove button is clicked', () => {
    const onRemove = vi.fn()
    render(<WorkingSetItem item={baseItem} onRemove={onRemove} />)
    fireEvent.click(screen.getByRole('button', { name: /Remove groove-01/ }))
    expect(onRemove).toHaveBeenCalledWith('1')
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('calls onRemove when Delete key is pressed on the list item', () => {
    const onRemove = vi.fn()
    render(<WorkingSetItem item={baseItem} onRemove={onRemove} />)
    fireEvent.keyDown(screen.getByRole('listitem'), { key: 'Delete' })
    expect(onRemove).toHaveBeenCalledWith('1')
  })

  it('calls onRemove when Backspace key is pressed on the list item', () => {
    const onRemove = vi.fn()
    render(<WorkingSetItem item={baseItem} onRemove={onRemove} />)
    fireEvent.keyDown(screen.getByRole('listitem'), { key: 'Backspace' })
    expect(onRemove).toHaveBeenCalledWith('1')
  })

  it('does not call onRemove on unrelated key presses', () => {
    const onRemove = vi.fn()
    render(<WorkingSetItem item={baseItem} onRemove={onRemove} />)
    fireEvent.keyDown(screen.getByRole('listitem'), { key: 'Enter' })
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('aria-label includes filename and type', () => {
    render(<WorkingSetItem item={baseItem} onRemove={() => {}} />)
    const el = screen.getByRole('listitem')
    expect(el.getAttribute('aria-label')).toContain('groove-01')
    expect(el.getAttribute('aria-label')).toContain('MIDI')
  })

  it('aria-label includes duration when non-null', () => {
    render(<WorkingSetItem item={baseItem} onRemove={() => {}} />)
    expect(screen.getByRole('listitem').getAttribute('aria-label')).toContain('3:38')
  })

  it('aria-label omits duration when null', () => {
    render(<WorkingSetItem item={{ ...baseItem, duration: null }} onRemove={() => {}} />)
    expect(screen.getByRole('listitem').getAttribute('aria-label')).not.toContain(':')
  })
})
