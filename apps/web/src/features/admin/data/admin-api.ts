import { useCallback, useEffect, useState } from 'react'

import type { StudentProfileData } from '@/features/student/profile/student-profile-types'

interface AdminOverview {
  students: number
  assessments: number
  completed: number
  inProgress: number
  needsAttention: number
  recommendations: number
  pendingGuidanceRequests: number
  operationalAttention: {
    processingFailures: number
    unverifiedSources: number
    unpublishedDrafts: number
    suspendedCounselors: number
    pendingGuidanceRequests: number
  }
  recentActivity: AdminAssessment[]
}

interface AdminStudent {
  id: number
  name: string
  email: string
  accountStatus: string
  attemptCount: number
  latestResultAt: string | null
  latestTopCode: string | null
}

interface RiasecDimension {
  code: string
  label: string
  value: number
}

interface AdminAssessment {
  id: number
  reference: string
  studentId: number
  studentName: string | null
  studentEmail: string | null
  attemptNumber: number
  attemptCount?: number
  retakeReason?: string | null
  status: 'in_progress' | 'preparing_result' | 'result_available' | 'result_failed'
  topCode: string | null
  startedAt: string | null
  submittedAt: string | null
  resultAvailableAt: string | null
  processingErrorCode: string | null
  dimensions?: RiasecDimension[]
  recommendations?: AdminRecommendation[]
}

interface AdminRecommendation {
  id: string
  rank: number
  code: string
  name: string
  match: number
}

interface AdminStudentRecord extends Omit<AdminStudent, 'attemptCount' | 'latestResultAt' | 'latestTopCode'> {
  profile: StudentProfileData
  attempts: AdminAssessment[]
  guidanceCase: GuidanceCase | null
}

interface GuidanceCase {
  id: number
  status: 'open' | 'follow_up' | 'closed'
  followUpOn: string | null
  assignedTo: string | null
  assignedToId: number | null
  notes: GuidanceNote[]
  summaries: GuidanceSummary[]
}

interface AdminStaffAssignment {
  caseId: number
  studentId: number
  studentName: string
  studentEmail: string
  status: GuidanceCase['status']
  followUpOn: string | null
}

interface AdminStaff {
  id: number
  name: string
  email: string
  accountStatus: string
  mustChangePassword: boolean
  assignedCaseCount: number
  activeCaseCount: number
  followUpCount: number
  overdueCount: number
  assignments: AdminStaffAssignment[]
}

interface AdminGuidanceRequest {
  id: number
  studentId: number
  studentName: string
  studentEmail: string
  programmeId: string | null
  programmeCode: string | null
  programmeName: string | null
  concernCategory: 'programme_comparison' | 'programme_fit' | 'course_requirements' | 'career_direction' | 'general_guidance'
  message: string
  preferredFormat: 'in_person' | 'video_call' | 'phone'
  preferredDate: string | null
  status: 'pending' | 'accepted' | 'declined' | 'closed' | 'expired' | 'cancelled'
  acceptedById: number | null
  acceptedBy: string | null
  acceptedAt: string | null
  closedAt: string | null
  resolutionReason: string | null
  statusHistory: Array<{ eventType: string; fromStatus: string | null; toStatus: string; reason: string | null; actor: string | null; createdAt: string }>
  createdAt: string
}

interface GuidanceNote {
  id: number
  body: string
  author: string
  createdAt: string
}

interface GuidanceSummary {
  id: number
  body: string
  author: string
  status: 'draft' | 'published'
  publishedBy: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

interface AdminProgramme {
  id: string
  code: string
  name: string
  profile: string[]
  profileStatus: string
  profileVersion: string | null
  majors: string[]
  recommendedStrands: string[]
  description: string
  learningAreas: string[]
  learningAreaDescriptions: Record<string, string>
  learningAreaTopics: Record<string, string[]>
  careerDirections: string[]
  strandGuidance: string
  requirements: string[]
  readinessPrompt: string
  contentVersion: string | null
  degreeType: string
  duration: ProgrammeSourceValue | null
  salary: ProgrammeSourceValue | null
  jobGrowth: ProgrammeSourceValue | null
  outlookVersion: string | null
  coverImageUrl: string | null
  logoImageUrl: string | null
  monitoring: {
    savedByStudents: number
    pendingGuidanceRequests: number
  }
}

interface ProgrammeSourceValue {
  status: string
  display?: string
  source_name?: string
  source_url?: string
  note?: string
}

interface AdminProgrammeCatalogue {
  academicYear: string
  catalogueVersion: number
  catalogueStatus: string
  programmes: AdminProgramme[]
}

interface AdminReport {
  generatedAt: string
  from: string | null
  to: string | null
  scope: 'institution' | 'counselor'
  studentCount: number
  assessmentActivity: number
  completedAssessments: number
  assessmentCompletionRate: number
  recommendationRuns: number
  programmeSaves: number
  guidanceRequestStatuses: Record<'pending' | 'accepted' | 'closed' | 'declined' | 'cancelled', number>
  openFollowUps: number
  overdueFollowUps: number
  closedGuidanceCases: number
  assessmentCompletionsByMonth: Array<{ month: string; count: number }>
}

interface ConfigurationVersion {
  id: number
  kind: 'catalogue' | 'methodology'
  version: number
  status: 'draft' | 'published' | 'archived'
  academicYear: string | null
  payload: Record<string, unknown>
  createdBy: string | null
  publishedBy: string | null
  createdAt: string
  publishedAt: string | null
}

interface ConfigurationDiffField {
  field: string
  before: unknown
  after: unknown
}

interface ConfigurationPreview {
  hasChanges: boolean
  changedSections: string[]
  changedProgrammeCount: number
  programmeChanges: Array<{
    programmeId: string
    code: string | null
    name: string | null
    fields: ConfigurationDiffField[]
  }>
}

interface ProgrammeSourceRegistryEntry {
  reference: string
  sourceName: string
  sourceUrl: string
  programmeIds: string[]
  fields: Array<'duration' | 'salary' | 'job_growth'>
  recordedStatuses: string[]
  lastVerifiedAt: string | null
  verifiedBy: string | null
  reviewIntervalDays: number
  nextReviewAt: string | null
  reviewStatus: 'not_verified' | 'review_due' | 'current'
}

interface ConfigurationWorkspace {
  kind: 'catalogue' | 'methodology'
  runtime: Record<string, unknown>
  versions: ConfigurationVersion[]
  sourceRegistry?: ProgrammeSourceRegistryEntry[]
}

interface AdminActivity {
  id: number
  actor: string
  action: string
  subjectType: string
  subjectReference: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

class AdminApiError extends Error {}

type StaffApiScope = 'admin' | 'counselor'

async function requestWorkspace<T>(scope: StaffApiScope, path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/v1/${scope}${path}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
    signal,
  })
  const payload = (await response.json().catch(() => ({}))) as {
    data?: T
    message?: string
  }

  if (!response.ok || payload.data === undefined) {
    throw new AdminApiError(payload.message ?? 'The guidance workspace could not be loaded.')
  }

  return payload.data
}

function requestAdmin<T>(path: string, signal?: AbortSignal): Promise<T> {
  return requestWorkspace<T>('admin', path, signal)
}

function csrfToken() {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='))
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

async function mutateWorkspace<T>(scope: StaffApiScope, path: string, method: 'POST' | 'PUT', body?: unknown): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  const token = csrfToken()
  if (token) headers.set('X-XSRF-TOKEN', token)
  const response = await fetch(`/api/v1/${scope}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const payload = (await response.json().catch(() => ({}))) as { data?: T; message?: string }
  if (!response.ok || payload.data === undefined) {
    throw new AdminApiError(payload.message ?? 'The change could not be saved.')
  }
  return payload.data
}

function mutateAdmin<T>(path: string, method: 'POST' | 'PUT', body?: unknown): Promise<T> {
  return mutateWorkspace<T>('admin', path, method, body)
}

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
        reject(new AdminApiError(payload.message ?? 'The image could not be uploaded.'))
        return
      }
      onProgress?.(100)
      resolve(payload.data)
    })
    request.addEventListener('error', () => reject(new AdminApiError('The image upload was interrupted. Try again.')))
    request.addEventListener('abort', () => reject(new AdminApiError('The image upload was cancelled.')))
    onProgress?.(0)
    request.send(body)
  })
}

function useAdminResource<T>(path: string) {
  return useWorkspaceResource<T>('admin', path)
}

function useWorkspaceResource<T>(scope: StaffApiScope, path: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    requestWorkspace<T>(scope, path, controller.signal)
      .then(setData)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : 'The guidance workspace could not be loaded.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [path, requestVersion, scope])

  return { data, error, loading, retry }
}

export { mutateAdmin, mutateWorkspace, requestAdmin, requestWorkspace, uploadProgrammeMedia, useAdminResource, useWorkspaceResource }
export type {
  AdminActivity,
  AdminAssessment,
  AdminOverview,
  AdminProgramme,
  AdminProgrammeCatalogue,
  AdminReport,
  AdminStudent,
  AdminStudentRecord,
  AdminStaff,
  AdminStaffAssignment,
  ConfigurationVersion,
  ConfigurationPreview,
  ConfigurationWorkspace,
  GuidanceCase,
  ProgrammeSourceRegistryEntry,
  AdminGuidanceRequest,
  GuidanceNote,
  GuidanceSummary,
  RiasecDimension,
  StaffApiScope,
}
