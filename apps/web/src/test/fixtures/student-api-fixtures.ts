import type { AssessmentLifecycle } from '@/features/student/assessment/assessment-api'
import type { AssessmentSessionContent } from '@/features/student/assessment/assessment-types'
import type { StudentRecommendationSnapshot } from '@/features/student/recommendations/recommendation-types'

const testAssessmentContent: AssessmentSessionContent = {
  id: 'test-session', versionReference: 'test-instrument',
  questions: Array.from({ length: 6 }, (_, index) => ({ id: `item-0${index + 1}`, prompt: `Test interest question ${index + 1}` })),
  responseOptions: [1, 2, 3, 4, 5].map((value) => ({ value: value as 1 | 2 | 3 | 4 | 5, label: ['Strongly dislike', 'Dislike', 'Unsure', 'Like', 'Strongly like'][value - 1], description: '' })),
}

const testAssessmentLifecycle: AssessmentLifecycle = {
  id: 1, reference: 'TEST-SESSION-001', instrument_code: 'test-instrument', status: 'result_available', question_count: 6,
  result_available_at: '2026-08-07T00:00:00Z',
  result: { instrument_code: 'test-instrument', answer_count: 6, result: [
    { area: 'Realistic', score: 45 }, { area: 'Investigative', score: 82 }, { area: 'Artistic', score: 59 },
    { area: 'Social', score: 66 }, { area: 'Enterprising', score: 51 }, { area: 'Conventional', score: 74 },
  ] },
}

const testRecommendationSnapshot: StudentRecommendationSnapshot = {
  id: 'TEST-REC-001', generatedAt: 'Aug 7, 2026', assessmentResultReference: 'TEST-SESSION-001', catalogueReference: 'TEST-CATALOGUE', ruleReference: 'TEST-RULE', status: 'Available',
  defaultCount: 3, totalEligible: 1, canViewAll: false, showingAll: false,
  profile: {
    sessionReference: 'TEST-SESSION-001', availableAt: '2026-08-07T00:00:00Z', topCode: 'I-C', topLabels: ['Investigative', 'Conventional'],
    dimensions: [
      { code: 'R', label: 'Realistic', value: 15 }, { code: 'I', label: 'Investigative', value: 19 },
      { code: 'A', label: 'Artistic', value: 15 }, { code: 'S', label: 'Social', value: 18 },
      { code: 'E', label: 'Enterprising', value: 17 }, { code: 'C', label: 'Conventional', value: 19 },
    ],
  },
  courses: [{
    id: 'test-course', rank: 1, code: 'TEST', name: 'Test Course', department: 'Test Department', duration: '4 years', level: 'Undergraduate', degreeType: "Bachelor's degree", match: 90, eligibility: 'Eligible', summary: '', factors: [], interestAreas: [], learningAreas: [], careerDirections: [], reviewNotes: [],
    durationSource: { status: 'ched_psg', display: '4 years', source_name: 'CHED programme standard', source_url: 'https://ched.gov.ph/issuances/' },
    salary: { status: 'not_published', display: 'Not published', source_name: 'Philippine Statistics Authority', source_url: 'https://psa.gov.ph/statistics/occupational-wages-survey' },
    jobGrowth: { status: 'not_published', display: 'Not published', source_name: 'Philippine Statistics Authority OpenSTAT', source_url: 'https://openstat.psa.gov.ph/' },
  }],
}

export { testAssessmentContent, testAssessmentLifecycle, testRecommendationSnapshot }
