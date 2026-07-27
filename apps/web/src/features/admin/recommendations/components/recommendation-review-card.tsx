import { ArrowUpRight, CalendarDays, Sparkles, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RecommendationStatusBadge } from '@/features/admin/recommendations/components/recommendation-status-badge'
import type { MockRecommendationRun } from '@/features/admin/recommendations/data/mock-recommendations'

function RecommendationReviewCard({
  run,
  onOpen,
}: {
  run: MockRecommendationRun
  onOpen: (id: string) => void
}) {
  const topMatch = run.matches[0]

  return (
    <article className="group rounded-2xl bg-background p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
          <Sparkles aria-hidden="true" className="size-5" />
        </span>
        <RecommendationStatusBadge status={run.status} />
      </div>

      <div className="mt-5">
        <p className="font-mono text-xs font-bold text-muted-foreground">
          {run.id} · v{run.version}
        </p>
        <h2 className="mt-2 text-lg font-extrabold">{run.applicantName}</h2>
        <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <UserRound aria-hidden="true" className="size-4" />
          {run.applicantId}
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-secondary/65 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Top guidance
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold">{topMatch.name}</h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {topMatch.code}
            </p>
          </div>
          <span className="text-xl font-extrabold text-primary">
            {topMatch.match}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`${topMatch.name} match for ${run.applicantName}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={topMatch.match}
          className="mt-4 h-2 overflow-hidden rounded-full bg-background"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${topMatch.match}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-4" />
          <time dateTime={run.generatedAt}>{run.generatedLabel}</time>
        </p>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpen(run.id)}
        >
          Open review
          <ArrowUpRight aria-hidden="true" />
        </Button>
      </div>
    </article>
  )
}

export { RecommendationReviewCard }
