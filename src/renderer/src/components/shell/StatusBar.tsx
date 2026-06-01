interface StatusBarProps {
  wsItemCount: number
}

export function StatusBar({ wsItemCount }: StatusBarProps) {
  return (
    <div className="status-bar" aria-live="polite">
      {wsItemCount > 0 && (
        <span className="status-bar__count">
          {wsItemCount} {wsItemCount === 1 ? 'item' : 'items'}
        </span>
      )}

      {wsItemCount > 0 && <div className="status-bar__sep" aria-hidden="true" />}

      <span className="status-bar__operation" />

      <span className="status-bar__shortcuts" aria-hidden="true">
        ⌘1 Library&nbsp;&nbsp;⌘2 Working Set
      </span>
    </div>
  )
}
