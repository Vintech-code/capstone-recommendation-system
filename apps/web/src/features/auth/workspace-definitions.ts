import {
  Activity,
  BookOpenCheck,
  ClipboardCheck,
  FileClock,
  FileText,
  HeartHandshake,
  Settings2,
  ShieldCheck,
  UserRound,
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
    title: 'Student dashboard',
    subtitle: 'Your application and course-guidance workspace.',
    workflowTitle: 'Application journey',
    workflow: [
      'Profile & application',
      'Official result',
      'Interest assessment',
      'Course guidance',
      'Student decision',
      'Student report',
    ],
    accessFacts: ['Access to your own records', 'Official results are read-only'],
    boundary:
      'Course guidance supports your decision. It does not guarantee admission or enrolment.',
    modules: [
      {
        id: 'profile',
        title: 'Profile & application',
        description: 'Manage applicant information and admission-cycle work.',
        icon: UserRound,
      },
      {
        id: 'official-result',
        title: 'Official result',
        description: 'View your Admin-verified examination information.',
        icon: ClipboardCheck,
      },
      {
        id: 'assessment',
        title: 'Assessment',
        description: 'Complete the approved interest-assessment process.',
        icon: FileClock,
      },
      {
        id: 'guidance',
        title: 'Course guidance',
        description: 'Review explainable course options and limitations.',
        icon: BookOpenCheck,
      },
      {
        id: 'decision',
        title: 'My decision',
        description: 'Record or revise your current course preference.',
        icon: HeartHandshake,
      },
      {
        id: 'report',
        title: 'My report',
        description: 'Preview, print, or download your guidance summary.',
        icon: FileText,
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
        description: 'Encode, verify, correct, and review result history.',
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
