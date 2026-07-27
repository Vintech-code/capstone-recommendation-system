type RecommendationStatus = 'Generated' | 'Reviewed' | 'Superseded'

interface MockCourseMatch {
  code: string
  name: string
  match: number
  eligibility: 'Eligible' | 'Conditional review'
  reasons: string[]
}

interface MockRecommendationRun {
  id: string
  applicantId: string
  applicantName: string
  status: RecommendationStatus
  version: number
  generatedAt: string
  generatedLabel: string
  assessmentVersion: string
  resultVersion: string
  ruleVersion: string
  matches: MockCourseMatch[]
}

const courseSets: MockCourseMatch[][] = [
  [
    {
      code: 'BSIT',
      name: 'BS Information Technology',
      match: 92,
      eligibility: 'Eligible',
      reasons: ['Strong interest alignment', 'Academic profile alignment'],
    },
    {
      code: 'BSCS',
      name: 'BS Computer Science',
      match: 87,
      eligibility: 'Eligible',
      reasons: ['Analytical interest pattern', 'Technology-oriented profile'],
    },
    {
      code: 'BSBA',
      name: 'BS Business Administration',
      match: 78,
      eligibility: 'Conditional review',
      reasons: ['Organizational interest', 'Communication-oriented profile'],
    },
  ],
  [
    {
      code: 'BSBA',
      name: 'BS Business Administration',
      match: 90,
      eligibility: 'Eligible',
      reasons: ['Leadership interest alignment', 'Organizational profile'],
    },
    {
      code: 'BSE',
      name: 'Bachelor of Secondary Education',
      match: 84,
      eligibility: 'Eligible',
      reasons: ['Social interest alignment', 'Communication profile'],
    },
    {
      code: 'BSIT',
      name: 'BS Information Technology',
      match: 76,
      eligibility: 'Conditional review',
      reasons: ['Problem-solving interest', 'Academic profile alignment'],
    },
  ],
]

const identities = [
  ['REC-001', 'APP-001', 'Alex Rivera', 'Generated', 1, 'Jul 27, 2026'],
  ['REC-002', 'APP-002', 'Jamie Cruz', 'Reviewed', 1, 'Jul 26, 2026'],
  ['REC-003', 'APP-003', 'Sam Reyes', 'Superseded', 2, 'Jul 25, 2026'],
  ['REC-004', 'APP-004', 'Taylor Santos', 'Generated', 1, 'Jul 24, 2026'],
  ['REC-005', 'APP-005', 'Jordan Flores', 'Reviewed', 1, 'Jul 23, 2026'],
  ['REC-006', 'APP-006', 'Casey Mendoza', 'Superseded', 3, 'Jul 22, 2026'],
  ['REC-007', 'APP-007', 'Morgan Garcia', 'Generated', 1, 'Jul 21, 2026'],
  ['REC-008', 'APP-008', 'Riley Navarro', 'Reviewed', 1, 'Jul 20, 2026'],
  ['REC-009', 'APP-009', 'Avery Ramos', 'Superseded', 2, 'Jul 19, 2026'],
] as const

// Synthetic recommendation values demonstrate UI only. They are not official
// TCC courses, eligibility decisions, weights, validation cases, or evidence.
const mockRecommendationRuns: MockRecommendationRun[] = identities.map(
  ([id, applicantId, applicantName, status, version, generatedLabel], index) => ({
    id,
    applicantId,
    applicantName,
    status,
    version,
    generatedAt: `2026-07-${String(27 - index).padStart(2, '0')}T09:00:00+08:00`,
    generatedLabel,
    assessmentVersion: 'QNR-01',
    resultVersion: `RES-${String(index + 1).padStart(3, '0')}-v1`,
    ruleVersion: 'RULE-01',
    matches: courseSets[index % courseSets.length],
  }),
)

const recommendationStatuses: RecommendationStatus[] = [
  'Generated',
  'Reviewed',
  'Superseded',
]

export { mockRecommendationRuns, recommendationStatuses }
export type {
  MockCourseMatch,
  MockRecommendationRun,
  RecommendationStatus,
}
