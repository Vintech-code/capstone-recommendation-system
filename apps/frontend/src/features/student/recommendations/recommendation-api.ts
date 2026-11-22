import type { StudentRecommendationFeedback, StudentRecommendationState } from '@/features/student/recommendations/recommendation-types'
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

function saveRecommendationFeedback(
  recommendationId: string,
  programmeId: string,
  rating: number,
  comment: string,
) {
  return apiDataRequest<StudentRecommendationFeedback>(
    `/api/v1/student/recommendations/${encodeURIComponent(recommendationId)}/programmes/${encodeURIComponent(programmeId)}/feedback`,
    {
      method: 'PUT',
      body: JSON.stringify({ rating, comment }),
    },
    { fallbackMessage: 'Your recommendation feedback could not be saved.' },
  )
}

export { getLatestRecommendation, getRecommendationForAttempt, saveRecommendationFeedback }
