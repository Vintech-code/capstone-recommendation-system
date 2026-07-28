import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { StudentRecommendationResultsPage } from '@/features/student/recommendations/components/student-recommendation-results-page'
import { renderAppAt } from '@/test/render-app'

async function openCourseGuidance() {
  const user = userEvent.setup()
  await renderAppAt('/student')

  const navigation = screen.getByRole('navigation', {
    name: 'Workspace navigation',
  })
  await user.click(
    within(navigation).getByRole('button', { name: 'Course guidance' }),
  )

  return user
}

describe('Student recommendation results', () => {
  it('shows ranked guidance, recorded factors, and provenance', async () => {
    await openCourseGuidance()

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Course guidance',
    })
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })

    expect(heading).toBeVisible()
    expect(
      heading.compareDocumentPosition(breadcrumb) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getByText('BS Information Technology')).toBeVisible()
    expect(screen.getByText('BS Computer Science')).toBeVisible()
    expect(screen.getAllByRole('progressbar')).toHaveLength(4)
    expect(screen.getByText('REC-STU-001')).toBeVisible()
    expect(screen.getByText('RIA-RES-001')).toBeVisible()
    expect(screen.getByText('CAT-UI-01')).toBeVisible()
    expect(screen.getByText('RULE-UI-01')).toBeVisible()
  })

  it('filters the ranked options by recorded requirement status', async () => {
    const user = await openCourseGuidance()

    await user.click(screen.getByRole('button', { name: 'Eligible' }))
    expect(screen.getByText('BS Information Technology')).toBeVisible()
    expect(screen.queryByText('BS Accountancy')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Needs review' }))
    expect(screen.getByText('BS Accountancy')).toBeVisible()
    expect(screen.getByText('BS Business Administration')).toBeVisible()
    expect(
      screen.queryByText('BS Information Technology'),
    ).not.toBeInTheDocument()
  })

  it('compares two selected course options and returns to the ranked list', async () => {
    const user = await openCourseGuidance()
    const informationTechnologyCard = screen
      .getByRole('heading', { name: 'BS Information Technology' })
      .closest('article')
    const computerScienceCard = screen
      .getByRole('heading', { name: 'BS Computer Science' })
      .closest('article')

    expect(informationTechnologyCard).not.toBeNull()
    expect(computerScienceCard).not.toBeNull()
    await user.click(
      within(informationTechnologyCard!).getByRole('button', {
        name: 'Add to comparison',
      }),
    )
    await user.click(
      within(computerScienceCard!).getByRole('button', {
        name: 'Add to comparison',
      }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Compare selected' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Compare course options' }),
    ).toBeVisible()
    expect(screen.getByText('BS Information Technology')).toBeVisible()
    expect(screen.getByText('BS Computer Science')).toBeVisible()
    expect(screen.getByText('92%')).toBeVisible()
    expect(screen.getByText('87%')).toBeVisible()

    await user.click(
      screen.getByRole('button', { name: 'Back to recommendations' }),
    )
    expect(
      screen.getByRole('heading', { name: 'Ranked course options' }),
    ).toBeVisible()
  })

  it('opens course details while preserving comparison selection', async () => {
    const user = await openCourseGuidance()
    const courseCard = screen
      .getByRole('heading', { name: 'BS Information Technology' })
      .closest('article')

    await user.click(
      within(courseCard!).getByRole('button', { name: 'Add to comparison' }),
    )
    await user.click(
      within(courseCard!).getByRole('button', { name: 'View details' }),
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'BS Information Technology' }),
    ).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Course overview' })).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'What you may explore' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Possible career directions' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: 'What to review before deciding',
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Selected to compare' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps guidance distinct from admission and administrative actions', async () => {
    await openCourseGuidance()

    expect(screen.getByText('Guidance, not admission')).toBeVisible()
    expect(screen.getByText(/does not guarantee eligibility/i)).toBeVisible()
    expect(screen.queryByRole('button', { name: /enrol|admit/i })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /approve recommendation/i }),
    ).not.toBeInTheDocument()
  })

  it('defines loading, pending, empty, and retryable error states', async () => {
    const loading = render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialLoadState="loading"
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading your course guidance',
    )
    loading.unmount()

    const pending = render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialLoadState="pending"
      />,
    )
    expect(
      screen.getByRole('heading', {
        name: 'Your recommendations are being prepared',
      }),
    ).toBeVisible()
    pending.unmount()

    const empty = render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialLoadState="empty"
      />,
    )
    expect(
      screen.getByRole('heading', {
        name: 'No recommendation result is available',
      }),
    ).toBeVisible()
    empty.unmount()

    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialLoadState="error"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'We could not load your course guidance',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      screen.getByRole('heading', { name: 'Course guidance' }),
    ).toBeVisible()
  })

  it('has no automatically detectable accessibility violations', async () => {
    render(<StudentRecommendationResultsPage onBack={vi.fn()} />)
    const results = await axe.run(document.body, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })
})
