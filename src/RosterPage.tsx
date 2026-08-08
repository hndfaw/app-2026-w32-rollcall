import { useEffect, useState } from 'react'
import ClassSidebar from './ClassSidebar'
import {
  createClass,
  createParticipant,
  setParticipantArchived,
  updateParticipant,
  type Participant,
  type SchoolClass,
} from './core/models'
import { loadState, saveState, type AppState } from './core/store'

function ClassForm({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    try {
      onCreate(name)
      setName('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create class')
    }
  }

  return (
    <form className="class-form" onSubmit={handleSubmit}>
      <input
        aria-label="New class name"
        placeholder="New class name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Add class</button>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

interface ParticipantFormValues {
  name: string
  participantId: string
  notes: string
}

const EMPTY_PARTICIPANT_FORM: ParticipantFormValues = { name: '', participantId: '', notes: '' }

function ParticipantForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: ParticipantFormValues
  submitLabel: string
  onSubmit: (values: ParticipantFormValues) => void
  onCancel?: () => void
}) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    try {
      onSubmit(values)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save participant')
    }
  }

  return (
    <form className="participant-form" onSubmit={handleSubmit}>
      <input
        aria-label="Participant name"
        placeholder="Name"
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
      />
      <input
        aria-label="Participant ID"
        placeholder="ID (optional)"
        value={values.participantId}
        onChange={(e) => setValues({ ...values, participantId: e.target.value })}
      />
      <input
        aria-label="Participant notes"
        placeholder="Notes (optional)"
        value={values.notes}
        onChange={(e) => setValues({ ...values, notes: e.target.value })}
      />
      <div className="participant-form-actions">
        <button type="submit">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

function ParticipantRow({
  participant,
  onUpdate,
  onToggleArchived,
}: {
  participant: Participant
  onUpdate: (id: string, values: ParticipantFormValues) => void
  onToggleArchived: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="participant-row">
        <ParticipantForm
          initial={{
            name: participant.name,
            participantId: participant.participantId ?? '',
            notes: participant.notes ?? '',
          }}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={(values) => {
            onUpdate(participant.id, values)
            setEditing(false)
          }}
        />
      </li>
    )
  }

  return (
    <li className={`participant-row${participant.archived ? ' archived' : ''}`}>
      <div className="participant-info">
        <span className="participant-name">{participant.name}</span>
        {participant.participantId && (
          <span className="participant-id">{participant.participantId}</span>
        )}
        {participant.notes && <span className="participant-notes">{participant.notes}</span>}
        {participant.archived && <span className="archived-badge">Archived</span>}
      </div>
      <div className="participant-actions">
        <button type="button" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button type="button" className="secondary" onClick={() => onToggleArchived(participant.id)}>
          {participant.archived ? 'Unarchive' : 'Archive'}
        </button>
      </div>
    </li>
  )
}

function RosterPage() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [addingParticipant, setAddingParticipant] = useState(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  const activeClasses = state.classes.filter((c) => !c.archived)
  const selectedClass: SchoolClass | undefined =
    activeClasses.find((c) => c.id === selectedClassId) ?? activeClasses[0]

  const participants = selectedClass
    ? state.participants
        .filter((p) => p.classId === selectedClass.id)
        .filter((p) => showArchived || !p.archived)
    : []

  function handleCreateClass(name: string) {
    const newClass = createClass({ name })
    setState((s) => ({ ...s, classes: [...s.classes, newClass] }))
    setSelectedClassId(newClass.id)
  }

  function handleAddParticipant(values: ParticipantFormValues) {
    if (!selectedClass) return
    const participant = createParticipant({
      classId: selectedClass.id,
      name: values.name,
      participantId: values.participantId,
      notes: values.notes,
    })
    setState((s) => ({ ...s, participants: [...s.participants, participant] }))
    setAddingParticipant(false)
  }

  function handleUpdateParticipant(id: string, values: ParticipantFormValues) {
    setState((s) => ({
      ...s,
      participants: s.participants.map((p) =>
        p.id === id
          ? updateParticipant(p, {
              name: values.name,
              participantId: values.participantId,
              notes: values.notes,
            })
          : p,
      ),
    }))
  }

  function handleToggleArchived(id: string) {
    setState((s) => ({
      ...s,
      participants: s.participants.map((p) =>
        p.id === id ? setParticipantArchived(p, !p.archived) : p,
      ),
    }))
  }

  return (
    <div className="roster-page">
      <ClassSidebar
        classes={activeClasses}
        selectedClassId={selectedClass?.id}
        onSelect={setSelectedClassId}
      >
        <ClassForm onCreate={handleCreateClass} />
      </ClassSidebar>

      <section className="roster-main">
        {selectedClass ? (
          <>
            <div className="roster-header">
              <h2>{selectedClass.name}</h2>
              <label className="show-archived">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
                Show archived
              </label>
            </div>

            <ul className="participant-list">
              {participants.map((p) => (
                <ParticipantRow
                  key={p.id}
                  participant={p}
                  onUpdate={handleUpdateParticipant}
                  onToggleArchived={handleToggleArchived}
                />
              ))}
              {participants.length === 0 && <p className="empty-hint">No participants yet.</p>}
            </ul>

            {addingParticipant ? (
              <ParticipantForm
                initial={EMPTY_PARTICIPANT_FORM}
                submitLabel="Add participant"
                onCancel={() => setAddingParticipant(false)}
                onSubmit={handleAddParticipant}
              />
            ) : (
              <button type="button" onClick={() => setAddingParticipant(true)}>
                Add participant
              </button>
            )}
          </>
        ) : (
          <p className="empty-hint">Create a class to get started.</p>
        )}
      </section>
    </div>
  )
}

export default RosterPage
