import type { StudentProfileData, StudentProfilePayload } from './student-profile-types'
import { apiDataRequest } from '@/services/api-client'

class StudentProfileApiError extends Error {
  readonly errors: Record<string, string[]>

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'StudentProfileApiError'
    this.errors = errors
  }
}

async function profileRequest(path: string, init: RequestInit = {}) {
  return apiDataRequest<StudentProfileData>(path, init, {
    fallbackMessage: 'Your profile could not be updated.',
    errorFactory: (message, _status, errors) => new StudentProfileApiError(message, errors),
  })
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
