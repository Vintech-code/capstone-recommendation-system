import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { ResultEntryForm } from '@/features/admin/official-results/components/result-entry-form'
import type { ResultEntryFields } from '@/features/admin/official-results/schemas/result-entry-schema'

interface ManualResultEntryPageProps {
  onBack: () => void
}

function ManualResultEntryPage({ onBack }: ManualResultEntryPageProps) {
  const [draft, setDraft] = useState<ResultEntryFields>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave(values: ResultEntryFields) {
    setDraft(values)
    setConfirmOpen(true)
  }

  function handleReset() {
    setDraft(undefined)
    setSaved(false)
  }

  return (
    <div className="w-full">
      <AdminPageHeader title="Add official result" />

      {saved && draft ? (
        <section className="mt-5 rounded-2xl bg-background p-8 text-center shadow-sm sm:p-12">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success/10 text-success">
            <CheckCircle2 aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-success">
            Saved
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">
            Official result added
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            The result for {draft.applicantId} is now included in Official
            results and is available as a read-only Student record.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" variant="secondary" onClick={handleReset}>
              Add another result
            </Button>
            <Button type="button" onClick={onBack}>
              View official results
            </Button>
          </div>
        </section>
      ) : (
        <div className="mt-5">
          <ResultEntryForm onCancel={onBack} onSave={handleSave} />
        </div>
      )}

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Save this official result?"
        description="Confirm that the values match the authorized source. The Student will have read-only access to the saved result."
        confirmLabel="Save result"
        onConfirm={() => setSaved(true)}
      />
    </div>
  )
}

export { ManualResultEntryPage }
