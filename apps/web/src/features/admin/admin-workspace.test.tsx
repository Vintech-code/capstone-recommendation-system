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

    const emailMatches = await screen.findAllByText('ana@example.test')
    const row = emailMatches.map((match) => match.closest('tr')).find(Boolean)
    expect(row).toBeDefined()
    await user.click(within(row as HTMLTableRowElement).getByRole('button', { name: 'Open student record' }))

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
    await user.type(screen.getByLabelText('Initial temporary password'), 'Initial!Counsel2026')
    await user.type(screen.getByLabelText('Confirm initial temporary password'), 'Initial!Counsel2026')
    await user.click(screen.getByRole('button', { name: /Create counselor account/i }))
    expect(await screen.findByText(/account created/i)).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/admin/counselors', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        name: 'New Counselor',
        email: 'new@example.test',
        password: 'Initial!Counsel2026',
        password_confirmation: 'Initial!Counsel2026',
      }),
    }))
    expect(screen.queryByText('One-time temporary password')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset password' }))
    expect(screen.getByRole('dialog', { name: 'Set a new temporary password' })).toBeVisible()
    await user.type(screen.getByLabelText('New temporary password'), 'Reset!Counselor2026')
    await user.type(screen.getByLabelText('Confirm new temporary password'), 'Reset!Counselor2026')
    await user.click(screen.getByRole('button', { name: 'Set temporary password' }))
    expect(await screen.findByText(/temporary password set/i)).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/admin/counselors/2/reset-password', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        password: 'Reset!Counselor2026',
        password_confirmation: 'Reset!Counselor2026',
      }),
    }))
  })

  it('lets a counselor decline a pending request with an auditable reason', async () => {
    const user = userEvent.setup()
    await renderAppAt('/counselor/requests')

    expect(await screen.findByText('Programme Comparison')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Decline' }))
    await user.type(screen.getByLabelText('Reason'), 'Please update the concern with the missing information.')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(await screen.findByText('Guidance concern declined.')).toBeVisible()
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

  it('gives counselors a separate aggregate report view', async () => {
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

  it('combines students and assessment activity in one searchable lifecycle ledger', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/students')

    expect(await screen.findByRole('heading', { name: 'Student records' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Student and assessment records' })).toBeVisible()
    expect(screen.getByText('Results available')).toBeVisible()
    await user.type(screen.getByRole('searchbox', { name: 'Search student records' }), 'Ana')
    expect(screen.getAllByRole('button', { name: /Open student record/i }).length).toBeGreaterThan(0)
  })

  it('redirects the former assessment destination to the combined student records page', async () => {
    await renderAppAt('/admin/assessments')

    expect(await screen.findByRole('heading', { name: 'Student records' })).toBeVisible()
    expect(window.location.pathname).toBe('/admin/students')
  })

  it('shows privacy-aware reports and auditable Admin activity', async () => {
    const { unmount } = await renderAppAt('/admin/reports')
    expect(await screen.findByRole('heading', { name: 'Guidance reports' })).toBeVisible()
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
