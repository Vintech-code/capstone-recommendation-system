import type { StudentProfileData, StudentProfileFields } from '@/features/student/profile/student-profile-types'
import { getCachedStudentResource, setCachedStudentResource } from '@/features/student/student-resource-cache'

class StudentProfileApiError extends Error {
  fieldErrors: Record<string, string[]>

  constructor(message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'StudentProfileApiError'
    this.fieldErrors = fieldErrors
  }
}

function csrfToken() {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='))
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

async function profileRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json')
  const token = csrfToken()
  if (token) headers.set('X-XSRF-TOKEN', token)

  const response = await fetch(path, { ...init, headers, credentials: 'include' })
  const payload = (await response.json().catch(() => ({}))) as {
    data?: StudentProfileData
    message?: string
    errors?: Record<string, string[]>
  }
  if (!response.ok || !payload.data) {
    throw new StudentProfileApiError(payload.message ?? 'Your profile could not be loaded.', payload.errors)
  }
  return payload.data
}

function getStudentProfile() {
  return getCachedStudentResource('profile:current', () => profileRequest('/api/v1/student/profile'), 60_000)
}

async function updateStudentProfile(fields: StudentProfileFields) {
  const profile = await profileRequest('/api/v1/student/profile', {
    method: 'PUT',
    body: JSON.stringify(fields),
  })
  setCachedStudentResource('profile:current', profile, 60_000)
  return profile
}

async function uploadStudentProfilePhoto(photo: File) {
  const body = new FormData()
  body.append('photo', photo)
  const profile = await profileRequest('/api/v1/student/profile/photo', { method: 'POST', body })
  setCachedStudentResource('profile:current', profile, 60_000)
  return profile
}

export { getStudentProfile, StudentProfileApiError, updateStudentProfile, uploadStudentProfilePhoto }
