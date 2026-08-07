interface StudentProgramme {
  id: string
  name: string
  code: string
  majors: string[]
  riasecProfile: string[]
  description: string
  learningAreas: string[]
  learningAreaDescriptions?: Record<string, string>
  learningAreaTopics?: Record<string, string[]>
  careerDirections: string[]
  recommendedStrands: string[]
  strandGuidance: string
  requirements: string[]
  readinessPrompt: string
  contentVersion?: string | null
}

interface StudentProgrammeCatalogue {
  academicYear: string
  catalogueVersion: number
  programmes: StudentProgramme[]
}

export type { StudentProgramme, StudentProgrammeCatalogue }
