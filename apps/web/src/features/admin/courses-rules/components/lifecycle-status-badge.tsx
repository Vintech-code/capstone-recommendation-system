import { Badge } from '@/components/ui/badge'
import type { LifecycleStatus } from '@/features/admin/courses-rules/data/mock-courses-rules'
import { cn } from '@/lib/utils'

const styles: Record<LifecycleStatus, string> = {
  Active: 'bg-success/10 text-success',
  Draft: 'bg-primary/8 text-primary',
  Retired: 'bg-secondary text-muted-foreground',
}

function LifecycleStatusBadge({ status }: { status: LifecycleStatus }) {
  return (
    <Badge variant="secondary" className={cn('border-0 font-bold', styles[status])}>
      {status}
    </Badge>
  )
}

export { LifecycleStatusBadge }
