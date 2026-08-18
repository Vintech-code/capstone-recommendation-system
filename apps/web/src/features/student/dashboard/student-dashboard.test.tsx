import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderAppAt } from '@/test/render-app'
import { StudentDashboardPage } from '@/features/student/dashboard/components/student-dashboard-page'
import { StudentAssessmentHistoryPage } from '@/features/student/assessment/components/student-assessment-history-page'
import { testAssessmentLifecycle, testRecommendationSnapshot } from '@/test/fixtures/student-api-fixtures'

describe('Student dashboard', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = input.toString()
      if (url === '/api/v1/student/assessments/onet-mini-ip/session') {
        return Response.json({
          data: testAssessmentLifecycle,
        })
      }
      if (url.startsWith('/api/v1/auth/authorize/')) {
        return Response.json({ authorized: true, portal: 'student' })
      }
      if (url === '/api/v1/student/recommendations/latest') {
        return Response.json({ data: { status: 'not_available', recommendation: null } })
      }
      if (url === '/api/v1/student/guidance-summaries') {
        return Response.json({ data: [{ id: 3, body: 'Compare your shortlisted programmes and record your remaining questions.', counselor: 'Guidance Counselor', publishedBy: 'Guidance Counselor', publishedAt: '2026-08-10T10:00:00+08:00' }] })
      }
      if (url === '/api/v1/student/programmes') {
        return Response.json({ data: { academicYear: '2026-2027', catalogueVersion: 1, programmes: [{ id: 'bs-information-technology', name: 'BS Information Technology', code: 'BSIT', majors: [], riasecProfile: ['I', 'C', 'R'], description: 'Technology programme', learningAreas: ['Software development'], requirements: ['Meet published admission requirements.'], readinessPrompt: 'Discuss your interest in technology.' }] } })
      }
      if (url === '/api/v1/student/assessments/onet-mini-ip/history') {
        return Response.json({
          data: [{ ...testAssessmentLifecycle, attempt_number: 1, is_current: true }],
          policy: { status: 'proposed', version: 'RETAKE-PROPOSED-2026-01', minimum_days_between_completed_attempts: 0, completed_attempts_are_read_only: true },
        })
      }
      if (url === '/api/v1/student/recommendations/attempts/1') {
        return Response.json({ data: { status: 'available', recommendation: testRecommendationSnapshot } })
      }
      return Response.json({ message: 'Not found.' }, { status: 404 })
    })
  })
  it.skip('shows the assessment and recommendation summary without a report module', async () => {
    await renderAppAt('/student')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeVisible()
    expect(await screen.findByRole('heading', { name: /Your strongest interests are/ })).toBeVisible()
    expect(screen.getAllByText('I-C')[0]).toBeVisible()
    expect(screen.getByText('Realistic')).toBeVisible()
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0)
    expect(screen.getByText('No recommendations yet')).toBeVisible()
    expect(screen.getByTestId('student-guidance-summary')).toHaveClass(
      'w-full',
    )
    expect(screen.getByTestId('student-guidance-summary')).not.toHaveClass('max-w-[96rem]')
    expect(screen.queryByText('TEST-SESSION-001')).not.toBeInTheDocument()
    expect(screen.queryByText('Profile & application')).not.toBeInTheDocument()
    expect(screen.queryByText('Official result')).not.toBeInTheDocument()
    expect(screen.queryByText('My decision')).not.toBeInTheDocument()
    expect(screen.queryByText('My report')).not.toBeInTheDocument()
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(screen.queryByText('Quick access')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('complementary', { name: 'Workspace sidebar' }),
    ).not.toBeInTheDocument()
  })

  it.skip('keeps only assessment and recommendation modules in top navigation', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student')
    const navigation = screen.getByRole('navigation', {
      name: 'Workspace navigation',
    })

    expect(
      within(navigation).queryByRole('button', { name: 'Assessment result' }),
    ).not.toBeInTheDocument()

    await user.click(
      within(navigation).getByRole('button', { name: 'Recommended courses' }),
    )
    expect(
      within(screen.getByRole('main')).getByRole('heading', {
        level: 1,
        name: 'Recommended courses',
      }),
    ).toBeVisible()

    expect(
      within(navigation).queryByRole('button', { name: 'My report' }),
    ).not.toBeInTheDocument()
  })

  it.skip('opens the next recommended-course step from the dashboard', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student')

    await user.click(
      await screen.findByRole('button', { name: 'Explore all recommendations' }),
    )

    expect(
      within(screen.getByRole('main')).getByRole('heading', {
        level: 1,
        name: 'Recommended courses',
      }),
    ).toBeVisible()
  })

  it.each([
    ['not_started', 'Start your interest assessment', 'Start assessment'],
    ['in_progress', 'Continue your assessment', 'Resume assessment'],
    ['preparing_result', 'Finalizing your submission', null],
    ['result_failed', 'Result processing needs attention', 'Try processing again'],
  ] as const)(
    'shows the truthful %s dashboard state',
    (status, heading, action) => {
      render(
        <StudentDashboardPage
          onSelectModule={vi.fn()}
          initialLifecycle={{
            status,
            answer_count: status === 'in_progress' ? 12 : 0,
            question_count: 30,
          }}
        />,
      )

      expect(screen.getByRole('heading', { name: heading })).toBeVisible()
      if (action) {
        expect(screen.getByRole('button', { name: action })).toBeVisible()
      } else {
        expect(screen.getByRole('button', { name: 'Assessment history' })).toBeVisible()
      }
    },
  )

  it('keeps guidance requests unavailable until course matches exist', () => {
    render(<StudentDashboardPage onSelectModule={vi.fn()} initialLifecycle={{ status: 'not_started', question_count: 30 }} />)
    expect(screen.getByRole('button', { name: 'Request guidance' })).toBeDisabled()
  })

  it('submits a student-owned guidance request for the current top match', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (input.toString() === '/api/v1/student/guidance-requests' && init?.method === 'POST') {
        const body = JSON.parse(String(init.body)) as { programmeId: string; concernCategory: string; preferredFormat: string; preferredDate: string | null; message: string }
        return Response.json({ data: { id: 21, programmeId: body.programmeId, programmeCode: 'TEST', programmeName: 'Test Course', concernCategory: body.concernCategory, preferredFormat: body.preferredFormat, preferredDate: body.preferredDate, message: body.message, status: 'pending', acceptedBy: null, acceptedAt: null, closedAt: null, resolutionReason: null, statusHistory: [], createdAt: '2026-08-09T10:00:00+08:00' } }, { status: 201 })
      }
      return Response.json({ message: 'Not found.' }, { status: 404 })
    })
    render(<StudentDashboardPage onSelectModule={vi.fn()} initialLifecycle={testAssessmentLifecycle} initialRecommendations={{ status: 'available', recommendation: testRecommendationSnapshot }} />)

    await user.click(screen.getByRole('button', { name: 'Request guidance' }))
    await user.click(screen.getByRole('button', { name: 'Send request' }))

    expect(await screen.findByText('Guidance request')).toBeVisible()
    expect(screen.getByText('Pending')).toBeVisible()
    const requestCall = vi.mocked(fetch).mock.calls.find(([input, init]) => input.toString() === '/api/v1/student/guidance-requests' && init?.method === 'POST')
    expect(JSON.parse(String(requestCall?.[1]?.body))).toMatchObject({ programmeId: 'test-course', concernCategory: 'programme_comparison', preferredFormat: 'in_person' })
  })

  it.skip('does not invent recommendation generation or provenance', async () => {
    await renderAppAt('/student')

    expect(await screen.findByText('No recommendations yet')).toBeVisible()
    expect(screen.queryByText(/Generated:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Based on assessment:/)).not.toBeInTheDocument()
  })

  it('opens a completed attempt with its saved result and recommendations', async () => {
    const user = userEvent.setup()
    render(<StudentAssessmentHistoryPage onBack={vi.fn()} onOpenAssessment={vi.fn()} />)

    await user.click(await screen.findByRole('button', { name: /Attempt 1/ }))

    expect(await screen.findByText('Attempt 1 result')).toBeVisible()
    expect(screen.getByText('Assessment version: test-instrument')).toBeVisible()
    expect(screen.getByText('Current result')).toBeVisible()
    expect(screen.getByText('Programme matches from this attempt')).toBeVisible()
    expect(await screen.findByText('Test Course')).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/student/recommendations/attempts/1', expect.any(Object))
  })

  it('compares a completed retake with the previous completed attempt using recorded values only', async () => {
    const user = userEvent.setup()
    const secondAttempt = {
      ...testAssessmentLifecycle,
      id: 2,
      reference: 'TEST-SESSION-002',
      attempt_number: 2,
      retake_reason: 'I wanted to review my recorded interests.',
      is_current: true,
      result: {
        ...testAssessmentLifecycle.result!,
        scoring_source: 'official-mini-ip-local-v1',
        result: testAssessmentLifecycle.result!.result.map((dimension) => ({
          ...dimension,
          score: dimension.score + 2,
        })),
      },
    }
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = input.toString()
      if (url === '/api/v1/student/assessments/onet-mini-ip/history') {
        return Response.json({
          data: [secondAttempt, { ...testAssessmentLifecycle, id: 1, attempt_number: 1, is_current: false }],
          policy: { status: 'proposed', version: 'RETAKE-PROPOSED-2026-01', minimum_days_between_completed_attempts: 0, completed_attempts_are_read_only: true },
        })
      }
      if (url === '/api/v1/student/assessments/onet-mini-ip/session') return Response.json({ data: secondAttempt })
      if (url === '/api/v1/student/recommendations/attempts/2') return Response.json({ data: { status: 'available', recommendation: testRecommendationSnapshot } })
      return Response.json({ message: 'Not found.' }, { status: 404 })
    })

    render(<StudentAssessmentHistoryPage onBack={vi.fn()} onOpenAssessment={vi.fn()} />)
    await user.click(await screen.findByRole('button', { name: /Attempt 2/ }))

    expect(await screen.findByRole('heading', { name: 'Compared with Attempt 1' })).toBeVisible()
    expect(screen.getByText('Assessment version: official-mini-ip-local-v1')).toBeVisible()
    expect(screen.getByText('Recorded score change only')).toBeVisible()
    expect(screen.getAllByText('+2')).toHaveLength(6)
    expect(screen.getByText(/I wanted to review my recorded interests/)).toBeVisible()
  })

  it('preserves the latest completed result while a retake is in progress', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = input.toString()
      if (url === '/api/v1/student/assessments/onet-mini-ip/history') {
        return Response.json({
          data: [
            { id: 2, status: 'in_progress', question_count: 30, attempt_number: 2, is_current: true, started_at: '2026-09-10T00:00:00Z' },
            { ...testAssessmentLifecycle, id: 1, attempt_number: 1, is_current: false },
          ],
          policy: { status: 'proposed', version: 'RETAKE-PROPOSED-2026-01', minimum_days_between_completed_attempts: 0, completed_attempts_are_read_only: true },
        })
      }
      if (url === '/api/v1/student/assessments/onet-mini-ip/session') {
        return Response.json({ data: { id: 2, status: 'in_progress', question_count: 30, attempt_number: 2, is_current: true } })
      }
      if (url === '/api/v1/student/recommendations/attempts/1') {
        return Response.json({ data: { status: 'available', recommendation: testRecommendationSnapshot } })
      }
      return Response.json({ message: 'Not found.' }, { status: 404 })
    })

    render(<StudentAssessmentHistoryPage onBack={vi.fn()} onOpenAssessment={vi.fn()} />)

    expect(await screen.findByRole('heading', { name: 'Your assessment timeline' })).toBeVisible()
    expect(screen.getByText('Select a completed attempt')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: /Attempt 1/ }))
    expect(await screen.findByText('Attempt 1 result')).toBeVisible()
    expect(await screen.findByText('Test Course')).toBeVisible()
  })

  it('keeps the latest completed summary on the dashboard while a new result is preparing', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = input.toString()
      if (url === '/api/v1/student/assessments/onet-mini-ip/session') {
        return Response.json({ data: { id: 2, status: 'preparing_result', question_count: 30, attempt_number: 2, is_current: true } })
      }
      if (url === '/api/v1/student/recommendations/latest') {
        return Response.json({ data: { status: 'preparing', recommendation: null } })
      }
      if (url === '/api/v1/student/assessments/onet-mini-ip/history') {
        return Response.json({
          data: [
            { id: 2, status: 'preparing_result', question_count: 30, attempt_number: 2, is_current: true },
            { ...testAssessmentLifecycle, id: 1, attempt_number: 1, is_current: false },
          ],
          policy: { status: 'proposed', version: 'RETAKE-PROPOSED-2026-01', minimum_days_between_completed_attempts: 0, completed_attempts_are_read_only: true },
        })
      }
      if (url === '/api/v1/student/recommendations/attempts/1') {
        return Response.json({ data: { status: 'available', recommendation: testRecommendationSnapshot } })
      }
      return Response.json({ message: 'Not found.' }, { status: 404 })
    })

    render(<StudentDashboardPage onSelectModule={vi.fn()} />)

    expect(await screen.findByRole('heading', { name: 'Finalizing your submission' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Investigative and Conventional' })).toBeVisible()
    expect(screen.getByText('Test Course')).toBeVisible()
  })

  it('confirms a retake and displays a visible start failure', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = input.toString()
      if (url === '/api/v1/student/assessments/onet-mini-ip/history') {
        return Response.json({
          data: [{ ...testAssessmentLifecycle, attempt_number: 1, is_current: true, can_retake: true }],
          policy: { status: 'proposed', version: 'RETAKE-PROPOSED-2026-01', minimum_days_between_completed_attempts: 0, completed_attempts_are_read_only: true },
        })
      }
      if (url === '/api/v1/student/assessments/onet-mini-ip/session') {
        return Response.json({ data: { ...testAssessmentLifecycle, attempt_number: 1, is_current: true, can_retake: true } })
      }
      if (url === '/api/v1/student/assessments/onet-mini-ip/sessions') {
        return Response.json({ message: 'Unable to start the retake.' }, { status: 503 })
      }
      return Response.json({ message: 'Not found.' }, { status: 404 })
    })
    render(<StudentAssessmentHistoryPage onBack={vi.fn()} onOpenAssessment={vi.fn()} />)

    await user.click(await screen.findByRole('button', { name: 'Start retake' }))
    expect(screen.getByRole('alertdialog')).toBeVisible()
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Start retake' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Retake could not be started')
  })

  it('has no automatically detectable accessibility violations', async () => {
    const { container } = await renderAppAt('/student')
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })

    expect(results.violations).toEqual([])
  })
})
