import { ArrowRight, BookOpenCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ConfirmActionDialog, EmptyState, ErrorState, LoadingState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  getCurrentAssessment,
  startAssessment,
  type AssessmentLifecycle,
} from '@/features/student/assessment/assessment-api'
import {
  formatAssessmentDate,
  mapAssessmentResult,
} from '@/features/student/assessment/assessment-result-mapper'
import { RecommendationMatchCard } from '@/features/student/recommendations/components/recommendation-match-card'
import { RecommendationProfilePanel } from '@/features/student/recommendations/components/recommendation-profile-panel'
import { StudentRecommendationDetailPage } from '@/features/student/recommendations/components/student-recommendation-detail-page'
import { getLatestRecommendation } from '@/features/student/recommendations/recommendation-api'
import type { StudentRecommendedCourse, StudentRecommendationSnapshot } from '@/features/student/recommendations/recommendation-types'

type RecommendationLoadState = 'ready' | 'loading' | 'error' | 'empty' | 'pending'

interface StudentRecommendationResultsPageProps {
  onBack: () => void
  onOpenAssessment?: () => void
  onExploreProgrammes?: (courses: StudentRecommendedCourse[]) => void
  initialLoadState?: RecommendationLoadState
  initialSnapshot?: StudentRecommendationSnapshot | null
  initialAssessment?: AssessmentLifecycle | null
}

function StudentRecommendationResultsPage({
  onBack,
  onOpenAssessment,
  onExploreProgrammes,
  initialLoadState = 'ready',
  initialSnapshot,
  initialAssessment,
}: StudentRecommendationResultsPageProps) {
  const [loadState, setLoadState] = useState<RecommendationLoadState>(
    initialLoadState === 'ready' && initialSnapshot === undefined ? 'loading' : initialLoadState,
  )
  const [snapshot, setSnapshot] = useState<StudentRecommendationSnapshot | null>(initialSnapshot ?? null)
  const [assessment, setAssessment] = useState<AssessmentLifecycle | null>(initialAssessment ?? null)
  const [loadingAll, setLoadingAll] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [retakeOpen, setRetakeOpen] = useState(false)
  const [retakeError, setRetakeError] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<StudentRecommendedCourse | null>(null)

  useEffect(() => {
    if (initialSnapshot !== undefined || initialLoadState !== 'ready') return
    let active = true

    getLatestRecommendation()
      .then((state) => {
        if (!active) return
        setSnapshot(state.recommendation)
        setLoadState(
          state.status === 'available' && state.recommendation
            ? 'ready'
            : state.status === 'preparing'
              ? 'pending'
              : 'empty',
        )
      })
      .catch(() => active && setLoadState('error'))

    return () => {
      active = false
    }
  }, [attempt, initialLoadState, initialSnapshot])

  useEffect(() => {
    if (initialAssessment !== undefined || initialSnapshot !== undefined) return
    let active = true

    getCurrentAssessment()
      .then((state) => active && setAssessment(state))
      .catch(() => active && setAssessment(null))

    return () => {
      active = false
    }
  }, [initialAssessment, initialSnapshot])

  const assessmentResult = useMemo(
    () => (assessment ? mapAssessmentResult(assessment) : null),
    [assessment],
  )

  if (loadState === 'loading') {
    return (
      <LoadingState
        variant="recommendations"
        title="Loading your academic matches"
        description="Connecting your completed assessment to its programme ranking."
      />
    )
  }

  if (loadState === 'error') {
    return (
      <ErrorState
        title="We could not load your academic matches"
        description="Check your connection and try again."
        onRetry={() => {
          setLoadState('loading')
          setAttempt((value) => value + 1)
        }}
      />
    )
  }

  if (loadState === 'pending') {
    return (
      <RecommendationState
        onBack={onBack}
        title="Your matches are being prepared"
        description="Your assessment is complete. The programme ranking will appear here when processing finishes."
      />
    )
  }

  if (loadState === 'empty' || !snapshot) {
    return (
      <RecommendationState
        onBack={onBack}
        title="No academic matches yet"
        description="Complete your interest assessment to generate your matched TCC programmes."
      />
    )
  }

  if (selectedCourse) {
    return (
      <StudentRecommendationDetailPage
        course={selectedCourse}
        generatedAt={formatAssessmentDate(snapshot.generatedAt)}
        onBack={() => setSelectedCourse(null)}
        onExploreProgrammes={() => (onExploreProgrammes ?? (() => onBack()))(snapshot.courses)}
      />
    )
  }

  return (
    <div className="student-grid-page">
    <div className="student-page pb-16 pt-8 sm:pt-10">
      <section
        className="grid gap-7 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        aria-labelledby="recommendation-title"
      >
        <div className="max-w-4xl">
          <p className="student-kicker"><span /> Assessment complete</p>
          <h1
            id="recommendation-title"
            className="mt-6 font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl"
          >
            Your academic matches
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-foreground/75 sm:text-lg">
            Compare the TCC programmes that most closely match the interests recorded in your completed assessment.
          </p>
          <p className="mt-5 font-label text-sm font-medium text-muted-foreground">
            Recommendations generated {formatAssessmentDate(snapshot.generatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 lg:max-w-sm lg:justify-end" data-print-hidden>
            {onOpenAssessment ? (
              <Button type="button" onClick={() => setRetakeOpen(true)} className="min-h-12">
                Retake assessment
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => (onExploreProgrammes ?? (() => onBack()))(snapshot.courses)} className="min-h-12 bg-card/85">
              Explore all programmes
            </Button>
        </div>
      </section>

      <div className="mt-12 grid items-start gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.65fr)]">
        <section aria-labelledby="top-recommendations-title">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 id="top-recommendations-title" className="font-display text-2xl font-semibold sm:text-3xl">
              Top recommendations
            </h2>
            <span className="inline-flex min-h-10 items-center rounded-full bg-primary px-4 font-label text-sm font-semibold text-primary-foreground shadow-sm">
              {snapshot.showingAll ? `${snapshot.courses.length} programmes` : `Top ${snapshot.courses.length} matches`}
            </span>
          </div>

          <ol className="space-y-5">
            {snapshot.courses.map((course, index) => (
              <li key={course.id}>
                <RecommendationMatchCard
                  course={course}
                  featured={index < 2}
                  onViewDetails={() => setSelectedCourse(course)}
                />
              </li>
            ))}
          </ol>

          {snapshot.canViewAll && !snapshot.showingAll ? (
            <Button
              type="button"
              variant="outline"
              disabled={loadingAll}
              className="mt-6 min-h-12 w-full bg-card"
              onClick={() => {
                setLoadingAll(true)
                getLatestRecommendation(true)
                  .then((state) => state.recommendation && setSnapshot(state.recommendation))
                  .catch(() => setLoadState('error'))
                  .finally(() => setLoadingAll(false))
              }}
            >
              {loadingAll ? 'Loading the complete ranking' : `View all ${snapshot.totalEligible} ranked programmes`}
              {!loadingAll ? <ArrowRight aria-hidden="true" /> : null}
            </Button>
          ) : null}
        </section>

        <RecommendationProfilePanel result={assessmentResult ?? snapshot.profile ?? null} />
      </div>

      <p className="mt-8 rounded bg-secondary px-5 py-4 text-sm leading-6 text-muted-foreground">
        These matches support course exploration. They do not guarantee admission or enrolment.
      </p>

      {retakeError ? (
        <p role="alert" className="mt-4 rounded bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {retakeError}
        </p>
      ) : null}

      <ConfirmActionDialog
        open={retakeOpen}
        onOpenChange={setRetakeOpen}
        title="Start a new assessment?"
        description="Your latest completed result and recommendations will remain available while the new attempt is in progress."
        confirmLabel="Start retake"
        onConfirm={async () => {
          try {
            setRetakeError('')
            await startAssessment()
            setRetakeOpen(false)
            onOpenAssessment?.()
          } catch (error) {
            setRetakeOpen(false)
            setRetakeError(error instanceof Error ? error.message : 'The retake could not be started.')
          }
        }}
      />
    </div>
    </div>
  )
}

function RecommendationState({
  onBack,
  title,
  description,
}: {
  onBack: () => void
  title: string
  description: string
}) {
  return (
    <div className="student-page py-12">
      <EmptyState
        title={title}
        description={description}
        icon={BookOpenCheck}
        action={(
          <Button type="button" variant="secondary" onClick={onBack}>
            Explore programmes
          </Button>
        )}
      />
    </div>
  )
}

export { StudentRecommendationResultsPage }
export type { RecommendationLoadState }
