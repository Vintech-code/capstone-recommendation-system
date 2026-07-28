interface AssessmentDimensionResult {
  code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
  label: string
  value: number
  colorClass: string
  surfaceClass: string
}

// Isolated D-015 UI data. Values and ordering demonstrate the result screen
// only; they are not approved scores, norms, interpretations, validation
// evidence, questionnaire mappings, or production seed data.
const mockAssessmentResult = {
  id: 'RIA-RES-001',
  sessionReference: 'ASMT-STU-001',
  assessmentVersion: 'IA-2026-01',
  availableAt: 'Jul 28, 2026',
  status: 'Available',
  topCode: 'I-C',
  topLabels: ['Investigative', 'Conventional'],
  dimensions: [
    {
      code: 'R',
      label: 'Realistic',
      value: 45,
      colorClass: 'bg-chart-slate',
      surfaceClass: 'bg-chart-slate/10 text-foreground',
    },
    {
      code: 'I',
      label: 'Investigative',
      value: 82,
      colorClass: 'bg-primary',
      surfaceClass: 'bg-primary/10 text-primary',
    },
    {
      code: 'A',
      label: 'Artistic',
      value: 59,
      colorClass: 'bg-magenta',
      surfaceClass: 'bg-magenta/10 text-magenta',
    },
    {
      code: 'S',
      label: 'Social',
      value: 66,
      colorClass: 'bg-chart-teal',
      surfaceClass: 'bg-chart-teal/10 text-chart-teal',
    },
    {
      code: 'E',
      label: 'Enterprising',
      value: 51,
      colorClass: 'bg-warning',
      surfaceClass: 'bg-warning/10 text-warning',
    },
    {
      code: 'C',
      label: 'Conventional',
      value: 74,
      colorClass: 'bg-chart-blue',
      surfaceClass: 'bg-chart-blue/10 text-chart-blue',
    },
  ] satisfies AssessmentDimensionResult[],
} as const

export { mockAssessmentResult }
export type { AssessmentDimensionResult }
