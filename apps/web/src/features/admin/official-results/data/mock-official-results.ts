type OfficialResultSource = 'Manual encoding' | 'CSV import'

type OfficialResultReviewState =
  | 'Verification review'
  | 'Verified'
  | 'Correction review'

interface MockOfficialResult {
  id: string
  applicantId: string
  applicantName: string
  source: OfficialResultSource
  reviewState: OfficialResultReviewState
  scoreDisplay: string
  scaleLabel: string
  version: number
  createdAt: string
  createdLabel: string
  updatedAt: string
  updatedLabel: string
}

interface MockResultHistoryEntry {
  id: string
  title: string
  description: string
  version: number
  occurredAt: string
  occurredLabel: string
}

// Synthetic result values exist only to demonstrate the prototype UI.
// They are not an official TCC score format, scale, threshold, or production seed.
const mockOfficialResults: MockOfficialResult[] = [
  {
    id: 'RES-001',
    applicantId: 'APP-001',
    applicantName: 'Alex Rivera',
    source: 'Manual encoding',
    reviewState: 'Verification review',
    scoreDisplay: '87.5',
    scaleLabel: '100-point scale',
    version: 1,
    createdAt: '2026-07-24T09:15:00+08:00',
    createdLabel: 'Jul 24, 2026',
    updatedAt: '2026-07-27T08:45:00+08:00',
    updatedLabel: 'Jul 27, 2026',
  },
  {
    id: 'RES-002',
    applicantId: 'APP-002',
    applicantName: 'Jamie Cruz',
    source: 'CSV import',
    reviewState: 'Verified',
    scoreDisplay: '91.0',
    scaleLabel: '100-point scale',
    version: 1,
    createdAt: '2026-07-23T14:10:00+08:00',
    createdLabel: 'Jul 23, 2026',
    updatedAt: '2026-07-26T14:10:00+08:00',
    updatedLabel: 'Jul 26, 2026',
  },
  {
    id: 'RES-003',
    applicantId: 'APP-003',
    applicantName: 'Sam Reyes',
    source: 'Manual encoding',
    reviewState: 'Correction review',
    scoreDisplay: '84.0',
    scaleLabel: '100-point scale',
    version: 2,
    createdAt: '2026-07-20T11:30:00+08:00',
    createdLabel: 'Jul 20, 2026',
    updatedAt: '2026-07-25T11:30:00+08:00',
    updatedLabel: 'Jul 25, 2026',
  },
  {
    id: 'RES-004',
    applicantId: 'APP-004',
    applicantName: 'Taylor Santos',
    source: 'CSV import',
    reviewState: 'Verification review',
    scoreDisplay: '89.5',
    scaleLabel: '100-point scale',
    version: 1,
    createdAt: '2026-07-22T09:15:00+08:00',
    createdLabel: 'Jul 22, 2026',
    updatedAt: '2026-07-24T09:15:00+08:00',
    updatedLabel: 'Jul 24, 2026',
  },
  {
    id: 'RES-005',
    applicantId: 'APP-005',
    applicantName: 'Jordan Flores',
    source: 'Manual encoding',
    reviewState: 'Verified',
    scoreDisplay: '93.0',
    scaleLabel: '100-point scale',
    version: 1,
    createdAt: '2026-07-20T16:20:00+08:00',
    createdLabel: 'Jul 20, 2026',
    updatedAt: '2026-07-23T16:20:00+08:00',
    updatedLabel: 'Jul 23, 2026',
  },
  {
    id: 'RES-006',
    applicantId: 'APP-006',
    applicantName: 'Casey Mendoza',
    source: 'CSV import',
    reviewState: 'Correction review',
    scoreDisplay: '82.5',
    scaleLabel: '100-point scale',
    version: 3,
    createdAt: '2026-07-18T13:40:00+08:00',
    createdLabel: 'Jul 18, 2026',
    updatedAt: '2026-07-22T13:40:00+08:00',
    updatedLabel: 'Jul 22, 2026',
  },
  {
    id: 'RES-007',
    applicantId: 'APP-007',
    applicantName: 'Morgan Garcia',
    source: 'Manual encoding',
    reviewState: 'Verification review',
    scoreDisplay: '86.0',
    scaleLabel: '100-point scale',
    version: 1,
    createdAt: '2026-07-19T10:05:00+08:00',
    createdLabel: 'Jul 19, 2026',
    updatedAt: '2026-07-21T10:05:00+08:00',
    updatedLabel: 'Jul 21, 2026',
  },
  {
    id: 'RES-008',
    applicantId: 'APP-008',
    applicantName: 'Riley Navarro',
    source: 'CSV import',
    reviewState: 'Verified',
    scoreDisplay: '90.5',
    scaleLabel: '100-point scale',
    version: 1,
    createdAt: '2026-07-18T15:55:00+08:00',
    createdLabel: 'Jul 18, 2026',
    updatedAt: '2026-07-20T15:55:00+08:00',
    updatedLabel: 'Jul 20, 2026',
  },
  {
    id: 'RES-009',
    applicantId: 'APP-009',
    applicantName: 'Avery Ramos',
    source: 'Manual encoding',
    reviewState: 'Correction review',
    scoreDisplay: '85.5',
    scaleLabel: '100-point scale',
    version: 2,
    createdAt: '2026-07-16T08:35:00+08:00',
    createdLabel: 'Jul 16, 2026',
    updatedAt: '2026-07-19T08:35:00+08:00',
    updatedLabel: 'Jul 19, 2026',
  },
]

const officialResultSources: OfficialResultSource[] = [
  'Manual encoding',
  'CSV import',
]

const officialResultReviewStates: OfficialResultReviewState[] = [
  'Verification review',
  'Verified',
  'Correction review',
]

function getMockResultHistory(
  result: MockOfficialResult,
): MockResultHistoryEntry[] {
  const createdEntry: MockResultHistoryEntry = {
    id: `${result.id}-created`,
    title:
      result.source === 'CSV import'
        ? 'Result record imported'
        : 'Result record encoded',
    description: 'The original mock record version was created.',
    version: 1,
    occurredAt: result.createdAt,
    occurredLabel: result.createdLabel,
  }

  if (result.reviewState === 'Verification review') {
    return [createdEntry]
  }

  if (result.reviewState === 'Verified') {
    return [
      {
        id: `${result.id}-verified`,
        title: 'Verification recorded',
        description: 'The mock record moved to verified review state.',
        version: result.version,
        occurredAt: result.updatedAt,
        occurredLabel: result.updatedLabel,
      },
      createdEntry,
    ]
  }

  return [
    {
      id: `${result.id}-correction`,
      title: 'Correction version created',
      description:
        'A new mock version was created while the previous version was retained.',
      version: result.version,
      occurredAt: result.updatedAt,
      occurredLabel: result.updatedLabel,
    },
    createdEntry,
  ]
}

export {
  getMockResultHistory,
  mockOfficialResults,
  officialResultReviewStates,
  officialResultSources,
}
export type {
  MockOfficialResult,
  MockResultHistoryEntry,
  OfficialResultReviewState,
  OfficialResultSource,
}
