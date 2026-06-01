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

function makeServices(
  queryFn?: AppServices['library']['query'],
  addAssetsFn?: AppServices['workingSet']['addAssets'],
): AppServices {
  return {
    library: {
      query: queryFn ?? vi.fn(async () => viewState()),
      getColumns: vi.fn(async () => COLUMNS),
      setColumnWidth: vi.fn(async () => {}),
      setColumnVisible: vi.fn(async () => {}),
      getSavedQuery: vi.fn(async () => ({ sortColumn: 'modified', sortDirection: 'desc' as const })),
      saveQuery: vi.fn(async () => {}),
    },
    workingSet: {
      addAssets: addAssetsFn ?? vi.fn(async () => ({ added: [], skipped: [] })),
      getItems: vi.fn(async () => []),
      removeAsset: vi.fn(async () => {}),
      clear: vi.fn(async () => {}),
    },
    operations: {} as AppServices['operations'],
  }
}

function renderPane(services: AppServices, onAssetsTransferred?: () => void) {
  return render(
    <ServicesContext.Provider value={services}>
      <LibraryPane onAssetsTransferred={onAssetsTransferred} />
    </ServicesContext.Provider>,
  )
}

function twoRowState(): LibraryViewState {
  return viewState({
    totalCount: 2,
    filteredCount: 2,
    items: [
      { id: 'a', selected: false, columnOrder: ['name'], cells: [{ columnId: 'name', value: 'asset-a' }] },
      { id: 'b', selected: false, columnOrder: ['name'], cells: [{ columnId: 'name', value: 'asset-b' }] },
    ],
  })
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

  describe('row selection', () => {
    it('click selects a row (adds row-selected class)', async () => {
      renderPane(makeServices(vi.fn(async () => twoRowState())))
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)
      expect(screen.getByText('asset-a').closest('tr')).toHaveClass('row-selected')
    })

    it('click on one row deselects the other', async () => {
      renderPane(makeServices(vi.fn(async () => twoRowState())))
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)
      fireEvent.click(screen.getByText('asset-b').closest('tr')!)
      expect(screen.getByText('asset-a').closest('tr')).not.toHaveClass('row-selected')
      expect(screen.getByText('asset-b').closest('tr')).toHaveClass('row-selected')
    })

    it('cmd-click adds a second row without clearing the first', async () => {
      renderPane(makeServices(vi.fn(async () => twoRowState())))
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)
      fireEvent.click(screen.getByText('asset-b').closest('tr')!, { metaKey: true })
      expect(screen.getByText('asset-a').closest('tr')).toHaveClass('row-selected')
      expect(screen.getByText('asset-b').closest('tr')).toHaveClass('row-selected')
    })

    it('cmd-click on a selected row deselects it', async () => {
      renderPane(makeServices(vi.fn(async () => twoRowState())))
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)
      fireEvent.click(screen.getByText('asset-a').closest('tr')!, { metaKey: true })
      expect(screen.getByText('asset-a').closest('tr')).not.toHaveClass('row-selected')
    })

    it('shift-click selects a range', async () => {
      const threeRowState = viewState({
        totalCount: 3, filteredCount: 3,
        items: [
          { id: 'a', selected: false, columnOrder: ['name'], cells: [{ columnId: 'name', value: 'asset-a' }] },
          { id: 'b', selected: false, columnOrder: ['name'], cells: [{ columnId: 'name', value: 'asset-b' }] },
          { id: 'c', selected: false, columnOrder: ['name'], cells: [{ columnId: 'name', value: 'asset-c' }] },
        ],
      })
      renderPane(makeServices(vi.fn(async () => threeRowState)))
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)
      fireEvent.click(screen.getByText('asset-c').closest('tr')!, { shiftKey: true })
      expect(screen.getByText('asset-a').closest('tr')).toHaveClass('row-selected')
      expect(screen.getByText('asset-b').closest('tr')).toHaveClass('row-selected')
      expect(screen.getByText('asset-c').closest('tr')).toHaveClass('row-selected')
    })
  })

  describe('count label with selection', () => {
    it('shows selection count prefix when items are selected', async () => {
      renderPane(makeServices(vi.fn(async () => twoRowState())))
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)
      await waitFor(() => expect(screen.getByText('1 selected · 2 items')).toBeInTheDocument())
    })

    it('shows selection count with filter context', async () => {
      const filteredState = viewState({
        totalCount: 7, filteredCount: 2,
        items: [
          { id: 'a', selected: false, columnOrder: ['name'], cells: [{ columnId: 'name', value: 'asset-a' }] },
          { id: 'b', selected: false, columnOrder: ['name'], cells: [{ columnId: 'name', value: 'asset-b' }] },
        ],
      })
      renderPane(makeServices(vi.fn(async () => filteredState)))
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)
      await waitFor(() => expect(screen.getByText('1 selected · 2 of 7')).toBeInTheDocument())
    })

    it('clears selection count display after search changes', async () => {
      renderPane(makeServices(vi.fn(async () => twoRowState())))
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)
      await waitFor(() => screen.getByText('1 selected · 2 items'))
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'x' } })
      await waitFor(() => expect(screen.queryByText(/selected/)).toBeNull())
    })
  })

  describe('⌘→ transfer', () => {
    it('calls addAssets with selected ids on ⌘→', async () => {
      const addAssets = vi.fn(async () => ({ added: ['a'], skipped: [] }))
      renderPane(makeServices(vi.fn(async () => twoRowState()), addAssets))
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)
      fireEvent.keyDown(document, { key: 'ArrowRight', metaKey: true })
      await waitFor(() => expect(addAssets).toHaveBeenCalledWith(['a']))
    })

    it('calls onAssetsTransferred callback after transfer', async () => {
      const onTransferred = vi.fn()
      renderPane(makeServices(vi.fn(async () => twoRowState())), onTransferred)
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)
      fireEvent.keyDown(document, { key: 'ArrowRight', metaKey: true })
      await waitFor(() => expect(onTransferred).toHaveBeenCalledOnce())
    })

    it('transfers focused (anchor) item when nothing is selected', async () => {
      const addAssets = vi.fn(async () => ({ added: ['a'], skipped: [] }))
      // cmd-click to select then deselect, leaving anchor set but nothing selected
      renderPane(makeServices(vi.fn(async () => twoRowState()), addAssets))
      await screen.findByText('asset-a')
      fireEvent.click(screen.getByText('asset-a').closest('tr')!)        // select a, anchor=a
      fireEvent.click(screen.getByText('asset-a').closest('tr')!, { metaKey: true }) // deselect a
      fireEvent.keyDown(document, { key: 'ArrowRight', metaKey: true })
      await waitFor(() => expect(addAssets).toHaveBeenCalledWith(['a']))
    })

    it('does nothing on ⌘→ when selection is empty and no anchor', async () => {
      const addAssets = vi.fn(async () => ({ added: [], skipped: [] }))
      renderPane(makeServices(vi.fn(async () => twoRowState()), addAssets))
      await screen.findByText('asset-a')
      fireEvent.keyDown(document, { key: 'ArrowRight', metaKey: true })
      await new Promise(r => setTimeout(r, 50))
      expect(addAssets).not.toHaveBeenCalled()
    })
  })
})
