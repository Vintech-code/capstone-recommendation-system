interface ProgrammeMediaPosition {
  x: number
  y: number
  zoom: number
}

interface CareerOpportunity {
  label: string
  description?: string
  escoUri: string
  escoCode?: string | null
  iscoCode?: string | null
  skills: string[]
  source: 'esco'
  sourceLanguage: string
  sourceVersion: string
  retrievedAt: string
  reviewStatus: 'proposed'
}

interface StudentProgramme {
  id: string
  name: string
  code: string
  eligibilityGroup?: 'board' | 'non_board' | null
  majors: string[]
  riasecProfile: string[]
  description: string
  learningAreas: string[]
  learningAreaDescriptions?: Record<string, string>
  learningAreaTopics?: Record<string, string[]>
  careerDirections: string[]
  careerOpportunities?: CareerOpportunity[]
  recommendedStrands: string[]
  strandGuidance: string
  requirements: string[]
  readinessPrompt: string
  contentVersion?: string | null
  degreeType?: string
  duration?: {
    status: 'ched_psg' | 'needs_tcc_confirmation'
    display: string
    source_name?: string
    source_url?: string
    note?: string
  } | null
  salary?: { status: string; display?: string } | null
  jobGrowth?: { status: string; display?: string } | null
  outlookVersion?: string | null
  coverImageUrl?: string | null
  logoImageUrl?: string | null
  coverImagePosition?: ProgrammeMediaPosition | null
  logoImagePosition?: ProgrammeMediaPosition | null
}

interface StudentProgrammeCatalogue {
  academicYear: string
  catalogueVersion: number
  programmes: StudentProgramme[]
}

interface StudentProgrammeMatchContext {
  programmeId: string
  match: number
  factors: string[]
}

export type { CareerOpportunity, ProgrammeMediaPosition, StudentProgramme, StudentProgrammeCatalogue, StudentProgrammeMatchContext }
