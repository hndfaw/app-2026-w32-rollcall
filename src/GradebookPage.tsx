import { useEffect, useState } from 'react'
import ClassSidebar from './ClassSidebar'
import { participantAverage } from './core/analytics'
import {
  createAssessment,
  createScore,
  setScoreValue,
  type Assessment,
  type Participant,
  type Score,
} from './core/models'
import { loadState, saveState, type AppState } from './core/store'

function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`
}

function AssessmentForm({ onCreate }: { onCreate: (name: string, maxScore: number) => void }) {
  const [name, setName] = useState('')
  const [maxScore, setMaxScore] = useState('100')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    try {
      onCreate(name, Number(maxScore))
      setName('')
      setMaxScore('100')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create assessment')
    }
  }

  return (
    <form className="assessment-form" onSubmit={handleSubmit}>
      <input
        aria-label="Assessment name"
        placeholder="Assessment name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        aria-label="Max score"
        type="number"
        min={1}
        value={maxScore}
        onChange={(e) => setMaxScore(e.target.value)}
      />
      <button type="submit">Add assessment</button>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

function ScoreCell({
  participant,
  assessment,
  score,
  onChange,
}: {
  participant: Participant
  assessment: Assessment
  score: Score | undefined
  onChange: (value: number) => void
}) {
  const [text, setText] = useState(score ? String(score.value) : '')

  useEffect(() => {
    setText(score ? String(score.value) : '')
  }, [score])

  function commit() {
    if (text.trim() === '') {
      setText(score ? String(score.value) : '')
      return
    }
    const value = Number(text)
    if (!Number.isFinite(value) || value < 0 || value > assessment.maxScore) {
      setText(score ? String(score.value) : '')
      return
    }
    onChange(value)
  }

  return (
    <input
      aria-label={`${participant.name} — ${assessment.name}`}
      className="score-input"
      type="number"
      min={0}
      max={assessment.maxScore}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
    />
  )
}

function GradebookTable({
  participants,
  assessments,
  scores,
  onScoreChange,
}: {
  participants: Participant[]
  assessments: Assessment[]
  scores: Score[]
  onScoreChange: (participantId: string, assessment: Assessment, value: number) => void
}) {
  return (
    <table className="gradebook-table">
      <thead>
        <tr>
          <th>Participant</th>
          {assessments.map((a) => (
            <th key={a.id}>
              {a.name} <span className="assessment-max">/ {a.maxScore}</span>
            </th>
          ))}
          <th>Average</th>
        </tr>
      </thead>
      <tbody>
        {participants.map((p) => {
          const average = participantAverage(assessments, scores, p.id)
          return (
            <tr key={p.id}>
              <td className="participant-name">{p.name}</td>
              {assessments.map((a) => (
                <td key={a.id}>
                  <ScoreCell
                    participant={p}
                    assessment={a}
                    score={scores.find((s) => s.assessmentId === a.id && s.participantId === p.id)}
                    onChange={(value) => onScoreChange(p.id, a, value)}
                  />
                </td>
              ))}
              <td className="gradebook-average">{average === null ? '—' : formatPercent(average)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function GradebookPage() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  const activeClasses = state.classes.filter((c) => !c.archived)
  const selectedClass = activeClasses.find((c) => c.id === selectedClassId) ?? activeClasses[0]

  const participants = selectedClass
    ? state.participants.filter((p) => p.classId === selectedClass.id && !p.archived)
    : []

  const assessments = selectedClass
    ? state.assessments.filter((a) => a.classId === selectedClass.id)
    : []

  const assessmentIds = new Set(assessments.map((a) => a.id))
  const scores = state.scores.filter((s) => assessmentIds.has(s.assessmentId))

  function handleCreateAssessment(name: string, maxScore: number) {
    if (!selectedClass) return
    const assessment = createAssessment({ classId: selectedClass.id, name, maxScore })
    setState((s) => ({ ...s, assessments: [...s.assessments, assessment] }))
  }

  function handleScoreChange(participantId: string, assessment: Assessment, value: number) {
    setState((s) => {
      const existing = s.scores.find(
        (sc) => sc.assessmentId === assessment.id && sc.participantId === participantId,
      )
      if (existing) {
        return {
          ...s,
          scores: s.scores.map((sc) =>
            sc.id === existing.id ? setScoreValue(sc, value, assessment) : sc,
          ),
        }
      }
      const score = createScore({ assessmentId: assessment.id, participantId, value }, assessment)
      return { ...s, scores: [...s.scores, score] }
    })
  }

  return (
    <div className="gradebook-page">
      <ClassSidebar
        classes={activeClasses}
        selectedClassId={selectedClass?.id}
        onSelect={setSelectedClassId}
      />

      <section className="gradebook-main">
        {selectedClass ? (
          participants.length > 0 ? (
            <>
              <div className="gradebook-header">
                <h2>{selectedClass.name}</h2>
                <AssessmentForm onCreate={handleCreateAssessment} />
              </div>

              {assessments.length > 0 ? (
                <GradebookTable
                  participants={participants}
                  assessments={assessments}
                  scores={scores}
                  onScoreChange={handleScoreChange}
                />
              ) : (
                <p className="empty-hint">Add an assessment to start entering scores.</p>
              )}
            </>
          ) : (
            <p className="empty-hint">Add participants to this class before entering scores.</p>
          )
        ) : (
          <p className="empty-hint">Create a class in Roster to get started.</p>
        )}
      </section>
    </div>
  )
}

export default GradebookPage
