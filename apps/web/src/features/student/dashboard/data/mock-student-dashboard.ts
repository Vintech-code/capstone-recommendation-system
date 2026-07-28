import {
  BookOpenCheck,
  ClipboardCheck,
  FileClock,
  FileText,
  HeartHandshake,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import type { StatusTone } from '@/components/shared/status-badge'

interface StudentJourneyStage {
  id: string
  label: string
  description: string
  status: string
  tone: StatusTone
  actionLabel: string
  moduleId: string
  icon: LucideIcon
}

interface StudentAvailableAction {
  id: string
  label: string
  description: string
  moduleId: string
  icon: LucideIcon
}

const studentJourney: StudentJourneyStage[] = [
  {
    id: 'profile',
    label: 'Profile & application',
    description:
      'Review the applicant information connected to your current application.',
    status: 'In progress',
    tone: 'info',
    actionLabel: 'Continue profile',
    moduleId: 'profile',
    icon: UserRound,
  },
  {
    id: 'official-result',
    label: 'Official result',
    description:
      'View the examination information made available to your account.',
    status: 'Available to view',
    tone: 'success',
    actionLabel: 'View result',
    moduleId: 'official-result',
    icon: ClipboardCheck,
  },
  {
    id: 'assessment',
    label: 'Interest assessment',
    description:
      'Continue your saved interest-assessment session when you are ready.',
    status: 'Ready to continue',
    tone: 'warning',
    actionLabel: 'Continue assessment',
    moduleId: 'assessment',
    icon: FileClock,
  },
  {
    id: 'guidance',
    label: 'Course guidance',
    description:
      'Review the status, explanations, and limitations of your course guidance.',
    status: 'Available to review',
    tone: 'success',
    actionLabel: 'Review guidance',
    moduleId: 'guidance',
    icon: BookOpenCheck,
  },
  {
    id: 'decision',
    label: 'My decision',
    description:
      'Record or revise the course preference connected to your guidance.',
    status: 'Still deciding',
    tone: 'info',
    actionLabel: 'Review decision',
    moduleId: 'decision',
    icon: HeartHandshake,
  },
  {
    id: 'report',
    label: 'My report',
    description:
      'Preview, print, or download your available course-guidance summary.',
    status: 'Available',
    tone: 'success',
    actionLabel: 'Open report',
    moduleId: 'report',
    icon: FileText,
  },
]

const studentAvailableActions: StudentAvailableAction[] = [
  {
    id: 'review-profile',
    label: 'Review applicant information',
    description: 'Check the information currently connected to your account.',
    moduleId: 'profile',
    icon: UserRound,
  },
  {
    id: 'view-result',
    label: 'View official result',
    description: 'Open your read-only examination information.',
    moduleId: 'official-result',
    icon: ClipboardCheck,
  },
  {
    id: 'review-guidance',
    label: 'Review course guidance',
    description: 'Compare ranked course options and recorded explanations.',
    moduleId: 'guidance',
    icon: BookOpenCheck,
  },
  {
    id: 'review-decision',
    label: 'Review my decision',
    description: 'Record or revise your current course preference.',
    moduleId: 'decision',
    icon: HeartHandshake,
  },
  {
    id: 'open-report',
    label: 'Open my report',
    description: 'Preview, print, or download your guidance summary.',
    moduleId: 'report',
    icon: FileText,
  },
]

export { studentAvailableActions, studentJourney }
export type { StudentAvailableAction, StudentJourneyStage }
