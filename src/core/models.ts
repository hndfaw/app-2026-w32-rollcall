// Data model: classes, participants, sessions, attendance marks, assessments, scores.
// All factory functions validate their input and return a fully-formed, immutable record.

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export const ATTENDANCE_STATUSES: readonly AttendanceStatus[] = [
  'present',
  'absent',
  'late',
  'excused',
]

export interface SchoolClass {
  readonly id: string
  readonly name: string
  readonly archived: boolean
  readonly createdAt: string
}

export interface Participant {
  readonly id: string
  readonly classId: string
  readonly name: string
  readonly participantId?: string
  readonly notes?: string
  readonly archived: boolean
  readonly createdAt: string
}

export interface Session {
  readonly id: string
  readonly classId: string
  readonly date: string
  readonly label?: string
  readonly createdAt: string
}

export interface AttendanceMark {
  readonly id: string
  readonly sessionId: string
  readonly participantId: string
  readonly status: AttendanceStatus
}

export interface Assessment {
  readonly id: string
  readonly classId: string
  readonly name: string
  readonly maxScore: number
  readonly createdAt: string
}

export interface Score {
  readonly id: string
  readonly assessmentId: string
  readonly participantId: string
  readonly value: number
}

function newId(): string {
  return crypto.randomUUID()
}

function nowIso(): string {
  return new Date().toISOString()
}

function requireNonEmpty(value: string, field: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error(`${field} must not be empty`)
  }
  return trimmed
}

export interface CreateClassInput {
  name: string
}

export function createClass(input: CreateClassInput): SchoolClass {
  return {
    id: newId(),
    name: requireNonEmpty(input.name, 'Class name'),
    archived: false,
    createdAt: nowIso(),
  }
}

export interface CreateParticipantInput {
  classId: string
  name: string
  participantId?: string
  notes?: string
}

export function createParticipant(input: CreateParticipantInput): Participant {
  if (!input.classId) {
    throw new Error('Participant must belong to a class')
  }
  return {
    id: newId(),
    classId: input.classId,
    name: requireNonEmpty(input.name, 'Participant name'),
    participantId: input.participantId?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    archived: false,
    createdAt: nowIso(),
  }
}

export interface CreateSessionInput {
  classId: string
  date: string
  label?: string
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function createSession(input: CreateSessionInput): Session {
  if (!input.classId) {
    throw new Error('Session must belong to a class')
  }
  if (!ISO_DATE_RE.test(input.date) || Number.isNaN(Date.parse(input.date))) {
    throw new Error('Session date must be an ISO date string (YYYY-MM-DD)')
  }
  return {
    id: newId(),
    classId: input.classId,
    date: input.date,
    label: input.label?.trim() || undefined,
    createdAt: nowIso(),
  }
}

export interface CreateAttendanceMarkInput {
  sessionId: string
  participantId: string
  status: AttendanceStatus
}

export function createAttendanceMark(input: CreateAttendanceMarkInput): AttendanceMark {
  if (!input.sessionId) {
    throw new Error('Attendance mark must reference a session')
  }
  if (!input.participantId) {
    throw new Error('Attendance mark must reference a participant')
  }
  if (!ATTENDANCE_STATUSES.includes(input.status)) {
    throw new Error(`Attendance status must be one of: ${ATTENDANCE_STATUSES.join(', ')}`)
  }
  return {
    id: newId(),
    sessionId: input.sessionId,
    participantId: input.participantId,
    status: input.status,
  }
}

export interface CreateAssessmentInput {
  classId: string
  name: string
  maxScore: number
}

export function createAssessment(input: CreateAssessmentInput): Assessment {
  if (!input.classId) {
    throw new Error('Assessment must belong to a class')
  }
  if (!Number.isFinite(input.maxScore) || input.maxScore <= 0) {
    throw new Error('Assessment maxScore must be a positive number')
  }
  return {
    id: newId(),
    classId: input.classId,
    name: requireNonEmpty(input.name, 'Assessment name'),
    maxScore: input.maxScore,
    createdAt: nowIso(),
  }
}

export interface CreateScoreInput {
  assessmentId: string
  participantId: string
  value: number
}

export function createScore(input: CreateScoreInput, assessment: Assessment): Score {
  if (!input.participantId) {
    throw new Error('Score must reference a participant')
  }
  if (input.assessmentId !== assessment.id) {
    throw new Error('Score assessmentId must match the given assessment')
  }
  if (!Number.isFinite(input.value) || input.value < 0 || input.value > assessment.maxScore) {
    throw new Error(`Score must be between 0 and ${assessment.maxScore}`)
  }
  return {
    id: newId(),
    assessmentId: input.assessmentId,
    participantId: input.participantId,
    value: input.value,
  }
}
