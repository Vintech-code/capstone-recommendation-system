import type { StudentRecommendationState } from '@/features/student/recommendations/recommendation-types'
import { getCachedStudentResource } from '@/features/student/student-resource-cache'

async function recommendationRequest(path: string): Promise<StudentRecommendationState> {
  const response = await fetch(path, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  const payload = (await response.json().catch(() => ({}))) as {
    data?: StudentRecommendationState
    message?: string
  }
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'The recommendation request could not be completed.')
  }
  return payload.data
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
