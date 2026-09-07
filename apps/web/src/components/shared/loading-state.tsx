import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  title?: string
  description?: string
  compact?: boolean
  variant?: 'default' | 'assessment' | 'catalogue' | 'dashboard' | 'recommendations'
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
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-6' : 'min-h-[260px] py-14',
        className,
      )}
    >
      <Loader2
        className={cn('animate-spin text-primary', compact ? 'size-6' : 'size-9')}
        aria-hidden="true"
      />
      <p className="mt-3 font-display text-sm sm:text-base font-bold text-foreground">
        {title}
      </p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      ) : null}
      <span className="sr-only">{title}</span>
    </div>
  )
}

export { LoadingState }
export type { LoadingStateProps }
