import { useState, useEffect, useCallback, useRef } from 'react'
import { Settings } from 'lucide-react'
import { useServices } from '../../services/context'
import { AssetListItem } from './AssetListItem'
import {
  emptySelection,
  clearSelection,
  getSelectedIds,
  applyGesture,
  type SelectionState,
  type SelectionGesture,
} from './selection'
import type { ColumnDefinition, LibraryViewState, LibraryQuery } from '@shared/types/asset'

interface LibraryPaneProps {
  onAssetsTransferred?: () => void
}

const DEFAULT_QUERY: LibraryQuery = { sortColumn: 'modified', sortDirection: 'desc' }

export function LibraryPane({ onAssetsTransferred }: LibraryPaneProps) {
  const services = useServices()
  const [query, setQuery] = useState<LibraryQuery>(DEFAULT_QUERY)
  const [viewState, setViewState] = useState<LibraryViewState | null>(null)
  const [sel, setSel] = useState<SelectionState>(emptySelection())

  // Refs to avoid stale closures in the ⌘→ listener
  const selRef = useRef(sel)
  const visibleIdsRef = useRef<string[]>([])

  useEffect(() => { selRef.current = sel }, [sel])

  useEffect(() => {
    services.library.query(query).then(setViewState)
  }, [services, query])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSel(clearSelection())
    setQuery(q => ({ ...q, search: e.target.value || undefined }))
  }

  const handleRowClick = useCallback((id: string, e: React.MouseEvent) => {
    let gesture: SelectionGesture
    if (e.metaKey && e.shiftKey) gesture = 'cmd-shift-click'
    else if (e.shiftKey) gesture = 'shift-click'
    else if (e.metaKey) gesture = 'cmd-click'
    else gesture = 'click'
    setSel(prev => applyGesture(prev, id, gesture, visibleIdsRef.current))
  }, [])

  // ⌘→ — transfer selection (or focused item) to Working Set
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (!e.metaKey || e.key !== 'ArrowRight') return
      e.preventDefault()
      const currentSel = selRef.current
      const selectedIds = getSelectedIds(currentSel)
      const idsToAdd = selectedIds.size > 0
        ? [...selectedIds]
        : currentSel.anchor ? [currentSel.anchor] : []
      if (idsToAdd.length === 0) return
      await services.workingSet.addAssets(idsToAdd)
      onAssetsTransferred?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [services, onAssetsTransferred])

  if (!viewState) return null

  const { items, totalCount, filteredCount, columns } = viewState
  visibleIdsRef.current = items.map(r => r.id)

  const isFiltered = filteredCount < totalCount
  const selectedCount = getSelectedIds(sel).size
  const baseCount = isFiltered ? `${filteredCount} of ${totalCount}` : `${totalCount} items`
  const countLabel = selectedCount > 0 ? `${selectedCount} selected · ${baseCount}` : baseCount

  const selectedIdsSet = getSelectedIds(sel)

  return (
    <div className="library-pane">
      <div className="library-toolbar">
        <div className="library-toolbar__search">
          <input
            type="search"
            placeholder="Search… (⌘F)"
            value={query.search ?? ''}
            onChange={handleSearch}
            aria-label="Search library"
          />
        </div>

        <button className="btn-ghost" aria-label="Filters">
          + Filter
        </button>

        <button className="btn-ghost" aria-label="Sort">
          Sort: Modified ↓
        </button>

        <span className="library-toolbar__count" aria-live="polite">
          {countLabel}
        </span>
      </div>

      <div className="library-list-container">
        <table className="library-table" aria-label="Library assets" aria-multiselectable="true">
          <thead>
            <tr>
              {columns.filter(c => c.visible).map(col => (
                <th
                  key={col.id}
                  style={{ width: col.id === 'name' ? undefined : col.defaultWidth }}
                  className={colClass(col)}
                  aria-sort="none"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(row => (
              <AssetListItem
                key={row.id}
                row={{ ...row, selected: selectedIdsSet.has(row.id) }}
                columns={columns}
                onRowClick={handleRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="library-settings"
        aria-label="Settings"
        title="Settings"
        onClick={e => e.stopPropagation()}
      >
        <Settings size={16} />
      </button>
    </div>
  )
}

function colClass(col: ColumnDefinition): string {
  if (col.type === 'numeric' || col.type === 'duration' || col.type === 'date') return `col-${col.type}`
  return ''
}
