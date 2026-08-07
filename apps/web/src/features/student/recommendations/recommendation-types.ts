type StudentRecommendationEligibility = 'Eligible' | 'Needs review' | 'Provisional'

interface StudentRecommendedCourse {
  id: string
  rank: number
  code: string
  name: string
  department: string
  duration: string
  level: string
  match: number
  eligibility: StudentRecommendationEligibility
  summary: string
  factors: string[]
  interestAreas: string[]
  learningAreas: string[]
  careerDirections: string[]
  reviewNotes: string[]
  contentStatus?: 'proposed'
  contentVersion?: string
}

interface StudentRecommendationProfile {
  sessionReference: string
  availableAt: string
  topCode: string
  topLabels: string[]
  dimensions: Array<{
    code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
    label: string
    value: number
  }>
}

interface StudentRecommendationSnapshot {
  id: string
  generatedAt: string
  assessmentResultReference: string
  catalogueReference: string
  ruleReference: string
  status: string
  defaultCount: number
  totalEligible: number
  canViewAll: boolean
  showingAll: boolean
  guidanceContentStatus?: 'proposed'
  profile?: StudentRecommendationProfile
  courses: StudentRecommendedCourse[]
}

interface StudentRecommendationState {
  status: 'not_available' | 'preparing' | 'available'
  reason?: string
  recommendation: StudentRecommendationSnapshot | null
}

export type { StudentRecommendationEligibility, StudentRecommendationProfile, StudentRecommendedCourse, StudentRecommendationSnapshot, StudentRecommendationState }
