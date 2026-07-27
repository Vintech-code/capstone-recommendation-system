type StudentDecisionStatus = 'Accepted' | 'Undecided' | 'Declined'

interface MockStudentDecision {
  id: string
  applicantId: string
  applicantName: string
  recommendationId: string
  recommendedCourse: string
  selectedCourse: string
  status: StudentDecisionStatus
  note: string
  recordedAt: string
  recordedLabel: string
}

// Synthetic decisions demonstrate review UI only. They are not enrollment,
// admission, placement, or approved institutional outcome records.
const mockStudentDecisions: MockStudentDecision[] = [
  {
    id: 'DEC-001',
    applicantId: 'APP-001',
    applicantName: 'Alex Rivera',
    recommendationId: 'REC-001',
    recommendedCourse: 'BS Information Technology',
    selectedCourse: 'BS Information Technology',
    status: 'Accepted',
    note: 'The applicant selected the first synthetic recommendation.',
    recordedAt: '2026-07-28T08:15:00+08:00',
    recordedLabel: 'Jul 28, 2026',
  },
  {
    id: 'DEC-002',
    applicantId: 'APP-002',
    applicantName: 'Jamie Cruz',
    recommendationId: 'REC-002',
    recommendedCourse: 'BS Business Administration',
    selectedCourse: 'No selection recorded',
    status: 'Undecided',
    note: 'The applicant has not recorded a final preference.',
    recordedAt: '2026-07-27T14:25:00+08:00',
    recordedLabel: 'Jul 27, 2026',
  },
  {
    id: 'DEC-003',
    applicantId: 'APP-003',
    applicantName: 'Sam Reyes',
    recommendationId: 'REC-003',
    recommendedCourse: 'BS Information Technology',
    selectedCourse: 'BS Computer Science',
    status: 'Declined',
    note: 'The applicant selected another synthetic course option.',
    recordedAt: '2026-07-26T11:40:00+08:00',
    recordedLabel: 'Jul 26, 2026',
  },
  {
    id: 'DEC-004',
    applicantId: 'APP-004',
    applicantName: 'Taylor Santos',
    recommendationId: 'REC-004',
    recommendedCourse: 'BS Business Administration',
    selectedCourse: 'BS Business Administration',
    status: 'Accepted',
    note: 'The applicant selected the first synthetic recommendation.',
    recordedAt: '2026-07-25T09:30:00+08:00',
    recordedLabel: 'Jul 25, 2026',
  },
  {
    id: 'DEC-005',
    applicantId: 'APP-005',
    applicantName: 'Jordan Flores',
    recommendationId: 'REC-005',
    recommendedCourse: 'BS Information Technology',
    selectedCourse: 'No selection recorded',
    status: 'Undecided',
    note: 'The applicant has not recorded a final preference.',
    recordedAt: '2026-07-24T16:05:00+08:00',
    recordedLabel: 'Jul 24, 2026',
  },
  {
    id: 'DEC-006',
    applicantId: 'APP-006',
    applicantName: 'Casey Mendoza',
    recommendationId: 'REC-006',
    recommendedCourse: 'BS Business Administration',
    selectedCourse: 'Bachelor of Secondary Education',
    status: 'Declined',
    note: 'The applicant selected another synthetic course option.',
    recordedAt: '2026-07-23T13:55:00+08:00',
    recordedLabel: 'Jul 23, 2026',
  },
]

const studentDecisionStatuses: StudentDecisionStatus[] = [
  'Accepted',
  'Undecided',
  'Declined',
]

export { mockStudentDecisions, studentDecisionStatuses }
export type { MockStudentDecision, StudentDecisionStatus }
