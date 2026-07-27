import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  FileClock,
  Sparkles,
  UserRound,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RecommendationStatusBadge } from '@/features/admin/recommendations/components/recommendation-status-badge'
import { mockRecommendationRuns } from '@/features/admin/recommendations/data/mock-recommendations'

function RecommendationDetailPage({
  recommendationId,
  onBack,
  onOpenApplicant,
}: {
  recommendationId: string
  onBack: () => void
  onOpenApplicant: (id: string) => void
}) {
  const run = mockRecommendationRuns.find((item) => item.id === recommendationId)

  if (!run) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-background p-8 text-center shadow-sm">
        <Sparkles className="mx-auto size-7 text-muted-foreground" />
        <h1 className="mt-5 text-2xl font-extrabold">
          Recommendation not found
        </h1>
        <Button type="button" className="mt-6" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Back to recommendations
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Recommendations
      </Button>

      <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-background p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <Sparkles aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Recommendation run · v{run.version}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">
              {run.id}
            </h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {run.applicantName}
            </p>
          </div>
        </div>
        <RecommendationStatusBadge status={run.status} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,.6fr)]">
        <section className="rounded-2xl bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpenCheck aria-hidden="true" className="size-5 text-primary" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Ranked guidance
              </p>
              <h2 className="mt-1 text-lg font-extrabold">
                Recommended courses
              </h2>
            </div>
          </div>

          <ol className="mt-6 space-y-4">
            {run.matches.map((course, index) => (
              <li key={course.code} className="rounded-2xl bg-secondary/65 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-bold text-muted-foreground">
                          {course.code}
                        </p>
                        <h3 className="mt-1 font-extrabold">{course.name}</h3>
                      </div>
                      <Badge variant="secondary" className="border-0 bg-background">
                        {course.eligibility}
                      </Badge>
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <div
                        role="progressbar"
                        aria-label={`${course.name} match`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={course.match}
                        className="h-2 flex-1 overflow-hidden rounded-full bg-background"
                      >
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${course.match}%` }}
                        />
                      </div>
                      <span className="text-sm font-extrabold">
                        {course.match}%
                      </span>
                    </div>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {course.reasons.map((reason) => (
                        <li
                          key={reason}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2
                            aria-hidden="true"
                            className="size-4 text-success"
                          />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <h2 className="font-extrabold">Applicant</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserRound aria-hidden="true" className="size-4" />
                  Applicant reference
                </dt>
                <dd className="mt-2 font-mono font-semibold">
                  {run.applicantId}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileClock aria-hidden="true" className="size-4" />
                  Generated
                </dt>
                <dd className="mt-2 font-semibold">
                  <time dateTime={run.generatedAt}>{run.generatedLabel}</time>
                </dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="secondary"
              className="mt-6 w-full"
              onClick={() => onOpenApplicant(run.applicantId)}
            >
              Open applicant record
            </Button>
          </section>

          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <h2 className="font-extrabold">Input snapshot</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Assessment</dt>
                <dd className="mt-1 font-mono font-semibold">
                  {run.assessmentVersion}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Official result
                </dt>
                <dd className="mt-1 font-mono font-semibold">
                  {run.resultVersion}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Rule version</dt>
                <dd className="mt-1 font-mono font-semibold">
                  {run.ruleVersion}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}

export { RecommendationDetailPage }
