import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { StudentRecommendedCourse } from '@/features/student/recommendations/recommendation-types'
import { cn } from '@/lib/utils'

const rankedHighlightStyles = [
  { color: 'bg-info/28', width: 'lg:w-[68%]' },
  { color: 'bg-primary/28', width: 'lg:w-[58%]' },
  { color: 'bg-warning/38', width: 'lg:w-[48%]' },
] as const

function matchLabel(pct: number): string {
  if (pct >= 60) return 'Strong match'
  if (pct >= 30) return 'Good match'
  return 'Explore match'
}

function matchLabelStyle(pct: number): string {
  if (pct >= 60) return 'text-primary-ink'
  if (pct >= 30) return 'text-primary-ink/80'
  return 'text-muted-foreground'
}

interface RecommendationMatchCardProps {
  course: StudentRecommendedCourse
  onViewDetails: () => void
}

function RecommendationMatchCard({ course, onViewDetails }: RecommendationMatchCardProps) {
  const match = Math.min(100, Math.max(0, course.match))
  const displayPct = Math.round(match)
  const highlightStyle = rankedHighlightStyles[course.rank - 1]
  const label = matchLabel(match)
  const labelStyle = matchLabelStyle(match)

  return (
    <article
      className={cn(
        'group relative overflow-hidden bg-card transition-shadow',
        highlightStyle
          ? 'rounded-3xl border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]'
          : 'border-b border-border',
      )}
    >
      {highlightStyle ? (
        <span
          data-rank-highlight={course.rank}
          aria-hidden="true"
          className={cn(
            'absolute inset-y-0 left-0 hidden rounded-r-[6rem] lg:block',
            highlightStyle.color,
            highlightStyle.width,
          )}
        />
      ) : null}

      <div className="relative grid lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div
          className={cn(
            'relative px-5 py-4 sm:px-7 sm:py-5 lg:bg-transparent lg:pr-20',
            highlightStyle?.color,
          )}
        >
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-label text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Programme #{course.rank}
              </span>
              <span
                className={cn(
                  'inline-flex min-h-7 items-center rounded-full px-3 font-label text-xs font-bold uppercase tracking-[0.04em]',
                  course.rank === 1
                    ? 'bg-primary-ink text-white'
                    : 'border border-foreground/10 bg-white/75 text-foreground',
                )}
              >
                {course.rank === 1 ? 'Top fit' : `Top ${course.rank}`}
              </span>
            </div>

            <h3 className="mt-2.5 max-w-3xl font-display text-xl font-extrabold leading-tight tracking-[-0.02em] text-foreground sm:text-2xl">
              {course.name}
            </h3>

            {course.summary ? (
              <p className="mt-1.5 max-w-4xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
                {course.summary}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 flex min-w-0 flex-col justify-between gap-3 border-t border-border bg-card px-5 py-4 sm:px-7 sm:py-5 lg:border-l lg:border-t-0">
          <div>
            <p className={cn('font-label text-sm font-bold', labelStyle)}>{label}</p>
            <p className={cn('mt-1 font-display text-3xl font-black leading-none', labelStyle)}>
              {displayPct}%
            </p>
            <div
              role="progressbar"
              aria-label={`${course.name} ${label.toLowerCase()}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={displayPct}
              className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
            >
              <span
                className="block h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${displayPct}%` }}
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onViewDetails}
            className="w-full justify-between text-primary-ink"
          >
            View programme
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  )
}

export { RecommendationMatchCard }
