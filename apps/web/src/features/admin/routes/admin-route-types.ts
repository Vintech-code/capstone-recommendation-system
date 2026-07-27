const adminModuleIds = [
  'overview',
  'applicants',
  'official-results',
  'assessments',
  'recommendations',
  'courses-rules',
  'reports',
] as const

type AdminModuleId = (typeof adminModuleIds)[number]
type AssessmentView = 'sessions' | 'questionnaires'
type CoursesRulesView = 'courses' | 'rules'
type OfficialResultsView = 'list' | 'new' | 'import-upload' | 'import-detail'
type RecommendationsView = 'list' | 'validation-cases' | 'decisions'

function isAdminModuleId(value: string | undefined): value is AdminModuleId {
  return adminModuleIds.some((moduleId) => moduleId === value)
}

export { adminModuleIds, isAdminModuleId }
export type {
  AdminModuleId,
  AssessmentView,
  CoursesRulesView,
  OfficialResultsView,
  RecommendationsView,
}
