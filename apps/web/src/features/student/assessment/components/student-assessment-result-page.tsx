import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  FileKey2,
  Info,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { AssessmentDimensionChart } from '@/features/student/assessment/components/assessment-dimension-chart'
import { mockAssessmentResult } from '@/features/student/assessment/data/mock-assessment-result'
import { StudentPageHeader } from '@/features/student/components/student-page-header'

type AssessmentResultLoadState =
  | 'ready'
  | 'loading'
  | 'error'
  | 'empty'
  | 'pending'

interface StudentAssessmentResultPageProps {
  onBack: () => void
  onOpenRecommendations?: () => void
  initialLoadState?: AssessmentResultLoadState
}

function StudentAssessmentResultPage({
  onBack,
  onOpenRecommendations,
  initialLoadState = 'ready',
}: StudentAssessmentResultPageProps) {
  const [loadState, setLoadState] = useState(initialLoadState)
  const result = mockAssessmentResult

  if (loadState === 'loading') {
    return (
      <LoadingState
        title="Loading your assessment result"
        description="Preparing the recorded result available to your account."
      />
    )
  }

  if (loadState === 'error') {
    return (
      <ErrorState
        title="We could not load your result"
        description="Your submitted responses were not changed. Try loading the result again."
        onRetry={() => setLoadState('ready')}
      />
    )
  }

  if (loadState === 'empty') {
    return (
      <EmptyState
        title="No submitted assessment was found"
        description="A result can appear only after an assessment session has been submitted."
        icon={ClipboardCheck}
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
          title="Assessment result"
          description="Check the availability of your submitted assessment result."
          onBack={onBack}
          actions={<StatusBadge label="Preparing" tone="info" />}
        />
        <EmptyState
          className="mt-4"
          title="Your result is being prepared"
          description="Your assessment is submitted and locked. The result will appear here when it becomes available."
          icon={BarChart3}
          action={
            <Button type="button" variant="secondary" onClick={onBack}>
              Return to dashboard
            </Button>
          }
        />
      </div>
    )
  }

  const leadingDimensions = result.dimensions
    .filter((dimension) =>
      result.topLabels.some((label) => label === dimension.label),
    )
    .sort((first, second) => second.value - first.value)

  return (
    <div className="w-full pb-8">
      <StudentPageHeader
        title="Assessment result"
        description="Review the recorded interest pattern connected to your submitted session."
        onBack={onBack}
        actions={<StatusBadge label={result.status} tone="success" />}
      />

      <section
        aria-labelledby="assessment-result-summary-title"
        className="relative mt-4 overflow-hidden rounded-2xl bg-brand-dark p-5 text-white shadow-sm sm:p-7"
      >
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 size-72 rounded-full bg-primary/40 blur-3xl"
        />
        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,.8fr)] lg:items-end">
          <div>
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-brand-soft">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-brand-soft">
              Top interest code
            </p>
            <h2
              id="assessment-result-summary-title"
              className="mt-2 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl"
            >
              {result.topCode}
            </h2>
            <p className="mt-3 text-lg font-bold">
              {result.topLabels.join(' • ')}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              These are the two highest recorded dimensions in this result.
              Review all six dimensions below for the complete pattern.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <LockKeyhole
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-brand-soft"
              />
              <div>
                <p className="font-extrabold">Read-only result</p>
                <p className="mt-1 text-xs leading-5 text-white/70">
                  This result is linked to a submitted assessment session and
                  cannot be changed from the Student workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
        <section
          aria-labelledby="dimension-results-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <BarChart3 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 id="dimension-results-title" className="text-lg font-extrabold">
                Six-dimension overview
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Each value is shown with a label and number, not colour alone.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <AssessmentDimensionChart dimensions={result.dimensions} />
          </div>
        </section>

        <aside className="space-y-4">
          <section
            aria-labelledby="leading-dimensions-title"
            className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
          >
            <h2 id="leading-dimensions-title" className="text-lg font-extrabold">
              Leading dimensions
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              The highest values recorded in this result.
            </p>
            <ol className="mt-5 space-y-3">
              {leadingDimensions.map((dimension, index) => (
                <li
                  key={dimension.code}
                  className="flex items-center gap-3 rounded-xl bg-secondary/55 p-4"
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${dimension.surfaceClass}`}
                  >
                    {dimension.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-muted-foreground">
                      {index === 0 ? 'Highest recorded' : 'Second highest'}
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {dimension.label}
                    </p>
                  </div>
                  <span className="text-lg font-extrabold">
                    {dimension.value}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="result-boundary-title"
            className="rounded-2xl bg-canvas-cream p-5 shadow-sm sm:p-6"
          >
            <ShieldCheck aria-hidden="true" className="size-5 text-warning" />
            <h2 id="result-boundary-title" className="mt-4 font-extrabold">
              Guidance boundary
            </h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              This result supports course-guidance discussion. It is not a
              diagnosis, admission decision, enrolment action, or guarantee of
              a course outcome.
            </p>
          </section>
        </aside>
      </div>

      <section
        aria-labelledby="result-provenance-title"
        className="mt-4 rounded-2xl bg-background p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <FileKey2 aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 id="result-provenance-title" className="text-lg font-extrabold">
              Result provenance
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              References connecting this result to its submitted session.
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ResultReference
            icon={FileKey2}
            label="Result reference"
            value={result.id}
          />
          <ResultReference
            icon={ClipboardCheck}
            label="Session reference"
            value={result.sessionReference}
          />
          <ResultReference
            icon={ShieldCheck}
            label="Assessment version"
            value={result.assessmentVersion}
          />
          <ResultReference
            icon={CalendarDays}
            label="Available on"
            value={result.availableAt}
          />
        </dl>
      </section>

      <section
        aria-labelledby="reading-result-title"
        className="mt-4 rounded-2xl bg-background p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas-cream text-warning">
            <Info aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 id="reading-result-title" className="text-lg font-extrabold">
              Reading this result
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Consider the complete six-dimension pattern instead of treating
              one value as a final answer. Course options, requirements, and
              guidance explanations remain separate from this assessment
              result.
            </p>
          </div>
        </div>
        {onOpenRecommendations ? (
          <Button
            type="button"
            onClick={onOpenRecommendations}
            className="mt-5 min-h-12 w-full sm:w-auto"
          >
            View course guidance
            <ArrowRight aria-hidden="true" />
          </Button>
        ) : null}
      </section>
    </div>
  )
}

function ResultReference({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileKey2
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-secondary/55 p-4">
      <Icon aria-hidden="true" className="size-4 text-primary" />
      <dt className="mt-3 text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-extrabold">{value}</dd>
    </div>
  )
}

export { StudentAssessmentResultPage }
export type { AssessmentResultLoadState }
