import type { StudentProgramme, StudentProgrammeCatalogue } from '@/features/student/programmes/programme-types'

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
  return programmeRequest<StudentProgrammeCatalogue>('/api/v1/student/programmes')
}

function getProgramme(programmeId: string) {
  return programmeRequest<StudentProgramme>(`/api/v1/student/programmes/${encodeURIComponent(programmeId)}`)
}

function getSavedProgrammeIds() {
  return programmeRequest<{ programmeIds: string[] }>('/api/v1/student/saved-programmes')
}

function updateSavedProgramme(programmeId: string, saved: boolean) {
  return programmeRequest<{ programmeId: string; saved: boolean }>(
    `/api/v1/student/saved-programmes/${encodeURIComponent(programmeId)}`,
    { method: saved ? 'PUT' : 'DELETE' },
  )
}

export { getProgramme, getProgrammeCatalogue, getSavedProgrammeIds, updateSavedProgramme }
