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
        'rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm',
        !compact && 'min-h-40 p-6',
        className,
      )}
    >
      <p className="sr-only">{title}</p>
      <p className="sr-only">{description}</p>
      <div aria-hidden="true" className="flex items-start gap-3">
        <Skeleton
          className={cn('size-10 shrink-0 rounded-xl', compact && 'size-8')}
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
  if (variant === 'dashboard') {
    return (
      <div aria-hidden="true" className="w-full space-y-6 py-4">
        {/* Top Row: Hero Banner + Progress Card */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
          {/* Hero Banner Skeleton */}
          <div className="flex min-h-[18rem] flex-col justify-center rounded-3xl border border-border bg-card p-6 sm:p-8">
            <Skeleton className="h-3.5 w-36 rounded-full" />
            <Skeleton className="mt-3 h-10 w-4/5 max-w-md rounded-xl sm:h-12" />
            <Skeleton className="mt-4 h-4 w-full max-w-sm" />
            <Skeleton className="mt-2 h-4 w-3/4 max-w-xs" />
            <Skeleton className="mt-6 h-11 w-44 rounded-xl" />
          </div>

          {/* Progress Widget Skeleton */}
          <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24 rounded-full" />
                <Skeleton className="h-6 w-36 rounded-lg" />
              </div>
              <Skeleton className="size-20 shrink-0 rounded-full" />
            </div>
            <div className="mt-6 space-y-3 divide-y divide-border/60">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-5 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Row: Course Direction + Assessment Status */}
        <div className="grid gap-4 xl:grid-cols-12">
          {/* Course Direction Panel Skeleton */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 xl:col-span-7">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-32 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-8 w-4/5 rounded-xl" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-36 rounded-xl" />
            </div>
          </div>

          {/* Assessment Lifecycle Card Skeleton */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 xl:col-span-5">
            <Skeleton className="h-3.5 w-28 rounded-full" />
            <Skeleton className="mt-4 h-7 w-3/4 rounded-lg" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-6 h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Bottom Row: Interest Pattern 6-Tile Profile */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-36 rounded-full" />
              <Skeleton className="h-7 w-64 rounded-xl" />
              <Skeleton className="h-3.5 w-44" />
            </div>
            <Skeleton className="h-12 w-28 rounded-xl" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="rounded-2xl border border-border/80 bg-secondary/30 p-4 text-center">
                <Skeleton className="mx-auto size-8 rounded-full" />
                <Skeleton className="mx-auto mt-3 h-6 w-12 rounded" />
                <Skeleton className="mx-auto mt-2 h-3.5 w-16" />
                <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'assessment') {
    return (
      <div aria-hidden="true" className="mx-auto w-full max-w-3xl py-6 sm:py-10">
        {/* Top Step Header & Progress */}
        <div className="mb-8 space-y-3 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Main Question Card Skeleton */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <Skeleton className="h-3.5 w-24 rounded-full" />
          <Skeleton className="mt-3 h-8 w-full max-w-xl rounded-xl sm:h-10" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-md" />

          {/* 5-Option Scale Buttons Skeleton */}
          <div className="mt-8 space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex h-14 w-full items-center justify-between rounded-2xl border border-border bg-background px-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-3.5 w-8 rounded-full" />
              </div>
            ))}
          </div>

          {/* Navigation Buttons Skeleton */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Skeleton className="h-11 w-28 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'catalogue') {
    return (
      <div aria-hidden="true" className="w-full space-y-8 pb-12 pt-4">
        {/* Header & Filter Bar */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-9 w-72 rounded-xl" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Skeleton className="h-11 w-full max-w-sm rounded-xl sm:w-80" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-11 w-24 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Programme Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-7 w-4/5 rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <Skeleton className="h-9 w-28 rounded-xl" />
                  <Skeleton className="h-9 w-32 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'recommendations') {
    return (
      <div aria-hidden="true" className="w-full space-y-8 pb-16 pt-4">
        {/* Top Match Result Banner */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <Skeleton className="h-3.5 w-36 rounded-full" />
          <Skeleton className="mt-3 h-9 w-3/4 max-w-lg rounded-xl" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
        </div>

        {/* 2-Column Results Layout */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
          {/* Left: Ranked Programme Cards */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 rounded-lg" />
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-7 w-64 rounded-lg" />
                  </div>
                  <Skeleton className="h-10 w-20 rounded-2xl" />
                </div>
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-36 rounded-xl" />
                </div>
              </div>
            ))}
          </div>

          {/* Right: RIASEC Profile Breakdown */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="mx-auto mt-6 size-48 rounded-full" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div aria-hidden="true" className="space-y-6 py-4">
      <Skeleton className="h-44 w-full rounded-3xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    </div>
  )
}

export { LoadingState }
export type { LoadingStateProps }
