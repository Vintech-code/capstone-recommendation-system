import { Badge } from '@/components/ui/badge'
import type { RecommendationStatus } from '@/features/admin/recommendations/data/mock-recommendations'
import { cn } from '@/lib/utils'

const statusClasses: Record<RecommendationStatus, string> = {
  Generated: 'bg-primary/8 text-primary',
  Reviewed: 'bg-success/10 text-success',
  Superseded: 'bg-secondary text-muted-foreground',
}

function RecommendationStatusBadge({
  status,
}: {
  status: RecommendationStatus
}) {
  return (
    <Badge
      variant="secondary"
      className={cn('border-0 font-bold', statusClasses[status])}
    >
      {status}
    </Badge>
  )
}

export { RecommendationStatusBadge }
