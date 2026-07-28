type StudentRecommendationEligibility = 'Eligible' | 'Needs review'

interface StudentRecommendedCourse {
  id: string
  rank: number
  code: string
  name: string
  department: string
  duration: string
  level: string
  match: number
  eligibility: StudentRecommendationEligibility
  summary: string
  factors: string[]
  interestAreas: string[]
  learningAreas: string[]
  careerDirections: string[]
  reviewNotes: string[]
}

// Isolated D-015 UI data. Course records, rankings, match values, eligibility,
// and factors demonstrate the Student recommendation experience only. They
// are not official TCC catalogue data, rules, thresholds, weights, decisions,
// validation evidence, or production seed data.
const mockStudentRecommendationSnapshot = {
  id: 'REC-STU-001',
  generatedAt: 'Jul 28, 2026',
  assessmentResultReference: 'RIA-RES-001',
  catalogueReference: 'CAT-UI-01',
  ruleReference: 'RULE-UI-01',
  status: 'Available',
  courses: [
    {
      id: 'CRS-001',
      rank: 1,
      code: 'BSIT',
      name: 'BS Information Technology',
      department: 'Computing Studies',
      duration: '4 years',
      level: 'Undergraduate',
      match: 92,
      eligibility: 'Eligible',
      summary:
        'Technology-focused program covering software, systems, and data.',
      factors: [
        'Interest-pattern alignment',
        'Recorded academic information',
        'Current catalogue profile',
      ],
      interestAreas: ['Investigative', 'Conventional', 'Realistic'],
      learningAreas: [
        'Software and application development',
        'Information and data systems',
        'Technology infrastructure',
      ],
      careerDirections: [
        'Application development',
        'Systems support',
        'Data operations',
      ],
      reviewNotes: [
        'Review the complete program curriculum.',
        'Confirm current program requirements with authorized guidance personnel.',
      ],
    },
    {
      id: 'CRS-002',
      rank: 2,
      code: 'BSCS',
      name: 'BS Computer Science',
      department: 'Computing Studies',
      duration: '4 years',
      level: 'Undergraduate',
      match: 87,
      eligibility: 'Eligible',
      summary:
        'Computing program focused on algorithms and software foundations.',
      factors: [
        'Analytical-interest alignment',
        'Problem-solving orientation',
        'Current catalogue profile',
      ],
      interestAreas: ['Investigative', 'Realistic', 'Conventional'],
      learningAreas: [
        'Algorithms and problem solving',
        'Software foundations',
        'Computing theory',
      ],
      careerDirections: [
        'Software engineering',
        'Computing research',
        'Systems development',
      ],
      reviewNotes: [
        'Compare the theory-focused curriculum with your preferred learning style.',
        'Confirm current program requirements with authorized guidance personnel.',
      ],
    },
    {
      id: 'CRS-005',
      rank: 3,
      code: 'BSA',
      name: 'BS Accountancy',
      department: 'Business Studies',
      duration: '4 years',
      level: 'Undergraduate',
      match: 81,
      eligibility: 'Needs review',
      summary:
        'Accounting program focused on reporting and assurance practice.',
      factors: [
        'Structured-work alignment',
        'Recorded academic information',
        'Additional requirement review',
      ],
      interestAreas: ['Conventional', 'Investigative', 'Enterprising'],
      learningAreas: [
        'Financial reporting',
        'Assurance concepts',
        'Business regulation',
      ],
      careerDirections: [
        'Accounting practice',
        'Audit support',
        'Financial operations',
      ],
      reviewNotes: [
        'An additional requirement review is recorded for this option.',
        'Confirm the applicable program requirements before making a decision.',
      ],
    },
    {
      id: 'CRS-003',
      rank: 4,
      code: 'BSBA',
      name: 'BS Business Administration',
      department: 'Business Studies',
      duration: '4 years',
      level: 'Undergraduate',
      match: 76,
      eligibility: 'Needs review',
      summary:
        'Business program covering management and organizational practice.',
      factors: [
        'Organizational-interest alignment',
        'Communication-oriented profile',
        'Additional requirement review',
      ],
      interestAreas: ['Enterprising', 'Social', 'Conventional'],
      learningAreas: [
        'Organization and management',
        'Business communication',
        'Operations planning',
      ],
      careerDirections: [
        'Business operations',
        'Project coordination',
        'Administrative management',
      ],
      reviewNotes: [
        'This option has a lower recorded match than the higher-ranked courses.',
        'Confirm the applicable program requirements before making a decision.',
      ],
    },
  ] satisfies StudentRecommendedCourse[],
} as const

export { mockStudentRecommendationSnapshot }
export type {
  StudentRecommendationEligibility,
  StudentRecommendedCourse,
}
