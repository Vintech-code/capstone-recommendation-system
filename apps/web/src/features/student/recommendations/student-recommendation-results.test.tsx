import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { StudentRecommendationResultsPage } from '@/features/student/recommendations/components/student-recommendation-results-page'
import { testAssessmentLifecycle, testRecommendationSnapshot } from '@/test/fixtures/student-api-fixtures'

describe('Student recommendation results', () => {
  it('renders only recommendation data supplied by the API boundary', () => {
    render(<StudentRecommendationResultsPage
      onBack={vi.fn()}
      initialAssessment={testAssessmentLifecycle}
      initialSnapshot={{ ...testRecommendationSnapshot, status: 'Temporary methodology' }}
    />)
    expect(screen.getByText('Test Course')).toBeVisible()
    expect(screen.getByText('Recommendations generated Aug 7, 2026')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Your profile breakdown' })).toBeVisible()
    expect(screen.getByText('I · Investigative')).toBeVisible()
    expect(screen.getByText('Top code: I-C')).toBeVisible()
    expect(screen.queryByText('TEST-SESSION-001')).not.toBeInTheDocument()
    expect(screen.queryByText(/temporary methodology/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/programme guidance for review/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/learning areas to explore/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/requirements to confirm with tcc/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/counselor's note/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/logical reasoning/i)).not.toBeInTheDocument()
  })

  it('shows an honest empty state when no recommendation exists', () => {
    render(<StudentRecommendationResultsPage onBack={vi.fn()} initialSnapshot={null} initialLoadState="empty" />)
    expect(screen.getByRole('heading', { name: 'No academic matches yet' })).toBeVisible()
    expect(screen.queryByText('Test Course')).not.toBeInTheDocument()
  })

  it('renders the assessment profile embedded in the recommendation response', () => {
    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialSnapshot={testRecommendationSnapshot}
      />,
    )

    expect(screen.getByText('I · Investigative')).toBeVisible()
    expect(screen.getAllByText('19 / 25')).toHaveLength(2)
    expect(screen.queryByLabelText('Interest profile unavailable')).not.toBeInTheDocument()
  })

  it('defines loading, pending, and retryable error states', () => {
    const loading = render(<StudentRecommendationResultsPage onBack={vi.fn()} initialLoadState="loading" />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading your academic matches')
    loading.unmount()
    const pending = render(<StudentRecommendationResultsPage onBack={vi.fn()} initialLoadState="pending" />)
    expect(screen.getByText('Your matches are being prepared')).toBeVisible()
    pending.unmount()
    render(<StudentRecommendationResultsPage onBack={vi.fn()} initialLoadState="error" />)
    expect(screen.getByRole('alert')).toHaveTextContent('We could not load your academic matches')
  })

  it('loads the complete ranked result when view all is available', async () => {
    const user = userEvent.setup()
    const expanded = {
      ...testRecommendationSnapshot,
      canViewAll: false,
      showingAll: true,
      totalEligible: 2,
      courses: [
        ...testRecommendationSnapshot.courses,
        { ...testRecommendationSnapshot.courses[0], id: 'second-course', rank: 2, name: 'Second Course' },
      ],
    }
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'available', recommendation: expanded } }),
    } as Response)

    render(<StudentRecommendationResultsPage
      onBack={vi.fn()}
      initialSnapshot={{ ...testRecommendationSnapshot, canViewAll: true, totalEligible: 2 }}
    />)
    await user.click(screen.getByRole('button', { name: 'View all 2 ranked programmes' }))

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/student/recommendations/latest?view=all', expect.any(Object))
    expect(await screen.findByText('Second Course')).toBeVisible()
  })

  it('opens a selected match in the screen1-style programme detail view', async () => {
    const user = userEvent.setup()
    const detailedCourse = {
      ...testRecommendationSnapshot.courses[0],
      summary: 'A programme connected to the recorded assessment profile.',
      factors: ['Profile includes I', 'Profile includes C'],
      interestAreas: ['I', 'C'],
      learningAreas: ['Software development', 'Information management'],
      careerDirections: ['Systems support'],
    }

    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialSnapshot={{ ...testRecommendationSnapshot, courses: [detailedCourse] }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'View programme' }))

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('My Matches')
    expect(screen.getByRole('heading', { level: 1, name: 'Test Course' })).toBeVisible()
    expect(screen.getByText('High Fit')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Why this fits you' })).toBeVisible()
    expect(screen.getByText('Software development')).toBeVisible()
    expect(screen.getByText('Systems support')).toBeVisible()
    expect(screen.queryByRole('button', { name: /apply/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back to matches' }))
    expect(screen.getByRole('heading', { name: 'Your academic matches' })).toBeVisible()
  })

  it('confirms a retake before creating the new assessment', async () => {
    const user = userEvent.setup()
    const onOpenAssessment = vi.fn()
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 2, status: 'in_progress', question_count: 30 } }),
    } as Response)

    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        onOpenAssessment={onOpenAssessment}
        initialSnapshot={testRecommendationSnapshot}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Retake assessment' }))
    expect(screen.getByRole('alertdialog', { name: 'Start a new assessment?' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Start retake' }))

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/student/assessments/onet-mini-ip/sessions',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(onOpenAssessment).toHaveBeenCalledOnce()
  })

  it('has no automatically detectable accessibility violations', async () => {
    render(<StudentRecommendationResultsPage onBack={vi.fn()} initialSnapshot={null} initialLoadState="empty" />)
    const results = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
