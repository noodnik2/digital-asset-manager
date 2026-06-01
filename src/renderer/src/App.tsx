import { useState, useEffect, useCallback } from 'react'
import { ServicesContext } from './services/context'
import { mockServices } from './services/mock'
import { LibraryPane } from './components/library/LibraryPane'
import { WorkingSetPane } from './components/working-set/WorkingSetPane'
import { StatusBar } from './components/shell/StatusBar'

type PaneId = 'library' | 'working-set'

export default function App() {
  const [activePane, setActivePane] = useState<PaneId>('library')
  const [wsItemCount, setWsItemCount] = useState(0)

  // ⌘1 / ⌘2 pane switching (app-shell spec, Task 1)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.metaKey) return
      if (e.key === '1') { e.preventDefault(); setActivePane('library') }
      if (e.key === '2') { e.preventDefault(); setActivePane('working-set') }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleWsCountChange = useCallback((count: number) => {
    setWsItemCount(count)
  }, [])

  return (
    <ServicesContext.Provider value={mockServices}>
      <div className="app-shell">
        <div className="app-panes">
          <div
            className={`pane pane--library${activePane === 'library' ? ' pane--active' : ''}`}
            role="main"
            aria-label="Library"
            aria-current={activePane === 'library' ? 'true' : undefined}
            onClick={() => setActivePane('library')}
          >
            <LibraryPane />
          </div>

          <div className="pane-divider" aria-hidden="true" />

          <div
            className={`pane pane--working-set${activePane === 'working-set' ? ' pane--active' : ''}`}
            role="complementary"
            aria-label="Working Set"
            aria-current={activePane === 'working-set' ? 'true' : undefined}
            onClick={() => setActivePane('working-set')}
          >
            <WorkingSetPane onCountChange={handleWsCountChange} />
          </div>
        </div>

        <StatusBar wsItemCount={wsItemCount} />
      </div>
    </ServicesContext.Provider>
  )
}
