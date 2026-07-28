import {
  ArrowLeft,
  ClipboardList,
  FileClock,
  History,
  ListChecks,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AssessmentStateBadge } from '@/features/admin/assessments/components/assessment-state-badge'
import {
  getMockAssessmentHistory,
  mockAssessmentSessions,
} from '@/features/admin/assessments/data/mock-assessments'

interface AssessmentDetailPageProps {
  assessmentId: string
  onBack: () => void
  onOpenApplicant: (applicantId: string) => void
}

function AssessmentDetailPage({
  assessmentId,
  onBack,
  onOpenApplicant,
}: AssessmentDetailPageProps) {
  const session = mockAssessmentSessions.find(
    (record) => record.id === assessmentId,
  )

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-background p-8 text-center shadow-sm">
          <ClipboardList
            aria-hidden="true"
            className="mx-auto size-7 text-muted-foreground"
          />
          <h1 className="mt-5 text-2xl font-extrabold">Session not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Return to the assessment list and select another session.
          </p>
          <Button type="button" onClick={onBack} className="mt-6">
            <ArrowLeft aria-hidden="true" />
            Back to assessments
          </Button>
        </div>
      </div>
    )
  }

  const history = getMockAssessmentHistory(session)

  return (
    <div className="w-full">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Assessments
      </Button>

      <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-background p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <ClipboardList aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Assessment session
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">
              {session.id}
            </h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {session.applicantName}
            </p>
          </div>
        </div>
        <AssessmentStateBadge state={session.state} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]">
        <div className="space-y-5">
          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <h2 className="text-lg font-extrabold">Session overview</h2>
            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <UserRound aria-hidden="true" className="size-4" />
                  Applicant reference
                </dt>
                <dd className="mt-2 font-mono font-semibold">
                  {session.applicantId}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted-foreground">
                  Questionnaire version
                </dt>
                <dd className="mt-2 font-mono font-semibold">
                  {session.questionnaireVersion}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <FileClock aria-hidden="true" className="size-4" />
                  Last updated
                </dt>
                <dd className="mt-2 font-semibold">
                  <time dateTime={session.updatedAt}>
                    {session.updatedLabel}
                  </time>
                </dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenApplicant(session.applicantId)}
              className="mt-6 w-full"
            >
              Open applicant record
            </Button>
          </section>

          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ListChecks aria-hidden="true" className="size-5 text-primary" />
              <h2 className="font-extrabold">Response progress</h2>
            </div>
            <div className="mt-5 flex items-end justify-between gap-4">
              <p className="text-3xl font-extrabold">
                {session.answeredItems}
                <span className="text-base text-muted-foreground">
                  {' '}
                  / {session.totalItems}
                </span>
              </p>
              <p className="text-sm font-semibold text-muted-foreground">
                {Math.round(
                  (session.answeredItems / session.totalItems) * 100,
                )}
                % complete
              </p>
            </div>
            <div
              role="progressbar"
              aria-label="Assessment response progress"
              aria-valuemin={0}
              aria-valuemax={session.totalItems}
              aria-valuenow={session.answeredItems}
              className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${(session.answeredItems / session.totalItems) * 100}%`,
                }}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {session.state === 'Submitted'
                ? 'All responses were recorded with this submitted session.'
                : 'The student can continue this saved assessment session.'}
            </p>
          </section>
        </div>

        <section className="rounded-2xl bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <History aria-hidden="true" className="size-4.5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Session record
              </p>
              <h2 className="mt-1 font-extrabold">Session history</h2>
            </div>
          </div>

          <ol className="mt-8 space-y-4">
            {history.map((entry) => (
              <li key={entry.id} className="rounded-2xl bg-secondary/65 p-5">
                <h3 className="font-bold">{entry.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {entry.description}
                </p>
                <time
                  dateTime={entry.occurredAt}
                  className="mt-4 block text-xs font-semibold text-muted-foreground"
                >
                  {entry.occurredLabel}
                </time>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

export { AssessmentDetailPage }
