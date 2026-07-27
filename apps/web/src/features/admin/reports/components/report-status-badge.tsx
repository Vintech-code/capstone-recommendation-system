import { Badge } from '@/components/ui/badge'
import type { ReportStatus } from '@/features/admin/reports/data/mock-reports'
import { cn } from '@/lib/utils'

const statusClasses: Record<ReportStatus, string> = {
  Ready: 'bg-success/10 text-success',
  'In review': 'bg-primary/8 text-primary',
  Archived: 'bg-secondary text-muted-foreground',
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn('border-0 font-bold', statusClasses[status])}
    >
      {status}
    </Badge>
  )
}

export { ReportStatusBadge }
