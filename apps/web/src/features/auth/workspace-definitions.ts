import {
  Activity,
  BookOpenCheck,
  ClipboardCheck,
  ClipboardList,
  FileClock,
  FileText,
  Settings2,
  ShieldCheck,
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
    ],
  },
  admin: {
    title: 'Admin dashboard',
    subtitle:
      'Applicant, examination, assessment, recommendation, and guidance operations.',
    workflowTitle: 'Admin workflow',
    workflow: [
      'Review applicants',
      'Manage official results',
      'Govern assessments',
      'Review recommendations',
    ],
    accessFacts: [
      'Shared role for authorized counselors and psychometricians',
      'Institutional and guidance workflows',
    ],
    boundary:
      'Corrections preserve history. Completed assessment and recommendation records are not overwritten.',
    modules: [
      {
        id: 'applicants',
        title: 'Applicants',
        description: 'Search and review authorized applicant records.',
        icon: UsersRound,
      },
      {
        id: 'official-results',
        title: 'Official results',
        description: 'Add, import, and review official result records.',
        icon: ClipboardCheck,
      },
      {
        id: 'assessments',
        title: 'Assessments & questionnaires',
        description:
          'Review assessment results and govern approved questionnaire versions.',
        icon: FileClock,
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        description:
          'Review explainable recommendations, decisions, and validation cases.',
        icon: BookOpenCheck,
      },
      {
        id: 'courses-rules',
        title: 'Courses & rules',
        description:
          'Govern approved course profiles, catalogue data, and admission rules.',
        icon: Settings2,
      },
      {
        id: 'reports',
        title: 'Reports',
        description:
          'Generate only approved guidance and institutional reports.',
        icon: FileText,
      },
    ],
  },
  'system-admin': {
    title: 'System administration',
    subtitle: 'Access, lifecycle, and technical governance controls.',
    workflowTitle: 'Administration areas',
    workflow: [
      'User access',
      'Role assignments',
      'Admission cycles',
      'Audit activity',
    ],
    accessFacts: [
      'Limited system-administration role',
      'Technical and access controls only',
    ],
    boundary:
      'System administration does not include psychometric interpretation or admission decision authority.',
    modules: [
      {
        id: 'users',
        title: 'User access',
        description: 'Manage the authorized account lifecycle.',
        icon: UsersRound,
      },
      {
        id: 'roles',
        title: 'Role assignments',
        description: 'Manage access using the approved three-role model.',
        icon: ShieldCheck,
      },
      {
        id: 'cycles',
        title: 'Admission cycles',
        description: 'Manage technical cycle and system settings.',
        icon: Settings2,
      },
      {
        id: 'audit',
        title: 'Audit activity',
        description: 'Review system and access activity history.',
        icon: Activity,
      },
    ],
  },
}

export { dashboards }
export type { DashboardDefinition, DashboardModule }
