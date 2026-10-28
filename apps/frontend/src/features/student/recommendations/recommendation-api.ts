import type { StudentRecommendationState } from '@/features/student/recommendations/recommendation-types'
import { getCachedStudentResource } from '@/features/student/student-resource-cache'
import { apiDataRequest } from '@/services/api-client'

async function recommendationRequest(path: string): Promise<StudentRecommendationState> {
  return apiDataRequest(path, {}, {
    fallbackMessage: 'The recommendation request could not be completed.',
  })
}

function getLatestRecommendation(viewAll = false) {
  const suffix = viewAll ? '?view=all' : ''
  return getCachedStudentResource(`recommendation:latest${suffix}`, () => recommendationRequest(`/api/v1/student/recommendations/latest${suffix}`))
}

function getRecommendationForAttempt(assessmentSessionId: number, viewAll = false) {
  const suffix = viewAll ? '?view=all' : ''
  return getCachedStudentResource(
    `recommendation:attempt:${assessmentSessionId}${suffix}`,
    () => recommendationRequest(`/api/v1/student/recommendations/attempts/${assessmentSessionId}${suffix}`),
  )
}

export { getLatestRecommendation, getRecommendationForAttempt }
