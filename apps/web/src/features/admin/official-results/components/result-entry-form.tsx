import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, FileKey2, Gauge, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { mockApplicants } from '@/features/admin/applicants/data/mock-applicants'
import {
  resultEntrySchema,
  type ResultEntryFields,
} from '@/features/admin/official-results/schemas/result-entry-schema'

interface ResultEntryFormProps {
  initialValues?: ResultEntryFields
  onCancel: () => void
  onReview: (values: ResultEntryFields) => void
}

const emptyResultEntry: ResultEntryFields = {
  applicantId: '',
  examReference: '',
  scoreValue: '',
  scoreFormat: '',
  examinationDate: '',
  sourceNote: '',
}

function ResultEntryForm({
  initialValues,
  onCancel,
  onReview,
}: ResultEntryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResultEntryFields>({
    resolver: zodResolver(resultEntrySchema),
    defaultValues: initialValues ?? emptyResultEntry,
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onReview)}
      aria-labelledby="result-entry-form-title"
      className="rounded-2xl bg-background p-6 shadow-sm sm:p-8"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
          Manual source
        </p>
        <h2
          id="result-entry-form-title"
          className="mt-2 text-xl font-extrabold"
        >
          Result details
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter the source values exactly as they appear, then review the
          complete record before adding it to the verification queue.
        </p>
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <FormField className="sm:col-span-2">
          <Label htmlFor="applicant-id">Applicant</Label>
          <div className="relative">
            <UserRound
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <select
              id="applicant-id"
              aria-invalid={Boolean(errors.applicantId)}
              aria-describedby={
                errors.applicantId ? 'applicant-id-error' : undefined
              }
              className="h-12 w-full rounded-s border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary/55"
              {...register('applicantId')}
            >
              <option value="">Select an applicant</option>
              {mockApplicants.map((applicant) => (
                <option key={applicant.id} value={applicant.id}>
                  {applicant.name} — {applicant.id}
                </option>
              ))}
            </select>
          </div>
          <FieldError id="applicant-id-error" message={errors.applicantId?.message} />
        </FormField>

        <FormField>
          <Label htmlFor="exam-reference">Examination reference</Label>
          <div className="relative">
            <FileKey2
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="exam-reference"
              placeholder="Enter source reference"
              className="pl-10"
              aria-invalid={Boolean(errors.examReference)}
              aria-describedby={
                errors.examReference ? 'exam-reference-error' : undefined
              }
              {...register('examReference')}
            />
          </div>
          <FieldError
            id="exam-reference-error"
            message={errors.examReference?.message}
          />
        </FormField>

        <FormField>
          <Label htmlFor="examination-date">Examination date</Label>
          <div className="relative">
            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="examination-date"
              type="date"
              className="pl-10"
              aria-invalid={Boolean(errors.examinationDate)}
              aria-describedby={
                errors.examinationDate
                  ? 'examination-date-error'
                  : undefined
              }
              {...register('examinationDate')}
            />
          </div>
          <FieldError
            id="examination-date-error"
            message={errors.examinationDate?.message}
          />
        </FormField>

        <FormField>
          <Label htmlFor="score-value">Recorded result value</Label>
          <div className="relative">
            <Gauge
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="score-value"
              inputMode="decimal"
              placeholder="Enter result value"
              className="pl-10"
              aria-invalid={Boolean(errors.scoreValue)}
              aria-describedby={
                errors.scoreValue ? 'score-value-error' : undefined
              }
              {...register('scoreValue')}
            />
          </div>
          <FieldError
            id="score-value-error"
            message={errors.scoreValue?.message}
          />
        </FormField>

        <FormField>
          <Label htmlFor="score-format">Score format or scale</Label>
          <Input
            id="score-format"
            placeholder="Describe the source format"
            aria-invalid={Boolean(errors.scoreFormat)}
            aria-describedby={
              errors.scoreFormat ? 'score-format-error' : undefined
            }
            {...register('scoreFormat')}
          />
          <FieldError
            id="score-format-error"
            message={errors.scoreFormat?.message}
          />
        </FormField>

        <FormField className="sm:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="source-note">Source note</Label>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>
          <Textarea
            id="source-note"
            placeholder="Add a short provenance or handling note"
            aria-invalid={Boolean(errors.sourceNote)}
            aria-describedby={
              errors.sourceNote ? 'source-note-error' : 'source-note-help'
            }
            {...register('sourceNote')}
          />
          <p id="source-note-help" className="text-xs text-muted-foreground">
            Do not include passwords, credentials, or unrelated personal data.
          </p>
          <FieldError
            id="source-note-error"
            message={errors.sourceNote?.message}
          />
        </FormField>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Review result</Button>
      </div>
    </form>
  )
}

function FormField({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`space-y-2 ${className}`}>{children}</div>
}

function FieldError({
  id,
  message,
}: {
  id: string
  message?: string
}) {
  return message ? (
    <p id={id} className="text-xs font-semibold text-destructive">
      {message}
    </p>
  ) : null
}

export { ResultEntryForm }
