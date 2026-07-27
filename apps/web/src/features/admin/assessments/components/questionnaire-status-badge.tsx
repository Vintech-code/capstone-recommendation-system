import { Badge } from '@/components/ui/badge'
import type { QuestionnaireStatus } from '@/features/admin/assessments/data/mock-questionnaires'
import { cn } from '@/lib/utils'

const statusClasses: Record<QuestionnaireStatus, string> = {
  Active: 'bg-success/10 text-success',
  Draft: 'bg-primary/8 text-primary',
  Retired: 'bg-secondary text-muted-foreground',
}

interface QuestionnaireStatusBadgeProps {
  status: QuestionnaireStatus
}

function QuestionnaireStatusBadge({
  status,
}: QuestionnaireStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('border-0 font-bold', statusClasses[status])}
    >
      {status}
    </Badge>
  )
}

export { QuestionnaireStatusBadge }
