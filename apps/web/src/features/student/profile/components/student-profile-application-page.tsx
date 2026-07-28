import { zodResolver } from '@hookform/resolvers/zod'
import {
  Check,
  ClipboardCheck,
  FileText,
  LoaderCircle,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
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
import { StudentPageHeader } from '@/features/student/components/student-page-header'
import {
  mockStudentApplication,
  mockStudentProfile,
} from '@/features/student/profile/data/mock-student-profile'
import { StudentProfileForm } from '@/features/student/profile/components/student-profile-form'
import {
  studentProfileSchema,
  type StudentProfileFields,
} from '@/features/student/profile/schemas/student-profile-schema'

type ProfileLoadState = 'ready' | 'loading' | 'error' | 'empty'

interface StudentProfileApplicationPageProps {
  onBack: () => void
  initialLoadState?: ProfileLoadState
}

const completionKeys: Array<keyof StudentProfileFields> = [
  'fullName',
  'contactEmail',
  'mobileNumber',
  'currentSchool',
  'currentLevel',
  'trackOrStrand',
  'homeAddress',
]

function StudentProfileApplicationPage({
  onBack,
  initialLoadState = 'ready',
}: StudentProfileApplicationPageProps) {
  const [loadState, setLoadState] = useState(initialLoadState)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<
    'Draft' | 'Submitted'
  >('Draft')
  const [declarationAccepted, setDeclarationAccepted] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)

  const form = useForm<StudentProfileFields>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: mockStudentProfile,
    mode: 'onBlur',
  })
  const { isDirty } = form.formState
  const values = useWatch({ control: form.control })
  const completion = useMemo(() => {
    const completeFields = completionKeys.filter((key) =>
      String(values[key] ?? '').trim(),
    ).length

    return Math.round((completeFields / completionKeys.length) * 100)
  }, [values])
  const profileComplete = completion === 100

  function handleBack() {
    if (isDirty) {
      setDiscardDialogOpen(true)
      return
    }
    onBack()
  }

  async function saveProfile(fields: StudentProfileFields) {
    setIsSaving(true)
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    form.reset(fields)
    setIsSaving(false)
    setIsEditing(false)
    toast.success('Profile changes saved')
  }

  async function submitApplication() {
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    setApplicationStatus('Submitted')
    toast.success('Application submitted for review')
  }

  if (loadState === 'loading') {
    return (
      <LoadingState
        title="Loading your profile"
        description="Preparing your saved profile and application information."
      />
    )
  }

  if (loadState === 'error') {
    return (
      <ErrorState
        title="We could not load your profile"
        description="Check your connection, then try loading your information again."
        onRetry={() => setLoadState('ready')}
      />
    )
  }

  if (loadState === 'empty') {
    return (
      <EmptyState
        title="No application is available"
        description="Your account does not have an application workspace to display."
        icon={FileText}
        action={
          <Button type="button" variant="secondary" onClick={onBack}>
            Return to dashboard
          </Button>
        }
      />
    )
  }

  return (
    <div className="w-full pb-24 sm:pb-8">
      <StudentPageHeader
        title="Profile & application"
        description="Keep your contact and education details readable and review your application before submitting it."
        onBack={handleBack}
        actions={
          <StatusBadge
            label={applicationStatus}
            tone={applicationStatus === 'Submitted' ? 'success' : 'warning'}
          />
        }
      />

      <section
        aria-labelledby="profile-progress-title"
        className="mt-5 rounded-2xl bg-brand-dark p-5 text-white shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-soft">
            <ClipboardCheck aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="profile-progress-title" className="font-extrabold">
                Profile completion
              </h2>
              <span className="text-sm font-extrabold">{completion}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Profile completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completion}
              className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"
            >
              <div
                className="h-full rounded-full bg-brand-soft transition-[width]"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/70">
              {profileComplete
                ? 'Your profile has the information needed for this sample application.'
                : 'Complete the missing profile information before reviewing submission.'}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,.6fr)]">
        <form
          noValidate
          onSubmit={form.handleSubmit(saveProfile)}
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-7"
          aria-labelledby="profile-details-title"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <UserRound aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 id="profile-details-title" className="text-lg font-extrabold">
                  Your information
                </h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Review each field carefully before saving.
                </p>
              </div>
            </div>
            {!isEditing && applicationStatus === 'Draft' ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto"
              >
                <Pencil aria-hidden="true" />
                Edit details
              </Button>
            ) : null}
          </div>

          <div className="mt-6">
            {isEditing ? (
              <StudentProfileForm
                register={form.register}
                errors={form.formState.errors}
              />
            ) : (
              <ProfileSummary values={values as StudentProfileFields} />
            )}
          </div>

          {isEditing ? (
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                className="min-h-12"
                onClick={() => {
                  form.reset()
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                aria-busy={isSaving}
                className="min-h-12"
              >
                {isSaving ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                ) : (
                  <Save aria-hidden="true" />
                )}
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          ) : null}
        </form>

        <aside
          aria-labelledby="application-summary-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas-cream text-warning">
              <FileText aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Application
              </p>
              <h2
                id="application-summary-title"
                className="mt-1 text-lg font-extrabold"
              >
                Review &amp; submit
              </h2>
            </div>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <SummaryRow
              label="Reference"
              value={mockStudentApplication.reference}
            />
            <SummaryRow label="Cycle" value={mockStudentApplication.cycle} />
            <SummaryRow label="Status" value={applicationStatus} />
          </dl>

          {applicationStatus === 'Draft' ? (
            <>
              <div className="mt-6 rounded-xl bg-secondary/70 p-4">
                <p className="text-sm font-extrabold">Before submitting</p>
                <ul className="mt-3 space-y-3 text-xs leading-5 text-muted-foreground">
                  <ChecklistItem
                    complete={profileComplete}
                    text="Complete all profile information"
                  />
                  <ChecklistItem
                    complete={declarationAccepted}
                    text="Confirm that you reviewed your details"
                  />
                </ul>
              </div>

              <label className="mt-5 flex min-h-12 cursor-pointer items-start gap-3 rounded-xl bg-secondary/45 p-3 text-sm leading-6">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(event) =>
                    setDeclarationAccepted(event.target.checked)
                  }
                  className="mt-1 size-5 shrink-0 accent-primary"
                />
                <span>I reviewed the information shown on this page.</span>
              </label>

              <Button
                type="button"
                className="mt-4 min-h-12 w-full"
                disabled={
                  !profileComplete || !declarationAccepted || isEditing
                }
                onClick={() => setSubmitDialogOpen(true)}
              >
                Review submission
              </Button>
              {!profileComplete ? (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Add the missing profile information to continue.
                </p>
              ) : null}
            </>
          ) : (
            <div
              role="status"
              className="mt-6 rounded-xl bg-success/10 p-4 text-sm"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-success"
                />
                <div>
                  <p className="font-extrabold">Application submitted</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your information is now shown as read-only in this
                    prototype workflow.
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      <ConfirmActionDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        title="Submit this application?"
        description="Confirm that you reviewed the profile and application information. After submission, this prototype displays the record as read-only."
        confirmLabel="Submit application"
        onConfirm={submitApplication}
      />
      <ConfirmActionDialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        title="Leave without saving?"
        description="Your unsaved profile changes will be discarded."
        confirmLabel="Discard changes"
        destructive
        onConfirm={() => {
          form.reset()
          onBack()
        }}
      />
    </div>
  )
}

function ProfileSummary({ values }: { values: StudentProfileFields }) {
  const fields = [
    ['Full name', values.fullName],
    ['Contact email', values.contactEmail],
    ['Mobile number', values.mobileNumber],
    ['Current school', values.currentSchool],
    ['Current level', values.currentLevel],
    ['Track or strand', values.trackOrStrand || 'Not provided'],
    ['Home address', values.homeAddress || 'Missing information'],
  ]

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {fields.map(([label, value], index) => (
        <div
          key={label}
          className={`rounded-xl bg-secondary/60 p-4 ${
            index === fields.length - 1 ? 'sm:col-span-2' : ''
          }`}
        >
          <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
          <dd className="mt-1 break-words text-sm font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold">{value}</dd>
    </div>
  )
}

function ChecklistItem({
  complete,
  text,
}: {
  complete: boolean
  text: string
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
          complete
            ? 'bg-success text-white'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {complete ? <Check aria-hidden="true" className="size-3" /> : null}
      </span>
      <span>
        {text}
        <span className="sr-only">
          {complete ? ' — complete' : ' — incomplete'}
        </span>
      </span>
    </li>
  )
}

export { StudentProfileApplicationPage }
export type { ProfileLoadState }
