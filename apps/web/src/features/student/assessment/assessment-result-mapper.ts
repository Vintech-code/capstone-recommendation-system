import type { AssessmentLifecycle } from '@/features/student/assessment/assessment-api'
import type { AssessmentDimensionResult, AssessmentDisplayResult } from '@/features/student/assessment/assessment-types'

const dimensionPresentation: Record<string, Omit<AssessmentDimensionResult, 'label' | 'value'>> = {
  Realistic: { code: 'R', colorClass: 'bg-chart-slate', surfaceClass: 'bg-chart-slate/10 text-foreground' },
  Investigative: { code: 'I', colorClass: 'bg-primary', surfaceClass: 'bg-primary/10 text-primary' },
  Artistic: { code: 'A', colorClass: 'bg-magenta', surfaceClass: 'bg-magenta/10 text-magenta' },
  Social: { code: 'S', colorClass: 'bg-chart-teal', surfaceClass: 'bg-chart-teal/10 text-chart-teal' },
  Enterprising: { code: 'E', colorClass: 'bg-warning', surfaceClass: 'bg-warning/10 text-warning' },
  Conventional: { code: 'C', colorClass: 'bg-chart-blue', surfaceClass: 'bg-chart-blue/10 text-chart-blue' },
}

function mapAssessmentResult(lifecycle: AssessmentLifecycle): AssessmentDisplayResult | null {
  const payload = lifecycle.result
  const entries = payload?.result
  if (!payload || !entries || entries.length !== 6) return null

  const dimensions = entries.map((entry) => {
    const presentation = dimensionPresentation[entry.area]
    if (!presentation || !Number.isFinite(entry.score)) return null
    return { ...presentation, label: entry.area, value: entry.score }
  })
  if (dimensions.some((dimension) => !dimension)) return null

  const completeDimensions = dimensions as AssessmentDimensionResult[]
  const leading = [...completeDimensions].sort((a, b) => b.value - a.value).slice(0, 2)

  return {
    id: `result-${lifecycle.reference ?? lifecycle.id ?? 'current'}`,
    sessionReference: lifecycle.reference ?? String(lifecycle.id ?? 'Unavailable'),
    assessmentVersion: payload.instrument_code,
    availableAt: formatAssessmentDate(lifecycle.result_available_at),
    status: 'Available',
    topCode: leading.map((dimension) => dimension.code).join('-'),
    topLabels: leading.map((dimension) => dimension.label),
    dimensions: completeDimensions,
  }
}

function formatAssessmentDate(value?: string | null) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export { formatAssessmentDate, mapAssessmentResult }
