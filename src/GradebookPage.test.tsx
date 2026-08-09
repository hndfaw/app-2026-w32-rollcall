import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  window.localStorage.clear()
})

function setUpClassWithParticipant(name: string) {
  fireEvent.change(screen.getByLabelText('New class name'), {
    target: { value: 'Morning Cohort' },
  })
  fireEvent.click(screen.getByText('Add class'))
  fireEvent.click(screen.getByText('Add participant'))
  fireEvent.change(screen.getByLabelText('Participant name'), {
    target: { value: name },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Add participant' }))
}

describe('GradebookPage', () => {
  it('prompts to add an assessment before any exist', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Gradebook' }))

    expect(screen.getByText('Add an assessment to start entering scores.')).toBeInTheDocument()
  })

  it('adds an assessment and enters a score', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Gradebook' }))
    fireEvent.change(screen.getByLabelText('Assessment name'), {
      target: { value: 'Quiz 1' },
    })
    fireEvent.change(screen.getByLabelText('Max score'), { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add assessment' }))

    expect(screen.getByText('Quiz 1', { exact: false })).toBeInTheDocument()

    const cell = screen.getByLabelText('Jane Doe — Quiz 1')
    fireEvent.change(cell, { target: { value: '15' } })
    fireEvent.blur(cell)

    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows a dash when a participant has no scores yet', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Gradebook' }))
    fireEvent.change(screen.getByLabelText('Assessment name'), {
      target: { value: 'Quiz 1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add assessment' }))

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('rejects a score above the assessment max and keeps the prior value', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Gradebook' }))
    fireEvent.change(screen.getByLabelText('Assessment name'), {
      target: { value: 'Quiz 1' },
    })
    fireEvent.change(screen.getByLabelText('Max score'), { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add assessment' }))

    const cell = screen.getByLabelText('Jane Doe — Quiz 1') as HTMLInputElement
    fireEvent.change(cell, { target: { value: '15' } })
    fireEvent.blur(cell)
    expect(screen.getByText('75%')).toBeInTheDocument()

    fireEvent.change(cell, { target: { value: '99' } })
    fireEvent.blur(cell)
    expect(cell.value).toBe('15')
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})
