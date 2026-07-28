import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { StudentAssessmentResultPage } from '@/features/student/assessment/components/student-assessment-result-page'

describe('Student assessment result', () => {
  it('shows the top code, all dimensions, and linked provenance', () => {
    render(<StudentAssessmentResultPage onBack={vi.fn()} />)

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Assessment result',
    })
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })

    expect(heading).toBeVisible()
    expect(
      heading.compareDocumentPosition(breadcrumb) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getByText('I-C')).toBeVisible()
    expect(screen.getByText('Investigative • Conventional')).toBeVisible()
    expect(
      screen.getByRole('progressbar', {
        name: 'Investigative recorded value',
      }),
    ).toHaveAttribute('aria-valuenow', '82')
    expect(screen.getAllByRole('progressbar')).toHaveLength(6)
    expect(screen.getByText('RIA-RES-001')).toBeVisible()
    expect(screen.getByText('ASMT-STU-001')).toBeVisible()
    expect(screen.getByText('IA-2026-01')).toBeVisible()
  })

  it('keeps the result read-only and separate from recommendations', () => {
    render(<StudentAssessmentResultPage onBack={vi.fn()} />)

    expect(screen.getByText('Read-only result')).toBeVisible()
    expect(screen.getByText('Guidance boundary')).toBeVisible()
    expect(
      screen.getByText(/It is not a diagnosis, admission decision/i),
    ).toBeVisible()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /edit|recalculate|approve/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/recommended course/i)).not.toBeInTheDocument()
  })

  it('returns to the Student dashboard through the breadcrumb', async () => {
    const onBack = vi.fn()
    render(<StudentAssessmentResultPage onBack={onBack} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Go to Student dashboard' }),
    )
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('defines a pending result state', () => {
    render(
      <StudentAssessmentResultPage
        onBack={vi.fn()}
        initialLoadState="pending"
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Your result is being prepared',
      }),
    ).toBeVisible()
    expect(screen.getByText('Preparing')).toBeVisible()
    expect(screen.queryByText('I-C')).not.toBeInTheDocument()
  })

  it('defines loading, empty, and retryable error states', async () => {
    const loading = render(
      <StudentAssessmentResultPage
        onBack={vi.fn()}
        initialLoadState="loading"
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading your assessment result',
    )
    loading.unmount()

    const empty = render(
      <StudentAssessmentResultPage
        onBack={vi.fn()}
        initialLoadState="empty"
      />,
    )
    expect(
      screen.getByRole('heading', {
        name: 'No submitted assessment was found',
      }),
    ).toBeVisible()
    empty.unmount()

    render(
      <StudentAssessmentResultPage
        onBack={vi.fn()}
        initialLoadState="error"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'We could not load your result',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      screen.getByRole('heading', { name: 'Assessment result' }),
    ).toBeVisible()
  })

  it('has no automatically detectable accessibility violations', async () => {
    render(<StudentAssessmentResultPage onBack={vi.fn()} />)
    const results = await axe.run(document.body, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })
})
