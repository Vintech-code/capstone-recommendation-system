import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderAppAt } from '@/test/render-app'
import { StudentDashboardPage } from '@/features/student/dashboard/components/student-dashboard-page'
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
    expect(
      screen.getByRole('link', { name: 'O*NET® Web Services' }),
    ).toHaveAttribute('href', 'https://services.onetcenter.org/')
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
    ['not_started', 'Discover your strongest interests', 'Start assessment'],
    ['in_progress', 'Continue your assessment', 'Resume assessment'],
    ['preparing_result', 'Your result is being prepared', null],
    ['result_failed', 'Your result needs another try', 'Try processing again'],
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
        expect(screen.queryByRole('button', { name: /assessment/i })).not.toBeInTheDocument()
      }
    },
  )

  it.skip('does not invent recommendation generation or provenance', async () => {
    await renderAppAt('/student')

    expect(await screen.findByText('No recommendations yet')).toBeVisible()
    expect(screen.queryByText(/Generated:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Based on assessment:/)).not.toBeInTheDocument()
  })

  it.skip('prints the dashboard summary directly', async () => {
    const user = userEvent.setup()
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    await renderAppAt('/student')

    await user.click(await screen.findByRole('button', { name: 'Print summary' }))

    expect(print).toHaveBeenCalledOnce()
    print.mockRestore()
  })

  it('opens a completed attempt with its saved result and recommendations', async () => {
    const user = userEvent.setup()
    render(<StudentDashboardPage onSelectModule={vi.fn()} initialLifecycle={{ ...testAssessmentLifecycle, attempt_number: 1, is_current: true }} />)

    await user.click(await screen.findByRole('button', { name: /Attempt 1/ }))

    expect(await screen.findByText('Attempt 1 result')).toBeVisible()
    expect(screen.getByText('Programme matches from this attempt')).toBeVisible()
    expect(await screen.findByText('Test Course')).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/student/recommendations/attempts/1', expect.any(Object))
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
      if (url === '/api/v1/student/recommendations/attempts/1') {
        return Response.json({ data: { status: 'available', recommendation: testRecommendationSnapshot } })
      }
      return Response.json({ message: 'Not found.' }, { status: 404 })
    })

    render(<StudentDashboardPage onSelectModule={vi.fn()} initialLifecycle={{ id: 2, status: 'in_progress', question_count: 30, attempt_number: 2, is_current: true }} />)

    expect(screen.getByRole('heading', { name: 'Continue your assessment' })).toBeVisible()
    await user.click(await screen.findByRole('button', { name: /Attempt 1/ }))
    expect(await screen.findByText('Attempt 1 result')).toBeVisible()
    expect(await screen.findByText('Test Course')).toBeVisible()
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
      if (url === '/api/v1/student/assessments/onet-mini-ip/sessions') {
        return Response.json({ message: 'Unable to start the retake.' }, { status: 503 })
      }
      return Response.json({ message: 'Not found.' }, { status: 404 })
    })
    render(<StudentDashboardPage onSelectModule={vi.fn()} initialLifecycle={{ ...testAssessmentLifecycle, attempt_number: 1, is_current: true, can_retake: true }} />)

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
