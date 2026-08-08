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

function goToAnalytics() {
  fireEvent.click(screen.getByRole('button', { name: 'Analytics' }))
}

describe('AnalyticsPage', () => {
  it('prompts to add participants before showing analytics', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('New class name'), {
      target: { value: 'Morning Cohort' },
    })
    fireEvent.click(screen.getByText('Add class'))

    goToAnalytics()

    expect(screen.getByText('Add participants to this class to see analytics.')).toBeInTheDocument()
  })

  it('shows attendance rate, absence streak, at-risk status, and session trend', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Sessions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Absent' }))

    fireEvent.change(screen.getByLabelText('Session label'), {
      target: { value: 'Second visit' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Absent' }))

    goToAnalytics()

    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0)
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0)

    fireEvent.change(screen.getByLabelText('Missed at least'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Of last sessions'), { target: { value: '2' } })

    expect(screen.getByText('missed 2 of 2')).toBeInTheDocument()
  })

  it('shows no at-risk participants once attendance improves', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Sessions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Present' }))

    goToAnalytics()

    expect(screen.getByText('No participants currently at risk.')).toBeInTheDocument()
  })
})
