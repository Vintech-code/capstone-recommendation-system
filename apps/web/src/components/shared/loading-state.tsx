import { Skeleton } from '@/components/ui/skeleton'
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
  variant = 'default',
  className,
}: LoadingStateProps) {
  if (variant !== 'default') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn('w-full', className)}
      >
        <p className="sr-only">{title}</p>
        <p className="sr-only">{description}</p>
        <PageSkeleton variant={variant} />
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'rounded-lg bg-card p-4 text-card-foreground shadow-sm',
        !compact && 'min-h-40 p-6',
        className,
      )}
    >
      <p className="sr-only">{title}</p>
      <p className="sr-only">{description}</p>
      <div aria-hidden="true" className="flex items-start gap-3">
        <Skeleton
          className={cn('size-10 shrink-0 rounded', compact && 'size-8')}
        />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className={cn('h-4 w-2/5', compact && 'w-1/3')} />
          <Skeleton className="h-3 w-4/5" />
          {!compact ? <Skeleton className="h-3 w-3/5" /> : null}
        </div>
      </div>
    </div>
  )
}

function PageSkeleton({ variant }: { variant: Exclude<LoadingStateProps['variant'], 'default' | undefined> }) {
  if (variant === 'assessment') {
    return (
      <div aria-hidden="true" className="student-page py-8">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="mt-3 h-9 w-72 max-w-full rounded" />
        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          <Skeleton className="min-h-[31rem] rounded-lg" />
          <div className="rounded-lg bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="mt-5 h-2 w-full rounded" />
            <Skeleton className="mt-8 h-7 w-5/6 rounded" />
            <Skeleton className="mt-3 h-4 w-3/5 rounded" />
            <div className="mt-7 space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'catalogue') {
    return (
      <div aria-hidden="true" className="student-page pb-10">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="mt-9 h-8 w-48 rounded" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="grid min-h-56 overflow-hidden rounded-lg bg-card shadow-sm sm:grid-cols-[10rem_1fr]">
              <Skeleton className="h-full min-h-44 rounded-none" />
              <div className="p-5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="mt-4 h-6 w-4/5 rounded" />
                <Skeleton className="mt-3 h-4 w-full rounded" />
                <Skeleton className="mt-2 h-4 w-2/3 rounded" />
                <Skeleton className="mt-5 h-10 w-36 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'recommendations') {
    return (
      <div aria-hidden="true" className="student-page pb-16 pt-8">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.65fr)]">
          <div>
            <Skeleton className="h-8 w-64 rounded" />
            <div className="mt-5 space-y-5">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-52 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-card p-6 shadow-sm">
            <Skeleton className="h-7 w-52 rounded" />
            <Skeleton className="mx-auto mt-6 aspect-square w-full max-w-64 rounded-lg" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-6 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div aria-hidden="true" className="space-y-6 py-5">
      <Skeleton className="h-52 w-full rounded-lg" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  )
}

export { LoadingState }
export type { LoadingStateProps }
