import { useCallback, useEffect, useState } from 'react'

import type { CareerOpportunity, ProgrammeContentSource } from '@/features/student/programmes/programme-types'
import type { ResultCardData } from '@/features/student/assessment/assessment-api'
import { apiDataRequest, csrfToken } from '@/services/api-client'

interface AdminOverview {
  students: number
  assessments: number
  completed: number
  inProgress: number
  needsAttention: number
  recommendations: number
  funnel: {
    registered: number
    entranceDeclared: number
    assessmentStarted: number
    inProgress: number
    processing: number
    resultAvailable: number
  }
  operationalAttention: {
    processingFailures: number
  }
  recentActivity: AdminAssessment[]
}

interface AdminStudent {
  id: number
  name: string
  email: string
  photoUrl?: string | null
  accountStatus: string
  attemptCount: number
  completedAssessmentCount?: number
  retakeCount?: number
  latestResultAt: string | null
  latestTopCode: string | null
  declarationStatus: 'required' | 'declared'
  selfDeclaredScore: number | null
  eligibilityGroup: 'board' | 'non_board' | null
  currentAssessmentStatus: 'not_started' | AdminAssessment['status']
  currentAssessmentReference: string | null
  recommendationAvailable: boolean
  savedProgrammeCount: number
  lastActivityAt: string | null
}

interface AdminPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number
  to: number
}

interface AdminStudentDirectory {
  items: AdminStudent[]
  pagination: AdminPagination
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
  instrumentCode: string
  status: 'in_progress' | 'preparing_result' | 'result_available' | 'result_failed'
  answerCount: number
  questionCount: number
  topCode: string | null
  startedAt: string | null
  savedAt: string | null
  submittedAt: string | null
  resultAvailableAt: string | null
  processingErrorCode: string | null
  processingFailedAt: string | null
  entranceExamination: {
    resultId: number
    score: number
    eligibilityGroup: 'board' | 'non_board'
    ruleReference: string
    source: 'student_self_declared'
    declaredAt: string | null
  } | null
  recommendationSnapshot: {
    catalogueReference: string
    ruleReference: string
    methodologyStatus: string
    generatedAt: string | null
    totalEligible: number
  } | null
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

interface AdminStudentRecord {
  id: number
  name: string
  email: string
  photoUrl?: string | null
  accountStatus: string
  savedProgrammeCount: number
  profile: {
    photoUrl?: string | null
    lrn: string | null
    birthDate: string | null
    age: number | null
    phone: string | null
    location?: { regionId: number; provinceId: number | null; cityMunicipalityId: number; barangayId: number; code: string } | null
    addressLine: string | null
    barangay: string | null
    municipality: string | null
    province: string | null
    shsSchoolName: string | null
    shsStrand: string | null
    shsGraduationYear: number | null
  } | null
  assessmentSummary?: {
    totalAttempts: number
    completedAttempts: number
    retakeCount: number
    latestAttempt: AdminAssessment | null
  } | null
  attempts: AdminAssessment[]
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
  careerOpportunities?: CareerOpportunity[]
  strandGuidance: string
  requirements: string[]
  readinessPrompt: string
  contentStatus?: string
  contentSource?: ProgrammeContentSource | null
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
  }
  eligibilityGroup: 'board' | 'non_board' | null
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
  scope: 'institution'
  studentCount: number
  eligibilityDistribution: { board: number; nonBoard: number }
  completedAssessments: number
  assessmentCompletionRate: number
  assessmentFunnel: {
    started: number
    inProgress: number
    processing: number
    resultAvailable: number
  }
  recommendationRuns: number
  programmeSaves: number
  assessmentCompletionsByMonth: Array<{ month: string; count: number }>
  retakeMetrics?: {
    totalAssessmentAttempts: number
    totalCompletedAttempts: number
    studentsWithRetakes: number
    totalRetakeAttempts: number
  }
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
  actorId: number
  actor: string | null
  action: string
  createdAt: string
}

interface AdminActivityResponse {
  items: AdminActivity[]
  pagination: AdminPagination
  filters: {
    actors: Array<{ id: number; name: string }>
    actions: string[]
  }
}

interface ManagedAdministrator {
  id: number
  name: string
  email: string
  accountStatus: 'active' | 'suspended' | 'archived'
  canManageAdministrators: boolean
  lastActiveAt: string | null
  createdAt: string
}

interface AdministratorInvitation {
  id: number
  name: string
  email: string
  status: 'pending' | 'expired' | 'accepted' | 'revoked'
  canManageAdministrators: boolean
  invitedBy: string | null
  expiresAt: string
  sentAt: string | null
  createdAt: string
}

interface AdministratorManagement {
  administrators: ManagedAdministrator[]
  invitations: AdministratorInvitation[]
}

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

interface EscoOccupationSearchResult {
  uri: string
  title: string
  escoCode: string | null
  iscoCode: string | null
}

async function searchEscoOccupations(query: string, signal?: AbortSignal): Promise<EscoOccupationSearchResult[]> {
  return requestAdmin<EscoOccupationSearchResult[]>(`/esco/occupations?query=${encodeURIComponent(query)}`, signal)
}

async function getEscoOccupation(uri: string): Promise<CareerOpportunity> {
  return requestAdmin<CareerOpportunity>(`/esco/occupation?uri=${encodeURIComponent(uri)}`)
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

const adminResourceCache = new Map<string, unknown>()

function invalidateAdminResource(pathPrefix?: string) {
  if (!pathPrefix) {
    adminResourceCache.clear()
    return
  }
  for (const key of adminResourceCache.keys()) {
    if (key.startsWith(pathPrefix)) {
      adminResourceCache.delete(key)
    }
  }
}

function useAdminResource<T>(path: string) {
  const [prevPath, setPrevPath] = useState(path)
  const [data, setData] = useState<T | null>(() => (adminResourceCache.get(path) as T | undefined) ?? null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(() => !adminResourceCache.has(path))
  const [requestVersion, setRequestVersion] = useState(0)

  if (prevPath !== path) {
    setPrevPath(path)
    const cached = adminResourceCache.get(path) as T | undefined
    setData(cached ?? null)
    setLoading(!cached)
    setError(null)
  }

  const retry = useCallback(() => {
    setLoading(!adminResourceCache.has(path))
    setError(null)
    setRequestVersion((version) => version + 1)
  }, [path])

  useEffect(() => {
    const controller = new AbortController()
    requestAdmin<T>(path, controller.signal)
      .then((payload) => {
        adminResourceCache.set(path, payload)
        setData(payload)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : 'The administration workspace could not be loaded.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [path, requestVersion])

  return { data, error, loading, retry }
}

async function getAdminStudentResultCard(studentId: number, sessionId: number): Promise<ResultCardData> {
  return requestAdmin<ResultCardData>(`/students/${studentId}/attempts/${sessionId}/card`)
}

export { getAdminStudentResultCard, getEscoOccupation, invalidateAdminResource, mutateAdmin, requestAdmin, searchEscoOccupations, uploadProgrammeMedia, useAdminResource }
export type {
  AdminActivity,
  AdminAssessment,
  AdminOverview,
  AdminProgramme,
  AdminProgrammeCatalogue,
  AdminReport,
  AdminStudent,
  AdminStudentDirectory,
  AdminStudentRecord,
  AdminPagination,
  AdminActivityResponse,
  AdministratorInvitation,
  AdministratorManagement,
  ConfigurationVersion,
  ConfigurationPreview,
  ConfigurationWorkspace,
  ProgrammeSourceRegistryEntry,
  RiasecDimension,
  EscoOccupationSearchResult,
  ManagedAdministrator,
}
