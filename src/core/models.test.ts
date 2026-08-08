import { describe, expect, it } from 'vitest'
import {
  createAssessment,
  createAttendanceMark,
  createClass,
  createParticipant,
  createScore,
  createSession,
  setAttendanceMarkStatus,
  setParticipantArchived,
  updateParticipant,
} from './models'

describe('createClass', () => {
  it('creates a class with a generated id and timestamp', () => {
    const cls = createClass({ name: 'Morning Cohort' })
    expect(cls.id).toBeTruthy()
    expect(cls.name).toBe('Morning Cohort')
    expect(cls.archived).toBe(false)
    expect(cls.createdAt).toBeTruthy()
  })

  it('trims the name', () => {
    expect(createClass({ name: '  Padded  ' }).name).toBe('Padded')
  })

  it('rejects an empty name', () => {
    expect(() => createClass({ name: '   ' })).toThrow(/must not be empty/)
  })
})

describe('createParticipant', () => {
  const classId = createClass({ name: 'Class A' }).id

  it('creates a participant tied to a class', () => {
    const p = createParticipant({ classId, name: 'Jane Doe' })
    expect(p.classId).toBe(classId)
    expect(p.name).toBe('Jane Doe')
    expect(p.archived).toBe(false)
    expect(p.participantId).toBeUndefined()
  })

  it('keeps optional participantId and notes when provided', () => {
    const p = createParticipant({
      classId,
      name: 'Jane Doe',
      participantId: 'ID-42',
      notes: 'left-handed',
    })
    expect(p.participantId).toBe('ID-42')
    expect(p.notes).toBe('left-handed')
  })

  it('rejects a missing classId', () => {
    expect(() => createParticipant({ classId: '', name: 'Jane' })).toThrow(/belong to a class/)
  })

  it('rejects an empty name', () => {
    expect(() => createParticipant({ classId, name: '' })).toThrow(/must not be empty/)
  })
})

describe('updateParticipant', () => {
  const classId = createClass({ name: 'Class A' }).id

  it('updates only the given fields', () => {
    const p = createParticipant({ classId, name: 'Jane Doe', notes: 'left-handed' })
    const updated = updateParticipant(p, { name: 'Jane Smith' })
    expect(updated.name).toBe('Jane Smith')
    expect(updated.notes).toBe('left-handed')
    expect(updated.id).toBe(p.id)
  })

  it('trims and clears optional fields', () => {
    const p = createParticipant({ classId, name: 'Jane Doe', notes: 'left-handed' })
    const updated = updateParticipant(p, { notes: '   ' })
    expect(updated.notes).toBeUndefined()
  })

  it('rejects an empty name', () => {
    const p = createParticipant({ classId, name: 'Jane Doe' })
    expect(() => updateParticipant(p, { name: '  ' })).toThrow(/must not be empty/)
  })
})

describe('setParticipantArchived', () => {
  it('toggles the archived flag', () => {
    const classId = createClass({ name: 'Class A' }).id
    const p = createParticipant({ classId, name: 'Jane Doe' })
    expect(setParticipantArchived(p, true).archived).toBe(true)
    expect(setParticipantArchived(setParticipantArchived(p, true), false).archived).toBe(false)
  })
})

describe('createSession', () => {
  const classId = createClass({ name: 'Class A' }).id

  it('creates a session for a valid ISO date', () => {
    const s = createSession({ classId, date: '2026-08-06' })
    expect(s.classId).toBe(classId)
    expect(s.date).toBe('2026-08-06')
  })

  it('rejects a non-ISO date', () => {
    expect(() => createSession({ classId, date: '08/06/2026' })).toThrow(/ISO date/)
  })

  it('rejects an invalid calendar date', () => {
    expect(() => createSession({ classId, date: '2026-13-40' })).toThrow(/ISO date/)
  })

  it('rejects a missing classId', () => {
    expect(() => createSession({ classId: '', date: '2026-08-06' })).toThrow(/belong to a class/)
  })
})

describe('createAttendanceMark', () => {
  const classId = createClass({ name: 'Class A' }).id
  const sessionId = createSession({ classId, date: '2026-08-06' }).id
  const participantId = createParticipant({ classId, name: 'Jane' }).id

  it('creates a mark with a valid status', () => {
    const mark = createAttendanceMark({ sessionId, participantId, status: 'present' })
    expect(mark.status).toBe('present')
    expect(mark.sessionId).toBe(sessionId)
    expect(mark.participantId).toBe(participantId)
  })

  it('rejects an invalid status', () => {
    expect(() =>
      createAttendanceMark({ sessionId, participantId, status: 'maybe' as never }),
    ).toThrow(/Attendance status must be one of/)
  })

  it('rejects a missing sessionId', () => {
    expect(() =>
      createAttendanceMark({ sessionId: '', participantId, status: 'present' }),
    ).toThrow(/reference a session/)
  })

  it('rejects a missing participantId', () => {
    expect(() =>
      createAttendanceMark({ sessionId, participantId: '', status: 'present' }),
    ).toThrow(/reference a participant/)
  })
})

describe('setAttendanceMarkStatus', () => {
  const classId = createClass({ name: 'Class A' }).id
  const sessionId = createSession({ classId, date: '2026-08-06' }).id
  const participantId = createParticipant({ classId, name: 'Jane' }).id
  const mark = createAttendanceMark({ sessionId, participantId, status: 'present' })

  it('returns a new mark with the updated status', () => {
    const updated = setAttendanceMarkStatus(mark, 'absent')
    expect(updated.status).toBe('absent')
    expect(updated.id).toBe(mark.id)
    expect(mark.status).toBe('present')
  })

  it('rejects an invalid status', () => {
    expect(() => setAttendanceMarkStatus(mark, 'maybe' as never)).toThrow(
      /Attendance status must be one of/,
    )
  })
})

describe('createAssessment', () => {
  const classId = createClass({ name: 'Class A' }).id

  it('creates an assessment with a positive maxScore', () => {
    const a = createAssessment({ classId, name: 'Quiz 1', maxScore: 20 })
    expect(a.maxScore).toBe(20)
    expect(a.name).toBe('Quiz 1')
  })

  it('rejects a non-positive maxScore', () => {
    expect(() => createAssessment({ classId, name: 'Quiz 1', maxScore: 0 })).toThrow(
      /positive number/,
    )
    expect(() => createAssessment({ classId, name: 'Quiz 1', maxScore: -5 })).toThrow(
      /positive number/,
    )
  })

  it('rejects a missing classId', () => {
    expect(() => createAssessment({ classId: '', name: 'Quiz 1', maxScore: 10 })).toThrow(
      /belong to a class/,
    )
  })
})

describe('createScore', () => {
  const classId = createClass({ name: 'Class A' }).id
  const participantId = createParticipant({ classId, name: 'Jane' }).id
  const assessment = createAssessment({ classId, name: 'Quiz 1', maxScore: 20 })

  it('creates a score within range', () => {
    const score = createScore({ assessmentId: assessment.id, participantId, value: 18 }, assessment)
    expect(score.value).toBe(18)
    expect(score.assessmentId).toBe(assessment.id)
  })

  it('rejects a value above maxScore', () => {
    expect(() =>
      createScore({ assessmentId: assessment.id, participantId, value: 21 }, assessment),
    ).toThrow(/between 0 and 20/)
  })

  it('rejects a negative value', () => {
    expect(() =>
      createScore({ assessmentId: assessment.id, participantId, value: -1 }, assessment),
    ).toThrow(/between 0 and 20/)
  })

  it('rejects a mismatched assessmentId', () => {
    expect(() =>
      createScore({ assessmentId: 'other-id', participantId, value: 5 }, assessment),
    ).toThrow(/must match the given assessment/)
  })

  it('rejects a missing participantId', () => {
    expect(() =>
      createScore({ assessmentId: assessment.id, participantId: '', value: 5 }, assessment),
    ).toThrow(/reference a participant/)
  })
})
