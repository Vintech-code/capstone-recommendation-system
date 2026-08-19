import { getCachedStudentResource, invalidateStudentResources, setCachedStudentResource } from '@/features/student/student-resource-cache'

const currentAssessmentKey = 'assessment:current'
const assessmentQuestionsKey = 'assessment:questions'
const assessmentHistoryKey = 'assessment:history'

type AssessmentLifecycleStatus =
  | 'not_started'
  | 'in_progress'
  | 'preparing_result'
  | 'result_failed'
  | 'result_available'

interface AssessmentResultEntry {
  area: string
  score: number
}

interface ProposedRiasecGuidance {
  status: 'proposed'
  version: string
  notice: string
  explanations: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', string>
}

interface AssessmentLifecycle {
  id?: number
  reference?: string
  instrument_code?: string
  status: AssessmentLifecycleStatus
  answers?: Record<string, number>
  answer_count?: number
  question_count: number
  current_question?: number
  started_at?: string | null
  saved_at?: string | null
  submitted_at?: string | null
  result_available_at?: string | null
  retake_available_at?: string | null
  retake_reason?: string | null
  can_retake?: boolean
  attempt_number?: number
  is_current?: boolean
  processing_error_code?: string | null
  processing_failed_at?: string | null
  result?: {
    instrument_code: string
    answer_count: number
    scoring_source?: string
    result: AssessmentResultEntry[]
    guidance?: ProposedRiasecGuidance
  } | null
}

interface AssessmentHistoryResponse {
  attempts: AssessmentLifecycle[]
  policy: {
    status: 'proposed'
    version: string
    minimum_days_between_completed_attempts: number
    completed_attempts_are_read_only: boolean
  }
}

interface AssessmentQuestionPayload {
  instrument: {
    code: string
    name: string
    question_count: number
    content_version: string
    status: 'proposed'
    instructions: string
  }
  answer_options: Array<{ value: number; name: string }>
  questions: Array<{ index: number; text: string }>
}

class AssessmentApiError extends Error {
  status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'AssessmentApiError'
    this.status = status
  }
}

function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('XSRF-TOKEN='))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

async function assessmentRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')
  const token = csrfToken()
  if (token) headers.set('X-XSRF-TOKEN', token)

  let response: Response
  try {
    response = await fetch(path, { ...init, headers, credentials: 'include' })
  } catch {
    throw new AssessmentApiError(
      'Unable to reach the assessment service.',
      0,
    )
  }

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T
    message?: string
  }
  if (!response.ok || payload.data === undefined) {
    throw new AssessmentApiError(
      payload.message ?? 'The assessment request could not be completed.',
      response.status,
    )
  }

  return payload.data
}

function getCurrentAssessment(force = false) {
  if (force) invalidateStudentResources(currentAssessmentKey)
  return getCachedStudentResource(
    currentAssessmentKey,
    () => assessmentRequest<AssessmentLifecycle>('/api/v1/student/assessments/riasec/session'),
  )
}

function getAssessmentQuestions() {
  return getCachedStudentResource(
    assessmentQuestionsKey,
    () => assessmentRequest<AssessmentQuestionPayload>('/api/v1/student/assessments/riasec/questions'),
    5 * 60_000,
  )
}

async function startAssessment(retakeReason?: string) {
  const lifecycle = await assessmentRequest<AssessmentLifecycle>(
    '/api/v1/student/assessments/riasec/sessions',
    {
      method: 'POST',
      body: retakeReason ? JSON.stringify({ retakeReason }) : undefined,
    },
  )
  setCachedStudentResource(currentAssessmentKey, lifecycle)
  invalidateStudentResources(assessmentHistoryKey, 'recommendation:latest')
  return lifecycle
}

async function saveAssessment(
  sessionId: number,
  answers: Record<string, number>,
  currentQuestion: number,
) {
  const lifecycle = await assessmentRequest<AssessmentLifecycle>(
    `/api/v1/student/assessments/riasec/sessions/${sessionId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ answers, current_question: currentQuestion }),
    },
  )
  setCachedStudentResource(currentAssessmentKey, lifecycle)
  return lifecycle
}

async function submitAssessmentSession(sessionId: number) {
  const lifecycle = await assessmentRequest<AssessmentLifecycle>(
    `/api/v1/student/assessments/riasec/sessions/${sessionId}/submit`,
    { method: 'POST' },
  )
  setCachedStudentResource(currentAssessmentKey, lifecycle)
  invalidateStudentResources(assessmentHistoryKey, 'recommendation:latest')
  return lifecycle
}

async function retryAssessmentResult(sessionId: number) {
  const lifecycle = await assessmentRequest<AssessmentLifecycle>(
    `/api/v1/student/assessments/riasec/sessions/${sessionId}/retry-result`,
    { method: 'POST' },
  )
  setCachedStudentResource(currentAssessmentKey, lifecycle)
  invalidateStudentResources(assessmentHistoryKey, 'recommendation:latest')
  return lifecycle
}

function getAssessmentHistory(): Promise<AssessmentHistoryResponse> {
  return getCachedStudentResource(assessmentHistoryKey, async () => {
    const response = await fetch('/api/v1/student/assessments/riasec/history', {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
    const payload = (await response.json().catch(() => ({}))) as {
    data?: AssessmentLifecycle[]
    policy?: AssessmentHistoryResponse['policy']
    message?: string
  }
    if (!response.ok || !payload.data || !payload.policy) {
      throw new AssessmentApiError(payload.message ?? 'Assessment history could not be loaded.', response.status)
    }
    return { attempts: payload.data, policy: payload.policy }
  })
}

export {
  AssessmentApiError,
  getAssessmentQuestions,
  getCurrentAssessment,
  saveAssessment,
  startAssessment,
  submitAssessmentSession,
  retryAssessmentResult,
  getAssessmentHistory,
}
export type {
  AssessmentHistoryResponse,
  AssessmentLifecycle,
  AssessmentLifecycleStatus,
  AssessmentQuestionPayload,
}
