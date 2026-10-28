import {
  getAssessmentHistory,
  getAssessmentQuestions,
  getCurrentAssessment,
  getEntranceExaminationResult,
} from '@/features/student/assessment/assessment-api'
import { getProgrammeCatalogue, getSavedProgrammeIds } from '@/features/student/programmes/programme-api'
import { getLatestRecommendation } from '@/features/student/recommendations/recommendation-api'

function prefetchStudentWorkspace() {
  const gatedQuestions = getEntranceExaminationResult().then((examination) =>
    examination.status === 'declared' ? getAssessmentQuestions() : undefined,
  )

  return Promise.allSettled([
    getCurrentAssessment(),
    getAssessmentHistory(),
    gatedQuestions,
    getLatestRecommendation(),
    getProgrammeCatalogue(),
    getSavedProgrammeIds(),
  ])
}

export { prefetchStudentWorkspace }
