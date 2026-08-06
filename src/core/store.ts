// localStorage persistence for app state, with schema versioning and a migration guard
// so a stored shape from an older or unrecognized build never corrupts the app.

import type {
  AttendanceMark,
  Assessment,
  Participant,
  Score,
  Session,
  SchoolClass,
} from './models'

export interface AppState {
  classes: SchoolClass[]
  participants: Participant[]
  sessions: Session[]
  attendanceMarks: AttendanceMark[]
  assessments: Assessment[]
  scores: Score[]
}

export const SCHEMA_VERSION = 1

export const STORAGE_KEY = 'rollcall:state'

interface StoredEnvelope {
  schemaVersion: number
  state: AppState
}

export function emptyState(): AppState {
  return {
    classes: [],
    participants: [],
    sessions: [],
    attendanceMarks: [],
    assessments: [],
    scores: [],
  }
}

type Migration = (state: unknown) => unknown

// Keyed by the version a stored envelope claims; run in order until SCHEMA_VERSION is reached.
const MIGRATIONS: Record<number, Migration> = {}

function isAppStateShape(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') {
    return false
  }
  const v = value as Record<string, unknown>
  return (
    Array.isArray(v.classes) &&
    Array.isArray(v.participants) &&
    Array.isArray(v.sessions) &&
    Array.isArray(v.attendanceMarks) &&
    Array.isArray(v.assessments) &&
    Array.isArray(v.scores)
  )
}

export function loadState(storage: Storage = window.localStorage): AppState {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    return emptyState()
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return emptyState()
  }

  if (!parsed || typeof parsed !== 'object' || !('schemaVersion' in parsed)) {
    return emptyState()
  }

  const envelope = parsed as { schemaVersion: unknown; state: unknown }
  if (typeof envelope.schemaVersion !== 'number') {
    return emptyState()
  }

  let schemaVersion = envelope.schemaVersion
  let state = envelope.state

  if (schemaVersion > SCHEMA_VERSION) {
    // Stored data is newer than this build understands - refuse to guess, start fresh.
    return emptyState()
  }

  while (schemaVersion < SCHEMA_VERSION) {
    const migrate = MIGRATIONS[schemaVersion]
    if (!migrate) {
      return emptyState()
    }
    state = migrate(state)
    schemaVersion += 1
  }

  return isAppStateShape(state) ? state : emptyState()
}

export function saveState(state: AppState, storage: Storage = window.localStorage): void {
  const envelope: StoredEnvelope = { schemaVersion: SCHEMA_VERSION, state }
  storage.setItem(STORAGE_KEY, JSON.stringify(envelope))
}

export function clearState(storage: Storage = window.localStorage): void {
  storage.removeItem(STORAGE_KEY)
}
