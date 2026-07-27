type AssessmentSessionState = 'In progress' | 'Submitted'

interface MockAssessmentSession {
  id: string
  applicantId: string
  applicantName: string
  state: AssessmentSessionState
  questionnaireVersion: string
  answeredItems: number
  totalItems: number
  startedAt: string
  startedLabel: string
  updatedAt: string
  updatedLabel: string
  submittedAt?: string
  submittedLabel?: string
}

interface MockAssessmentHistoryEntry {
  id: string
  title: string
  description: string
  occurredAt: string
  occurredLabel: string
}

// Synthetic session metadata intentionally excludes questions, responses,
// mappings, scores, and interpretations while OQ-003/OQ-004 are open.
const mockAssessmentSessions: MockAssessmentSession[] = [
  {
    id: 'ASM-001',
    applicantId: 'APP-001',
    applicantName: 'Alex Rivera',
    state: 'In progress',
    questionnaireVersion: 'QNR-01',
    answeredItems: 18,
    totalItems: 42,
    startedAt: '2026-07-25T09:10:00+08:00',
    startedLabel: 'Jul 25, 2026',
    updatedAt: '2026-07-27T09:40:00+08:00',
    updatedLabel: 'Jul 27, 2026',
  },
  {
    id: 'ASM-002',
    applicantId: 'APP-002',
    applicantName: 'Jamie Cruz',
    state: 'Submitted',
    questionnaireVersion: 'QNR-01',
    answeredItems: 42,
    totalItems: 42,
    startedAt: '2026-07-22T14:15:00+08:00',
    startedLabel: 'Jul 22, 2026',
    updatedAt: '2026-07-26T10:20:00+08:00',
    updatedLabel: 'Jul 26, 2026',
    submittedAt: '2026-07-26T10:20:00+08:00',
    submittedLabel: 'Jul 26, 2026',
  },
  {
    id: 'ASM-003',
    applicantId: 'APP-003',
    applicantName: 'Sam Reyes',
    state: 'Submitted',
    questionnaireVersion: 'QNR-01',
    answeredItems: 42,
    totalItems: 42,
    startedAt: '2026-07-21T11:00:00+08:00',
    startedLabel: 'Jul 21, 2026',
    updatedAt: '2026-07-25T15:05:00+08:00',
    updatedLabel: 'Jul 25, 2026',
    submittedAt: '2026-07-25T15:05:00+08:00',
    submittedLabel: 'Jul 25, 2026',
  },
  {
    id: 'ASM-004',
    applicantId: 'APP-004',
    applicantName: 'Taylor Santos',
    state: 'In progress',
    questionnaireVersion: 'QNR-01',
    answeredItems: 27,
    totalItems: 42,
    startedAt: '2026-07-23T08:30:00+08:00',
    startedLabel: 'Jul 23, 2026',
    updatedAt: '2026-07-24T16:45:00+08:00',
    updatedLabel: 'Jul 24, 2026',
  },
  {
    id: 'ASM-005',
    applicantId: 'APP-005',
    applicantName: 'Jordan Flores',
    state: 'Submitted',
    questionnaireVersion: 'QNR-01',
    answeredItems: 42,
    totalItems: 42,
    startedAt: '2026-07-19T13:25:00+08:00',
    startedLabel: 'Jul 19, 2026',
    updatedAt: '2026-07-23T09:50:00+08:00',
    updatedLabel: 'Jul 23, 2026',
    submittedAt: '2026-07-23T09:50:00+08:00',
    submittedLabel: 'Jul 23, 2026',
  },
  {
    id: 'ASM-006',
    applicantId: 'APP-006',
    applicantName: 'Casey Mendoza',
    state: 'In progress',
    questionnaireVersion: 'QNR-01',
    answeredItems: 12,
    totalItems: 42,
    startedAt: '2026-07-20T10:40:00+08:00',
    startedLabel: 'Jul 20, 2026',
    updatedAt: '2026-07-22T14:35:00+08:00',
    updatedLabel: 'Jul 22, 2026',
  },
  {
    id: 'ASM-007',
    applicantId: 'APP-007',
    applicantName: 'Morgan Garcia',
    state: 'Submitted',
    questionnaireVersion: 'QNR-01',
    answeredItems: 42,
    totalItems: 42,
    startedAt: '2026-07-18T09:00:00+08:00',
    startedLabel: 'Jul 18, 2026',
    updatedAt: '2026-07-21T11:15:00+08:00',
    updatedLabel: 'Jul 21, 2026',
    submittedAt: '2026-07-21T11:15:00+08:00',
    submittedLabel: 'Jul 21, 2026',
  },
  {
    id: 'ASM-008',
    applicantId: 'APP-008',
    applicantName: 'Riley Navarro',
    state: 'In progress',
    questionnaireVersion: 'QNR-01',
    answeredItems: 33,
    totalItems: 42,
    startedAt: '2026-07-18T13:10:00+08:00',
    startedLabel: 'Jul 18, 2026',
    updatedAt: '2026-07-20T10:25:00+08:00',
    updatedLabel: 'Jul 20, 2026',
  },
  {
    id: 'ASM-009',
    applicantId: 'APP-009',
    applicantName: 'Avery Ramos',
    state: 'Submitted',
    questionnaireVersion: 'QNR-01',
    answeredItems: 42,
    totalItems: 42,
    startedAt: '2026-07-16T08:20:00+08:00',
    startedLabel: 'Jul 16, 2026',
    updatedAt: '2026-07-19T12:30:00+08:00',
    updatedLabel: 'Jul 19, 2026',
    submittedAt: '2026-07-19T12:30:00+08:00',
    submittedLabel: 'Jul 19, 2026',
  },
]

const assessmentSessionStates: AssessmentSessionState[] = [
  'In progress',
  'Submitted',
]

function getMockAssessmentHistory(
  session: MockAssessmentSession,
): MockAssessmentHistoryEntry[] {
  const history: MockAssessmentHistoryEntry[] = [
    {
      id: `${session.id}-started`,
      title: 'Session started',
      description:
        'The assessment session was linked to its questionnaire version.',
      occurredAt: session.startedAt,
      occurredLabel: session.startedLabel,
    },
  ]

  if (session.submittedAt && session.submittedLabel) {
    history.unshift({
      id: `${session.id}-submitted`,
      title: 'Session submitted',
      description:
        'Submission was recorded without changing its original questionnaire version.',
      occurredAt: session.submittedAt,
      occurredLabel: session.submittedLabel,
    })
  }

  return history
}

export {
  assessmentSessionStates,
  getMockAssessmentHistory,
  mockAssessmentSessions,
}
export type {
  AssessmentSessionState,
  MockAssessmentHistoryEntry,
  MockAssessmentSession,
}
