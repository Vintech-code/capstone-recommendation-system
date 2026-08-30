import {
  Activity,
  BookOpenCheck,
  ClipboardList,
  FileText,
  History,
  LibraryBig,
  Target,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

import type { AccessRole } from '@/features/auth/access-types'

interface DashboardModule {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

interface DashboardDefinition {
  title: string
  subtitle: string
  workflowTitle: string
  workflow: string[]
  accessFacts: string[]
  boundary: string
  modules: DashboardModule[]
}

const dashboards: Record<AccessRole, DashboardDefinition> = {
  student: {
    title: 'Pathways',
    subtitle: 'Your interest assessment and TCC course-guidance workspace.',
    workflowTitle: 'Student flow',
    workflow: [
      'Login or register',
      'Take interest assessment',
      'View assessment result',
      'View recommended TCC courses',
      'Review dashboard summary',
    ],
    accessFacts: ['Access to your own assessment and recommendation records'],
    boundary:
      'Course recommendations are limited to the approved TCC catalogue supplied by the backend.',
    modules: [
      {
        id: 'assessment',
        title: 'Interest assessment',
        description: 'Answer the 42 researcher-provided RIASEC questions.',
        icon: ClipboardList,
      },
      {
        id: 'programmes',
        title: 'Explore Programs',
        description: 'Explore programmes in the current TCC catalogue.',
        icon: LibraryBig,
      },
      {
        id: 'recommendations',
        title: 'My Matches',
        description: 'View programme matches from your completed assessment.',
        icon: Target,
      },
      {
        id: 'history',
        title: 'Assessment history',
        description: 'Review previous assessment results and saved programme matches.',
        icon: History,
      },
    ],
  },
  admin: {
    title: 'Administration workspace',
    subtitle:
      'Programme governance, student monitoring, reporting, and audit activity.',
    workflowTitle: 'Administration workflow',
    workflow: [
      'Find a student record',
      'Review assessment history',
      'Review programme governance',
      'Monitor aggregate outcomes',
    ],
    accessFacts: [
      'Individual Administrator accounts',
      'Read-only access to submitted student results',
    ],
    boundary:
      'Administrators govern access and programme content but cannot alter completed student assessments.',
    modules: [
      {
        id: 'students',
        title: 'Students',
        description: 'Search students and monitor immutable assessment records.',
        icon: UsersRound,
      },
      {
        id: 'programmes',
        title: 'Programmes',
        description: 'Review the programme catalogue and RIASEC profiles.',
        icon: BookOpenCheck,
      },
      {
        id: 'reports',
        title: 'Reports',
        description: 'Review aggregate assessment and programme-match activity.',
        icon: FileText,
      },
      {
        id: 'activity',
        title: 'Activity',
        description: 'Review configuration, security, and report audit events.',
        icon: Activity,
      },
    ],
  },
}

export { dashboards }
export type { DashboardDefinition, DashboardModule }
