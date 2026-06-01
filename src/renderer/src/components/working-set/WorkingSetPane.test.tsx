import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { WorkingSetPane } from './WorkingSetPane'
import { ServicesContext } from '../../services/context'
import type { AppServices, WorkingSetItem } from '@shared/appservices'

const item1: WorkingSetItem = { assetId: '1', filename: 'groove-01', extension: 'mid', fileType: 'MIDI', duration: 218 }
const item2: WorkingSetItem = { assetId: '4', filename: 'arp-v2-final', extension: 'mid', fileType: 'MIDI', duration: 96 }

function makeServices(initial: WorkingSetItem[] = []): AppServices {
  let items = [...initial]
  return {
    library: {} as AppServices['library'],
    operations: {} as AppServices['operations'],
    workingSet: {
      getItems: vi.fn(async () => [...items]),
      addAssets: vi.fn(async (ids) => ({ added: ids, skipped: [] })),
      removeAsset: vi.fn(async (id) => { items = items.filter(i => i.assetId !== id) }),
      clear: vi.fn(async () => { items = [] }),
    },
  }
}

function renderPane(services: AppServices, onCountChange = vi.fn(), refreshKey?: number) {
  return render(
    <ServicesContext.Provider value={services}>
      <WorkingSetPane onCountChange={onCountChange} refreshKey={refreshKey} />
    </ServicesContext.Provider>,
  )
}

describe('WorkingSetPane', () => {
  it('shows empty state when no items', async () => {
    const services = makeServices([])
    renderPane(services)
    await screen.findByText(/Select assets from/)
  })

  it('renders items when populated', async () => {
    const services = makeServices([item1, item2])
    renderPane(services)
    await screen.findByText('groove-01')
    expect(screen.getByText('arp-v2-final')).toBeInTheDocument()
  })

  it('calls onCountChange with item count on load', async () => {
    const onCountChange = vi.fn()
    renderPane(makeServices([item1, item2]), onCountChange)
    await waitFor(() => expect(onCountChange).toHaveBeenCalledWith(2))
  })

  it('calls onCountChange with 0 when empty', async () => {
    const onCountChange = vi.fn()
    renderPane(makeServices([]), onCountChange)
    await waitFor(() => expect(onCountChange).toHaveBeenCalledWith(0))
  })

  it('remove button calls removeAsset and refreshes', async () => {
    const services = makeServices([item1])
    renderPane(services)
    await screen.findByText('groove-01')
    fireEvent.click(screen.getByRole('button', { name: /Remove groove-01/ }))
    await waitFor(() => expect(services.workingSet.removeAsset).toHaveBeenCalledWith('1'))
    await waitFor(() => expect(services.workingSet.getItems).toHaveBeenCalledTimes(2))
  })

  it('clear button calls clear and triggers refresh', async () => {
    const services = makeServices([item1])
    renderPane(services)
    await screen.findByText('groove-01')
    fireEvent.click(screen.getByRole('button', { name: /Clear/ }))
    await waitFor(() => expect(services.workingSet.clear).toHaveBeenCalled())
  })

  it('shows empty state after all items cleared', async () => {
    const services = makeServices([item1])
    renderPane(services)
    await screen.findByText('groove-01')
    fireEvent.click(screen.getByRole('button', { name: /Clear/ }))
    await screen.findByText(/Select assets from/)
  })

  it('select operation button is disabled when empty', async () => {
    renderPane(makeServices([]))
    await screen.findByText(/Select assets from/)
    expect(screen.getByRole('button', { name: /Select operation/ })).toBeDisabled()
  })

  it('clear button is disabled when empty', async () => {
    renderPane(makeServices([]))
    await screen.findByText(/Select assets from/)
    expect(screen.getByRole('button', { name: /Clear/ })).toBeDisabled()
  })

  it('select operation button is enabled when items exist', async () => {
    renderPane(makeServices([item1]))
    await screen.findByText('groove-01')
    expect(screen.getByRole('button', { name: /Select operation/ })).not.toBeDisabled()
  })

  describe('refreshKey', () => {
    it('re-fetches items when refreshKey changes (stable onCountChange)', async () => {
      const services = makeServices([item1])
      const stableOnCountChange = vi.fn()
      const { rerender } = render(
        <ServicesContext.Provider value={services}>
          <WorkingSetPane onCountChange={stableOnCountChange} refreshKey={0} />
        </ServicesContext.Provider>,
      )
      await screen.findByText('groove-01')
      const callsBefore = (services.workingSet.getItems as ReturnType<typeof vi.fn>).mock.calls.length
      // Rerender with same onCountChange (stable) but incremented refreshKey
      rerender(
        <ServicesContext.Provider value={services}>
          <WorkingSetPane onCountChange={stableOnCountChange} refreshKey={1} />
        </ServicesContext.Provider>,
      )
      await waitFor(() =>
        expect((services.workingSet.getItems as ReturnType<typeof vi.fn>).mock.calls.length)
          .toBeGreaterThan(callsBefore),
      )
    })
  })
})
