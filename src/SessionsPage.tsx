import { useEffect, useState } from 'react'
import ClassSidebar from './ClassSidebar'
import {
  ATTENDANCE_STATUSES,
  createAttendanceMark,
  createSession,
  setAttendanceMarkStatus,
  type AttendanceStatus,
  type Participant,
} from './core/models'
import { loadState, saveState, type AppState } from './core/store'

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function SessionForm({ onCreate }: { onCreate: (date: string, label: string) => void }) {
  const [date, setDate] = useState(todayIso)
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    try {
      onCreate(date, label)
      setLabel('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start session')
    }
  }

  return (
    <form className="session-form" onSubmit={handleSubmit}>
      <input aria-label="Session date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input
        aria-label="Session label"
        placeholder="Label (optional)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <button type="submit">Start session</button>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

function AttendanceRow({
  participant,
  status,
  onMark,
}: {
  participant: Participant
  status: AttendanceStatus | undefined
  onMark: (status: AttendanceStatus) => void
}) {
  return (
    <li className="attendance-row">
      <span className="participant-name">{participant.name}</span>
      <div className="status-buttons" role="group" aria-label={`${participant.name} attendance status`}>
        {ATTENDANCE_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`status-button status-${s}${status === s ? ' selected' : ''}`}
            aria-pressed={status === s}
            onClick={() => onMark(s)}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </li>
  )
}

function SessionsPage() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  const activeClasses = state.classes.filter((c) => !c.archived)
  const selectedClass = activeClasses.find((c) => c.id === selectedClassId) ?? activeClasses[0]

  const classSessions = selectedClass
    ? state.sessions.filter((s) => s.classId === selectedClass.id).sort((a, b) => (a.date < b.date ? 1 : -1))
    : []

  const activeSession = classSessions.find((s) => s.id === activeSessionId) ?? classSessions[0]

  const participants = selectedClass
    ? state.participants.filter((p) => p.classId === selectedClass.id && !p.archived)
    : []

  const marksForActiveSession = activeSession
    ? state.attendanceMarks.filter((m) => m.sessionId === activeSession.id)
    : []

  function handleSelectClass(id: string) {
    setSelectedClassId(id)
    setActiveSessionId(null)
  }

  function handleStartSession(date: string, label: string) {
    if (!selectedClass) return
    const session = createSession({ classId: selectedClass.id, date, label })
    setState((s) => ({ ...s, sessions: [...s.sessions, session] }))
    setActiveSessionId(session.id)
  }

  function handleMark(participantId: string, status: AttendanceStatus) {
    if (!activeSession) return
    setState((s) => {
      const existing = s.attendanceMarks.find(
        (m) => m.sessionId === activeSession.id && m.participantId === participantId,
      )
      if (existing) {
        return {
          ...s,
          attendanceMarks: s.attendanceMarks.map((m) =>
            m.id === existing.id ? setAttendanceMarkStatus(m, status) : m,
          ),
        }
      }
      const mark = createAttendanceMark({ sessionId: activeSession.id, participantId, status })
      return { ...s, attendanceMarks: [...s.attendanceMarks, mark] }
    })
  }

  return (
    <div className="sessions-page">
      <ClassSidebar classes={activeClasses} selectedClassId={selectedClass?.id} onSelect={handleSelectClass} />

      <section className="sessions-main">
        {selectedClass ? (
          <>
            <div className="sessions-header">
              <h2>{selectedClass.name}</h2>
              <SessionForm onCreate={handleStartSession} />
            </div>

            {classSessions.length > 0 && (
              <ul className="session-list">
                {classSessions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={s.id === activeSession?.id ? 'session-button selected' : 'session-button'}
                      aria-pressed={s.id === activeSession?.id}
                      onClick={() => setActiveSessionId(s.id)}
                    >
                      {s.date}
                      {s.label ? ` — ${s.label}` : ''}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {activeSession ? (
              participants.length > 0 ? (
                <>
                  <p className="session-summary">
                    {marksForActiveSession.length} of {participants.length} marked
                  </p>
                  <ul className="attendance-list">
                    {participants.map((p) => (
                      <AttendanceRow
                        key={p.id}
                        participant={p}
                        status={marksForActiveSession.find((m) => m.participantId === p.id)?.status}
                        onMark={(status) => handleMark(p.id, status)}
                      />
                    ))}
                  </ul>
                </>
              ) : (
                <p className="empty-hint">Add participants to this class before marking attendance.</p>
              )
            ) : (
              <p className="empty-hint">Start a session to begin marking attendance.</p>
            )}
          </>
        ) : (
          <p className="empty-hint">Create a class in Roster to get started, or load its demo class to explore first.</p>
        )}
      </section>
    </div>
  )
}

export default SessionsPage
