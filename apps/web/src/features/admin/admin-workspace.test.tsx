import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderAppAt } from '@/test/render-app'

describe('Administration and counselor workspaces', () => {
  it('shows real-data dashboard areas without legacy verification workflows', async () => {
    await renderAppAt('/admin')

    expect(await screen.findByRole('heading', { name: /Welcome back, Admin/i })).toBeVisible()
    expect(screen.getByText('Results ready')).toBeVisible()
    expect(screen.getByText('Generate reports')).toBeVisible()
    expect(screen.getByRole('button', { name: /Manage counselors/i })).toBeVisible()
    expect(screen.getByText('Recent assessment activity')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Operational attention' })).toBeVisible()
    expect(screen.getByText('Sources without a verification date')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'System insights' })).not.toBeInTheDocument()
    expect(screen.queryByText(/verification review/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/encode official result/i)).not.toBeInTheDocument()
  })

  it('opens a student record with its immutable result and recommendations', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/students')

    const row = (await screen.findByText('ana@example.test')).closest('tr')
    expect(row).not.toBeNull()
    await user.click(within(row as HTMLTableRowElement).getByRole('button', { name: 'Open record' }))

    expect(window.location.pathname).toBe('/admin/students/10')
    expect(await screen.findByRole('heading', { name: 'Ana Santos' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'About Ana Santos' })).toBeVisible()
    expect(screen.getByText('Problem-solving')).toBeVisible()
    expect(screen.getByText('I-C interest profile')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Student-provided retake context' })).toBeVisible()
    expect(screen.getByText('I wanted to review my current course interests.')).toBeVisible()
    expect(screen.getAllByText('BS Information Technology').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Counseling activity' })).toBeVisible()
    expect(screen.getByText(/cannot assign students/i)).toBeVisible()
    expect(screen.queryByLabelText('Add guidance note')).not.toBeInTheDocument()
  })

  it('shows counselor account governance in the Administrator portal', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/counselors')

    expect(await screen.findByRole('heading', { name: 'Counselor accounts' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Counselor directory' })).toBeVisible()
    await user.type(screen.getByLabelText('Full name'), 'New Counselor')
    await user.type(screen.getByLabelText('Email address'), 'new@example.test')
    await user.click(screen.getByRole('button', { name: /Create counselor account/i }))
    expect(await screen.findByText(/account created/i)).toBeVisible()
  })

  it('uses the separate Counselor portal to schedule a student appointment', async () => {
    const user = userEvent.setup()
    await renderAppAt('/counselor')

    expect(await screen.findByRole('heading', { name: /Good (morning|afternoon|evening), Counselor/i })).toBeVisible()
    expect(screen.getAllByText('Student records').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: "Today's calendar" })).toBeVisible()
    expect(screen.getByRole('list', { name: 'Seven-day date strip' }).children).toHaveLength(7)
    expect(screen.getByRole('button', { name: /View full calendar/i })).toBeVisible()
    expect(screen.queryByRole('button', { name: /Previous month/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Next month/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Weekly')).not.toBeInTheDocument()
    expect(screen.queryByText('Monthly')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Guidance request queue' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: /Accept.*schedule/i }))
    expect(screen.getByLabelText('Student')).toHaveValue('10')
    expect(screen.getByLabelText('Guidance topic')).toHaveValue('Review BSIT programme match')
    fireEvent.change(screen.getByLabelText('Appointment date'), { target: { value: '2026-08-20' } })
    await user.type(screen.getByLabelText('Length in minutes'), '60')
    await user.click(screen.getByRole('button', { name: 'Show available times' }))
    await user.click(await screen.findByRole('button', { name: /9:00.*10:00/i }))
    await user.click(screen.getByRole('button', { name: 'Schedule appointment' }))

    expect(await screen.findByText('Appointment scheduled successfully.')).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/counselor/appointments', expect.objectContaining({ method: 'POST' }))
    const appointmentCall = vi.mocked(fetch).mock.calls.find(([input, init]) => input.toString() === '/api/v1/counselor/appointments' && init?.method === 'POST')
    expect(JSON.parse(String(appointmentCall?.[1]?.body))).toMatchObject({ studentId: 10, guidanceRequestId: 21, programmeCode: 'BSIT', scheduledAt: '2026-08-20T09:00:00+08:00', endsAt: '2026-08-20T10:00:00+08:00' })
  })

  it('uses recorded free time and an explicit appointment length when scheduling', async () => {
    const user = userEvent.setup()
    await renderAppAt('/counselor/appointments')

    expect(await screen.findByRole('columnheader', { name: 'No.' })).toBeVisible()
    expect(screen.getByText('Showing 1–1 of 1 appointments')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.queryByText('Asia/Manila')).not.toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Schedule appointment' }))
    expect(screen.getByRole('dialog')).toBeVisible()
    fireEvent.change(screen.getByLabelText('Appointment date'), { target: { value: '2026-08-20' } })
    await user.type(screen.getByLabelText('Length in minutes'), '60')
    await user.click(screen.getByRole('button', { name: 'Show available times' }))

    const availableTime = await screen.findByRole('button', { name: /9:00.*10:00/i })
    await user.click(availableTime)

    expect(screen.queryByLabelText('Date and time')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('End date and time')).not.toBeInTheDocument()
    expect(within(screen.getByText('Selected schedule').parentElement!).getByText(/Aug 20, 2026, 9:00 AM/)).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/counselor/availability/slots?date=2026-08-20&durationMinutes=60', expect.objectContaining({ credentials: 'include' }))
  })

  it('excludes the current appointment when selecting a reschedule time', async () => {
    const user = userEvent.setup()
    await renderAppAt('/counselor/appointments')

    await user.click(await screen.findByRole('button', { name: 'Reschedule' }))
    const dates = screen.getAllByLabelText('Appointment date')
    const durations = screen.getAllByLabelText('Length in minutes')
    const showButtons = screen.getAllByRole('button', { name: 'Show available times' })
    fireEvent.change(dates[0], { target: { value: '2026-08-20' } })
    await user.type(durations[0], '60')
    await user.click(showButtons[0])

    expect(await screen.findByRole('button', { name: /9:00.*10:00/i })).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/counselor/availability/slots?date=2026-08-20&durationMinutes=60&excludeAppointmentId=7', expect.objectContaining({ credentials: 'include' }))
  })

  it('lets a counselor configure Manila availability and reschedule an upcoming appointment', async () => {
    const user = userEvent.setup()
    await renderAppAt('/counselor/appointments')

    await user.click(await screen.findByRole('button', { name: 'Recurring availability' }))
    expect(await screen.findByRole('heading', { name: 'Your recurring availability' })).toBeVisible()
    expect(screen.getByText('Not configured')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Add time window' }))
    await user.selectOptions(screen.getByLabelText('Day'), '4')
    await user.type(screen.getByLabelText('Start'), '08:00')
    await user.type(screen.getByLabelText('End'), '12:00')
    await user.click(screen.getByRole('button', { name: 'Save availability' }))

    expect(await screen.findByText('Availability saved.')).toBeVisible()
    const availabilityCall = vi.mocked(fetch).mock.calls.find(([input, init]) => input.toString() === '/api/v1/counselor/availability' && init?.method === 'PUT')
    expect(JSON.parse(String(availabilityCall?.[1]?.body))).toEqual({ timezone: 'Asia/Manila', windows: [{ weekday: 4, startsAt: '08:00', endsAt: '12:00' }] })

    await user.click(screen.getByRole('button', { name: 'Close recurring availability' }))
    expect(screen.getByRole('table')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Reschedule' }))
    expect(screen.queryByLabelText('New start')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('New end')).not.toBeInTheDocument()
    const rescheduleDates = screen.getAllByLabelText('Appointment date')
    const rescheduleDurations = screen.getAllByLabelText('Length in minutes')
    const rescheduleShowButtons = screen.getAllByRole('button', { name: 'Show available times' })
    fireEvent.change(rescheduleDates[0], { target: { value: '2026-08-20' } })
    fireEvent.change(rescheduleDurations[0], { target: { value: '60' } })
    await user.click(rescheduleShowButtons[0])
    await user.click(await screen.findByRole('button', { name: /9:00.*10:00/i }))
    await user.click(screen.getByRole('button', { name: 'Confirm reschedule' }))

    expect(await screen.findByText(/Appointment rescheduled/)).toBeVisible()
    const rescheduleCall = vi.mocked(fetch).mock.calls.find(([input, init]) => input.toString() === '/api/v1/counselor/appointments/7' && init?.method === 'PUT')
    expect(JSON.parse(String(rescheduleCall?.[1]?.body))).toMatchObject({ scheduledAt: '2026-08-20T09:00:00+08:00', endsAt: '2026-08-20T10:00:00+08:00', status: 'scheduled' })
  })

  it('lets a counselor decline a pending request with an auditable reason', async () => {
    const user = userEvent.setup()
    await renderAppAt('/counselor/requests')

    expect(await screen.findByText('Programme Comparison')).toBeVisible()
    expect(screen.getByText('In Person')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Decline' }))
    await user.type(screen.getByLabelText('Reason for declining'), 'The requested date is not available; please submit another date.')
    await user.click(screen.getByRole('button', { name: 'Confirm decline' }))

    expect(await screen.findByText('Guidance request declined with a recorded reason.')).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/counselor/guidance-requests/21/decline', expect.objectContaining({ method: 'POST' }))
  })

  it('keeps the counselor student profile focused and opens counseling work in a modal sheet', async () => {
    const user = userEvent.setup()
    await renderAppAt('/counselor/students/10')

    expect(await screen.findByRole('heading', { name: 'Ana Santos' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'About Ana Santos' })).toBeVisible()
    expect(screen.getByText('Software and application development')).toBeVisible()
    expect(screen.getByLabelText('Ana Santos profile placeholder')).toHaveTextContent('AS')
    expect(screen.getByText('STU-000010')).toBeVisible()
    expect(screen.getByText('ana@example.test')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Interest profile at a glance' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Current programme matches' })).toBeVisible()
    expect(screen.getByTestId('student-evidence-band')).toHaveClass('lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]')
    expect(screen.queryByRole('heading', { name: 'Assessment history' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Guidance activity' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'What should happen next?' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Record summary' })).not.toBeInTheDocument()
    expect(screen.getAllByText('BS Information Technology').length).toBeGreaterThan(0)
    expect(fetch).not.toHaveBeenCalledWith('/api/v1/counselor/appointments', expect.any(Object))
    expect(fetch).not.toHaveBeenCalledWith('/api/v1/counselor/guidance-requests', expect.any(Object))

    await user.click(screen.getByRole('button', { name: 'Open counseling workspace' }))
    expect(screen.getByRole('dialog', { name: 'Counseling workspace for Ana Santos' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Notes, progress, and next steps' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Close counseling workspace' })).toBeVisible()
  })

  it('records an append-only guidance note through the Counselor API', async () => {
    const user = userEvent.setup()
    await renderAppAt('/counselor/students/10')

    await user.click(await screen.findByRole('button', { name: 'Open counseling workspace' }))
    await user.type(await screen.findByLabelText('Guidance note'), 'Discussed programme options.')
    await user.click(screen.getByRole('button', { name: 'Add note' }))

    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/counselor/students/10/guidance-notes',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('gives counselors separate calendar and aggregate report views', async () => {
    const { unmount } = await renderAppAt('/counselor/calendar')
    expect(await screen.findByRole('heading', { name: 'Appointment calendar' })).toBeVisible()
    unmount()

    await renderAppAt('/counselor/reports')
    expect(await screen.findByRole('heading', { name: 'Guidance reports' })).toBeVisible()
    expect(screen.queryByText(/programme match frequency/i)).not.toBeInTheDocument()
  })

  it('provides programme monitoring and configuration without a methodology module', async () => {
    const user = userEvent.setup()
    const { unmount } = await renderAppAt('/admin/programmes')
    expect(await screen.findByRole('heading', { name: 'Programme monitoring' })).toBeVisible()
    expect(screen.getByText('BS Information Technology')).toBeVisible()
    expect(screen.queryByText('Student saves')).not.toBeInTheDocument()
    expect(screen.getByText('CHED duration sourced')).toBeVisible()
    expect(screen.getAllByText('CHED CMO No. 25, series of 2015').length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: 'Catalogue evidence' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Open catalogue evidence/i }))
    expect(window.location.pathname).toBe('/admin/programmes/sources')
    expect(await screen.findByRole('heading', { name: 'Catalogue evidence' })).toBeVisible()
    expect(screen.getByText(/recheck each linked source every 180 days/i)).toBeVisible()
    expect(screen.getByText('Not verified')).toBeVisible()
    expect(screen.getByText('Needs review')).toBeVisible()
    await user.type(screen.getByLabelText('Verification date'), '2026-08-11')
    await user.click(screen.getByRole('button', { name: 'Record verification' }))
    expect(await screen.findByText(/verification recorded/i)).toBeVisible()
    await user.click(screen.getByRole('button', { name: /Back to programmes/i }))
    expect(await screen.findByRole('heading', { name: 'Programme monitoring' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'View details' }))
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Possible career directions' })).toBeVisible()
    expect(screen.getByText('Software and application development')).toBeVisible()
    expect(screen.queryByText('Governance metadata')).not.toBeInTheDocument()
    expect(screen.queryByText('Student-facing requirements')).not.toBeInTheDocument()
    expect(screen.queryByText('Readiness prompt shown to students')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close navigation' }))
    await user.click(screen.getByRole('button', { name: 'Edit programme' }))
    expect(screen.getByRole('heading', { name: 'Edit BS Information Technology' })).toBeVisible()
    expect(screen.getByLabelText('Programme name')).toBeVisible()
    fireEvent.change(screen.getAllByRole('slider', { name: /Horizontal position/ })[0], { target: { value: '65' } })
    await waitFor(() => expect(screen.getByText('Draft autosaved')).toBeVisible())
    expect(vi.mocked(fetch).mock.calls.some(([input, init]) => {
      if (input.toString() !== '/api/v1/admin/configurations/versions/7' || init?.method !== 'PUT') return false
      const saved = JSON.parse(String(init.body)) as { payload?: { programmes?: Array<{ cover_image_position?: { x?: number } }> } }
      return saved.payload?.programmes?.[0]?.cover_image_position?.x === 65
    })).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Preview before and after' }))
    expect(await screen.findByRole('heading', { name: 'Publication preview' })).toBeVisible()
    await user.upload(screen.getByLabelText('Programme cover photo'), new File(['cover'], 'cover.webp', { type: 'image/webp' }))
    expect(await screen.findByRole('status', { name: 'Uploading image 50%' })).toBeVisible()
    expect(await screen.findByText(/cover photo uploaded and ready/i)).toBeVisible()
    expect(screen.getByAltText('Cover photo framing preview')).toHaveStyle({ objectPosition: '65% 50%' })
    await user.click(screen.getByRole('button', { name: 'Publish to student pages' }))
    await user.click(screen.getByRole('button', { name: 'Save and publish' }))
    expect(fetch).toHaveBeenCalledWith('/api/v1/admin/configurations/versions/7', expect.objectContaining({ method: 'PUT' }))
    expect(fetch).toHaveBeenCalledWith('/api/v1/admin/configurations/versions/7/publish', expect.objectContaining({ method: 'POST' }))

    expect(screen.queryByText('Methodology')).not.toBeInTheDocument()
    unmount()
  }, 15_000)

  it('keeps a failed programme upload available for retry', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/programmes')
    await user.click(await screen.findByRole('button', { name: 'Edit programme' }))
    await user.upload(screen.getByLabelText('Programme cover photo'), new File(['broken'], 'fail.webp', { type: 'image/webp' }))

    expect(await screen.findByText('The image upload failed.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Retry upload' })).toBeVisible()
  })

  it('presents assessment activity as a searchable lifecycle ledger', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/assessments')

    expect(await screen.findByRole('heading', { name: 'Assessment activity' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Student assessment records' })).toBeVisible()
    expect(screen.getByText('Results available')).toBeVisible()
    await user.type(screen.getByRole('searchbox', { name: 'Search assessment activity' }), 'Ana')
    expect(screen.getByRole('button', { name: /Open student record/i })).toBeVisible()
  })

  it('shows privacy-aware reports and auditable Admin activity', async () => {
    const { unmount } = await renderAppAt('/admin/reports')
    expect(await screen.findByRole('heading', { name: 'Guidance reports' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Appointment lifecycle' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Guidance operations' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Assessment completion by month' })).toBeVisible()
    expect(screen.getByText('100%')).toBeVisible()
    expect(screen.getByText(/aggregate counts only/i)).toBeVisible()
    expect(screen.queryByText(/programme match frequency/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/guidance requests by concern/i)).not.toBeInTheDocument()

    unmount()
    await renderAppAt('/admin/activity')
    expect(await screen.findByRole('heading', { name: 'Admin activity' })).toBeVisible()
    expect(screen.getByText('Guidance Note Created')).toBeVisible()
  })

  it('shows a retryable error when an Admin endpoint fails', async () => {
    const defaultImplementation = vi.mocked(fetch).getMockImplementation()
    vi.mocked(fetch).mockImplementation((input, init) => {
      if (input.toString() === '/api/v1/admin/overview') {
        return Promise.resolve(Response.json({ message: 'Service unavailable.' }, { status: 503 }))
      }
      return defaultImplementation!(input, init)
    })
    await renderAppAt('/admin')

    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable.')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible()
  })
})
