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
    expect(screen.getByText('Top 1 matches')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Your profile breakdown' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Your academic matches' }).closest('.student-grid-page')).not.toBeNull()
    expect(screen.getByText('I · Investigative')).toBeVisible()
    expect(screen.getByText('Top code: I-C')).toBeVisible()
    expect(screen.getByText(/recorded Investigative \(19\) and Conventional \(19\) scores/)).toBeVisible()
    expect(screen.queryByText('TEST-SESSION-001')).not.toBeInTheDocument()
    expect(screen.queryByText(/temporary methodology/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/programme guidance for review/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/learning areas to explore/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/requirements to confirm with tcc/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/counselor's note/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/logical reasoning/i)).not.toBeInTheDocument()
  })

  it('uses the uploaded programme picture for a matched catalogue course', () => {
    const picturedCourse = {
      ...testRecommendationSnapshot.courses[0],
      id: 'bs-information-technology',
      name: 'BS Information Technology',
      coverImageUrl: '/storage/programme-media/bs-information-technology/cover/published.webp',
      coverImagePosition: { x: 30, y: 70, zoom: 1.4 },
    }

    render(<StudentRecommendationResultsPage
      onBack={vi.fn()}
      initialAssessment={testAssessmentLifecycle}
      initialSnapshot={{ ...testRecommendationSnapshot, courses: [picturedCourse] }}
    />)

    expect(screen.getByRole('img', { name: 'BS Information Technology programme' })).toHaveStyle({
      objectPosition: '30% 70%',
      transform: 'scale(1.4)',
    })
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

  it('opens a selected match in the reference-informed course detail view', async () => {
    const user = userEvent.setup()
    const detailedCourse = {
      ...testRecommendationSnapshot.courses[0],
      summary: 'A programme connected to the recorded assessment profile.',
      factors: ['Profile includes I', 'Profile includes C'],
      interestAreas: ['I', 'C'],
      learningAreas: ['Software development', 'Information management'],
      learningAreaDescriptions: {
        'Software development': 'Design, build, test, and maintain software applications.',
        'Information management': 'Organise and protect information using structured data practices.',
      },
      careerDirections: ['Systems support'],
      reviewNotes: ['Review the published programme guidance before deciding.'],
    }

    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialSnapshot={{ ...testRecommendationSnapshot, courses: [detailedCourse] }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'View programme' }))

    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Test Course' })).toBeVisible()
    expect(screen.getByText('High Fit')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Your match score' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Why this fits you' })).toBeVisible()
    expect(screen.getByText('Investigative recorded score: 19')).toBeVisible()
    expect(screen.getByText('Catalogue learning areas: Software development')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Core learning areas' })).toBeVisible()
    expect(screen.getByText('Degree type')).toBeVisible()
    expect(screen.getByText("Bachelor's degree")).toBeVisible()
    expect(screen.getByText('Starting salary')).toBeVisible()
    expect(screen.getByText('Job growth')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Related fields' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Career trajectory' })).not.toBeInTheDocument()
    expect(screen.getByText('Software development')).toBeVisible()
    expect(screen.getByText('Design, build, test, and maintain software applications.')).toBeVisible()
    expect(screen.getByText('Systems support')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Before you decide' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Official data sources' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /apply/i })).not.toBeInTheDocument()

    const detail = screen.getByRole('article', { name: 'Test Course' })
    const accessibility = await axe.run(detail, { rules: { 'color-contrast': { enabled: false } } })
    expect(accessibility.violations).toEqual([])

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
    await user.type(screen.getByRole('textbox', { name: 'Reason for retaking (optional)' }), 'I want to reconsider my programme options.')
    await user.click(screen.getByRole('button', { name: 'Start retake' }))

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/student/assessments/onet-mini-ip/sessions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ retakeReason: 'I want to reconsider my programme options.' }),
      }),
    )
    expect(onOpenAssessment).toHaveBeenCalledOnce()
  })

  it('has no automatically detectable accessibility violations', async () => {
    render(<StudentRecommendationResultsPage onBack={vi.fn()} initialSnapshot={null} initialLoadState="empty" />)
    const results = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
