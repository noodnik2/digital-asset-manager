import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { LibraryPane } from './LibraryPane'
import { ServicesContext } from '../../services/context'
import type { AppServices } from '@shared/appservices'
import type { LibraryViewState, ColumnDefinition } from '@shared/types/asset'

const COLUMNS: ColumnDefinition[] = [
  { id: 'name', label: 'Name', type: 'string', tier: 'core', defaultWidth: 240, visible: true, sortable: true },
  { id: 'type', label: 'Type', type: 'string', tier: 'core', defaultWidth: 56, visible: true, sortable: true },
  { id: 'duration', label: 'Duration', type: 'duration', tier: 'shared', defaultWidth: 72, visible: true, sortable: true },
  { id: 'size', label: 'Size', type: 'numeric', tier: 'shared', defaultWidth: 72, visible: true, sortable: true },
  { id: 'modified', label: 'Modified', type: 'date', tier: 'core', defaultWidth: 96, visible: true, sortable: true },
  { id: 'hidden', label: 'Hidden', type: 'string', tier: 'core', defaultWidth: 80, visible: false, sortable: true },
]

function viewState(overrides?: Partial<LibraryViewState>): LibraryViewState {
  return { items: [], totalCount: 0, filteredCount: 0, columns: COLUMNS, ...overrides }
}

function makeServices(queryFn?: AppServices['library']['query']): AppServices {
  return {
    library: {
      query: queryFn ?? vi.fn(async () => viewState()),
      getColumns: vi.fn(async () => COLUMNS),
      setColumnWidth: vi.fn(async () => {}),
      setColumnVisible: vi.fn(async () => {}),
      getSavedQuery: vi.fn(async () => ({ sortColumn: 'modified', sortDirection: 'desc' as const })),
      saveQuery: vi.fn(async () => {}),
    },
    workingSet: {} as AppServices['workingSet'],
    operations: {} as AppServices['operations'],
  }
}

function renderPane(services: AppServices) {
  return render(
    <ServicesContext.Provider value={services}>
      <LibraryPane />
    </ServicesContext.Provider>,
  )
}

describe('LibraryPane', () => {
  describe('column headers', () => {
    it('renders visible column headers', async () => {
      renderPane(makeServices())
      await screen.findByText('Name')
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Duration')).toBeInTheDocument()
    })

    it('hides columns where visible is false', async () => {
      renderPane(makeServices())
      await screen.findByText('Name')
      expect(screen.queryByText('Hidden')).toBeNull()
    })

    it('applies col-numeric class to numeric column header', async () => {
      renderPane(makeServices())
      await screen.findByText('Size')
      expect(screen.getByText('Size').closest('th')).toHaveClass('col-numeric')
    })

    it('applies col-duration class to duration column header', async () => {
      renderPane(makeServices())
      await screen.findByText('Duration')
      expect(screen.getByText('Duration').closest('th')).toHaveClass('col-duration')
    })

    it('applies col-date class to date column header', async () => {
      renderPane(makeServices())
      await screen.findByText('Modified')
      expect(screen.getByText('Modified').closest('th')).toHaveClass('col-date')
    })

    it('applies no special class to string column header', async () => {
      renderPane(makeServices())
      await screen.findByText('Name')
      const th = screen.getByText('Name').closest('th')
      expect(th?.className).toBe('')
    })
  })

  describe('asset rows', () => {
    it('renders asset rows', async () => {
      const state = viewState({
        items: [{
          id: '1', selected: false, columnOrder: ['name', 'type'],
          cells: [
            { columnId: 'name', value: 'groove-01', secondaryValue: 'packs/' },
            { columnId: 'type', value: 'MIDI' },
          ],
        }],
        totalCount: 1,
        filteredCount: 1,
      })
      renderPane(makeServices(vi.fn(async () => state)))
      await screen.findByText('groove-01')
      expect(screen.getByText('MIDI')).toBeInTheDocument()
    })
  })

  describe('item count label', () => {
    it('shows "N items" when not filtered', async () => {
      renderPane(makeServices(vi.fn(async () => viewState({ totalCount: 7, filteredCount: 7 }))))
      await screen.findByText('7 items')
    })

    it('shows "M of N" when filtered', async () => {
      renderPane(makeServices(vi.fn(async () => viewState({ totalCount: 7, filteredCount: 2 }))))
      await screen.findByText('2 of 7')
    })
  })

  describe('search', () => {
    it('updates query with search term when typed', async () => {
      const queryFn = vi.fn(async () => viewState())
      renderPane(makeServices(queryFn))
      await screen.findByRole('searchbox')
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'groove' } })
      await waitFor(() =>
        expect(queryFn).toHaveBeenCalledWith(expect.objectContaining({ search: 'groove' })),
      )
    })

    it('removes search from query when input is cleared', async () => {
      const queryFn = vi.fn(async () => viewState())
      renderPane(makeServices(queryFn))
      await screen.findByRole('searchbox')
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'groove' } })
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } })
      await waitFor(() => {
        const lastArgs = queryFn.mock.calls[queryFn.mock.calls.length - 1][0]
        expect(lastArgs.search).toBeUndefined()
      })
    })
  })

  describe('toolbar', () => {
    it('renders Filter and Sort buttons', async () => {
      renderPane(makeServices())
      await screen.findByText('Name')
      expect(screen.getByRole('button', { name: /Filters/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Sort/ })).toBeInTheDocument()
    })

    it('renders Settings button', async () => {
      renderPane(makeServices())
      await screen.findByText('Name')
      expect(screen.getByRole('button', { name: /Settings/ })).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('renders nothing while query is pending', () => {
      const neverResolves = vi.fn(() => new Promise<LibraryViewState>(() => {}))
      const { container } = renderPane(makeServices(neverResolves as unknown as AppServices['library']['query']))
      expect(container.firstChild).toBeNull()
    })
  })
})
