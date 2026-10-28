type AccessRole = 'student' | 'admin'

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
    description: 'Access your assessment and programme recommendation workspace.',
  },
  {
    value: 'admin',
    label: 'Administrator',
    shortLabel: 'Admin',
    description: 'Govern programmes, student monitoring, reporting, and audit activity.',
  },
]

export { roleOptions }
export type { AccessRole, RoleOption }
