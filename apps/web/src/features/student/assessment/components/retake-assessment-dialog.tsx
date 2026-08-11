import { useState } from 'react'

import { ConfirmActionDialog } from '@/components/shared'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface RetakeAssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  description: string
  onConfirm: (reason?: string) => void | Promise<void>
}

function RetakeAssessmentDialog({ open, onOpenChange, description, onConfirm }: RetakeAssessmentDialogProps) {
  const [reason, setReason] = useState('')

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) setReason('')
    onOpenChange(nextOpen)
  }

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={changeOpen}
      title="Start a new assessment?"
      description={description}
      confirmLabel="Start retake"
      onConfirm={() => onConfirm(reason.trim() || undefined)}
    >
      <div className="grid gap-2">
        <Label htmlFor="retake-reason">Reason for retaking (optional)</Label>
        <Textarea
          id="retake-reason"
          value={reason}
          maxLength={500}
          rows={4}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Add context you may want to remember when reviewing this attempt."
        />
        <p className="text-right text-xs text-muted-foreground">{reason.length}/500</p>
      </div>
    </ConfirmActionDialog>
  )
}

export { RetakeAssessmentDialog }
