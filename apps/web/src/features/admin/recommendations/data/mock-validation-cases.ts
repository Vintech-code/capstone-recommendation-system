type ValidationCaseStatus = 'Match' | 'Discrepancy' | 'Needs review'

interface MockValidationCase {
  id: string
  title: string
  applicantProfile: string
  expectedTopCourse: string
  actualTopCourse: string
  expectedEligibility: string
  actualEligibility: string
  status: ValidationCaseStatus
  assessmentVersion: string
  ruleVersion: string
  rationale: string
  lastRunAt: string
  lastRunLabel: string
}

// Synthetic cases demonstrate expert-review UI only. They are not approved
// TCC expected outcomes, course mappings, eligibility rules, or evidence.
const mockValidationCases: MockValidationCase[] = [
  {
    id: 'VAL-001',
    title: 'Technology-oriented profile',
    applicantProfile: 'High investigative and realistic interest pattern',
    expectedTopCourse: 'BS Information Technology',
    actualTopCourse: 'BS Information Technology',
    expectedEligibility: 'Eligible',
    actualEligibility: 'Eligible',
    status: 'Match',
    assessmentVersion: 'QNR-01',
    ruleVersion: 'RULE-01',
    rationale: 'Expected and generated top course align in this synthetic case.',
    lastRunAt: '2026-07-28T00:40:00+08:00',
    lastRunLabel: 'Jul 28, 2026',
  },
  {
    id: 'VAL-002',
    title: 'Social leadership profile',
    applicantProfile: 'High social and enterprising interest pattern',
    expectedTopCourse: 'Bachelor of Secondary Education',
    actualTopCourse: 'BS Business Administration',
    expectedEligibility: 'Eligible',
    actualEligibility: 'Eligible',
    status: 'Discrepancy',
    assessmentVersion: 'QNR-01',
    ruleVersion: 'RULE-01',
    rationale:
      'The generated ranking differs from the expert-expected top course.',
    lastRunAt: '2026-07-27T15:15:00+08:00',
    lastRunLabel: 'Jul 27, 2026',
  },
  {
    id: 'VAL-003',
    title: 'Conditional academic profile',
    applicantProfile: 'Investigative interest with a conditional source result',
    expectedTopCourse: 'BS Computer Science',
    actualTopCourse: 'BS Computer Science',
    expectedEligibility: 'Conditional review',
    actualEligibility: 'Eligible',
    status: 'Discrepancy',
    assessmentVersion: 'QNR-01',
    ruleVersion: 'RULE-02',
    rationale:
      'The ranking aligns, but the synthetic eligibility outcome requires review.',
    lastRunAt: '2026-07-27T13:05:00+08:00',
    lastRunLabel: 'Jul 27, 2026',
  },
  {
    id: 'VAL-004',
    title: 'Incomplete assessment input',
    applicantProfile: 'Assessment response set is incomplete',
    expectedTopCourse: 'No recommendation',
    actualTopCourse: 'Not run',
    expectedEligibility: 'Needs review',
    actualEligibility: 'Needs review',
    status: 'Needs review',
    assessmentVersion: 'QNR-02',
    ruleVersion: 'RULE-02',
    rationale:
      'The case is held until its synthetic input snapshot is complete.',
    lastRunAt: '2026-07-26T10:20:00+08:00',
    lastRunLabel: 'Jul 26, 2026',
  },
  {
    id: 'VAL-005',
    title: 'Creative communication profile',
    applicantProfile: 'High artistic and social interest pattern',
    expectedTopCourse: 'BA Communication',
    actualTopCourse: 'BA Communication',
    expectedEligibility: 'Eligible',
    actualEligibility: 'Eligible',
    status: 'Match',
    assessmentVersion: 'QNR-02',
    ruleVersion: 'RULE-02',
    rationale: 'Expected and generated outputs align in this synthetic case.',
    lastRunAt: '2026-07-25T09:10:00+08:00',
    lastRunLabel: 'Jul 25, 2026',
  },
]

const validationCaseStatuses: ValidationCaseStatus[] = [
  'Match',
  'Discrepancy',
  'Needs review',
]

export { mockValidationCases, validationCaseStatuses }
export type { MockValidationCase, ValidationCaseStatus }
