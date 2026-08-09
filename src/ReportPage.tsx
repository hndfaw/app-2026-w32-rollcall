import { useMemo, useState } from 'react'
import ClassSidebar from './ClassSidebar'
import { absenceStreak, attendanceRate, participantAverage } from './core/analytics'
import { attendanceCsv, gradesCsv } from './core/csv'
import { loadState, type AppState } from './core/store'

function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`
}

function todayLabel(): string {
  return new Date().toISOString().slice(0, 10)
}

function csvDownloadHref(csv: string): string {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-') || 'class'
}

function ReportPage() {
  const [state] = useState<AppState>(() => loadState())
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  const activeClasses = state.classes.filter((c) => !c.archived)
  const selectedClass = activeClasses.find((c) => c.id === selectedClassId) ?? activeClasses[0]

  const participants = useMemo(
    () =>
      selectedClass
        ? state.participants.filter((p) => p.classId === selectedClass.id && !p.archived)
        : [],
    [state.participants, selectedClass],
  )

  const sessions = useMemo(
    () => (selectedClass ? state.sessions.filter((s) => s.classId === selectedClass.id) : []),
    [state.sessions, selectedClass],
  )

  const sessionIds = useMemo(() => new Set(sessions.map((s) => s.id)), [sessions])
  const marks = useMemo(
    () => state.attendanceMarks.filter((m) => sessionIds.has(m.sessionId)),
    [state.attendanceMarks, sessionIds],
  )

  const assessments = useMemo(
    () => (selectedClass ? state.assessments.filter((a) => a.classId === selectedClass.id) : []),
    [state.assessments, selectedClass],
  )

  const assessmentIds = useMemo(() => new Set(assessments.map((a) => a.id)), [assessments])
  const scores = useMemo(
    () => state.scores.filter((s) => assessmentIds.has(s.assessmentId)),
    [state.scores, assessmentIds],
  )

  const rows = useMemo(
    () =>
      participants.map((participant) => ({
        participant,
        rate: attendanceRate(sessions, marks, participant.id),
        streak: absenceStreak(sessions, marks, participant.id),
        average: participantAverage(assessments, scores, participant.id),
      })),
    [participants, sessions, marks, assessments, scores],
  )

  const attendanceCsvHref = useMemo(
    () => csvDownloadHref(attendanceCsv(sessions, marks, participants)),
    [sessions, marks, participants],
  )
  const gradesCsvHref = useMemo(
    () => csvDownloadHref(gradesCsv(assessments, scores, participants)),
    [assessments, scores, participants],
  )

  const slug = selectedClass ? slugify(selectedClass.name) : 'class'

  return (
    <div className="report-page">
      <div className="no-print">
        <ClassSidebar
          classes={activeClasses}
          selectedClassId={selectedClass?.id}
          onSelect={setSelectedClassId}
        />
      </div>

      <section className="report-main">
        {selectedClass ? (
          participants.length > 0 ? (
            <>
              <div className="report-header">
                <div>
                  <h2>{selectedClass.name}</h2>
                  <p className="report-date">Report generated {todayLabel()}</p>
                </div>
                <div className="report-actions no-print">
                  <button type="button" onClick={() => window.print()}>
                    Print report
                  </button>
                  <a
                    className="button-link"
                    href={attendanceCsvHref}
                    download={`${slug}-attendance.csv`}
                  >
                    Download attendance CSV
                  </a>
                  <a className="button-link" href={gradesCsvHref} download={`${slug}-grades.csv`}>
                    Download grades CSV
                  </a>
                </div>
              </div>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Attendance rate</th>
                    <th>Absence streak</th>
                    <th>Grade average</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ participant, rate, streak, average }) => (
                    <tr key={participant.id}>
                      <td>{participant.name}</td>
                      <td>{formatPercent(rate)}</td>
                      <td>{streak > 0 ? streak : '—'}</td>
                      <td>{average === null ? '—' : formatPercent(average)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="empty-hint">Add participants to this class to generate a report.</p>
          )
        ) : (
          <p className="empty-hint">Create a class in Roster to get started.</p>
        )}
      </section>
    </div>
  )
}

export default ReportPage
