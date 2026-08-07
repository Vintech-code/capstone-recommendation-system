import {
  BookOpenCheck,
  ClipboardCheck,
  FileClock,
  FileText,
  Upload,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

import type { StatusTone } from '@/components/shared/status-badge'

interface DashboardMetric {
  id: string
  label: string
  value: number
  helper: string
  route: string
  icon: LucideIcon
  tone: 'primary' | 'blue' | 'teal' | 'amber' | 'navy'
  trend: number[]
}

interface RecentApplicant {
  id: string
  name: string
  currentArea: string
  status: string
  tone: StatusTone
  updatedAt: string
  route: string
}

interface DashboardActivity {
  id: string
  title: string
  detail: string
  timestamp: string
  route: string
  icon: LucideIcon
}

interface ActivityPoint {
  label: string
  results: number
  assessments: number
  recommendations: number
}

interface ChartState {
  name: string
  value: number
  color: string
}

// Isolated synthetic records for D-015 stakeholder UI prototyping only.
const dashboardMetrics: DashboardMetric[] = [
  {
    id: 'applicants',
    label: 'Applicant records',
    value: 8,
    helper: '4 active reviews',
    route: '/admin/applicants',
    icon: UsersRound,
    tone: 'primary',
    trend: [3, 4, 4, 6, 5, 7, 8],
  },
  {
    id: 'results',
    label: 'Official results',
    value: 12,
    helper: '4 added this week',
    route: '/admin/official-results',
    icon: ClipboardCheck,
    tone: 'blue',
    trend: [5, 6, 6, 8, 7, 9, 12],
  },
  {
    id: 'assessments',
    label: 'Assessment sessions',
    value: 25,
    helper: '12 submitted',
    route: '/admin/assessments',
    icon: FileClock,
    tone: 'teal',
    trend: [12, 15, 14, 18, 17, 21, 25],
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    value: 14,
    helper: '4 awaiting review',
    route: '/admin/recommendations',
    icon: BookOpenCheck,
    tone: 'amber',
    trend: [6, 8, 7, 9, 8, 12, 14],
  },
  {
    id: 'reports',
    label: 'Reports',
    value: 6,
    helper: '2 ready to generate',
    route: '/admin/reports',
    icon: FileText,
    tone: 'navy',
    trend: [2, 3, 2, 4, 3, 5, 6],
  },
]

const recentApplicants: RecentApplicant[] = [
  {
    id: 'APP-004',
    name: 'Taylor Santos',
    currentArea: 'Official result record',
    status: 'Result available',
    tone: 'success',
    updatedAt: 'Jul 28, 2026',
    route: '/admin/applicants/APP-004',
  },
  {
    id: 'APP-003',
    name: 'Sam Reyes',
    currentArea: 'Assessment review',
    status: 'Submitted',
    tone: 'success',
    updatedAt: 'Jul 28, 2026',
    route: '/admin/applicants/APP-003',
  },
  {
    id: 'APP-005',
    name: 'Jordan Flores',
    currentArea: 'Recommendation review',
    status: 'Guidance review',
    tone: 'neutral',
    updatedAt: 'Jul 27, 2026',
    route: '/admin/applicants/APP-005',
  },
  {
    id: 'APP-006',
    name: 'Casey Mendoza',
    currentArea: 'Import follow-up',
    status: 'Needs attention',
    tone: 'danger',
    updatedAt: 'Jul 27, 2026',
    route: '/admin/applicants/APP-006',
  },
  {
    id: 'APP-008',
    name: 'Riley Navarro',
    currentArea: 'Assessment session',
    status: 'In progress',
    tone: 'info',
    updatedAt: 'Jul 26, 2026',
    route: '/admin/applicants/APP-008',
  },
]

const activities: DashboardActivity[] = [
  {
    id: 'ACT-001',
    title: 'Official result added',
    detail: 'Taylor Santos - RES-004',
    timestamp: '9:40 AM',
    route: '/admin/official-results/RES-004',
    icon: ClipboardCheck,
  },
  {
    id: 'ACT-002',
    title: 'Import reconciled',
    detail: 'Batch IMP-001',
    timestamp: '9:12 AM',
    route: '/admin/imports/IMP-001',
    icon: Upload,
  },
  {
    id: 'ACT-003',
    title: 'Assessment submitted',
    detail: 'Sam Reyes - ASM-003',
    timestamp: 'Yesterday',
    route: '/admin/assessments/ASM-003',
    icon: FileClock,
  },
  {
    id: 'ACT-004',
    title: 'Recommendation reviewed',
    detail: 'Jordan Flores - REC-005',
    timestamp: 'Yesterday',
    route: '/admin/recommendations/REC-005',
    icon: BookOpenCheck,
  },
  {
    id: 'ACT-005',
    title: 'Report generated',
    detail: 'Guidance report - RPT-001',
    timestamp: 'Jul 26',
    route: '/admin/reports/RPT-001',
    icon: FileText,
  },
]

const activityByRange: Record<'7d' | '30d', ActivityPoint[]> = {
  '7d': [
    { label: 'Mon', results: 3, assessments: 5, recommendations: 2 },
    { label: 'Tue', results: 5, assessments: 4, recommendations: 3 },
    { label: 'Wed', results: 4, assessments: 7, recommendations: 4 },
    { label: 'Thu', results: 7, assessments: 6, recommendations: 3 },
    { label: 'Fri', results: 6, assessments: 9, recommendations: 5 },
    { label: 'Sat', results: 8, assessments: 7, recommendations: 4 },
    { label: 'Sun', results: 9, assessments: 10, recommendations: 6 },
  ],
  '30d': [
    { label: 'Week 1', results: 18, assessments: 23, recommendations: 12 },
    { label: 'Week 2', results: 24, assessments: 28, recommendations: 16 },
    { label: 'Week 3', results: 21, assessments: 34, recommendations: 19 },
    { label: 'Week 4', results: 31, assessments: 38, recommendations: 24 },
  ],
}

const assessmentStates: ChartState[] = [
  { name: 'Submitted', value: 12, color: 'var(--primary)' },
  { name: 'In progress', value: 8, color: 'var(--chart-blue)' },
  { name: 'Not started', value: 5, color: 'var(--chart-slate)' },
]

const recommendationStates: ChartState[] = [
  { name: 'Reviewed', value: 8, color: 'var(--primary)' },
  { name: 'Awaiting review', value: 4, color: 'var(--chart-blue)' },
  { name: 'Needs attention', value: 2, color: 'var(--chart-slate)' },
]

export {
  activities,
  activityByRange,
  assessmentStates,
  dashboardMetrics,
  recentApplicants,
  recommendationStates,
}
