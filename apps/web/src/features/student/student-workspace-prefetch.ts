import { getAssessmentHistory, getAssessmentQuestions, getCurrentAssessment } from '@/features/student/assessment/assessment-api'
import { getProgrammeCatalogue, getSavedProgrammeIds } from '@/features/student/programmes/programme-api'
import { getLatestRecommendation } from '@/features/student/recommendations/recommendation-api'

function prefetchStudentWorkspace() {
  return Promise.allSettled([
    getCurrentAssessment(),
    getAssessmentHistory(),
    getAssessmentQuestions(),
    getLatestRecommendation(),
    getProgrammeCatalogue(),
    getSavedProgrammeIds(),
  ])
}

export { prefetchStudentWorkspace }
