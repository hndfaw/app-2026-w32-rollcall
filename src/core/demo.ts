// Builds a self-contained demo class so first-time users can explore the app
// (sessions, attendance, gradebook, analytics, report) before entering real data.

import {
  createAssessment,
  createAttendanceMark,
  createClass,
  createParticipant,
  createScore,
  createSession,
  type Assessment,
  type AttendanceMark,
  type AttendanceStatus,
  type Participant,
  type Score,
  type Session,
  type SchoolClass,
} from './models'

export interface DemoData {
  schoolClass: SchoolClass
  participants: Participant[]
  sessions: Session[]
  attendanceMarks: AttendanceMark[]
  assessments: Assessment[]
  scores: Score[]
}

const DEMO_PARTICIPANT_NAMES = ['Aiko Tanaka', 'Bilal Ahmed', 'Carmen Ruiz', 'Dev Patel', 'Elena Popescu']

// [participant index][session index], indexed by DEMO_PARTICIPANT_NAMES order.
const DEMO_ATTENDANCE: AttendanceStatus[][] = [
  ['present', 'present', 'present', 'present'],
  ['present', 'absent', 'present', 'present'],
  ['present', 'present', 'late', 'absent'],
  ['absent', 'absent', 'absent', 'present'],
  ['late', 'present', 'present', 'excused'],
]

// [participant index] -> [Quiz 1 score, Midterm score]; null means ungraded.
const DEMO_SCORES: Array<[number | null, number | null]> = [
  [18, 92],
  [15, 78],
  [20, 88],
  [12, 65],
  [17, null],
]

function daysAgoIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

export function buildDemoData(): DemoData {
  const schoolClass = createClass({ name: 'Demo Class' })

  const participants = DEMO_PARTICIPANT_NAMES.map((name) =>
    createParticipant({ classId: schoolClass.id, name }),
  )

  const sessions = [21, 14, 7, 0].map((daysAgo, i) =>
    createSession({ classId: schoolClass.id, date: daysAgoIso(daysAgo), label: `Week ${i + 1}` }),
  )

  const attendanceMarks = participants.flatMap((participant, pIndex) =>
    sessions.map((session, sIndex) =>
      createAttendanceMark({
        sessionId: session.id,
        participantId: participant.id,
        status: DEMO_ATTENDANCE[pIndex][sIndex],
      }),
    ),
  )

  const quiz = createAssessment({ classId: schoolClass.id, name: 'Quiz 1', maxScore: 20 })
  const midterm = createAssessment({ classId: schoolClass.id, name: 'Midterm', maxScore: 100 })
  const assessments = [quiz, midterm]

  const scores = participants.flatMap((participant, pIndex) => {
    const [quizScore, midtermScore] = DEMO_SCORES[pIndex]
    const entries: Score[] = []
    if (quizScore !== null) {
      entries.push(createScore({ assessmentId: quiz.id, participantId: participant.id, value: quizScore }, quiz))
    }
    if (midtermScore !== null) {
      entries.push(
        createScore({ assessmentId: midterm.id, participantId: participant.id, value: midtermScore }, midterm),
      )
    }
    return entries
  })

  return { schoolClass, participants, sessions, attendanceMarks, assessments, scores }
}
