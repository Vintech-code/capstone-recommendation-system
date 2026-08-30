/**
 * Minimal student-profile shape used by the Admin panel
 * (read-only, staff-facing view of a student's self-declared profile).
 * Moved here after the student-facing My Profile feature was removed.
 */

interface StudentProfileIdentity {
  id: number
  name: string
  email: string
  photoUrl: string | null
}

interface StudentProfileQuestionnaire {
  complete: boolean
  strengths: string[]
  growthAreas: string[]
  learningPreferences: string[]
  updatedAt: string | null
}

interface StudentProfileRiasecResult {
  sessionReference: string
  availableAt: string | null
  primary: { code: string; label: string } | null
  secondary: { code: string; label: string } | null
  code: string
  dimensions: Array<{ code: string; label: string; value: number }>
}

interface StudentProfileData {
  student: StudentProfileIdentity
  questionnaire: StudentProfileQuestionnaire
  options: {
    strengths: string[]
    growthAreas: string[]
    learningPreferences: string[]
  }
  riasec: StudentProfileRiasecResult | null
  careerInterests: string[]
  about: string
}

export type { StudentProfileData, StudentProfileRiasecResult }
