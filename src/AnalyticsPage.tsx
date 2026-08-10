import { useMemo, useState } from 'react'
import ClassSidebar from './ClassSidebar'
import {
  absenceStreak,
  atRiskParticipants,
  attendanceRate,
  classSessionTrend,
} from './core/analytics'
import { loadState, type AppState } from './core/store'

const DEFAULT_AT_RISK_LAST = 4
const DEFAULT_AT_RISK_MISSED = 2

function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`
}

function formatSessionLabel(date: string, label: string | undefined): string {
  return label ? `${date} — ${label}` : date
}

function AnalyticsPage() {
  const [state] = useState<AppState>(() => loadState())
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [atRiskLast, setAtRiskLast] = useState(DEFAULT_AT_RISK_LAST)
  const [atRiskMissed, setAtRiskMissed] = useState(DEFAULT_AT_RISK_MISSED)

  const activeClasses = state.classes.filter((c) => !c.archived)
  const selectedClass = activeClasses.find((c) => c.id === selectedClassId) ?? activeClasses[0]

  const classSessions = useMemo(
    () => (selectedClass ? state.sessions.filter((s) => s.classId === selectedClass.id) : []),
    [state.sessions, selectedClass],
  )

  const participants = useMemo(
    () =>
      selectedClass
        ? state.participants.filter((p) => p.classId === selectedClass.id && !p.archived)
        : [],
    [state.participants, selectedClass],
  )

  const sessionIds = useMemo(() => new Set(classSessions.map((s) => s.id)), [classSessions])
  const marks = useMemo(
    () => state.attendanceMarks.filter((m) => sessionIds.has(m.sessionId)),
    [state.attendanceMarks, sessionIds],
  )

  const participantStats = useMemo(
    () =>
      participants.map((p) => ({
        participant: p,
        rate: attendanceRate(classSessions, marks, p.id),
        streak: absenceStreak(classSessions, marks, p.id),
      })),
    [participants, classSessions, marks],
  )

  const validLast = Number.isInteger(atRiskLast) && atRiskLast > 0 ? atRiskLast : DEFAULT_AT_RISK_LAST
  const validMissed =
    Number.isInteger(atRiskMissed) && atRiskMissed >= 0 ? atRiskMissed : DEFAULT_AT_RISK_MISSED

  const atRisk = useMemo(
    () =>
      atRiskParticipants(classSessions, marks, participants, {
        last: validLast,
        missed: validMissed,
      }),
    [classSessions, marks, participants, validLast, validMissed],
  )

  const trend = useMemo(
    () => classSessionTrend(classSessions, marks, participants),
    [classSessions, marks, participants],
  )

  return (
    <div className="analytics-page">
      <ClassSidebar
        classes={activeClasses}
        selectedClassId={selectedClass?.id}
        onSelect={setSelectedClassId}
      />

      <section className="analytics-main">
        {selectedClass ? (
          participants.length > 0 ? (
            <>
              <h2>{selectedClass.name}</h2>

              <div className="analytics-section">
                <h3>Attendance rates</h3>
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Attendance rate</th>
                      <th>Absence streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantStats.map(({ participant, rate, streak }) => (
                      <tr key={participant.id}>
                        <td>{participant.name}</td>
                        <td>{formatRate(rate)}</td>
                        <td>{streak > 0 ? streak : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="analytics-section">
                <h3>At risk</h3>
                <div className="at-risk-controls">
                  <label>
                    Missed at least
                    <input
                      aria-label="Missed at least"
                      type="number"
                      min={0}
                      value={atRiskMissed}
                      onChange={(e) => setAtRiskMissed(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    of last
                    <input
                      aria-label="Of last sessions"
                      type="number"
                      min={1}
                      value={atRiskLast}
                      onChange={(e) => setAtRiskLast(Number(e.target.value))}
                    />
                    sessions
                  </label>
                </div>
                {atRisk.length > 0 ? (
                  <ul className="at-risk-list">
                    {atRisk.map((entry) => (
                      <li key={entry.participant.id} className="at-risk-row">
                        <span className="participant-name">{entry.participant.name}</span>
                        <span className="at-risk-count">
                          missed {entry.missedCount} of {entry.consideredSessions}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-hint">No participants currently at risk.</p>
                )}
              </div>

              <div className="analytics-section">
                <h3>Session trend</h3>
                {trend.length > 0 ? (
                  <ul className="session-trend-list">
                    {trend.map(({ session, rate }) => (
                      <li key={session.id} className="session-trend-row">
                        <span className="session-trend-label">
                          {formatSessionLabel(session.date, session.label)}
                        </span>
                        <div className="session-trend-bar-track">
                          <div className="session-trend-bar" style={{ width: formatRate(rate) }} />
                        </div>
                        <span className="session-trend-rate">{formatRate(rate)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-hint">No sessions recorded yet.</p>
                )}
              </div>
            </>
          ) : (
            <p className="empty-hint">Add participants to this class to see analytics.</p>
          )
        ) : (
          <p className="empty-hint">Create a class in Roster to get started, or load its demo class to explore first.</p>
        )}
      </section>
    </div>
  )
}

export default AnalyticsPage
