import type { OfficialResultReviewState } from '@/features/admin/official-results/data/mock-official-results'
import { cn } from '@/lib/utils'

const stateClasses: Record<OfficialResultReviewState, string> = {
  'Verification review': 'bg-primary/8 text-primary',
  Verified: 'bg-success/10 text-success',
  'Correction review': 'bg-canvas-cream text-foreground',
}

function ResultStateBadge({
  state,
}: {
  state: OfficialResultReviewState
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        stateClasses[state],
      )}
    >
      {state}
    </span>
  )
}

export { ResultStateBadge }
