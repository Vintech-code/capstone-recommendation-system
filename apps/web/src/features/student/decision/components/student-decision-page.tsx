import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  FileText,
  History,
  Info,
  Pencil,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import {
  ConfirmActionDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StudentPageHeader } from '@/features/student/components/student-page-header'
import {
  mockStudentDecision,
  studentDecisionOptions,
  type StudentDecisionRecord,
  type StudentDecisionValue,
} from '@/features/student/decision/data/mock-student-decision'
import {
  studentDecisionSchema,
  type StudentDecisionFormValues,
} from '@/features/student/decision/schemas/student-decision-schema'
import { mockStudentRecommendationSnapshot } from '@/features/student/recommendations/data/mock-student-recommendations'
import { cn } from '@/lib/utils'

type StudentDecisionLoadState = 'ready' | 'loading' | 'error' | 'empty'

interface StudentDecisionPageProps {
  onBack: () => void
  onOpenGuidance: () => void
  onOpenReport: () => void
  initialLoadState?: StudentDecisionLoadState
}

const decisionLabels: Record<StudentDecisionValue, string> = {
  prefer: 'Preferred course',
  undecided: 'Still deciding',
  decline: 'Not preferred',
  other: 'Other response',
}

function StudentDecisionPage({
  onBack,
  onOpenGuidance,
  onOpenReport,
  initialLoadState = 'ready',
}: StudentDecisionPageProps) {
  const [loadState, setLoadState] = useState(initialLoadState)
  const [record, setRecord] = useState<StudentDecisionRecord>(
    mockStudentDecision,
  )
  const [editing, setEditing] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [pendingValues, setPendingValues] =
    useState<StudentDecisionFormValues>()
  const form = useForm<StudentDecisionFormValues>({
    resolver: zodResolver(studentDecisionSchema),
    defaultValues: {
      courseId: record.courseId,
      decision: record.decision,
      note: record.note,
    },
  })
  const selectedDecision = useWatch({
    control: form.control,
    name: 'decision',
  })
  const selectedCourseId = useWatch({
    control: form.control,
    name: 'courseId',
  })
  const decisionNote = useWatch({
    control: form.control,
    name: 'note',
  })
  const selectedCourse = mockStudentRecommendationSnapshot.courses.find(
    (course) => course.id === selectedCourseId,
  )

  if (loadState === 'loading') {
    return (
      <LoadingState
        title="Loading your decision"
        description="Preparing the preference recorded for your recommendation."
      />
    )
  }

  if (loadState === 'error') {
    return (
      <ErrorState
        title="We could not load your decision"
        description="Your recorded preference was not changed. Try loading it again."
        onRetry={() => setLoadState('ready')}
      />
    )
  }

  if (loadState === 'empty') {
    return (
      <EmptyState
        title="No recommendation is available for a decision"
        description="Review your course guidance when a recommendation result becomes available."
        icon={BookOpenCheck}
        action={
          <Button type="button" onClick={onOpenGuidance}>
            Open course guidance
          </Button>
        }
      />
    )
  }

  async function saveDecision() {
    if (!pendingValues) return

    const course = mockStudentRecommendationSnapshot.courses.find(
      (item) => item.id === pendingValues.courseId,
    )
    if (!course) return

    await new Promise((resolve) => window.setTimeout(resolve, 250))
    setRecord((current) => ({
      ...current,
      courseId: pendingValues.courseId,
      decision: pendingValues.decision,
      note: pendingValues.note,
      updatedAt: 'Just now',
      history: [
        {
          id: `DEC-HIS-${current.history.length + 1}`,
          decision: pendingValues.decision,
          courseName: course.name,
          note: pendingValues.note,
          recordedAt: 'Just now',
        },
        ...current.history,
      ],
    }))
    setEditing(false)
    setPendingValues(undefined)
    toast.success('Your decision was recorded.')
  }

  function beginEditing() {
    form.reset({
      courseId: record.courseId,
      decision: record.decision,
      note: record.note,
    })
    setEditing(true)
  }

  return (
    <div className="w-full pb-24 sm:pb-8">
      <StudentPageHeader
        title="My decision"
        description="Record your current course preference and revise it when needed."
        onBack={onBack}
        actions={
          <StatusBadge
            label={decisionLabels[record.decision]}
            tone={record.decision === 'prefer' ? 'success' : 'info'}
          />
        }
      />

      <section className="mt-4 rounded-2xl bg-brand-dark p-5 text-white shadow-sm sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.55fr)] lg:items-end">
          <div>
            <ShieldCheck aria-hidden="true" className="size-6 text-brand-soft" />
            <h2 className="mt-5 text-2xl font-extrabold">
              Your preference stays separate from enrolment.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Recording a decision helps guidance review. It does not submit an
              application, reserve a slot, assign a course, or enrol you.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-bold text-white/60">
              Recommendation reference
            </p>
            <p className="mt-2 font-mono text-sm font-extrabold">
              {record.recommendationReference}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)]">
        <section className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                Current preference
              </p>
              <h2 className="mt-1 text-xl font-extrabold">
                {editing ? 'Update your decision' : decisionLabels[record.decision]}
              </h2>
            </div>
            {!editing ? (
              <Button type="button" variant="secondary" onClick={beginEditing}>
                <Pencil aria-hidden="true" />
                Edit decision
              </Button>
            ) : null}
          </div>

          {editing ? (
            <form
              className="mt-6 space-y-6"
              onSubmit={form.handleSubmit((values) => {
                setPendingValues(values)
                setConfirmationOpen(true)
              })}
              noValidate
            >
              <div>
                <Label htmlFor="decision-course">Course under review</Label>
                <select
                  id="decision-course"
                  {...form.register('courseId')}
                  aria-invalid={Boolean(form.formState.errors.courseId)}
                  className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:text-sm"
                >
                  {mockStudentRecommendationSnapshot.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.courseId ? (
                  <p className="mt-2 text-xs font-semibold text-destructive">
                    {form.formState.errors.courseId.message}
                  </p>
                ) : null}
              </div>

              <fieldset>
                <legend className="text-sm font-bold">
                  Current decision
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {studentDecisionOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex min-h-24 cursor-pointer items-start gap-3 rounded-xl bg-secondary/55 p-4 shadow-sm transition-colors',
                        selectedDecision === option.value && 'bg-primary/10',
                      )}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...form.register('decision')}
                        className="mt-1 size-4 accent-primary"
                      />
                      <span>
                        <span className="block text-sm font-extrabold">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {form.formState.errors.decision ? (
                  <p className="mt-2 text-xs font-semibold text-destructive">
                    {form.formState.errors.decision.message}
                  </p>
                ) : null}
              </fieldset>

              <div>
                <Label htmlFor="decision-note">Decision note</Label>
                <Textarea
                  id="decision-note"
                  {...form.register('note')}
                  aria-invalid={Boolean(form.formState.errors.note)}
                  className="mt-2 min-h-32 text-base sm:text-sm"
                  placeholder="Add context for your current preference."
                />
                <div className="mt-2 flex items-start justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    Explain what you want to review or discuss.
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {decisionNote.length}/500
                  </span>
                </div>
                {form.formState.errors.note ? (
                  <p className="mt-2 text-xs font-semibold text-destructive">
                    {form.formState.errors.note.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditing(false)}
                  className="min-h-12"
                >
                  Cancel
                </Button>
                <Button type="submit" className="min-h-12">
                  <Save aria-hidden="true" />
                  Review decision
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <DecisionValue
                label="Course under review"
                value={
                  mockStudentRecommendationSnapshot.courses.find(
                    (course) => course.id === record.courseId,
                  )?.name ?? 'Course unavailable'
                }
              />
              <DecisionValue
                label="Decision"
                value={decisionLabels[record.decision]}
              />
              <DecisionValue label="Last updated" value={record.updatedAt} />
              <DecisionValue label="Decision reference" value={record.id} />
              <div className="rounded-xl bg-secondary/55 p-4 sm:col-span-2">
                <p className="text-xs font-bold text-muted-foreground">Note</p>
                <p className="mt-2 text-sm leading-6">{record.note}</p>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-background p-5 shadow-sm">
            <h2 className="text-lg font-extrabold">Continue reviewing</h2>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              Revisit course guidance or open the report connected to this
              recommendation.
            </p>
            <div className="mt-5 grid gap-2">
              <Button type="button" onClick={onOpenGuidance}>
                Review course guidance
                <ArrowRight aria-hidden="true" />
              </Button>
              <Button type="button" variant="secondary" onClick={onOpenReport}>
                <FileText aria-hidden="true" />
                Open my report
              </Button>
            </div>
          </section>

          <section className="rounded-2xl bg-canvas-cream p-5 shadow-sm">
            <Info aria-hidden="true" className="size-5 text-warning" />
            <h2 className="mt-4 font-extrabold">You can revise this</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              The interface keeps a visible local history whenever you record
              another preference.
            </p>
          </section>
        </aside>
      </div>

      <section className="mt-4 rounded-2xl bg-background p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <History aria-hidden="true" className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-extrabold">Decision history</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Earlier recorded preferences remain visible.
            </p>
          </div>
        </div>
        <ol className="mt-5 space-y-3">
          {record.history.map((entry) => (
            <li
              key={entry.id}
              className="grid gap-3 rounded-xl bg-secondary/55 p-4 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={decisionLabels[entry.decision]}
                    tone={entry.decision === 'prefer' ? 'success' : 'info'}
                  />
                  <span className="text-sm font-extrabold">
                    {entry.courseName}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {entry.note}
                </p>
              </div>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays aria-hidden="true" className="size-4" />
                {entry.recordedAt}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <ConfirmActionDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        title="Record this decision?"
        description={`Save “${pendingValues ? decisionLabels[pendingValues.decision] : ''}” for ${selectedCourse?.name ?? 'the selected course'}? This records a preference only and does not enrol you.`}
        confirmLabel="Record decision"
        onConfirm={saveDecision}
      />
    </div>
  )
}

function DecisionValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/55 p-4">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-extrabold">{value}</p>
    </div>
  )
}

export { StudentDecisionPage }
export type { StudentDecisionLoadState }
