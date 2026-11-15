import type { LocationSelection } from '@/features/locations/location-api'

interface StudentProfileIdentity {
  id: number
  name: string
  firstName?: string | null
  lastName?: string | null
  email: string
  photoUrl: string | null
}

interface PersonalAcademicProfile {
  complete: boolean
  idNumber: string | null
  birthDate: string | null
  age: number | null
  phone: string | null
  location?: LocationSelection | null
  addressLine: string | null
  barangay: string | null
  municipality: string | null
  province: string | null
  updatedAt: string | null
}

interface StudentProfileData {
  student: StudentProfileIdentity
  personalAcademic: PersonalAcademicProfile
  riasec: {
    sessionReference: string
    availableAt: string | null
    code: string
  } | null
}

interface StudentProfilePayload {
  idNumber: string
  birthDate: string | null
  phone: string | null
  location?: LocationSelection | null
  addressLine: string | null
  barangay: string | null
  municipality: string | null
  province: string | null
}

export type { StudentProfileData, StudentProfilePayload }
