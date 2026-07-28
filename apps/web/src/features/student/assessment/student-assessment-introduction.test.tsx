import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { StudentAssessmentIntroductionPage } from '@/features/student/assessment/components/student-assessment-introduction-page'
import { renderAppAt } from '@/test/render-app'

async function openAssessmentIntroduction() {
  const user = userEvent.setup()
  await renderAppAt('/student')

  const navigation = screen.getByRole('navigation', {
    name: 'Workspace navigation',
  })
  await user.click(
    within(navigation).getByRole('button', { name: 'Assessment' }),
  )

  return user
}

describe('Student assessment introduction', () => {
  it('shows the active version, readiness, and aligned breadcrumb', async () => {
    await openAssessmentIntroduction()

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Interest assessment',
    })
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })

    expect(heading).toBeVisible()
    expect(
      heading.compareDocumentPosition(breadcrumb) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getByText('IA-2026-01')).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Ready to begin' }),
    ).toBeVisible()
    expect(screen.getByText('Guidance, not diagnosis')).toBeVisible()
    expect(screen.queryByText('Applicants')).not.toBeInTheDocument()
  })

  it('requires the notice and confirmation before opening a session', async () => {
    const user = await openAssessmentIntroduction()
    const beginButton = screen.getByRole('button', {
      name: 'Begin assessment',
    })

    expect(beginButton).toBeDisabled()
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I have read and understood the assessment notice.',
      }),
    )
    expect(beginButton).toBeEnabled()

    await user.click(beginButton)
    expect(
      screen.getByRole('alertdialog', { name: 'Begin the assessment?' }),
    ).toBeVisible()
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Begin assessment',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Assessment session',
      }),
    ).toBeVisible()
    expect(screen.getByText('Question 1 of 6')).toBeVisible()
  })

  it('opens the session and returns through the Student breadcrumb', async () => {
    const user = await openAssessmentIntroduction()
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I have read and understood the assessment notice.',
      }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Begin assessment' }),
    )
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Begin assessment',
      }),
    )
    await screen.findByText('Question 1 of 6')

    await user.click(
      screen.getByRole('button', { name: 'Go to Student dashboard' }),
    )
    expect(
      await screen.findByRole('heading', {
        name: /your guidance journey, one step at a time/i,
      }),
    ).toBeVisible()
  })

  it('defines an inactive assessment state without a start action', () => {
    render(
      <StudentAssessmentIntroductionPage
        onBack={vi.fn()}
        availability="inactive"
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Assessment is not available' }),
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Begin assessment' }),
    ).not.toBeInTheDocument()
  })

  it('defines loading, empty, and retryable error states', async () => {
    const onBack = vi.fn()
    const loading = render(
      <StudentAssessmentIntroductionPage
        onBack={onBack}
        initialLoadState="loading"
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading assessment information',
    )
    loading.unmount()

    const empty = render(
      <StudentAssessmentIntroductionPage
        onBack={onBack}
        initialLoadState="empty"
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'No assessment is assigned' }),
    ).toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Return to dashboard' }),
    )
    expect(onBack).toHaveBeenCalledOnce()
    empty.unmount()

    render(
      <StudentAssessmentIntroductionPage
        onBack={onBack}
        initialLoadState="error"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'We could not load the assessment',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      screen.getByRole('heading', { name: 'Interest assessment' }),
    ).toBeVisible()
  })

  it('has no automatically detectable accessibility violations', async () => {
    await openAssessmentIntroduction()
    const results = await axe.run(screen.getByRole('main'), {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })
})
