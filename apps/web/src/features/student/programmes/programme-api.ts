import type { StudentProgramme, StudentProgrammeCatalogue } from '@/features/student/programmes/programme-types'
import { getCachedStudentResource, invalidateStudentResources } from '@/features/student/student-resource-cache'

async function programmeRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
    ...init,
  })
  const payload = (await response.json().catch(() => ({}))) as { data?: T; message?: string }
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Programme information could not be loaded.')
  }
  return payload.data
}

function getProgrammeCatalogue() {
  return getCachedStudentResource('programmes:catalogue', () => programmeRequest<StudentProgrammeCatalogue>('/api/v1/student/programmes'), 5 * 60_000)
}

function getProgramme(programmeId: string) {
  return programmeRequest<StudentProgramme>(`/api/v1/student/programmes/${encodeURIComponent(programmeId)}`)
}

function getSavedProgrammeIds() {
  return getCachedStudentResource('programmes:saved', () => programmeRequest<{ programmeIds: string[] }>('/api/v1/student/saved-programmes'))
}

async function updateSavedProgramme(programmeId: string, saved: boolean) {
  const result = await programmeRequest<{ programmeId: string; saved: boolean }>(
    `/api/v1/student/saved-programmes/${encodeURIComponent(programmeId)}`,
    { method: saved ? 'PUT' : 'DELETE' },
  )
  invalidateStudentResources('programmes:saved')
  return result
}

export { getProgramme, getProgrammeCatalogue, getSavedProgrammeIds, updateSavedProgramme }
