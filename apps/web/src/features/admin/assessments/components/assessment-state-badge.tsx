import { Badge } from '@/components/ui/badge'
import type { AssessmentSessionState } from '@/features/admin/assessments/data/mock-assessments'
import { cn } from '@/lib/utils'

const stateClasses: Record<AssessmentSessionState, string> = {
  'In progress': 'bg-primary/8 text-primary',
  Submitted: 'bg-success/10 text-success',
}

interface AssessmentStateBadgeProps {
  state: AssessmentSessionState
}

function AssessmentStateBadge({ state }: AssessmentStateBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('border-0 font-bold', stateClasses[state])}
    >
      {state}
    </Badge>
  )
}

export { AssessmentStateBadge }
