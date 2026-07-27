type LifecycleStatus = 'Active' | 'Draft' | 'Retired'

interface MockCourse {
  id: string
  code: string
  name: string
  department: string
  level: string
  duration: string
  status: LifecycleStatus
  boardCourse: boolean
  summary: string
  interestProfile: string[]
  careerPaths: string[]
}

interface MockAdmissionRule {
  id: string
  name: string
  version: string
  status: LifecycleStatus
  effectiveLabel: string
  scope: string
  conditions: string[]
}

// Synthetic catalogue and rule data demonstrate UI only. They are not an
// official TCC catalogue, threshold, board-course classification, or policy.
const mockCourses: MockCourse[] = [
  {
    id: 'CRS-001',
    code: 'BSIT',
    name: 'BS Information Technology',
    department: 'Computing Studies',
    level: 'Undergraduate',
    duration: '4 years',
    status: 'Active',
    boardCourse: false,
    summary: 'Technology-focused program covering software, systems, and data.',
    interestProfile: ['Investigative', 'Conventional', 'Realistic'],
    careerPaths: ['Software development', 'Systems support', 'Data operations'],
  },
  {
    id: 'CRS-002',
    code: 'BSCS',
    name: 'BS Computer Science',
    department: 'Computing Studies',
    level: 'Undergraduate',
    duration: '4 years',
    status: 'Draft',
    boardCourse: false,
    summary: 'Computing program focused on algorithms and software foundations.',
    interestProfile: ['Investigative', 'Realistic', 'Conventional'],
    careerPaths: ['Software engineering', 'Data science', 'Research support'],
  },
  {
    id: 'CRS-003',
    code: 'BSBA',
    name: 'BS Business Administration',
    department: 'Business Studies',
    level: 'Undergraduate',
    duration: '4 years',
    status: 'Active',
    boardCourse: false,
    summary: 'Business program covering management and organizational practice.',
    interestProfile: ['Enterprising', 'Social', 'Conventional'],
    careerPaths: ['Business operations', 'Marketing', 'Entrepreneurship'],
  },
  {
    id: 'CRS-004',
    code: 'BSE',
    name: 'Bachelor of Secondary Education',
    department: 'Teacher Education',
    level: 'Undergraduate',
    duration: '4 years',
    status: 'Active',
    boardCourse: true,
    summary: 'Education program focused on teaching and learner development.',
    interestProfile: ['Social', 'Artistic', 'Enterprising'],
    careerPaths: ['Secondary teaching', 'Learning support', 'Training'],
  },
  {
    id: 'CRS-005',
    code: 'BSA',
    name: 'BS Accountancy',
    department: 'Business Studies',
    level: 'Undergraduate',
    duration: '4 years',
    status: 'Draft',
    boardCourse: true,
    summary: 'Accounting program focused on reporting and assurance practice.',
    interestProfile: ['Conventional', 'Investigative', 'Enterprising'],
    careerPaths: ['Accounting', 'Audit support', 'Financial operations'],
  },
  {
    id: 'CRS-006',
    code: 'ACT',
    name: 'Associate in Computer Technology',
    department: 'Computing Studies',
    level: 'Associate',
    duration: '2 years',
    status: 'Retired',
    boardCourse: false,
    summary: 'Earlier technology program retained for historical records.',
    interestProfile: ['Realistic', 'Conventional', 'Investigative'],
    careerPaths: ['Technical support', 'Computer operations', 'Service desk'],
  },
]

const mockAdmissionRules: MockAdmissionRule[] = [
  {
    id: 'RULE-01',
    name: 'General admission eligibility',
    version: '2.0',
    status: 'Active',
    effectiveLabel: 'Academic Year 2026–2027',
    scope: 'All undergraduate programs',
    conditions: [
      'Verified admission result is available',
      'General academic average meets the configured minimum',
      'Required application information is complete',
    ],
  },
  {
    id: 'RULE-02',
    name: 'Board-course eligibility',
    version: '1.1',
    status: 'Draft',
    effectiveLabel: 'Academic Year 2027–2028',
    scope: 'Programs marked as board courses',
    conditions: [
      'General admission eligibility is satisfied',
      'Program-specific examination threshold is satisfied',
      'Required academic background is recorded',
    ],
  },
  {
    id: 'RULE-00',
    name: 'General admission eligibility',
    version: '1.0',
    status: 'Retired',
    effectiveLabel: 'Academic Year 2025–2026',
    scope: 'Historical undergraduate applications',
    conditions: [
      'Verified admission result was available',
      'Academic requirement was satisfied',
      'Application record was complete',
    ],
  },
]

export { mockAdmissionRules, mockCourses }
export type { LifecycleStatus, MockAdmissionRule, MockCourse }
