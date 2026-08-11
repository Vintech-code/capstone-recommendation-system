import type { ProgrammeMediaPosition } from '@/features/student/programmes/programme-types'

type StudentRecommendationEligibility = 'Eligible' | 'Needs review' | 'Provisional'

interface PhilippineSourceFact {
  status: 'available' | 'ched_psg' | 'not_published' | 'needs_tcc_confirmation'
  display?: string
  note?: string
  source_name?: string
  source_url?: string
}

interface StudentRecommendedCourse {
  id: string
  rank: number
  code: string
  name: string
  department: string
  duration: string
  durationSource?: PhilippineSourceFact | null
  level: string
  degreeType?: string
  salary?: PhilippineSourceFact | null
  jobGrowth?: PhilippineSourceFact | null
  outlookVersion?: string | null
  match: number
  eligibility: StudentRecommendationEligibility
  summary: string
  factors: string[]
  interestAreas: string[]
  learningAreas: string[]
  learningAreaDescriptions?: Record<string, string>
  careerDirections: string[]
  reviewNotes: string[]
  contentStatus?: 'proposed'
  contentVersion?: string
  coverImageUrl?: string | null
  logoImageUrl?: string | null
  coverImagePosition?: ProgrammeMediaPosition | null
  logoImagePosition?: ProgrammeMediaPosition | null
  explanation?: StudentRecommendationExplanation
}

interface StudentRecommendationExplanation {
  assessmentReference: string | null
  recordedProfileCode: string
  programmeInterestAreas: string[]
  sharedTopAreas: StudentRecommendationEvidenceArea[]
  recordedProgrammeAreas: StudentRecommendationEvidenceArea[]
  learningAreas: string[]
}

interface StudentRecommendationEvidenceArea {
  code: string
  label: string
  score: number
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

export type { PhilippineSourceFact, StudentRecommendationEligibility, StudentRecommendationEvidenceArea, StudentRecommendationExplanation, StudentRecommendationProfile, StudentRecommendedCourse, StudentRecommendationSnapshot, StudentRecommendationState }
