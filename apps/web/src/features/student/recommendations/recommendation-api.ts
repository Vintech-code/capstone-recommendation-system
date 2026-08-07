import type { StudentRecommendationState } from '@/features/student/recommendations/recommendation-types'

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
  return recommendationRequest(`/api/v1/student/recommendations/latest${viewAll ? '?view=all' : ''}`)
}

function getRecommendationForAttempt(assessmentSessionId: number, viewAll = false) {
  return recommendationRequest(
    `/api/v1/student/recommendations/attempts/${assessmentSessionId}${viewAll ? '?view=all' : ''}`,
  )
}

export { getLatestRecommendation, getRecommendationForAttempt }
