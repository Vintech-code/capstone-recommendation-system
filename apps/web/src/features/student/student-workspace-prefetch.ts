import { getAssessmentHistory, getAssessmentQuestions, getCurrentAssessment } from '@/features/student/assessment/assessment-api'
import { getStudentProfile } from '@/features/student/profile/student-profile-api'
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
    getStudentProfile(),
  ])
}

export { prefetchStudentWorkspace }
