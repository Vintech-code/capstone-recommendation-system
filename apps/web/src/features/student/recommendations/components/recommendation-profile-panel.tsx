import { cn } from '@/lib/utils'
import type { AssessmentDisplayResult } from '@/features/student/assessment/assessment-types'
import type { StudentRecommendationProfile } from '@/features/student/recommendations/recommendation-types'

interface RecommendationProfilePanelProps {
  result: AssessmentDisplayResult | StudentRecommendationProfile | null
  className?: string
}

const dimensionColors: Record<string, string> = {
  R: '#b65338',
  I: '#3d6f91',
  A: '#a84f72',
  S: '#3e7c61',
  E: '#a36b16',
  C: '#5e668f',
}

function normalizeScore(value: number, minimum: number, maximum: number) {
  if (maximum <= minimum) return 0
  return Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum)))
}

function RecommendationProfilePanel({ result, className }: RecommendationProfilePanelProps) {
  if (!result) {
    return (
      <aside style={{ alignSelf: 'start' }} className={cn("self-start rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]", className)} aria-label="Interest profile unavailable">
        <h2 className="font-display text-xl font-bold text-foreground">RIASEC scores unavailable</h2>
        <p className="mt-2 text-base font-medium leading-7 text-muted-foreground">
          Your programme matches are available, but the six assessment values could not be loaded here.
        </p>
      </aside>
    )
  }

  return (
    <aside style={{ alignSelf: 'start' }} className={cn("self-start rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-7 w-full", className)} aria-labelledby="profile-breakdown-title">
      <div>
        <h2 id="profile-breakdown-title" className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          RIASEC scores
        </h2>
        <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground sm:text-base">
          How your answers spread across six interest areas
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {result.dimensions.map((dimension) => {
          const minimum = dimension.minimum ?? 0
          const maximum = dimension.maximum ?? 25

          return (
            <div key={dimension.code}>
              <div className="flex items-center justify-between gap-3 font-label text-sm sm:text-base">
                <span className="flex min-w-0 items-center gap-2 font-semibold">
                  <span aria-hidden="true" className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: dimensionColors[dimension.code] ?? 'var(--primary)' }} />
                  <span className="text-foreground">{dimension.code} · {dimension.label}</span>
                </span>
                <span className="shrink-0 font-semibold text-muted-foreground tabular-nums">
                  {dimension.value} / {maximum}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`${dimension.label} score`}
                aria-valuemin={minimum}
                aria-valuemax={maximum}
                aria-valuenow={Math.max(minimum, Math.min(maximum, dimension.value))}
                className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${normalizeScore(dimension.value, minimum, maximum) * 100}%`,
                    backgroundColor: dimensionColors[dimension.code] ?? 'var(--primary)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-secondary/60 p-4 sm:p-5">
        <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm">
          Recorded pattern
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-foreground sm:text-base sm:leading-7">
          <strong>{result.topCode}</strong> represents the two categories stored as your leading areas. Programme matching compares the recorded RIASEC scores with each programme's configured profile.
        </p>
      </div>
    </aside>
  )
}

export { RecommendationProfilePanel }
