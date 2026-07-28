import type { AssessmentDimensionResult } from '@/features/student/assessment/data/mock-assessment-result'

interface AssessmentDimensionChartProps {
  dimensions: readonly AssessmentDimensionResult[]
}

function AssessmentDimensionChart({
  dimensions,
}: AssessmentDimensionChartProps) {
  return (
    <div
      aria-label="Six interest dimension results"
      className="space-y-4"
    >
      {dimensions.map((dimension) => (
        <div key={dimension.code}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${dimension.surfaceClass}`}
              >
                {dimension.code}
              </span>
              <span className="truncate text-sm font-extrabold">
                {dimension.label}
              </span>
            </div>
            <span className="text-sm font-extrabold">{dimension.value}</span>
          </div>
          <div
            role="progressbar"
            aria-label={`${dimension.label} recorded value`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={dimension.value}
            className="h-2.5 overflow-hidden rounded-full bg-secondary"
          >
            <div
              className={`h-full rounded-full ${dimension.colorClass}`}
              style={{ width: `${dimension.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export { AssessmentDimensionChart }
