import { useState } from 'react'
import RosterPage from './RosterPage'
import SessionsPage from './SessionsPage'
import './App.css'

type Page = 'roster' | 'sessions'

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
        </nav>
      </header>
      {page === 'roster' ? <RosterPage /> : <SessionsPage />}
    </>
  )
}

export default App
