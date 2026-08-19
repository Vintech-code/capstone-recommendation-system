import { ArrowRight, Award, BookOpenCheck, CalendarDays, CheckCircle2, GraduationCap, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { EmptyState, ErrorState, LoadingState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import matchesHeroImage from '@/assets/student-matches-hero-v2.webp'
import {
  getCurrentAssessment,
  startAssessment,
  type AssessmentLifecycle,
} from '@/features/student/assessment/assessment-api'
import { RetakeAssessmentDialog } from '@/features/student/assessment/components/retake-assessment-dialog'
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
    <div className="student-grid-page student-dashboard-canvas">
      <section
        data-testid="matches-hero"
        className="relative isolate min-h-[19rem] overflow-hidden bg-primary-fixed/55"
        aria-labelledby="recommendation-title"
      >
        <img src={matchesHeroImage} alt="" className="pointer-events-none absolute inset-0 -z-20 size-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-fixed/90 via-primary-fixed/20 to-transparent dark:from-background dark:via-background/70 dark:to-background/10" />
        <div className="student-page grid min-h-[19rem] gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
          <div className="max-w-2xl">
            <p className="inline-flex min-h-10 items-center gap-2 rounded bg-card/90 px-4 font-label text-xs font-semibold uppercase tracking-[0.08em] text-primary shadow-sm"><CheckCircle2 aria-hidden="true" className="size-5 text-chart-blue" />Assessment complete</p>
            <h1 id="recommendation-title" className="mt-5 font-display text-4xl font-bold tracking-[-0.04em] text-primary sm:text-5xl">Your academic matches</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-on-primary-fixed-variant sm:text-lg">Compare the TCC programmes that most closely match the interests recorded in your completed assessment.</p>
            <p className="mt-5 flex items-center gap-2 font-label text-sm font-medium text-on-primary-fixed-variant"><CalendarDays aria-hidden="true" className="size-4 text-primary" />Recommendations generated {formatAssessmentDate(snapshot.generatedAt)}</p>
          </div>

          <div className="grid w-full gap-3 justify-self-end sm:max-w-64" data-print-hidden>
            {onOpenAssessment ? (
              <Button type="button" onClick={() => setRetakeOpen(true)} className="min-h-12 justify-between bg-primary/95 px-5">
                <span className="flex items-center gap-2"><RefreshCw aria-hidden="true" />Retake assessment</span><ArrowRight aria-hidden="true" />
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => (onExploreProgrammes ?? (() => onBack()))(snapshot.courses)} className="min-h-12 justify-between bg-card/90 px-5">
              <span className="flex items-center gap-2"><GraduationCap aria-hidden="true" />Explore all programmes</span><ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <div className="student-page pb-16 pt-10 sm:pt-12">
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.65fr)]">
        <section aria-labelledby="top-recommendations-title">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary"><Award aria-hidden="true" className="size-5" /></span><h2 id="top-recommendations-title" className="font-display text-2xl font-semibold sm:text-3xl">Top recommendations</h2></div>
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

      <div className="mt-8 flex items-start gap-3 rounded bg-primary-fixed/55 px-5 py-4 text-sm leading-6 text-on-primary-fixed-variant"><span className="flex size-9 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground"><GraduationCap aria-hidden="true" className="size-5" /></span><p><strong className="text-on-primary-fixed">Course exploration reminder:</strong> These matches support exploration. Review each programme's published information; a match does not guarantee admission or enrolment.</p></div>

      {retakeError ? (
        <p role="alert" className="mt-4 rounded bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {retakeError}
        </p>
      ) : null}

      <RetakeAssessmentDialog
        open={retakeOpen}
        onOpenChange={setRetakeOpen}
        description="Your latest completed result and recommendations will remain available while the new attempt is in progress."
        onConfirm={async (reason) => {
          try {
            setRetakeError('')
            await startAssessment(reason)
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
