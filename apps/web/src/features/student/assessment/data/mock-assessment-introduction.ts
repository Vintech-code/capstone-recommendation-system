import {
  ClipboardCheck,
  FileCheck2,
  Save,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

import type { StatusTone } from '@/components/shared/status-badge'

interface AssessmentReadinessItem {
  id: string
  label: string
  description: string
  status: string
  tone: StatusTone
}

interface AssessmentExpectation {
  id: string
  label: string
  description: string
  icon: LucideIcon
}

const mockAssessmentIntroduction = {
  versionReference: 'IA-2026-01',
  availability: 'Available',
  readiness: [
    {
      id: 'profile',
      label: 'Profile information',
      description: 'Your Student profile is available for this assessment.',
      status: 'Ready',
      tone: 'success',
    },
    {
      id: 'result',
      label: 'Official result',
      description: 'A verified examination record is available to your account.',
      status: 'Ready',
      tone: 'success',
    },
    {
      id: 'session',
      label: 'Assessment session',
      description: 'A session can be opened from this introduction.',
      status: 'Ready to begin',
      tone: 'info',
    },
  ] satisfies AssessmentReadinessItem[],
  expectations: [
    {
      id: 'respond',
      label: 'Respond honestly',
      description:
        'Choose the response that best represents your current interests.',
      icon: ClipboardCheck,
    },
    {
      id: 'save',
      label: 'Progress feedback',
      description:
        'The assessment workspace will show when responses are saving or saved.',
      icon: Save,
    },
    {
      id: 'review',
      label: 'Review before submission',
      description:
        'Check your responses before using the final submission action.',
      icon: FileCheck2,
    },
    {
      id: 'boundary',
      label: 'Guidance, not diagnosis',
      description:
        'The assessment supports course guidance and is not a diagnosis or admission decision.',
      icon: ShieldCheck,
    },
  ] satisfies AssessmentExpectation[],
} as const

export { mockAssessmentIntroduction }
export type { AssessmentExpectation, AssessmentReadinessItem }
