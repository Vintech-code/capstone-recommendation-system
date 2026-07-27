import {
  BookOpenCheck,
  CircleAlert,
  ClipboardCheck,
  FileCheck2,
  FileClock,
  FileText,
  Upload,
  UserRoundSearch,
  type LucideIcon,
} from 'lucide-react'

import type { StatusTone } from '@/components/shared/status-badge'

type WorkArea =
  | 'all'
  | 'official-results'
  | 'imports'
  | 'assessments'
  | 'recommendations'

interface DashboardPriority {
  id: Exclude<WorkArea, 'all'>
  label: string
  count: number
  helper: string
  route: string
  icon: LucideIcon
  tone: StatusTone
}

interface DashboardTask {
  id: string
  area: Exclude<WorkArea, 'all'>
  title: string
  subject: string
  context: string
  status: string
  tone: StatusTone
  timestamp: string
  route: string
}

interface QuickAction {
  label: string
  description: string
  route: string
  icon: LucideIcon
}

interface DashboardActivity {
  id: string
  title: string
  detail: string
  timestamp: string
  route: string
  icon: LucideIcon
}

interface WorkflowStage {
  label: string
  helper: string
  status: string
  tone: StatusTone
  route: string
}

// Isolated synthetic records for D-015 stakeholder UI prototyping only.
const priorities: DashboardPriority[] = [
  {
    id: 'official-results',
    label: 'Results to verify',
    count: 4,
    helper: 'Encoded records awaiting review',
    route: '/admin/official-results',
    icon: ClipboardCheck,
    tone: 'warning',
  },
  {
    id: 'imports',
    label: 'Import rows to resolve',
    count: 3,
    helper: 'Rows with missing or duplicate data',
    route: '/admin/imports/IMP-001',
    icon: Upload,
    tone: 'danger',
  },
  {
    id: 'assessments',
    label: 'Assessments to review',
    count: 3,
    helper: 'Submitted sessions ready for review',
    route: '/admin/assessments',
    icon: FileClock,
    tone: 'info',
  },
  {
    id: 'recommendations',
    label: 'Guidance reviews',
    count: 2,
    helper: 'Recommendations needing a decision',
    route: '/admin/recommendations',
    icon: BookOpenCheck,
    tone: 'neutral',
  },
]

const tasks: DashboardTask[] = [
  {
    id: 'TASK-001',
    area: 'official-results',
    title: 'Verify encoded examination result',
    subject: 'Taylor Santos · APP-004',
    context: 'Manual entry has source details and is ready for review.',
    status: 'Awaiting verification',
    tone: 'warning',
    timestamp: 'Today, 9:40 AM',
    route: '/admin/official-results/RES-004',
  },
  {
    id: 'TASK-002',
    area: 'imports',
    title: 'Resolve CSV reconciliation issues',
    subject: 'Import batch IMP-001',
    context: 'Three rows require attention before the batch can proceed.',
    status: 'Needs attention',
    tone: 'danger',
    timestamp: 'Today, 9:12 AM',
    route: '/admin/imports/IMP-001',
  },
  {
    id: 'TASK-003',
    area: 'assessments',
    title: 'Review submitted assessment',
    subject: 'Sam Reyes · APP-003',
    context: 'The submitted session is linked to its questionnaire version.',
    status: 'Ready for review',
    tone: 'info',
    timestamp: 'Yesterday, 4:28 PM',
    route: '/admin/assessments/ASM-003',
  },
  {
    id: 'TASK-004',
    area: 'recommendations',
    title: 'Review recommendation explanation',
    subject: 'Jordan Flores · APP-005',
    context: 'Ranked options and their input-version snapshot are available.',
    status: 'Guidance review',
    tone: 'neutral',
    timestamp: 'Yesterday, 2:05 PM',
    route: '/admin/recommendations/REC-005',
  },
]

const quickActions: QuickAction[] = [
  {
    label: 'Encode result',
    description: 'Add a result to the verification queue.',
    route: '/admin/exam-results/new',
    icon: FileCheck2,
  },
  {
    label: 'Import CSV',
    description: 'Validate and preview a local result file.',
    route: '/admin/imports/new',
    icon: Upload,
  },
  {
    label: 'Review assessments',
    description: 'Open submitted and in-progress sessions.',
    route: '/admin/assessments',
    icon: FileClock,
  },
  {
    label: 'Validation cases',
    description: 'Compare expected and deterministic outputs.',
    route: '/admin/validation-cases',
    icon: CircleAlert,
  },
  {
    label: 'Student decisions',
    description: 'Review recorded course preferences.',
    route: '/admin/decisions',
    icon: UserRoundSearch,
  },
  {
    label: 'Generate report',
    description: 'Open the report workspace and previews.',
    route: '/admin/reports',
    icon: FileText,
  },
]

const activities: DashboardActivity[] = [
  {
    id: 'ACT-001',
    title: 'Result added to verification queue',
    detail: 'Taylor Santos · RES-004',
    timestamp: '9:40 AM',
    route: '/admin/official-results/RES-004',
    icon: ClipboardCheck,
  },
  {
    id: 'ACT-002',
    title: 'Import validation completed',
    detail: 'Batch IMP-001',
    timestamp: '9:12 AM',
    route: '/admin/imports/IMP-001',
    icon: Upload,
  },
  {
    id: 'ACT-003',
    title: 'Assessment submitted',
    detail: 'Sam Reyes · ASM-003',
    timestamp: 'Yesterday',
    route: '/admin/assessments/ASM-003',
    icon: FileClock,
  },
  {
    id: 'ACT-004',
    title: 'Recommendation generated',
    detail: 'Jordan Flores · REC-005',
    timestamp: 'Yesterday',
    route: '/admin/recommendations/REC-005',
    icon: BookOpenCheck,
  },
  {
    id: 'ACT-005',
    title: 'Report prepared',
    detail: 'Guidance report · RPT-001',
    timestamp: 'Jul 26',
    route: '/admin/reports/RPT-001',
    icon: FileText,
  },
]

const workflowStages: WorkflowStage[] = [
  {
    label: 'Applicant records',
    helper: 'Profiles available for authorized review',
    status: 'Review available',
    tone: 'info',
    route: '/admin/applicants',
  },
  {
    label: 'Official results',
    helper: 'Verification and reconciliation work is pending',
    status: 'Action required',
    tone: 'warning',
    route: '/admin/official-results',
  },
  {
    label: 'Assessments',
    helper: 'Submitted and in-progress sessions are separated',
    status: 'Review available',
    tone: 'info',
    route: '/admin/assessments',
  },
  {
    label: 'Recommendations',
    helper: 'Explanations and validation cases can be reviewed',
    status: 'Review available',
    tone: 'neutral',
    route: '/admin/recommendations',
  },
  {
    label: 'Decision & reporting',
    helper: 'Preferences remain separate from enrolment',
    status: 'Records available',
    tone: 'success',
    route: '/admin/decisions',
  },
]

export { activities, priorities, quickActions, tasks, workflowStages }
export type { WorkArea }
