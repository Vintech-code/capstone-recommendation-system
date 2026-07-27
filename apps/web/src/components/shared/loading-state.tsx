import { LoaderCircle } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  title?: string
  description?: string
  compact?: boolean
  className?: string
}

function LoadingState({
  title = 'Loading',
  description = 'Please wait while the requested information is prepared.',
  compact = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex items-start gap-3 rounded-2xl bg-card p-4 text-card-foreground shadow-sm',
        !compact && 'min-h-40 items-center justify-center text-center',
        className,
      )}
    >
      <LoaderCircle
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 animate-spin text-muted-foreground"
      />
      <div className={cn('space-y-1', !compact && 'max-w-sm')}>
        <p className="font-medium">{title}</p>
        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
        {!compact ? (
          <div aria-hidden="true" className="mx-auto flex max-w-xs gap-2 pt-3">
            <Skeleton className="h-2 flex-1" />
            <Skeleton className="h-2 flex-1" />
            <Skeleton className="h-2 flex-1" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { LoadingState }
export type { LoadingStateProps }
