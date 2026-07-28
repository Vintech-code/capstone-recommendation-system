import {
  Activity,
  Database,
  KeyRound,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'

import type { StatusTone } from '@/components/shared/status-badge'

type SystemAdminRange = '24h' | '7d'

interface SystemAdminMetric {
  id: string
  label: string
  values: Record<SystemAdminRange, string>
  helper: string
  moduleId: string
  icon: typeof UsersRound
  tone: 'primary' | 'blue' | 'teal' | 'amber'
}

interface ServiceStatus {
  id: string
  label: string
  detail: string
  status: string
  tone: StatusTone
  icon: typeof Database
}

interface AccessTask {
  id: string
  title: string
  detail: string
  timestamp: string
  status: string
  tone: StatusTone
  moduleId: string
}

interface AuditEvent {
  id: string
  title: string
  actor: string
  timestamp: string
  icon: typeof Activity
}

const systemAdminMetrics: SystemAdminMetric[] = [
  {
    id: 'accounts',
    label: 'Active accounts',
    values: { '24h': '18', '7d': '21' },
    helper: 'Accounts available for portal access',
    moduleId: 'users',
    icon: UsersRound,
    tone: 'primary',
  },
  {
    id: 'access-review',
    label: 'Access reviews',
    values: { '24h': '3', '7d': '5' },
    helper: 'Role or account changes awaiting review',
    moduleId: 'roles',
    icon: KeyRound,
    tone: 'blue',
  },
  {
    id: 'cycles',
    label: 'Configured cycles',
    values: { '24h': '2', '7d': '2' },
    helper: 'Cycle records visible to technical administration',
    moduleId: 'cycles',
    icon: RefreshCw,
    tone: 'teal',
  },
  {
    id: 'audit',
    label: 'Audit events',
    values: { '24h': '12', '7d': '46' },
    helper: 'Recent access and configuration events',
    moduleId: 'audit',
    icon: Activity,
    tone: 'amber',
  },
]

const serviceStatuses: ServiceStatus[] = [
  {
    id: 'api',
    label: 'Application service',
    detail: 'Responding to authenticated requests',
    status: 'Operational',
    tone: 'success',
    icon: ServerCog,
  },
  {
    id: 'database',
    label: 'Database connection',
    detail: 'Connectivity check is available',
    status: 'Operational',
    tone: 'success',
    icon: Database,
  },
  {
    id: 'jobs',
    label: 'Background jobs',
    detail: 'One item requires operator review',
    status: 'Needs review',
    tone: 'warning',
    icon: RefreshCw,
  },
  {
    id: 'backup',
    label: 'Backup evidence',
    detail: 'Latest recorded check is available',
    status: 'Recorded',
    tone: 'info',
    icon: ShieldCheck,
  },
]

const accessTasks: AccessTask[] = [
  {
    id: 'AR-014',
    title: 'Review a new account request',
    detail: 'Confirm the requested portal access before activation.',
    timestamp: 'Today, 9:35 AM',
    status: 'Account review',
    tone: 'info',
    moduleId: 'users',
  },
  {
    id: 'AR-013',
    title: 'Review a role assignment change',
    detail: 'Compare the current and requested role assignment.',
    timestamp: 'Today, 8:50 AM',
    status: 'Role review',
    tone: 'warning',
    moduleId: 'roles',
  },
  {
    id: 'AR-012',
    title: 'Check cycle access configuration',
    detail: 'Review the technical access state for the selected cycle.',
    timestamp: 'Yesterday, 4:18 PM',
    status: 'Cycle review',
    tone: 'neutral',
    moduleId: 'cycles',
  },
]

const auditEvents: AuditEvent[] = [
  {
    id: 'AUD-047',
    title: 'Account status reviewed',
    actor: 'System Administrator',
    timestamp: '9:35 AM',
    icon: UserRoundCheck,
  },
  {
    id: 'AUD-046',
    title: 'Role assignment opened',
    actor: 'System Administrator',
    timestamp: '8:50 AM',
    icon: KeyRound,
  },
  {
    id: 'AUD-045',
    title: 'Cycle configuration viewed',
    actor: 'System Administrator',
    timestamp: 'Yesterday',
    icon: RefreshCw,
  },
]

export {
  accessTasks,
  auditEvents,
  serviceStatuses,
  systemAdminMetrics,
}
export type { SystemAdminRange }
