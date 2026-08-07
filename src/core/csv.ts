// CSV export: attendance and grades generators. Pure functions that turn a class's
// records into CSV text - no I/O, no DOM. The UI wires these to a download link.

import { attendanceRate } from './analytics'
import type { AttendanceMark, Assessment, Participant, Score, Session } from './models'

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function csvRow(cells: string[]): string {
  return cells.map(csvEscape).join(',')
}

function sortByDate(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
  })
}

/**
 * One row per participant, one column per session (oldest to newest) holding
 * that session's attendance status, plus a trailing attendance-rate column.
 */
export function attendanceCsv(
  sessions: Session[],
  marks: AttendanceMark[],
  participants: Participant[],
): string {
  const sorted = sortByDate(sessions)
  const header = ['Participant', ...sorted.map((s) => s.date), 'Attendance Rate']
  const rows = participants.map((participant) => {
    const statuses = sorted.map((session) => {
      const mark = marks.find(
        (m) => m.sessionId === session.id && m.participantId === participant.id,
      )
      return mark?.status ?? ''
    })
    const rate = attendanceRate(sorted, marks, participant.id)
    return [participant.name, ...statuses, `${Math.round(rate * 100)}%`]
  })
  return [header, ...rows].map(csvRow).join('\n')
}

/**
 * One row per participant, one column per assessment holding that participant's
 * score, plus a trailing average-percentage column across scored assessments.
 */
export function gradesCsv(
  assessments: Assessment[],
  scores: Score[],
  participants: Participant[],
): string {
  const header = [
    'Participant',
    ...assessments.map((a) => `${a.name} (/${a.maxScore})`),
    'Average %',
  ]
  const rows = participants.map((participant) => {
    const scoreFor = (assessment: Assessment) =>
      scores.find(
        (s) => s.assessmentId === assessment.id && s.participantId === participant.id,
      )
    const cells = assessments.map((a) => {
      const score = scoreFor(a)
      return score ? String(score.value) : ''
    })
    const percentages = assessments
      .map((a) => {
        const score = scoreFor(a)
        return score ? score.value / a.maxScore : undefined
      })
      .filter((p): p is number => p !== undefined)
    const average =
      percentages.length === 0
        ? ''
        : `${Math.round((percentages.reduce((sum, p) => sum + p, 0) / percentages.length) * 100)}%`
    return [participant.name, ...cells, average]
  })
  return [header, ...rows].map(csvRow).join('\n')
}
