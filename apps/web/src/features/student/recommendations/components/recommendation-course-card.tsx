import {
  ArrowRight,
  Check,
  CircleAlert,
  GitCompareArrows,
  Sparkles,
} from 'lucide-react'

import { StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import type { StudentRecommendedCourse } from '@/features/student/recommendations/data/mock-student-recommendations'

interface RecommendationCourseCardProps {
  course: StudentRecommendedCourse
  selected: boolean
  comparisonDisabled: boolean
  onToggleComparison: () => void
  onViewDetails: () => void
}

function RecommendationCourseCard({
  course,
  selected,
  comparisonDisabled,
  onToggleComparison,
  onViewDetails,
}: RecommendationCourseCardProps) {
  const eligible = course.eligibility === 'Eligible'

  return (
    <article className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground">
            {course.rank}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
              {course.code}
            </p>
            <h2 className="mt-1 text-lg font-extrabold leading-6">
              {course.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {course.department} · {course.duration}
            </p>
          </div>
        </div>
        <StatusBadge
          label={course.eligibility}
          tone={eligible ? 'success' : 'warning'}
          className="shrink-0"
        />
      </div>

      <div className="mt-5 rounded-xl bg-secondary/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Sparkles aria-hidden="true" className="size-4 text-primary" />
            Recorded match
          </span>
          <span className="text-lg font-extrabold">{course.match}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${course.name} recorded match`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={course.match}
          className="mt-3 h-2 overflow-hidden rounded-full bg-background"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${course.match}%` }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {course.summary}
      </p>

      <div className="mt-5">
        <p className="text-xs font-extrabold">Why this option appears</p>
        <ul className="mt-3 space-y-2">
          {course.factors.map((factor) => (
            <li
              key={factor}
              className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"
            >
              {factor.includes('review') ? (
                <CircleAlert
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-warning"
                />
              ) : (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-success"
                />
              )}
              {factor}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant={selected ? 'secondary' : 'outline'}
          disabled={comparisonDisabled && !selected}
          aria-pressed={selected}
          onClick={onToggleComparison}
          className="min-h-12 flex-1 sm:min-h-10"
        >
          <GitCompareArrows aria-hidden="true" />
          {selected ? 'Selected to compare' : 'Add to comparison'}
        </Button>
        <Button
          type="button"
          onClick={onViewDetails}
          className="min-h-12 flex-1 sm:min-h-10"
        >
          View details
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </article>
  )
}

export { RecommendationCourseCard }
