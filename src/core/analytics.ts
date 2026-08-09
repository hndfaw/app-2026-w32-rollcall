// Analytics: attendance rate, absence streak, at-risk list, and per-class session
// trends. Pure functions over already-filtered (single class) sessions/marks/
// participants - analytics doesn't know about classes, only the records it's given.

import type { AttendanceMark, Assessment, Participant, Score, Session } from './models'

function sortByDate(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
  })
}

function findMark(
  marks: AttendanceMark[],
  sessionId: string,
  participantId: string,
): AttendanceMark | undefined {
  return marks.find((m) => m.sessionId === sessionId && m.participantId === participantId)
}

const ATTENDED_STATUSES: ReadonlySet<string> = new Set(['present', 'late'])

/**
 * Attendance rate for one participant across the given sessions, as a 0-1 fraction.
 * present/late count as attended, absent counts against; excused and unmarked
 * sessions are excluded from both numerator and denominator. 0 when nothing counts.
 */
export function attendanceRate(
  sessions: Session[],
  marks: AttendanceMark[],
  participantId: string,
): number {
  let counted = 0
  let attended = 0
  for (const session of sessions) {
    const mark = findMark(marks, session.id, participantId)
    if (!mark || mark.status === 'excused') continue
    counted += 1
    if (ATTENDED_STATUSES.has(mark.status)) attended += 1
  }
  return counted === 0 ? 0 : attended / counted
}

/**
 * Current consecutive-absence streak for a participant, walking backward from the
 * most recent session. Any present/late/excused mark, or a session with no mark
 * at all, ends the streak.
 */
export function absenceStreak(
  sessions: Session[],
  marks: AttendanceMark[],
  participantId: string,
): number {
  const mostRecentFirst = sortByDate(sessions).reverse()
  let streak = 0
  for (const session of mostRecentFirst) {
    const mark = findMark(marks, session.id, participantId)
    if (mark?.status !== 'absent') break
    streak += 1
  }
  return streak
}

export interface AtRiskEntry {
  participant: Participant
  missedCount: number
  consideredSessions: number
}

export interface AtRiskOptions {
  missed: number
  last: number
}

/**
 * Participants who missed at least `missed` of the last `last` sessions
 * (fewer are considered if the class has held fewer than `last` sessions).
 */
export function atRiskParticipants(
  sessions: Session[],
  marks: AttendanceMark[],
  participants: Participant[],
  options: AtRiskOptions,
): AtRiskEntry[] {
  if (!Number.isInteger(options.last) || options.last <= 0) {
    throw new Error('last must be a positive integer')
  }
  if (!Number.isInteger(options.missed) || options.missed < 0) {
    throw new Error('missed must be a non-negative integer')
  }

  const recent = sortByDate(sessions).slice(-options.last)
  return participants
    .map((participant) => {
      const missedCount = recent.filter(
        (session) => findMark(marks, session.id, participant.id)?.status === 'absent',
      ).length
      return { participant, missedCount, consideredSessions: recent.length }
    })
    .filter((entry) => entry.missedCount >= options.missed)
}

/**
 * A participant's average score across assessments they have a score for, as a
 * 0-1 fraction of each assessment's maxScore. Assessments with no score recorded
 * are excluded. null when the participant has no scores at all.
 */
export function participantAverage(
  assessments: Assessment[],
  scores: Score[],
  participantId: string,
): number | null {
  const percentages: number[] = []
  for (const assessment of assessments) {
    const score = scores.find(
      (s) => s.assessmentId === assessment.id && s.participantId === participantId,
    )
    if (score) percentages.push(score.value / assessment.maxScore)
  }
  if (percentages.length === 0) return null
  return percentages.reduce((sum, p) => sum + p, 0) / percentages.length
}

export interface SessionAttendancePoint {
  session: Session
  rate: number
}

/**
 * Per-session attendance rate across the given participants, oldest to newest -
 * the input for a class attendance trend chart.
 */
export function classSessionTrend(
  sessions: Session[],
  marks: AttendanceMark[],
  participants: Participant[],
): SessionAttendancePoint[] {
  return sortByDate(sessions).map((session) => {
    let counted = 0
    let attended = 0
    for (const participant of participants) {
      const mark = findMark(marks, session.id, participant.id)
      if (!mark || mark.status === 'excused') continue
      counted += 1
      if (ATTENDED_STATUSES.has(mark.status)) attended += 1
    }
    return { session, rate: counted === 0 ? 0 : attended / counted }
  })
}
