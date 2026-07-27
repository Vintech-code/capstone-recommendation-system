// Synthetic records used only by the frontend prototype.
type ApplicantReviewArea =
  | 'Application review'
  | 'Official result review'
  | 'Assessment review'
  | 'Recommendation review'

interface MockApplicant {
  id: string
  name: string
  email: string
  reviewArea: ApplicantReviewArea
  updatedAt: string
  updatedLabel: string
}

const mockApplicants: MockApplicant[] = [
  {
    id: 'APP-001',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.test',
    reviewArea: 'Application review',
    updatedAt: '2026-07-27T08:45:00+08:00',
    updatedLabel: 'Jul 27, 2026',
  },
  {
    id: 'APP-002',
    name: 'Jamie Cruz',
    email: 'jamie.cruz@example.test',
    reviewArea: 'Official result review',
    updatedAt: '2026-07-26T14:10:00+08:00',
    updatedLabel: 'Jul 26, 2026',
  },
  {
    id: 'APP-003',
    name: 'Sam Reyes',
    email: 'sam.reyes@example.test',
    reviewArea: 'Assessment review',
    updatedAt: '2026-07-25T11:30:00+08:00',
    updatedLabel: 'Jul 25, 2026',
  },
  {
    id: 'APP-004',
    name: 'Taylor Santos',
    email: 'taylor.santos@example.test',
    reviewArea: 'Recommendation review',
    updatedAt: '2026-07-24T09:15:00+08:00',
    updatedLabel: 'Jul 24, 2026',
  },
  {
    id: 'APP-005',
    name: 'Jordan Flores',
    email: 'jordan.flores@example.test',
    reviewArea: 'Application review',
    updatedAt: '2026-07-23T16:20:00+08:00',
    updatedLabel: 'Jul 23, 2026',
  },
  {
    id: 'APP-006',
    name: 'Casey Mendoza',
    email: 'casey.mendoza@example.test',
    reviewArea: 'Official result review',
    updatedAt: '2026-07-22T13:40:00+08:00',
    updatedLabel: 'Jul 22, 2026',
  },
  {
    id: 'APP-007',
    name: 'Morgan Garcia',
    email: 'morgan.garcia@example.test',
    reviewArea: 'Assessment review',
    updatedAt: '2026-07-21T10:05:00+08:00',
    updatedLabel: 'Jul 21, 2026',
  },
  {
    id: 'APP-008',
    name: 'Riley Navarro',
    email: 'riley.navarro@example.test',
    reviewArea: 'Recommendation review',
    updatedAt: '2026-07-20T15:55:00+08:00',
    updatedLabel: 'Jul 20, 2026',
  },
  {
    id: 'APP-009',
    name: 'Avery Ramos',
    email: 'avery.ramos@example.test',
    reviewArea: 'Application review',
    updatedAt: '2026-07-19T08:35:00+08:00',
    updatedLabel: 'Jul 19, 2026',
  },
]

const reviewAreas: ApplicantReviewArea[] = [
  'Application review',
  'Official result review',
  'Assessment review',
  'Recommendation review',
]

export { mockApplicants, reviewAreas }
export type { ApplicantReviewArea, MockApplicant }
