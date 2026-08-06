import { beforeEach, describe, expect, it } from 'vitest'
import { createClass } from './models'
import { SCHEMA_VERSION, STORAGE_KEY, clearState, emptyState, loadState, saveState } from './store'

beforeEach(() => {
  window.localStorage.clear()
})

describe('loadState', () => {
  it('returns an empty state when nothing is stored', () => {
    expect(loadState()).toEqual(emptyState())
  })

  it('round-trips a saved state', () => {
    const state = { ...emptyState(), classes: [createClass({ name: 'Class A' })] }
    saveState(state)
    expect(loadState()).toEqual(state)
  })

  it('falls back to empty state on invalid JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json')
    expect(loadState()).toEqual(emptyState())
  })

  it('falls back to empty state when the envelope has no schemaVersion', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: emptyState() }))
    expect(loadState()).toEqual(emptyState())
  })

  it('falls back to empty state when the stored shape is malformed', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, state: { classes: 'nope' } }),
    )
    expect(loadState()).toEqual(emptyState())
  })

  it('falls back to empty state for a schema version newer than this build understands', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, state: emptyState() }),
    )
    expect(loadState()).toEqual(emptyState())
  })

  it('falls back to empty state for an older schema version with no registered migration', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 0, state: emptyState() }),
    )
    expect(loadState()).toEqual(emptyState())
  })
})

describe('saveState', () => {
  it('persists under the schema version envelope', () => {
    saveState(emptyState())
    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw as string)).toEqual({ schemaVersion: SCHEMA_VERSION, state: emptyState() })
  })
})

describe('clearState', () => {
  it('removes the stored state', () => {
    saveState(emptyState())
    clearState()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
