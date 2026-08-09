import { describe, expect, it } from 'vitest'
import {
  absenceStreak,
  atRiskParticipants,
  attendanceRate,
  classSessionTrend,
  participantAverage,
} from './analytics'
import {
  createAssessment,
  createAttendanceMark,
  createClass,
  createParticipant,
  createScore,
  createSession,
} from './models'

const classId = createClass({ name: 'Class A' }).id
const alice = createParticipant({ classId, name: 'Alice' })
const bob = createParticipant({ classId, name: 'Bob' })

const s1 = createSession({ classId, date: '2026-08-01' })
const s2 = createSession({ classId, date: '2026-08-02' })
const s3 = createSession({ classId, date: '2026-08-03' })
const s4 = createSession({ classId, date: '2026-08-04' })
const sessions = [s4, s1, s3, s2] // deliberately out of order

describe('attendanceRate', () => {
  it('counts present and late as attended, absent as not', () => {
    const marks = [
      createAttendanceMark({ sessionId: s1.id, participantId: alice.id, status: 'present' }),
      createAttendanceMark({ sessionId: s2.id, participantId: alice.id, status: 'late' }),
      createAttendanceMark({ sessionId: s3.id, participantId: alice.id, status: 'absent' }),
      createAttendanceMark({ sessionId: s4.id, participantId: alice.id, status: 'present' }),
    ]
    expect(attendanceRate(sessions, marks, alice.id)).toBe(0.75)
  })

  it('excludes excused and unmarked sessions from the denominator', () => {
    const marks = [
      createAttendanceMark({ sessionId: s1.id, participantId: alice.id, status: 'present' }),
      createAttendanceMark({ sessionId: s2.id, participantId: alice.id, status: 'excused' }),
      createAttendanceMark({ sessionId: s3.id, participantId: alice.id, status: 'absent' }),
      // s4 left unmarked
    ]
    expect(attendanceRate(sessions, marks, alice.id)).toBeCloseTo(1 / 2)
  })

  it('returns 0 when nothing counts', () => {
    expect(attendanceRate(sessions, [], alice.id)).toBe(0)
  })
})

describe('absenceStreak', () => {
  it('counts consecutive absences from the most recent session backward', () => {
    const marks = [
      createAttendanceMark({ sessionId: s1.id, participantId: alice.id, status: 'present' }),
      createAttendanceMark({ sessionId: s2.id, participantId: alice.id, status: 'absent' }),
      createAttendanceMark({ sessionId: s3.id, participantId: alice.id, status: 'absent' }),
      createAttendanceMark({ sessionId: s4.id, participantId: alice.id, status: 'absent' }),
    ]
    expect(absenceStreak(sessions, marks, alice.id)).toBe(3)
  })

  it('stops at the first non-absent mark', () => {
    const marks = [
      createAttendanceMark({ sessionId: s1.id, participantId: alice.id, status: 'absent' }),
      createAttendanceMark({ sessionId: s2.id, participantId: alice.id, status: 'absent' }),
      createAttendanceMark({ sessionId: s3.id, participantId: alice.id, status: 'present' }),
      createAttendanceMark({ sessionId: s4.id, participantId: alice.id, status: 'absent' }),
    ]
    expect(absenceStreak(sessions, marks, alice.id)).toBe(1)
  })

  it('stops at a session with no mark at all', () => {
    const marks = [
      createAttendanceMark({ sessionId: s1.id, participantId: alice.id, status: 'absent' }),
      createAttendanceMark({ sessionId: s2.id, participantId: alice.id, status: 'absent' }),
      // s3 unmarked
      createAttendanceMark({ sessionId: s4.id, participantId: alice.id, status: 'absent' }),
    ]
    expect(absenceStreak(sessions, marks, alice.id)).toBe(1)
  })

  it('is 0 when the most recent session was not an absence', () => {
    const marks = [
      createAttendanceMark({ sessionId: s4.id, participantId: alice.id, status: 'excused' }),
    ]
    expect(absenceStreak(sessions, marks, alice.id)).toBe(0)
  })
})

describe('atRiskParticipants', () => {
  it('flags participants who missed at least `missed` of the last `last` sessions', () => {
    const marks = [
      createAttendanceMark({ sessionId: s2.id, participantId: alice.id, status: 'absent' }),
      createAttendanceMark({ sessionId: s3.id, participantId: alice.id, status: 'absent' }),
      createAttendanceMark({ sessionId: s4.id, participantId: alice.id, status: 'present' }),
      createAttendanceMark({ sessionId: s2.id, participantId: bob.id, status: 'present' }),
      createAttendanceMark({ sessionId: s3.id, participantId: bob.id, status: 'present' }),
      createAttendanceMark({ sessionId: s4.id, participantId: bob.id, status: 'absent' }),
    ]
    const result = atRiskParticipants(sessions, marks, [alice, bob], { missed: 2, last: 3 })
    expect(result).toHaveLength(1)
    expect(result[0].participant.id).toBe(alice.id)
    expect(result[0].missedCount).toBe(2)
    expect(result[0].consideredSessions).toBe(3)
  })

  it('considers fewer sessions than `last` when the class has fewer', () => {
    const marks = [
      createAttendanceMark({ sessionId: s1.id, participantId: alice.id, status: 'absent' }),
    ]
    const result = atRiskParticipants([s1], marks, [alice], { missed: 1, last: 10 })
    expect(result).toEqual([
      { participant: alice, missedCount: 1, consideredSessions: 1 },
    ])
  })

  it('rejects a non-positive `last`', () => {
    expect(() => atRiskParticipants(sessions, [], [alice], { missed: 1, last: 0 })).toThrow(
      /positive integer/,
    )
  })

  it('rejects a negative `missed`', () => {
    expect(() => atRiskParticipants(sessions, [], [alice], { missed: -1, last: 1 })).toThrow(
      /non-negative integer/,
    )
  })
})

describe('classSessionTrend', () => {
  it('returns one point per session, ordered oldest to newest', () => {
    const marks = [
      createAttendanceMark({ sessionId: s1.id, participantId: alice.id, status: 'present' }),
      createAttendanceMark({ sessionId: s1.id, participantId: bob.id, status: 'absent' }),
      createAttendanceMark({ sessionId: s2.id, participantId: alice.id, status: 'present' }),
      createAttendanceMark({ sessionId: s2.id, participantId: bob.id, status: 'present' }),
    ]
    const trend = classSessionTrend([s2, s1], marks, [alice, bob])
    expect(trend.map((p) => p.session.id)).toEqual([s1.id, s2.id])
    expect(trend[0].rate).toBe(0.5)
    expect(trend[1].rate).toBe(1)
  })

  it('gives a session with no marks a rate of 0', () => {
    const trend = classSessionTrend([s1], [], [alice, bob])
    expect(trend[0].rate).toBe(0)
  })
})

describe('participantAverage', () => {
  const quiz1 = createAssessment({ classId, name: 'Quiz 1', maxScore: 20 })
  const quiz2 = createAssessment({ classId, name: 'Quiz 2', maxScore: 10 })

  it('averages percentages across assessments with a recorded score', () => {
    const scores = [
      createScore({ assessmentId: quiz1.id, participantId: alice.id, value: 10 }, quiz1),
      createScore({ assessmentId: quiz2.id, participantId: alice.id, value: 10 }, quiz2),
    ]
    expect(participantAverage([quiz1, quiz2], scores, alice.id)).toBe(0.75)
  })

  it('excludes assessments with no score for the participant', () => {
    const scores = [
      createScore({ assessmentId: quiz1.id, participantId: alice.id, value: 20 }, quiz1),
    ]
    expect(participantAverage([quiz1, quiz2], scores, alice.id)).toBe(1)
  })

  it('returns null when the participant has no scores', () => {
    expect(participantAverage([quiz1, quiz2], [], alice.id)).toBeNull()
  })
})
