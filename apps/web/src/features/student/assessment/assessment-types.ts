type AssessmentResponseValue = 1 | 2

interface AssessmentResponseOption {
  value: AssessmentResponseValue
  label: string
  description: string
}

interface AssessmentQuestion {
  id: string
  prompt: string
}

interface AssessmentSessionContent {
  id: string
  versionReference: string
  questions: AssessmentQuestion[]
  responseOptions: AssessmentResponseOption[]
}

interface AssessmentDimensionResult {
  code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
  label: string
  value: number
  minimum?: number
  maximum?: number
  colorClass: string
  surfaceClass: string
}

interface AssessmentDisplayResult {
  id: string
  sessionReference: string
  assessmentVersion: string
  availableAt: string
  status: string
  topCode: string
  topLabels: string[]
  dimensions: AssessmentDimensionResult[]
  guidance?: {
    status: 'proposed'
    version: string
    notice: string
    explanations: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', string>
  } | null
}

export type {
  AssessmentDimensionResult,
  AssessmentDisplayResult,
  AssessmentQuestion,
  AssessmentResponseOption,
  AssessmentResponseValue,
  AssessmentSessionContent,
}
