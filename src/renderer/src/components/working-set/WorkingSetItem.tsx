import { X } from 'lucide-react'
import type { WorkingSetItem as WsItem } from '@shared/appservices'

interface WorkingSetItemProps {
  item: WsItem
  onRemove: (assetId: string) => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function WorkingSetItem({ item, onRemove }: WorkingSetItemProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove(item.assetId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onRemove(item.assetId)
    }
  }

  return (
    <div
      className="ws-item"
      role="listitem"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={[
        item.filename,
        item.fileType,
        item.duration !== null ? formatDuration(item.duration) : null,
      ]
        .filter(Boolean)
        .join(', ')}
    >
      <span className="type-badge">{item.fileType}</span>

      <span className="ws-item__filename" title={item.filename}>
        {item.filename}
      </span>

      {item.duration !== null && (
        <span className="ws-item__duration">
          {formatDuration(item.duration)}
        </span>
      )}

      <button
        className="ws-item__remove"
        onClick={handleRemove}
        aria-label={`Remove ${item.filename} from Working Set`}
        title={`Remove ${item.filename}`}
      >
        <X size={12} />
      </button>
    </div>
  )
}
