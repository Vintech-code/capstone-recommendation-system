import type { StudentProgramme, StudentProgrammeCatalogue } from '@/features/student/programmes/programme-types'

async function programmeRequest<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
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

export { getProgramme, getProgrammeCatalogue }
