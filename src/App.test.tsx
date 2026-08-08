import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  window.localStorage.clear()
})

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('Rollcall')).toBeInTheDocument()
  })

  it('creates a class and shows it selected', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('New class name'), {
      target: { value: 'Morning Cohort' },
    })
    fireEvent.click(screen.getByText('Add class'))
    expect(screen.getByRole('heading', { name: 'Morning Cohort' })).toBeInTheDocument()
  })

  it('adds a participant to the selected class', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('New class name'), {
      target: { value: 'Morning Cohort' },
    })
    fireEvent.click(screen.getByText('Add class'))

    fireEvent.click(screen.getByText('Add participant'))
    fireEvent.change(screen.getByLabelText('Participant name'), {
      target: { value: 'Jane Doe' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add participant' }))

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('edits a participant', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('New class name'), {
      target: { value: 'Morning Cohort' },
    })
    fireEvent.click(screen.getByText('Add class'))
    fireEvent.click(screen.getByText('Add participant'))
    fireEvent.change(screen.getByLabelText('Participant name'), {
      target: { value: 'Jane Doe' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add participant' }))

    fireEvent.click(screen.getByText('Edit'))
    fireEvent.change(screen.getByLabelText('Participant name'), {
      target: { value: 'Jane Smith' },
    })
    fireEvent.click(screen.getByText('Save'))

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
  })

  it('archives and unarchives a participant', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('New class name'), {
      target: { value: 'Morning Cohort' },
    })
    fireEvent.click(screen.getByText('Add class'))
    fireEvent.click(screen.getByText('Add participant'))
    fireEvent.change(screen.getByLabelText('Participant name'), {
      target: { value: 'Jane Doe' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add participant' }))

    fireEvent.click(screen.getByText('Archive'))
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Show archived'))
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Archived')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Unarchive'))
    expect(screen.queryByText('Archived')).not.toBeInTheDocument()
  })
})
