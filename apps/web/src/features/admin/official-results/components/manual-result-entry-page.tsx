import { CheckCircle2, ClipboardPlus, FileCheck2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { ResultEntryForm } from '@/features/admin/official-results/components/result-entry-form'
import { ResultEntryReview } from '@/features/admin/official-results/components/result-entry-review'
import type { ResultEntryFields } from '@/features/admin/official-results/schemas/result-entry-schema'

interface ManualResultEntryPageProps {
  onBack: () => void
}

type EntryStage = 'entry' | 'review' | 'saved'

function ManualResultEntryPage({ onBack }: ManualResultEntryPageProps) {
  const [stage, setStage] = useState<EntryStage>('entry')
  const [draft, setDraft] = useState<ResultEntryFields>()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleReview(values: ResultEntryFields) {
    setDraft(values)
    setStage('review')
  }

  function handleReset() {
    setDraft(undefined)
    setStage('entry')
  }

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Encode official result"
        description="Create a manual result record, review its source details, and route it to verification."
      />

      <ol
        aria-label="Result entry progress"
        className="mt-5 grid gap-3 rounded-2xl bg-background p-4 shadow-sm sm:grid-cols-3"
      >
        <ProgressStep
          number="1"
          label="Enter details"
          active={stage === 'entry'}
          complete={stage !== 'entry'}
        />
        <ProgressStep
          number="2"
          label="Review record"
          active={stage === 'review'}
          complete={stage === 'saved'}
        />
        <ProgressStep
          number="3"
          label="Queue for verification"
          active={stage === 'saved'}
          complete={stage === 'saved'}
        />
      </ol>

      {stage === 'entry' ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <ResultEntryForm
            initialValues={draft}
            onCancel={onBack}
            onReview={handleReview}
          />
          <EntryGuidance />
        </div>
      ) : null}

      {stage === 'review' && draft ? (
        <div className="mt-5">
          <ResultEntryReview
            values={draft}
            onBack={() => setStage('entry')}
            onConfirm={() => setConfirmOpen(true)}
          />
        </div>
      ) : null}

      {stage === 'saved' && draft ? (
        <section className="mt-5 rounded-2xl bg-background p-8 text-center shadow-sm sm:p-12">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
            Added to verification queue
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">
            Result record ready for review
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            The manually encoded result for {draft.applicantId} is now shown as
            awaiting verification.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" variant="secondary" onClick={handleReset}>
              Encode another result
            </Button>
            <Button type="button" onClick={onBack}>
              View official results
            </Button>
          </div>
        </section>
      ) : null}

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Add result to the verification queue?"
        description="This creates a manual result record in verification review. Confirm that the summary matches the source before continuing."
        confirmLabel="Add result"
        onConfirm={() => setStage('saved')}
      />
    </div>
  )
}

function ProgressStep({
  number,
  label,
  active,
  complete,
}: {
  number: string
  label: string
  active: boolean
  complete: boolean
}) {
  return (
    <li
      aria-current={active ? 'step' : undefined}
      className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 ${
        active ? 'bg-primary text-primary-foreground' : 'bg-secondary/70'
      }`}
    >
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
          active ? 'bg-white/18' : 'bg-background text-foreground'
        }`}
      >
        {complete ? <CheckCircle2 aria-hidden="true" className="size-4" /> : number}
      </span>
      <span className="text-sm font-bold">{label}</span>
    </li>
  )
}

function EntryGuidance() {
  const guidance = [
    {
      icon: ClipboardPlus,
      title: 'Manual record',
      description: 'The source is recorded as manual encoding.',
    },
    {
      icon: FileCheck2,
      title: 'Review first',
      description: 'Every entered value is presented again before confirmation.',
    },
    {
      icon: ShieldCheck,
      title: 'Verification next',
      description: 'New records enter review and are not automatically verified.',
    },
  ]

  return (
    <aside
      aria-labelledby="entry-guidance-title"
      className="h-fit rounded-2xl bg-background p-6 shadow-sm"
    >
      <h2 id="entry-guidance-title" className="font-extrabold">
        Entry workflow
      </h2>
      <div className="mt-5 space-y-5">
        {guidance.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

export { ManualResultEntryPage }
