import type { StudentProfileFields } from '@/features/student/profile/schemas/student-profile-schema'

const mockStudentProfile: StudentProfileFields = {
  fullName: 'Jamie Rivera',
  contactEmail: 'jamie.rivera@example.test',
  mobileNumber: '+63 900 000 0000',
  currentSchool: 'Sample Senior High School',
  currentLevel: 'Grade 12',
  trackOrStrand: 'Sample academic track',
  homeAddress: '',
}

const mockStudentApplication = {
  reference: 'APP-SAMPLE-001',
  cycle: 'Current application cycle',
  status: 'Draft',
  lastSaved: 'Not yet saved in this session',
} as const

export { mockStudentApplication, mockStudentProfile }
