import { describe, expect, it } from 'vitest'
import { buildDemoData } from './demo'

describe('buildDemoData', () => {
  it('builds a class with participants, sessions, and marks that reference it correctly', () => {
    const demo = buildDemoData()

    expect(demo.schoolClass.name).toBe('Demo Class')
    expect(demo.participants.length).toBeGreaterThan(0)
    expect(demo.sessions.length).toBeGreaterThan(0)

    for (const participant of demo.participants) {
      expect(participant.classId).toBe(demo.schoolClass.id)
    }
    for (const session of demo.sessions) {
      expect(session.classId).toBe(demo.schoolClass.id)
    }
  })

  it('marks attendance for every participant in every session', () => {
    const demo = buildDemoData()
    expect(demo.attendanceMarks).toHaveLength(demo.participants.length * demo.sessions.length)

    const sessionIds = new Set(demo.sessions.map((s) => s.id))
    const participantIds = new Set(demo.participants.map((p) => p.id))
    for (const mark of demo.attendanceMarks) {
      expect(sessionIds.has(mark.sessionId)).toBe(true)
      expect(participantIds.has(mark.participantId)).toBe(true)
    }
  })

  it('creates assessments and scores within their max score', () => {
    const demo = buildDemoData()
    expect(demo.assessments.length).toBeGreaterThan(0)

    const maxByAssessment = new Map(demo.assessments.map((a) => [a.id, a.maxScore]))
    expect(demo.scores.length).toBeGreaterThan(0)
    for (const score of demo.scores) {
      const max = maxByAssessment.get(score.assessmentId)
      expect(max).toBeDefined()
      expect(score.value).toBeGreaterThanOrEqual(0)
      expect(score.value).toBeLessThanOrEqual(max ?? 0)
    }
  })

  it('leaves at least one participant without a score to exercise the ungraded state', () => {
    const demo = buildDemoData()
    const scoredParticipantIds = new Set(demo.scores.map((s) => s.participantId))
    const someMissing = demo.participants.some((p) => !scoredParticipantIds.has(p.id) || demo.scores.filter((s) => s.participantId === p.id).length < demo.assessments.length)
    expect(someMissing).toBe(true)
  })

  it('produces a fresh set of ids on every call', () => {
    const first = buildDemoData()
    const second = buildDemoData()
    expect(first.schoolClass.id).not.toBe(second.schoolClass.id)
  })
})
