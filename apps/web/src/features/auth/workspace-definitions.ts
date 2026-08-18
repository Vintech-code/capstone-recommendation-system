import {
  Activity,
  BookOpenCheck,
  ClipboardList,
  FileText,
  History,
  UsersRound,
  UserRound,
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
    accessFacts: ['Access to your own assessment and guidance records'],
    boundary:
      'Course recommendations are limited to the approved TCC catalogue supplied by the backend.',
    modules: [
      {
        id: 'assessment',
        title: 'Interest assessment',
        description: 'Answer the 30 RIASEC-based questions.',
        icon: ClipboardList,
      },
      {
        id: 'programmes',
        title: 'Explore Programs',
        description: 'Explore programmes in the current TCC catalogue.',
        icon: BookOpenCheck,
      },
      {
        id: 'recommendations',
        title: 'My Matches',
        description: 'View programme matches from your completed assessment.',
        icon: BookOpenCheck,
      },
      {
        id: 'history',
        title: 'Assessment history',
        description: 'Review previous assessment results and saved programme matches.',
        icon: History,
      },
      {
        id: 'profile',
        title: 'My Profile',
        description: 'Review and update your student-reported profile information.',
        icon: UserRound,
      },
    ],
  },
  admin: {
    title: 'Administration workspace',
    subtitle:
      'Programme governance, counselor accounts, student monitoring, and reporting.',
    workflowTitle: 'Administration workflow',
    workflow: [
      'Find a student record',
      'Review assessment history',
      'Manage counselor access',
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
        description: 'Search students and review their guidance records.',
        icon: UsersRound,
      },
      {
        id: 'counselors',
        title: 'Counselor accounts',
        description: 'Create, suspend, reactivate, and reset counselor accounts.',
        icon: UsersRound,
      },
      {
        id: 'assessments',
        title: 'Assessments',
        description: 'Monitor assessment attempts and processing outcomes.',
        icon: ClipboardList,
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
        description: 'Review guidance, configuration, and report audit events.',
        icon: Activity,
      },
    ],
  },
  counselor: {
    title: 'Counselor workspace',
    subtitle: 'Student course guidance, concerns, cases, and follow-ups.',
    workflowTitle: 'Counseling workflow',
    workflow: [
      'Review student concerns',
      'Review assessment and programme matches',
      'Document guidance notes and an action plan',
      'Record follow-up progress or resolve the concern',
    ],
    accessFacts: [
      'Individual counselor account',
      'Read-only assessment and recommendation evidence',
    ],
    boundary:
      'Counselors cannot edit programme governance, API-sourced facts, or staff accounts.',
    modules: [
      {
        id: 'students',
        title: 'Student records',
        description: 'Review student assessments, matches, and guidance history.',
        icon: UsersRound,
      },
      {
        id: 'requests',
        title: 'Guidance requests',
        description: 'Respond to student course concerns and advice requests.',
        icon: ClipboardList,
      },
      {
        id: 'follow-ups',
        title: 'Follow-ups',
        description: 'Monitor open cases and scheduled follow-up work.',
        icon: Activity,
      },
      {
        id: 'reports',
        title: 'Reports',
        description: 'Generate read-only aggregate guidance reports.',
        icon: FileText,
      },
    ],
  },
}

export { dashboards }
export type { DashboardDefinition, DashboardModule }
