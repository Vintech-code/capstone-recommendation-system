import { ArrowLeft, Check, ClipboardCheck, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { mockApplicants } from '@/features/admin/applicants/data/mock-applicants'
import type { ResultEntryFields } from '@/features/admin/official-results/schemas/result-entry-schema'

interface ResultEntryReviewProps {
  values: ResultEntryFields
  onBack: () => void
  onConfirm: () => void
}

function ResultEntryReview({
  values,
  onBack,
  onConfirm,
}: ResultEntryReviewProps) {
  const applicant = mockApplicants.find(
    (record) => record.id === values.applicantId,
  )

  const details = [
    ['Applicant', applicant?.name ?? values.applicantId],
    ['Applicant reference', values.applicantId],
    ['Examination reference', values.examReference],
    ['Examination date', values.examinationDate],
    ['Recorded result', values.scoreValue],
    ['Score format or scale', values.scoreFormat],
    ['Record source', 'Manual encoding'],
    ['Initial review state', 'Verification review'],
  ]

  return (
    <section
      aria-labelledby="result-review-title"
      className="rounded-2xl bg-background p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
            Review
          </p>
          <h2 id="result-review-title" className="mt-2 text-xl font-extrabold">
            Confirm result details
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Compare this summary with the source record before continuing.
          </p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
          <ClipboardCheck aria-hidden="true" className="size-5" />
        </span>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-secondary/65 p-4">
            <dt className="text-xs font-semibold text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-2 break-words text-sm font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      {values.sourceNote ? (
        <div className="mt-4 rounded-xl bg-secondary/65 p-4">
          <p className="text-xs font-semibold text-muted-foreground">
            Source note
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
            {values.sourceNote}
          </p>
        </div>
      ) : null}

      <div className="mt-7 flex items-start gap-3 rounded-xl bg-primary/6 p-4">
        <UserRound
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-primary"
        />
        <p className="text-sm leading-6 text-muted-foreground">
          Continuing adds this record to the verification workflow. It does not
          mark the result as verified.
        </p>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Edit details
        </Button>
        <Button type="button" onClick={onConfirm}>
          <Check aria-hidden="true" />
          Add to review queue
        </Button>
      </div>
    </section>
  )
}

export { ResultEntryReview }
