type AccessRole = 'student' | 'admin' | 'counselor'

interface RoleOption {
  value: AccessRole
  label: string
  shortLabel: string
  description: string
}

const roleOptions: RoleOption[] = [
  {
    value: 'student',
    label: 'Student Applicant',
    shortLabel: 'Student',
    description: 'Access your application and guidance workspace.',
  },
  {
    value: 'admin',
    label: 'Administrator',
    shortLabel: 'Admin',
    description: 'Govern programmes, counselor accounts, reporting, and audit activity.',
  },
  {
    value: 'counselor',
    label: 'Counselor',
    shortLabel: 'Counselor',
    description: 'Review student records and manage guidance appointments.',
  },
]

export { roleOptions }
export type { AccessRole, RoleOption }
