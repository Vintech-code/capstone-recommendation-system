import {
  ArrowLeft,
  ClipboardCheck,
  FileClock,
  Gauge,
  History,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ResultStateBadge } from '@/features/admin/official-results/components/result-state-badge'
import {
  getMockResultHistory,
  mockOfficialResults,
} from '@/features/admin/official-results/data/mock-official-results'

interface OfficialResultDetailPageProps {
  resultId: string
  onBack: () => void
  onOpenApplicant: (applicantId: string) => void
}

function OfficialResultDetailPage({
  resultId,
  onBack,
  onOpenApplicant,
}: OfficialResultDetailPageProps) {
  const result = mockOfficialResults.find((record) => record.id === resultId)

  if (!result) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-background p-8 text-center shadow-sm">
          <ClipboardCheck
            aria-hidden="true"
            className="mx-auto size-7 text-muted-foreground"
          />
          <h1 className="mt-5 text-2xl font-extrabold">Result not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Return to the result list and select another record.
          </p>
          <Button type="button" onClick={onBack} className="mt-6">
            <ArrowLeft aria-hidden="true" />
            Back to official results
          </Button>
        </div>
      </div>
    )
  }

  const history = getMockResultHistory(result)

  return (
    <div className="mx-auto max-w-[90rem]">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Official results
      </Button>

      <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-background p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <ClipboardCheck aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Official result record
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">
              {result.id}
            </h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {result.applicantName}
            </p>
          </div>
        </div>
        <ResultStateBadge state={result.reviewState} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]">
        <div className="space-y-5">
          <section
            aria-labelledby="result-overview-title"
            className="rounded-2xl bg-background p-6 shadow-sm"
          >
            <h2 id="result-overview-title" className="text-lg font-extrabold">
              Record overview
            </h2>
            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <UserRound aria-hidden="true" className="size-4" />
                  Applicant reference
                </dt>
                <dd className="mt-2 font-mono font-semibold">
                  {result.applicantId}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted-foreground">
                  Record source
                </dt>
                <dd className="mt-2 font-semibold">{result.source}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted-foreground">
                  Current version
                </dt>
                <dd className="mt-2 font-semibold">v{result.version}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <FileClock aria-hidden="true" className="size-4" />
                  Last updated
                </dt>
                <dd className="mt-2 font-semibold">
                  <time dateTime={result.updatedAt}>
                    {result.updatedLabel}
                  </time>
                </dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenApplicant(result.applicantId)}
              className="mt-6 w-full"
            >
              Open applicant record
            </Button>
          </section>

          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Gauge aria-hidden="true" className="size-5 text-primary" />
              <h2 className="font-extrabold">Recorded score</h2>
            </div>
            <p className="mt-5 text-4xl font-extrabold tracking-[-0.04em]">
              {result.scoreDisplay}
            </p>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {result.scaleLabel}
            </p>
          </section>
        </div>

        <section
          aria-labelledby="version-history-title"
          className="rounded-2xl bg-background p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <History aria-hidden="true" className="size-4.5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Immutable record
              </p>
              <h2 id="version-history-title" className="mt-1 font-extrabold">
                Version history
              </h2>
            </div>
          </div>

          <ol className="mt-8 space-y-4">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="rounded-2xl bg-secondary/65 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{entry.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {entry.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-bold">
                    v{entry.version}
                  </span>
                </div>
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

export { OfficialResultDetailPage }
