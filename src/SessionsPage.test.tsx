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

describe('SessionsPage', () => {
  it('prompts to start a session before any exist', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Sessions' }))

    expect(screen.getByText('Start a session to begin marking attendance.')).toBeInTheDocument()
  })

  it('starts a session and marks attendance', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Sessions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }))

    expect(screen.getByText('0 of 1 marked')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Absent' }))
    expect(screen.getByText('1 of 1 marked')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Absent' })).toHaveClass('selected')

    fireEvent.click(screen.getByRole('button', { name: 'Present' }))
    expect(screen.getByText('1 of 1 marked')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Present' })).toHaveClass('selected')
    expect(screen.getByRole('button', { name: 'Absent' })).not.toHaveClass('selected')
  })

  it('keeps marks separate across sessions for the same class', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Sessions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Present' }))

    fireEvent.change(screen.getByLabelText('Session label'), {
      target: { value: 'Second visit' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }))

    expect(screen.getByText('0 of 1 marked')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Late' }))
    expect(screen.getByText('1 of 1 marked')).toBeInTheDocument()

    const sessionButtons = screen.getAllByRole('button', { name: /^\d{4}-\d{2}-\d{2}/ })
    const firstSessionButton = sessionButtons.find((b) => !b.textContent?.includes('Second visit'))
    expect(firstSessionButton).toBeTruthy()
    fireEvent.click(firstSessionButton as HTMLElement)

    expect(screen.getByRole('button', { name: 'Present' })).toHaveClass('selected')
    expect(screen.getByRole('button', { name: 'Late' })).not.toHaveClass('selected')
  })
})
