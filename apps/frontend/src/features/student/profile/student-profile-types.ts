import type { LocationSelection } from '@/features/locations/location-api'

interface StudentProfileIdentity {
  id: number
  name: string
  email: string
  photoUrl: string | null
}

interface PersonalAcademicProfile {
  complete: boolean
  lrn: string | null
  birthDate: string | null
  age: number | null
  phone: string | null
  location?: LocationSelection | null
  addressLine: string | null
  barangay: string | null
  municipality: string | null
  province: string | null
  shsSchoolName: string | null
  shsStrand: string | null
  shsGraduationYear: number | null
  updatedAt: string | null
}

interface StudentProfileQuestionnaire {
  complete: boolean
  strengths: string[]
  growthAreas: string[]
  learningPreferences: string[]
  updatedAt: string | null
}

interface StudentProfileData {
  student: StudentProfileIdentity
  personalAcademic: PersonalAcademicProfile
  questionnaire: StudentProfileQuestionnaire
  options: {
    strengths: string[]
    growthAreas: string[]
    learningPreferences: string[]
  }
  riasec: {
    sessionReference: string
    availableAt: string | null
    code: string
  } | null
  careerInterests: string[]
  about: string
}

interface StudentProfilePayload {
  lrn: string | null
  birthDate: string | null
  phone: string | null
  location?: LocationSelection | null
  addressLine: string | null
  barangay: string | null
  municipality: string | null
  province: string | null
  shsSchoolName: string | null
  shsStrand: string | null
  shsGraduationYear: number | null
  strengths: string[]
  growthAreas: string[]
  learningPreferences: string[]
}

export type { StudentProfileData, StudentProfilePayload }
