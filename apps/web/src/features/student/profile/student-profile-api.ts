import type { StudentProfileData, StudentProfilePayload } from './student-profile-types'

class StudentProfileApiError extends Error {
  readonly errors: Record<string, string[]>

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'StudentProfileApiError'
    this.errors = errors
  }
}

function csrfToken() {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='))
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

async function profileRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const token = csrfToken()
  if (token) headers.set('X-XSRF-TOKEN', token)

  const response = await fetch(path, { ...init, headers, credentials: 'include' })
  const payload = (await response.json().catch(() => ({}))) as {
    data?: StudentProfileData
    message?: string
    errors?: Record<string, string[]>
  }
  if (!response.ok || !payload.data) {
    throw new StudentProfileApiError(payload.message ?? 'Your profile could not be updated.', payload.errors)
  }
  return payload.data
}

function getStudentProfile() {
  return profileRequest('/api/v1/student/profile')
}

function saveStudentProfile(payload: StudentProfilePayload) {
  return profileRequest('/api/v1/student/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

function uploadStudentProfilePhoto(photo: File) {
  const body = new FormData()
  body.append('photo', photo)
  return profileRequest('/api/v1/student/profile/photo', { method: 'POST', body })
}

export { getStudentProfile, saveStudentProfile, StudentProfileApiError, uploadStudentProfilePhoto }
