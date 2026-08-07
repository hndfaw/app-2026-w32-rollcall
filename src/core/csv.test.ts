import { describe, expect, it } from 'vitest'
import { attendanceCsv, gradesCsv } from './csv'
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
const bob = createParticipant({ classId, name: 'Bo, "Bobby"' })

describe('attendanceCsv', () => {
  const s1 = createSession({ classId, date: '2026-08-01' })
  const s2 = createSession({ classId, date: '2026-08-02' })

  it('emits one row per participant with sessions ordered oldest to newest', () => {
    const marks = [
      createAttendanceMark({ sessionId: s1.id, participantId: alice.id, status: 'present' }),
      createAttendanceMark({ sessionId: s2.id, participantId: alice.id, status: 'absent' }),
    ]
    const csv = attendanceCsv([s2, s1], marks, [alice])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Participant,2026-08-01,2026-08-02,Attendance Rate')
    expect(lines[1]).toBe('Alice,present,absent,50%')
  })

  it('leaves unmarked sessions blank', () => {
    const csv = attendanceCsv([s1], [], [alice])
    expect(csv.split('\n')[1]).toBe('Alice,,0%')
  })

  it('escapes participant names containing commas or quotes', () => {
    const csv = attendanceCsv([s1], [], [bob])
    expect(csv.split('\n')[1]).toBe('"Bo, ""Bobby""",,0%')
  })
})

describe('gradesCsv', () => {
  const quiz = createAssessment({ classId, name: 'Quiz 1', maxScore: 10 })
  const exam = createAssessment({ classId, name: 'Exam', maxScore: 50 })

  it('emits scores per assessment and an average percentage', () => {
    const scores = [
      createScore({ assessmentId: quiz.id, participantId: alice.id, value: 8 }, quiz),
      createScore({ assessmentId: exam.id, participantId: alice.id, value: 25 }, exam),
    ]
    const csv = gradesCsv([quiz, exam], scores, [alice])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Participant,Quiz 1 (/10),Exam (/50),Average %')
    // 8/10 = 80%, 25/50 = 50%, average of the two percentages = 65%
    expect(lines[1]).toBe('Alice,8,25,65%')
  })

  it('leaves the score blank and excludes it from the average when unscored', () => {
    const scores = [
      createScore({ assessmentId: quiz.id, participantId: alice.id, value: 10 }, quiz),
    ]
    const csv = gradesCsv([quiz, exam], scores, [alice])
    expect(csv.split('\n')[1]).toBe('Alice,10,,100%')
  })

  it('gives an empty average when no assessment is scored', () => {
    const csv = gradesCsv([quiz, exam], [], [alice])
    expect(csv.split('\n')[1]).toBe('Alice,,,')
  })
})
