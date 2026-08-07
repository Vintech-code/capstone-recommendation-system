import { BarChart3, Lightbulb } from 'lucide-react'

import type { AssessmentDisplayResult } from '@/features/student/assessment/assessment-types'
import type { StudentRecommendationProfile } from '@/features/student/recommendations/recommendation-types'

interface RecommendationProfilePanelProps {
  result: AssessmentDisplayResult | StudentRecommendationProfile | null
}

const scoreMinimum = 5
const scoreMaximum = 25
const center = 110
const chartRadius = 70

function normalizeScore(value: number) {
  return Math.max(0, Math.min(1, (value - scoreMinimum) / (scoreMaximum - scoreMinimum)))
}

function chartPoint(index: number, radius: number) {
  const angle = -Math.PI / 2 + index * (Math.PI / 3)
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  }
}

function pointList(values: readonly number[], scale = 1) {
  return values
    .map((value, index) => {
      const normalized = normalizeScore(value)
      const point = chartPoint(index, chartRadius * normalized * scale)
      return `${point.x},${point.y}`
    })
    .join(' ')
}

function RecommendationProfilePanel({ result }: RecommendationProfilePanelProps) {
  if (!result) {
    return (
      <aside className="rounded-xl bg-card p-6 shadow-sm" aria-label="Interest profile unavailable">
        <BarChart3 aria-hidden="true" className="size-7 text-primary" />
        <h2 className="mt-4 font-display text-xl font-semibold">Your profile breakdown</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your programme matches are available, but the six assessment values could not be loaded here.
        </p>
      </aside>
    )
  }

  const values = result.dimensions.map((dimension) => dimension.value)

  return (
    <div className="space-y-6 lg:sticky lg:top-28">
      <aside className="relative overflow-hidden rounded-xl bg-card p-6 shadow-sm" aria-labelledby="profile-breakdown-title">
        <BarChart3 aria-hidden="true" className="absolute right-5 top-5 size-16 text-primary/5" />
        <h2 id="profile-breakdown-title" className="font-display text-xl font-semibold">
          Your profile breakdown
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">RIASEC scores from your latest completed assessment</p>

        <svg
          viewBox="0 0 220 220"
          role="img"
          aria-label={`RIASEC profile: ${result.dimensions.map((item) => `${item.label} ${item.value}`).join(', ')}`}
          className="mx-auto mt-5 aspect-square w-full max-w-72 overflow-visible"
        >
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <polygon
              key={scale}
              points={pointList(Array(6).fill(scoreMaximum), scale)}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              className="text-outline-variant/60"
            />
          ))}
          {result.dimensions.map((dimension, index) => {
            const edge = chartPoint(index, chartRadius)
            const label = chartPoint(index, chartRadius + 19)
            return (
              <g key={dimension.code}>
                <line x1={center} y1={center} x2={edge.x} y2={edge.y} stroke="currentColor" strokeWidth="0.6" className="text-outline-variant/60" />
                <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-label text-[8px] font-semibold">
                  {dimension.code}
                </text>
              </g>
            )
          })}
          <polygon points={pointList(values)} className="fill-primary/15 stroke-primary" strokeWidth="2.25" strokeLinejoin="round" />
          {values.map((value, index) => {
            const point = chartPoint(index, chartRadius * normalizeScore(value))
            return <circle key={`${index}-${value}`} cx={point.x} cy={point.y} r="3.5" className="fill-secondary-container stroke-primary" strokeWidth="1.2" />
          })}
        </svg>

        <div className="mt-3 space-y-4">
          {result.dimensions.map((dimension) => (
            <div key={dimension.code}>
              <div className="flex items-center justify-between gap-3 font-label text-xs">
                <span>{dimension.code} · {dimension.label}</span>
                <strong>{dimension.value} / {scoreMaximum}</strong>
              </div>
              <div
                role="progressbar"
                aria-label={`${dimension.label} score`}
                aria-valuemin={scoreMinimum}
                aria-valuemax={scoreMaximum}
                aria-valuenow={Math.max(scoreMinimum, Math.min(scoreMaximum, dimension.value))}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${normalizeScore(dimension.value) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </aside>

      <aside className="rounded-xl bg-primary p-6 text-primary-foreground shadow-sm" aria-labelledby="leading-interests-title">
        <Lightbulb aria-hidden="true" className="size-7 text-secondary-container" />
        <h2 id="leading-interests-title" className="mt-4 font-display text-xl font-semibold">Your leading interests</h2>
        <p className="mt-3 text-sm leading-6 text-primary-foreground/80">
          Your strongest recorded areas are {result.topLabels.join(' and ')}. Use these results to compare programmes, then review the full programme information before choosing.
        </p>
        <p className="mt-4 font-label text-xs font-medium text-secondary-container">Top code: {result.topCode}</p>
      </aside>
    </div>
  )
}

export { RecommendationProfilePanel }
