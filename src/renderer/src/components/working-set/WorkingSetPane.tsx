import { useState, useEffect, useCallback } from 'react'
import { Zap } from 'lucide-react'
import { useServices } from '../../services/context'
import { WorkingSetItem } from './WorkingSetItem'
import type { WorkingSetItem as WsItem } from '@shared/appservices'

interface WorkingSetPaneProps {
  onCountChange: (count: number) => void
  refreshKey?: number
}

export function WorkingSetPane({ onCountChange, refreshKey }: WorkingSetPaneProps) {
  const services = useServices()
  const [items, setItems] = useState<WsItem[]>([])

  const refresh = useCallback(async () => {
    const result = await services.workingSet.getItems()
    setItems(result)
    onCountChange(result.length)
  }, [services, onCountChange])

  useEffect(() => { refresh() }, [refresh, refreshKey])

  const handleRemove = async (assetId: string) => {
    await services.workingSet.removeAsset(assetId)
    refresh()
  }

  const handleClear = async () => {
    await services.workingSet.clear()
    refresh()
  }

  const isEmpty = items.length === 0

  return (
    <div className="ws-pane">
      <div className="ws-toolbar">
        <button
          className="ws-toolbar__op-btn btn-ghost"
          disabled={isEmpty}
          aria-label={isEmpty ? 'Select operation' : 'Select operation — change operation'}
          aria-disabled={isEmpty}
          onClick={e => e.stopPropagation()}
        >
          <Zap size={14} />
          <span className="btn-label">Select Operation</span>
          <span aria-hidden="true">▾</span>
        </button>

        <button
          className="btn-ghost"
          disabled={isEmpty}
          aria-disabled={isEmpty}
          aria-label="Clear Working Set"
          onClick={e => { e.stopPropagation(); handleClear() }}
        >
          Clear
        </button>
      </div>

      <div className="ws-list-container" role="list" aria-label="Working Set contents" aria-live="polite">
        {isEmpty ? (
          <div className="ws-empty-state">
            <p>Select assets from<br />the Library to begin.</p>
          </div>
        ) : (
          items.map(item => (
            <WorkingSetItem
              key={item.assetId}
              item={item}
              onRemove={handleRemove}
            />
          ))
        )}
      </div>
    </div>
  )
}
