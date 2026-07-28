import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  FileKey2,
  Filter,
  GitCompareArrows,
  Info,
  ListFilter,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { RecommendationCourseCard } from '@/features/student/recommendations/components/recommendation-course-card'
import {
  mockStudentRecommendationSnapshot,
  type StudentRecommendedCourse,
  type StudentRecommendationEligibility,
} from '@/features/student/recommendations/data/mock-student-recommendations'
import { StudentPageHeader } from '@/features/student/components/student-page-header'

type RecommendationLoadState =
  | 'ready'
  | 'loading'
  | 'error'
  | 'empty'
  | 'pending'
type RecommendationFilter = 'All' | StudentRecommendationEligibility
type RecommendationView = 'list' | 'comparison' | 'detail'

interface StudentRecommendationResultsPageProps {
  onBack: () => void
  onOpenDecision?: () => void
  initialLoadState?: RecommendationLoadState
}

const recommendationFilters: RecommendationFilter[] = [
  'All',
  'Eligible',
  'Needs review',
]

function StudentRecommendationResultsPage({
  onBack,
  onOpenDecision,
  initialLoadState = 'ready',
}: StudentRecommendationResultsPageProps) {
  const [loadState, setLoadState] = useState(initialLoadState)
  const [filter, setFilter] = useState<RecommendationFilter>('All')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [view, setView] = useState<RecommendationView>('list')
  const [detailCourseId, setDetailCourseId] = useState<string>()
  const snapshot = mockStudentRecommendationSnapshot
  const filteredCourses = useMemo(
    () =>
      snapshot.courses.filter(
        (course) => filter === 'All' || course.eligibility === filter,
      ),
    [filter, snapshot.courses],
  )
  const selectedCourses = snapshot.courses.filter((course) =>
    selectedIds.includes(course.id),
  )
  const detailCourse = snapshot.courses.find(
    (course) => course.id === detailCourseId,
  )

  if (loadState === 'loading') {
    return (
      <LoadingState
        title="Loading your course guidance"
        description="Preparing the ranked options available to your account."
      />
    )
  }

  if (loadState === 'error') {
    return (
      <ErrorState
        title="We could not load your course guidance"
        description="Your assessment and application records were not changed. Try loading the recommendations again."
        onRetry={() => setLoadState('ready')}
      />
    )
  }

  if (loadState === 'empty') {
    return (
      <EmptyState
        title="No recommendation result is available"
        description="Course guidance will appear here when a recommendation result is available to your account."
        icon={BookOpenCheck}
        action={
          <Button type="button" variant="secondary" onClick={onBack}>
            Return to dashboard
          </Button>
        }
      />
    )
  }

  if (loadState === 'pending') {
    return (
      <div className="w-full">
        <StudentPageHeader
          title="Course guidance"
          description="Check the availability of your course recommendations."
          onBack={onBack}
          actions={<StatusBadge label="Preparing" tone="info" />}
        />
        <EmptyState
          className="mt-4"
          title="Your recommendations are being prepared"
          description="Your assessment result is available. Course guidance will appear here when the recommendation result is ready."
          icon={Sparkles}
          action={
            <Button type="button" variant="secondary" onClick={onBack}>
              Return to dashboard
            </Button>
          }
        />
      </div>
    )
  }

  if (view === 'comparison') {
    return (
      <RecommendationComparison
        courses={selectedCourses}
        onBack={() => setView('list')}
        onExit={onBack}
      />
    )
  }

  if (view === 'detail' && detailCourse) {
    return (
      <RecommendationCourseDetail
        course={detailCourse}
        onBack={() => setView('list')}
        onExit={onBack}
        selected={selectedIds.includes(detailCourse.id)}
        onToggleComparison={() => toggleComparison(detailCourse.id)}
      />
    )
  }

  function toggleComparison(courseId: string) {
    setSelectedIds((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : current.length < 3
          ? [...current, courseId]
          : current,
    )
  }

  return (
    <div className="w-full pb-24 sm:pb-8">
      <StudentPageHeader
        title="Course guidance"
        description="Review ranked course options, recorded factors, and guidance limitations."
        onBack={onBack}
        actions={<StatusBadge label={snapshot.status} tone="success" />}
      />

      <section
        aria-labelledby="recommendation-summary-title"
        className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-primary/10 p-5 shadow-sm sm:p-7"
      >
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 size-72 rounded-full bg-primary/12 blur-3xl"
        />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)] lg:items-end">
          <div>
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpenCheck aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-primary">
              Your ranked options
            </p>
            <h2
              id="recommendation-summary-title"
              className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl"
            >
              Explore the complete guidance result.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Rank and match values summarize this recorded result. Review the
              factors and requirement status for every course before making a
              decision.
            </p>
          </div>

          <div className="rounded-2xl bg-brand-dark p-5 text-white">
            <ShieldCheck aria-hidden="true" className="size-5 text-brand-soft" />
            <p className="mt-4 font-extrabold">Guidance, not admission</p>
            <p className="mt-2 text-xs leading-5 text-white/70">
              A recommendation does not guarantee eligibility, admission,
              enrolment, a reserved slot, or final course assignment.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="recommendation-filter-title"
        className="mt-4 rounded-2xl bg-background p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Filter aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h2 id="recommendation-filter-title" className="text-sm font-extrabold">
                Filter recommendations
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Show all options or focus on a recorded requirement status.
              </p>
            </div>
          </div>

          <div
            role="group"
            aria-label="Recommendation status filter"
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {recommendationFilters.map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={filter === option ? 'default' : 'secondary'}
                aria-pressed={filter === option}
                onClick={() => setFilter(option)}
                className="shrink-0 shadow-none"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {selectedIds.length > 0 ? (
        <section
          aria-label="Course comparison selection"
          className="mt-4 flex flex-col gap-4 rounded-2xl bg-brand-dark p-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex items-start gap-3">
            <GitCompareArrows
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-brand-soft"
            />
            <div>
              <p className="font-extrabold">
                {selectedIds.length} course
                {selectedIds.length === 1 ? '' : 's'} selected
              </p>
              <p className="mt-1 text-xs leading-5 text-white/65">
                Select two or three courses to compare their recorded details.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="flex-1 text-white hover:bg-white/10 hover:text-white sm:flex-none"
            >
              Clear
            </Button>
            <Button
              type="button"
              disabled={selectedIds.length < 2}
              onClick={() => setView('comparison')}
              className="flex-1 bg-white text-brand-dark shadow-none hover:bg-white/90 sm:flex-none"
            >
              Compare selected
            </Button>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="ranked-courses-title" className="mt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Recommendation result
            </p>
            <h2 id="ranked-courses-title" className="mt-1 text-xl font-extrabold">
              Ranked course options
            </h2>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {filteredCourses.length} option
            {filteredCourses.length === 1 ? '' : 's'} shown
          </p>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {filteredCourses.map((course) => (
              <RecommendationCourseCard
                key={course.id}
                course={course}
                selected={selectedIds.includes(course.id)}
                comparisonDisabled={selectedIds.length >= 3}
                onToggleComparison={() => toggleComparison(course.id)}
                onViewDetails={() => {
                  setDetailCourseId(course.id)
                  setView('detail')
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-4"
            title="No courses match this filter"
            description="Choose another requirement-status filter to view the remaining ranked options."
            icon={ListFilter}
            action={
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFilter('All')}
              >
                Show all recommendations
              </Button>
            }
          />
        )}
      </section>

      <RecommendationProvenance />

      {onOpenDecision ? (
        <section className="mt-4 flex flex-col gap-4 rounded-2xl bg-brand-dark p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-extrabold">
              Ready to record your current preference?
            </h2>
            <p className="mt-1 text-xs leading-5 text-white/70">
              Your decision remains separate from admission, course assignment,
              and enrolment.
            </p>
          </div>
          <Button
            type="button"
            onClick={onOpenDecision}
            className="min-h-12 shrink-0 bg-white text-brand-dark shadow-none hover:bg-white/90"
          >
            Open my decision
          </Button>
        </section>
      ) : null}
    </div>
  )
}

function RecommendationComparison({
  courses,
  onBack,
  onExit,
}: {
  courses: readonly StudentRecommendedCourse[]
  onBack: () => void
  onExit: () => void
}) {
  return (
    <div className="w-full pb-8">
      <StudentPageHeader
        title="Compare course options"
        description="Review selected recommendation details side by side."
        onBack={onExit}
        actions={
          <Button type="button" variant="secondary" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
            Back to recommendations
          </Button>
        }
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {courses.map((course) => (
          <article
            key={course.id}
            className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-primary">
                  Rank {course.rank} · {course.code}
                </p>
                <h2 className="mt-1 text-lg font-extrabold">{course.name}</h2>
              </div>
              <StatusBadge
                label={course.eligibility}
                tone={course.eligibility === 'Eligible' ? 'success' : 'warning'}
              />
            </div>

            <dl className="mt-5 space-y-3">
              <ComparisonValue label="Recorded match" value={`${course.match}%`} />
              <ComparisonValue label="Department" value={course.department} />
              <ComparisonValue label="Level" value={course.level} />
              <ComparisonValue label="Duration" value={course.duration} />
              <ComparisonValue
                label="Interest areas"
                value={course.interestAreas.join(', ')}
              />
              <ComparisonValue
                label="Learning areas"
                value={course.learningAreas.join(', ')}
              />
            </dl>
          </article>
        ))}
      </div>

      <section className="mt-4 rounded-2xl bg-canvas-cream p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />
          <div>
            <h2 className="font-extrabold">Compare the complete context</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Match and rank do not replace official course requirements,
              guidance review, or the applicant’s own decision.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function RecommendationCourseDetail({
  course,
  onBack,
  onExit,
  selected,
  onToggleComparison,
}: {
  course: StudentRecommendedCourse
  onBack: () => void
  onExit: () => void
  selected: boolean
  onToggleComparison: () => void
}) {
  return (
    <div className="w-full pb-8">
      <StudentPageHeader
        title={course.name}
        description="Review the course information and recorded recommendation factors."
        onBack={onExit}
        actions={
          <Button type="button" variant="secondary" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
            Back to recommendations
          </Button>
        }
      />

      <section className="mt-4 rounded-2xl bg-brand-dark p-5 text-white shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-soft">
              Rank {course.rank} · {course.code}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">{course.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              {course.summary}
            </p>
          </div>
          <StatusBadge
            label={course.eligibility}
            tone={course.eligibility === 'Eligible' ? 'success' : 'warning'}
            className="shrink-0"
          />
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
        <section className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold">Course overview</h2>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <DetailValue label="Department" value={course.department} />
            <DetailValue label="Program level" value={course.level} />
            <DetailValue label="Duration" value={course.duration} />
            <DetailValue label="Recorded match" value={`${course.match}%`} />
          </dl>
        </section>

        <section className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold">Why this option appears</h2>
          <ul className="mt-5 space-y-3">
            {course.factors.map((factor) => (
              <li
                key={factor}
                className="flex items-start gap-2 rounded-xl bg-secondary/55 p-3 text-sm"
              >
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-success"
                />
                {factor}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold">What you may explore</h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Broad learning areas connected to this course-profile record.
          </p>
          <ul className="mt-5 space-y-3">
            {course.learningAreas.map((area) => (
              <li
                key={area}
                className="flex items-start gap-2 rounded-xl bg-secondary/55 p-3 text-sm"
              >
                <BookOpenCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                {area}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold">Possible career directions</h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            General directions for discussion, not promised employment outcomes.
          </p>
          <ul className="mt-5 space-y-3">
            {course.careerDirections.map((direction) => (
              <li
                key={direction}
                className="flex items-start gap-2 rounded-xl bg-secondary/55 p-3 text-sm"
              >
                <Sparkles
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                {direction}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-4 rounded-2xl bg-canvas-cream p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <Info
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-warning"
          />
          <div>
            <h2 className="font-extrabold">What to review before deciding</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {course.reviewNotes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-4 flex flex-col gap-4 rounded-2xl bg-background p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-extrabold">Compare this option</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Return to the recommendation list to compare up to three courses.
          </p>
        </div>
        <Button
          type="button"
          variant={selected ? 'secondary' : 'default'}
          aria-pressed={selected}
          onClick={onToggleComparison}
        >
          <GitCompareArrows aria-hidden="true" />
          {selected ? 'Selected to compare' : 'Add to comparison'}
        </Button>
      </section>
    </div>
  )
}

function RecommendationProvenance() {
  const snapshot = mockStudentRecommendationSnapshot

  return (
    <section
      aria-labelledby="recommendation-provenance-title"
      className="mt-5 rounded-2xl bg-background p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <FileKey2 aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 id="recommendation-provenance-title" className="text-lg font-extrabold">
            Recommendation provenance
          </h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            References connected to this recorded recommendation result.
          </p>
        </div>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <DetailValue label="Recommendation" value={snapshot.id} />
        <DetailValue
          label="Assessment result"
          value={snapshot.assessmentResultReference}
        />
        <DetailValue label="Catalogue reference" value={snapshot.catalogueReference} />
        <DetailValue label="Rule reference" value={snapshot.ruleReference} />
        <DetailValue label="Generated on" value={snapshot.generatedAt} />
      </dl>
    </section>
  )
}

function ComparisonValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-secondary/55 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-xs font-extrabold">{value}</dd>
    </div>
  )
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/55 p-4">
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-extrabold">{value}</dd>
    </div>
  )
}

export { StudentRecommendationResultsPage }
export type { RecommendationLoadState }
