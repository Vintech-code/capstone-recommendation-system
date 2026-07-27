import { ArrowRight, CalendarClock, ClipboardList } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AssessmentStateBadge } from '@/features/admin/assessments/components/assessment-state-badge'
import type { MockAssessmentSession } from '@/features/admin/assessments/data/mock-assessments'

function AssessmentSessionCard({
  session,
  onOpen,
}: {
  session: MockAssessmentSession
  onOpen: (id: string) => void
}) {
  const progress = Math.round(
    (session.answeredItems / session.totalItems) * 100,
  )

  return (
    <article className="rounded-2xl bg-background p-5 shadow-sm">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <ClipboardList aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold leading-6">
              {session.applicantName}
            </h3>
            <p className="mt-1 whitespace-nowrap font-mono text-xs text-muted-foreground">
              {session.id} / {session.applicantId}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <AssessmentStateBadge state={session.state} />
        </div>
      </header>

      <section className="mt-6" aria-label="Response progress">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-muted-foreground">
            Response progress
          </p>
          <span className="text-xs font-extrabold">{progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${session.applicantName} response progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {session.answeredItems} of {session.totalItems} answered
        </p>
      </section>

      <footer className="mt-5 flex flex-col gap-4 rounded-xl bg-secondary/65 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <CalendarClock aria-hidden="true" className="size-4 shrink-0" />
            Last activity
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm font-semibold">
              <time dateTime={session.updatedAt}>{session.updatedLabel}</time>
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {session.questionnaireVersion}
            </p>
          </div>
        </div>

        <Button
          type="button"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => onOpen(session.id)}
        >
          Open session
          <ArrowRight aria-hidden="true" />
        </Button>
      </footer>
    </article>
  )
}

export { AssessmentSessionCard }
