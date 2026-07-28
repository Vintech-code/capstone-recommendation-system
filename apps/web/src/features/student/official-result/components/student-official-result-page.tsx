import {
  CalendarDays,
  Check,
  ClipboardCheck,
  FileCheck2,
  FileKey2,
  Info,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { StudentPageHeader } from '@/features/student/components/student-page-header'
import { mockStudentOfficialResult } from '@/features/student/official-result/data/mock-student-official-result'

type OfficialResultLoadState = 'ready' | 'loading' | 'error' | 'empty'

interface StudentOfficialResultPageProps {
  onBack: () => void
  initialLoadState?: OfficialResultLoadState
}

function StudentOfficialResultPage({
  onBack,
  initialLoadState = 'ready',
}: StudentOfficialResultPageProps) {
  const [loadState, setLoadState] = useState(initialLoadState)
  const result = mockStudentOfficialResult

  if (loadState === 'loading') {
    return (
      <LoadingState
        title="Loading your official result"
        description="Preparing the verified record available to your account."
      />
    )
  }

  if (loadState === 'error') {
    return (
      <ErrorState
        title="We could not load your result"
        description="Check your connection, then try loading the record again."
        onRetry={() => setLoadState('ready')}
      />
    )
  }

  if (loadState === 'empty') {
    return (
      <EmptyState
        title="No verified result is available"
        description="An official result will appear here after an authorized Admin makes it available to your account."
        icon={ClipboardCheck}
        action={
          <Button type="button" variant="secondary" onClick={onBack}>
            Return to dashboard
          </Button>
        }
      />
    )
  }

  return (
    <div className="w-full pb-8">
      <StudentPageHeader
        title="Official result"
        description="View the verified examination record available to your Student account."
        onBack={onBack}
        actions={<StatusBadge label={result.status} tone="success" />}
      />

      <section
        aria-labelledby="official-result-summary-title"
        className="mt-4 overflow-hidden rounded-2xl bg-brand-dark text-white shadow-sm"
      >
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,.7fr)] lg:items-end">
          <div>
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-brand-soft">
              <FileCheck2 aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-brand-soft">
              Verified examination record
            </p>
            <h2
              id="official-result-summary-title"
              className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl"
            >
              Recorded result: {result.recordedValue}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              This value is shown exactly as it appears in the verified record.
              No pass, fail, eligibility, or admission conclusion is added on
              this page.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <LockKeyhole
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-brand-soft"
              />
              <div>
                <p className="font-extrabold">Read-only record</p>
                <p className="mt-1 text-xs leading-5 text-white/70">
                  Students can view this information but cannot create, edit,
                  verify, or replace an official result.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
        <section
          aria-labelledby="result-details-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <ClipboardCheck aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 id="result-details-title" className="text-lg font-extrabold">
                Record details
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Source and verification information connected to this result.
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <ResultDetail
              icon={FileKey2}
              label="Record reference"
              value={result.reference}
            />
            <ResultDetail
              icon={ClipboardCheck}
              label="Recorded format"
              value={result.recordedFormat}
            />
            <ResultDetail
              icon={CalendarDays}
              label="Examination date"
              value={result.examinationDate}
            />
            <ResultDetail
              icon={ShieldCheck}
              label="Source"
              value={result.source}
            />
            <ResultDetail
              icon={Check}
              label="Verified by"
              value={result.verifiedBy}
            />
            <ResultDetail
              icon={CalendarDays}
              label="Verified on"
              value={result.verifiedAt}
            />
          </dl>
        </section>

        <section
          aria-labelledby="verification-history-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <h2
            id="verification-history-title"
            className="text-lg font-extrabold"
          >
            Verification history
          </h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            A simple view of how this record became available.
          </p>

          <ol className="mt-6 space-y-5">
            {result.timeline.map((event, index) => (
              <li key={event.id} className="relative flex gap-3">
                {index < result.timeline.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-8 h-[calc(100%+0.25rem)] w-px bg-muted"
                  />
                ) : null}
                <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 pt-1">
                  <p className="text-sm font-extrabold">{event.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {event.description}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {event.date}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section
        aria-labelledby="result-guidance-title"
        className="mt-4 rounded-2xl bg-background p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas-cream text-warning">
            <Info aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 id="result-guidance-title" className="text-lg font-extrabold">
              Questions about this record?
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Contact the authorized guidance office through the institution’s
              approved communication channel. This Student page cannot change
              an official result or start a correction.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function ResultDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileKey2
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-secondary/60 p-4">
      <Icon aria-hidden="true" className="size-4 text-primary" />
      <dt className="mt-3 text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-extrabold">{value}</dd>
    </div>
  )
}

export { StudentOfficialResultPage }
export type { OfficialResultLoadState }
