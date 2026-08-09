import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
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

function goToReport() {
  fireEvent.click(screen.getByRole('button', { name: 'Report' }))
}

describe('ReportPage', () => {
  it('prompts to add participants before showing a report', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('New class name'), {
      target: { value: 'Morning Cohort' },
    })
    fireEvent.click(screen.getByText('Add class'))

    goToReport()

    expect(screen.getByText('Add participants to this class to generate a report.')).toBeInTheDocument()
  })

  it('shows attendance rate, absence streak, and grade average per participant', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Sessions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Present' }))

    fireEvent.click(screen.getByRole('button', { name: 'Gradebook' }))
    fireEvent.change(screen.getByLabelText('Assessment name'), { target: { value: 'Quiz 1' } })
    fireEvent.change(screen.getByLabelText('Max score'), { target: { value: '10' } })
    fireEvent.click(screen.getByText('Add assessment'))
    fireEvent.change(screen.getByLabelText('Jane Doe — Quiz 1'), { target: { value: '8' } })
    fireEvent.blur(screen.getByLabelText('Jane Doe — Quiz 1'))

    goToReport()

    expect(screen.getByRole('heading', { name: 'Morning Cohort' })).toBeInTheDocument()
    const row = screen.getByText('Jane Doe').closest('tr')
    expect(row).not.toBeNull()
    expect(row!.textContent).toContain('100%')
    expect(row!.textContent).toContain('80%')
  })

  it('offers CSV downloads that encode the class records', () => {
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    fireEvent.click(screen.getByRole('button', { name: 'Sessions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Present' }))

    goToReport()

    const attendanceLink = screen.getByText('Download attendance CSV') as HTMLAnchorElement
    expect(attendanceLink.getAttribute('href')).toContain('data:text/csv')
    expect(decodeURIComponent(attendanceLink.getAttribute('href')!)).toContain('Jane Doe')
    expect(attendanceLink.getAttribute('download')).toBe('morning-cohort-attendance.csv')

    const gradesLink = screen.getByText('Download grades CSV') as HTMLAnchorElement
    expect(gradesLink.getAttribute('href')).toContain('data:text/csv')
    expect(gradesLink.getAttribute('download')).toBe('morning-cohort-grades.csv')
  })

  it('triggers window.print when the print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<App />)
    setUpClassWithParticipant('Jane Doe')

    goToReport()
    fireEvent.click(screen.getByRole('button', { name: 'Print report' }))

    expect(printSpy).toHaveBeenCalledOnce()
  })
})
