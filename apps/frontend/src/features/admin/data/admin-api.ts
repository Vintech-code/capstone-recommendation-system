import { csrfToken } from '@/services/api-client'

export { invalidateAdminResource } from '@/features/admin/data/admin-resource-cache'
export {
  getAdminStudentResultCard,
  getEscoOccupation,
  mutateAdmin,
  requestAdmin,
  searchEscoOccupations,
} from '@/features/admin/data/admin-service'
export { useAdminResource } from '@/features/admin/data/use-admin-resource'

class AdminUploadError extends Error {}

async function uploadProgrammeMedia(programmeId: string, kind: 'cover' | 'logo', image: File, onProgress?: (percentage: number) => void): Promise<{ kind: 'cover' | 'logo'; url: string }> {
  const body = new FormData()
  body.append('kind', kind)
  body.append('image', image)
  const token = csrfToken()

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', `/api/v1/admin/programmes/${encodeURIComponent(programmeId)}/media`)
    request.withCredentials = true
    request.setRequestHeader('Accept', 'application/json')
    if (token) request.setRequestHeader('X-XSRF-TOKEN', token)
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    })
    request.addEventListener('load', () => {
      let payload: { data?: { kind: 'cover' | 'logo'; url: string }; message?: string } = {}
      try { payload = JSON.parse(request.responseText) as typeof payload } catch { /* The shared error below covers an invalid response. */ }
      if (request.status < 200 || request.status >= 300 || !payload.data) {
        reject(new AdminUploadError(payload.message ?? 'The image could not be uploaded.'))
        return
      }
      onProgress?.(100)
      resolve(payload.data)
    })
    request.addEventListener('error', () => reject(new AdminUploadError('The image upload was interrupted. Try again.')))
    request.addEventListener('abort', () => reject(new AdminUploadError('The image upload was cancelled.')))
    onProgress?.(0)
    request.send(body)
  })
}

export { uploadProgrammeMedia }
export type {
  AdminActivity,
  AdminActivityResponse,
  AdminAssessment,
  AdminOverview,
  AdminPagination,
  AdminProgramme,
  AdminProgrammeCatalogue,
  AdminReport,
  AdminStudent,
  AdminStudentDirectory,
  AdminStudentRecord,
  AdministratorInvitation,
  AdministratorManagement,
  ConfigurationPreview,
  ConfigurationVersion,
  ConfigurationWorkspace,
  EscoOccupationSearchResult,
  ManagedAdministrator,
  RiasecDimension,
} from '@/features/admin/data/admin-types'
