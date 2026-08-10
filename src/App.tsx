import { useState } from 'react'
import AnalyticsPage from './AnalyticsPage'
import GradebookPage from './GradebookPage'
import ReportPage from './ReportPage'
import RosterPage from './RosterPage'
import SessionsPage from './SessionsPage'
import './App.css'

type Page = 'roster' | 'sessions' | 'gradebook' | 'analytics' | 'report'

const PAGES: { id: Page; label: string }[] = [
  { id: 'roster', label: 'Roster' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'gradebook', label: 'Gradebook' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'report', label: 'Report' },
]

function App() {
  const [page, setPage] = useState<Page>('roster')

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="app-header">
        <h1 className="app-title">Rollcall</h1>
        <nav className="app-nav" aria-label="Main">
          {PAGES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={page === id ? 'nav-button selected' : 'nav-button'}
              aria-current={page === id ? 'page' : undefined}
              onClick={() => setPage(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main id="main-content">
        {page === 'roster' && <RosterPage />}
        {page === 'sessions' && <SessionsPage />}
        {page === 'gradebook' && <GradebookPage />}
        {page === 'analytics' && <AnalyticsPage />}
        {page === 'report' && <ReportPage />}
      </main>
    </>
  )
}

export default App
