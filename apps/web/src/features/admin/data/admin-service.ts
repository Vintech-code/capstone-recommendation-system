import { invalidateAdminResource } from '@/features/admin/data/admin-resource-cache'
import type { EscoOccupationSearchResult } from '@/features/admin/data/admin-types'
import type { ResultCardData } from '@/features/student/assessment/assessment-api'
import type { CareerOpportunity } from '@/features/student/programmes/programme-types'
import { apiDataRequest } from '@/services/api-client'

class AdminApiError extends Error {}

async function requestAdmin<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiDataRequest<T>(`/api/v1/admin${path}`, { signal }, {
    fallbackMessage: 'The administration workspace could not be loaded.',
    errorFactory: (message) => new AdminApiError(message),
  })
}

async function mutateAdmin<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
  const result = await apiDataRequest<T>(`/api/v1/admin${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  }, {
    fallbackMessage: 'The change could not be saved.',
    errorFactory: (message) => new AdminApiError(message),
  })
  invalidateAdminResource()
  return result
}

async function searchEscoOccupations(query: string, signal?: AbortSignal): Promise<EscoOccupationSearchResult[]> {
  return requestAdmin<EscoOccupationSearchResult[]>(`/esco/occupations?query=${encodeURIComponent(query)}`, signal)
}

async function getEscoOccupation(uri: string): Promise<CareerOpportunity> {
  return requestAdmin<CareerOpportunity>(`/esco/occupation?uri=${encodeURIComponent(uri)}`)
}

async function getAdminStudentResultCard(studentId: number, sessionId: number): Promise<ResultCardData> {
  return requestAdmin<ResultCardData>(`/students/${studentId}/attempts/${sessionId}/card`)
}

export { getAdminStudentResultCard, getEscoOccupation, mutateAdmin, requestAdmin, searchEscoOccupations }
