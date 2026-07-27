type AccessRole = 'student' | 'admin' | 'system-admin'

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
    label: 'Guidance / Psychometrician / Admin',
    shortLabel: 'Admin',
    description: 'Access authorized applicant and guidance workflows.',
  },
  {
    value: 'system-admin',
    label: 'System Administrator',
    shortLabel: 'System Admin',
    description: 'Access limited system administration controls.',
  },
]

export { roleOptions }
export type { AccessRole, RoleOption }
