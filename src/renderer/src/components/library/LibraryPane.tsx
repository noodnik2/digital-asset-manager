import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { useServices } from '../../services/context'
import { AssetListItem } from './AssetListItem'
import type { ColumnDefinition, LibraryViewState, LibraryQuery } from '@shared/types/asset'

const DEFAULT_QUERY: LibraryQuery = { sortColumn: 'modified', sortDirection: 'desc' }

export function LibraryPane() {
  const services = useServices()
  const [query, setQuery] = useState<LibraryQuery>(DEFAULT_QUERY)
  const [viewState, setViewState] = useState<LibraryViewState | null>(null)

  useEffect(() => {
    services.library.query(query).then(setViewState)
  }, [services, query])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(q => ({ ...q, search: e.target.value || undefined }))
  }

  if (!viewState) return null

  const { items, totalCount, filteredCount, columns } = viewState
  const isFiltered = filteredCount < totalCount
  const countLabel = isFiltered
    ? `${filteredCount} of ${totalCount}`
    : `${totalCount} items`

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
              <AssetListItem key={row.id} row={row} columns={columns} />
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
