import { getCachedStudentResource, invalidateStudentResources, setCachedStudentResource } from '@/features/student/student-resource-cache'
import { apiDataRequest, apiRequest } from '@/services/api-client'

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
  share_token?: string | null
  shared_at?: string | null
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
  entrance_examination?: {
    score: number
    eligibility_group: 'board' | 'non_board'
    declared_at?: string | null
  } | null
  recommendation_summary?: {
    id: number
    catalogue_reference: string
    total_eligible: number
    ranked_count: number
    generated_at?: string | null
  } | null
}

interface ResultDimension {
  code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
  label: string
  value: number
}

interface ResultCardData {
  id: number
  reference: string
  studentName: string
  attemptNumber: number
  isCurrent: boolean
  instrumentCode: string
  status: string
  startedAt?: string | null
  submittedAt?: string | null
  resultAvailableAt?: string | null
  topCode: string
  formattedTopCode: string
  topDimensions: ResultDimension[]
  dimensions: ResultDimension[]
  scoringVersion: string
  guidanceVersion: string
  disclaimer: string
  shareToken?: string | null
  sharedAt?: string | null
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
    source?: {
      name: string
      asset_reference?: string
      url: string
      accessed_on: string
    }
    scoring?: {
      agree_value: number
      do_not_agree_value: number
      minimum_per_area: number
      maximum_per_area: number
      formula: string
    }
  }
  answer_options: Array<{ value: number; name: string }>
  questions: Array<{ index: number; text: string }>
}

type EntranceExaminationEligibilityGroup = 'board' | 'non_board'

interface EntranceExaminationResult {
  id: number
  score: number
  eligibilityGroup: EntranceExaminationEligibilityGroup
  ruleReference: string
  source: 'student_self_declared'
  declaredAt: string
}

interface EntranceExaminationState {
  status: 'required' | 'declared'
  result: EntranceExaminationResult | null
  policy: {
    ruleReference: string
    minimum: number
    maximum: number
    decimalPlaces: number
    boardRange: { minimum: number; maximum: number }
    nonBoardRange: { minimum: number; maximum: number }
    source: 'student_self_declared'
  }
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

async function assessmentRequest<T>(path: string, init: RequestInit = {}) {
  return apiDataRequest<T>(path, init, {
    fallbackMessage: 'The assessment request could not be completed.',
    networkMessage: 'Unable to reach the assessment service.',
    errorFactory: (message, status) => new AssessmentApiError(message, status),
  })
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

function getEntranceExaminationResult() {
  return assessmentRequest<EntranceExaminationState>('/api/v1/student/entrance-examination')
}

function declareEntranceExaminationResult(score: number) {
  return assessmentRequest<EntranceExaminationState>('/api/v1/student/entrance-examination', {
    method: 'POST',
    body: JSON.stringify({ score }),
  })
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
    const payload = await apiRequest<{
      data?: AssessmentLifecycle[]
      policy?: AssessmentHistoryResponse['policy']
      message?: string
    }>('/api/v1/student/assessments/riasec/history', {}, {
      fallbackMessage: 'Assessment history could not be loaded.',
      networkMessage: 'Unable to reach the assessment service.',
      errorFactory: (message, status) => new AssessmentApiError(message, status),
    })
    if (!payload.data || !payload.policy) {
      throw new AssessmentApiError(payload.message ?? 'Assessment history could not be loaded.', 200)
    }
    return { attempts: payload.data, policy: payload.policy }
  })
}

async function shareAssessmentResult(sessionId: number): Promise<{ shareToken: string; shareUrl: string; sharedAt: string }> {
  return assessmentRequest<{ shareToken: string; shareUrl: string; sharedAt: string }>(
    `/api/v1/student/assessments/riasec/sessions/${sessionId}/share`,
    { method: 'POST' },
  )
}

async function getAssessmentResultCard(sessionId: number): Promise<ResultCardData> {
  return assessmentRequest<ResultCardData>(
    `/api/v1/student/assessments/riasec/sessions/${sessionId}/card`,
  )
}

async function getSharedResult(shareToken: string): Promise<ResultCardData> {
  return apiDataRequest<ResultCardData>(
    `/api/v1/shared/results/${shareToken}`,
    {},
    {
      fallbackMessage: 'Shared assessment result could not be loaded.',
      networkMessage: 'Unable to reach the result sharing service.',
      errorFactory: (message, status) => new AssessmentApiError(message, status),
    },
  )
}

export {
  AssessmentApiError,
  getAssessmentQuestions,
  getEntranceExaminationResult,
  declareEntranceExaminationResult,
  getCurrentAssessment,
  saveAssessment,
  startAssessment,
  submitAssessmentSession,
  retryAssessmentResult,
  getAssessmentHistory,
  shareAssessmentResult,
  getAssessmentResultCard,
  getSharedResult,
}
export type {
  AssessmentHistoryResponse,
  AssessmentLifecycle,
  AssessmentLifecycleStatus,
  AssessmentQuestionPayload,
  EntranceExaminationEligibilityGroup,
  EntranceExaminationState,
  ResultCardData,
  ResultDimension,
}
