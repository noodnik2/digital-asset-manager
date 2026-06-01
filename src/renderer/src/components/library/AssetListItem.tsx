import type { AssetRow, AssetCell, ColumnDefinition } from '@shared/types/asset'

interface AssetListItemProps {
  row: AssetRow
  columns: ColumnDefinition[]
  onRowClick?: (id: string, e: React.MouseEvent) => void
}

export function AssetListItem({ row, columns, onRowClick }: AssetListItemProps) {
  const visibleCols = columns.filter(c => c.visible)
  const cellMap = new Map(row.cells.map(c => [c.columnId, c]))

  return (
    <tr
      className={row.selected ? 'row-selected' : ''}
      aria-selected={row.selected}
      role="row"
      onClick={onRowClick ? (e) => onRowClick(row.id, e) : undefined}
    >
      {visibleCols.map(col => {
        const cell = cellMap.get(col.id)
        return (
          <td
            key={col.id}
            className={`col-${col.id}`}
            title={cellTitle(col, cell)}
          >
            {renderCell(col, cell)}
          </td>
        )
      })}
    </tr>
  )
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

function cellTitle(col: ColumnDefinition, cell: AssetCell | undefined): string | undefined {
  if (col.id === 'name' && cell) {
    return `${cell.value}\n${cell.secondaryValue ?? ''}`
  }
  return undefined
}

function renderCell(col: ColumnDefinition, cell: AssetCell | undefined) {
  if (!cell) return null

  switch (col.id) {
    case 'name':
      return (
        <div>
          <div className="cell-name-primary">{String(cell.value ?? '')}</div>
          {cell.secondaryValue && (
            <div className="cell-name-secondary">{cell.secondaryValue}</div>
          )}
        </div>
      )

    case 'type':
      return <span className="type-badge">{String(cell.value ?? '')}</span>

    case 'duration': {
      if (cell.value === null || cell.value === undefined) return null
      const secs = typeof cell.value === 'number' ? cell.value : null
      if (secs === null) return null
      return <span className="cell-duration">{formatDuration(secs)}</span>
    }

    case 'size': {
      const bytes = typeof cell.value === 'number' ? cell.value : null
      if (bytes === null) return null
      return <span className="cell-numeric">{formatSize(bytes)}</span>
    }

    case 'tags': {
      if (!cell.value || !Array.isArray(cell.value)) return null
      return (
        <div className="cell-tags">
          {(cell.value as string[]).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )
    }

    case 'modified':
      return <span className="cell-date">{String(cell.value ?? '')}</span>

    default:
      // Plugin-specific columns — render by type
      if (col.type === 'numeric') return <span className="cell-numeric">{String(cell.value ?? '')}</span>
      if (col.type === 'duration') return <span className="cell-duration">{String(cell.value ?? '')}</span>
      if (col.type === 'date') return <span className="cell-date">{String(cell.value ?? '')}</span>
      return <span>{String(cell.value ?? '')}</span>
  }
}
