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
  can_retake?: boolean
  attempt_number?: number
  is_current?: boolean
  processing_error_code?: string | null
  processing_failed_at?: string | null
  result?: {
    instrument_code: string
    answer_count: number
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
    api_version: string
  }
  answer_options: Array<{ value: number; name: string }>
  questions: Array<{ index: number; text: string }>
  attribution: { text: string; url: string }
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

function getCurrentAssessment() {
  return assessmentRequest<AssessmentLifecycle>(
    '/api/v1/student/assessments/onet-mini-ip/session',
  )
}

function getAssessmentQuestions() {
  return assessmentRequest<AssessmentQuestionPayload>(
    '/api/v1/student/assessments/onet-mini-ip/questions',
  )
}

function startAssessment() {
  return assessmentRequest<AssessmentLifecycle>(
    '/api/v1/student/assessments/onet-mini-ip/sessions',
    { method: 'POST' },
  )
}

function saveAssessment(
  sessionId: number,
  answers: Record<string, number>,
  currentQuestion: number,
) {
  return assessmentRequest<AssessmentLifecycle>(
    `/api/v1/student/assessments/onet-mini-ip/sessions/${sessionId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ answers, current_question: currentQuestion }),
    },
  )
}

function submitAssessmentSession(sessionId: number) {
  return assessmentRequest<AssessmentLifecycle>(
    `/api/v1/student/assessments/onet-mini-ip/sessions/${sessionId}/submit`,
    { method: 'POST' },
  )
}

function retryAssessmentResult(sessionId: number) {
  return assessmentRequest<AssessmentLifecycle>(
    `/api/v1/student/assessments/onet-mini-ip/sessions/${sessionId}/retry-result`,
    { method: 'POST' },
  )
}

async function getAssessmentHistory(): Promise<AssessmentHistoryResponse> {
  const response = await fetch('/api/v1/student/assessments/onet-mini-ip/history', {
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
