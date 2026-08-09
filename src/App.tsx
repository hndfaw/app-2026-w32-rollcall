import { useState } from 'react'
import AnalyticsPage from './AnalyticsPage'
import GradebookPage from './GradebookPage'
import RosterPage from './RosterPage'
import SessionsPage from './SessionsPage'
import './App.css'

type Page = 'roster' | 'sessions' | 'gradebook' | 'analytics'

function App() {
  const [page, setPage] = useState<Page>('roster')

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">Rollcall</h1>
        <nav className="app-nav">
          <button
            type="button"
            className={page === 'roster' ? 'nav-button selected' : 'nav-button'}
            onClick={() => setPage('roster')}
          >
            Roster
          </button>
          <button
            type="button"
            className={page === 'sessions' ? 'nav-button selected' : 'nav-button'}
            onClick={() => setPage('sessions')}
          >
            Sessions
          </button>
          <button
            type="button"
            className={page === 'gradebook' ? 'nav-button selected' : 'nav-button'}
            onClick={() => setPage('gradebook')}
          >
            Gradebook
          </button>
          <button
            type="button"
            className={page === 'analytics' ? 'nav-button selected' : 'nav-button'}
            onClick={() => setPage('analytics')}
          >
            Analytics
          </button>
        </nav>
      </header>
      {page === 'roster' && <RosterPage />}
      {page === 'sessions' && <SessionsPage />}
      {page === 'gradebook' && <GradebookPage />}
      {page === 'analytics' && <AnalyticsPage />}
    </>
  )
}

export default App
