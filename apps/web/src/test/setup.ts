import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, vi } from 'vitest'

import { clearStudentResourceCache } from '@/features/student/student-resource-cache'

vi.mock('lottie-web/build/player/lottie_light', () => {
  return {
    default: {
      loadAnimation: () => ({
        destroy: () => undefined,
        goToAndStop: () => undefined,
      }),
    },
  }
})

vi.mock('recharts', async () => {
  const { createElement } = await import('react')
  const Container = ({ children }: { children?: ReactNode }) =>
    createElement('div', null, children)
  const SvgContainer = ({ children }: { children?: ReactNode }) =>
    createElement('svg', null, children)
  const Empty = () => null

  return {
    Area: Empty,
    AreaChart: SvgContainer,
    CartesianGrid: Empty,
    Cell: Empty,
    Pie: Empty,
    PieChart: SvgContainer,
    ResponsiveContainer: Container,
    Tooltip: Empty,
    XAxis: Empty,
    YAxis: Empty,
  }
})

afterEach(() => {
  cleanup()
  clearStudentResourceCache()
  document.documentElement.classList.remove('dark')
  document.documentElement.dataset.theme = 'light'
  document.documentElement.style.colorScheme = 'light'
  vi.mocked(fetch).mockReset().mockImplementation(defaultFetch)
})

async function defaultFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = input.toString()

  if (url === '/sanctum/csrf-cookie') {
    return new Response(null, { status: 204 })
  }

  if (url === '/api/v1/auth/login') {
    const body = JSON.parse(String(init?.body ?? '{}')) as {
      email: string
      portal: 'student' | 'admin'
    }
    return Response.json({
      user: {
        id: 1,
        name: 'Authenticated User',
        email: body.email,
        roles: [body.portal],
      },
    })
  }

  if (url === '/api/v1/auth/register') {
    const body = JSON.parse(String(init?.body ?? '{}')) as { name: string; email: string }
    return Response.json({
      message: 'Student account created.',
      user: { id: 2, name: body.name, email: body.email, roles: ['student'] },
    }, { status: 201 })
  }

  if (url === '/api/v1/auth/logout') {
    return Response.json({ message: 'Signed out.' })
  }

  if (url === '/api/v1/auth/forgot-password') {
    return Response.json({ message: 'If an active account matches that email, a password reset link has been sent.' })
  }

  if (url === '/api/v1/auth/reset-password') {
    return Response.json({ message: 'Your password has been reset.' })
  }

  if (url === '/api/v1/auth/password') {
    return Response.json({ data: { changed: true } })
  }

  if (url.startsWith('/api/v1/auth/authorize/')) {
    return Response.json({
      authorized: true,
      portal: url.split('/').at(-1),
    })
  }

  if (url === '/api/v1/admin/overview') {
    return Response.json({ data: {
      students: 2, assessments: 3, completed: 2, inProgress: 1,
      needsAttention: 0, recommendations: 2,
      operationalAttention: { processingFailures: 0, unverifiedSources: 3, unpublishedDrafts: 1 },
      recentActivity: [{ id: 1, reference: 'ASMT-000001', studentId: 10, studentName: 'Ana Santos', studentEmail: 'ana@example.test', attemptNumber: 1, status: 'result_available', topCode: 'I-C', startedAt: '2026-08-01T08:00:00+08:00', submittedAt: '2026-08-01T08:20:00+08:00', resultAvailableAt: '2026-08-01T08:20:01+08:00', processingErrorCode: null }],
    } })
  }

  if (url === '/api/v1/admin/students') {
    return Response.json({ data: [
      { id: 10, name: 'Ana Santos', email: 'ana@example.test', accountStatus: 'active', attemptCount: 1, latestResultAt: '2026-08-01T08:20:01+08:00', latestTopCode: 'I-C' },
      { id: 11, name: 'Ben Cruz', email: 'ben@example.test', accountStatus: 'active', attemptCount: 0, latestResultAt: null, latestTopCode: null },
    ] })
  }

  if (url === '/api/v1/admin/students/10') {
    return Response.json({ data: {
      id: 10, name: 'Ana Santos', email: 'ana@example.test', accountStatus: 'active',
      profile: { student: { id: 10, name: 'Ana Santos', email: 'ana@example.test', photoUrl: null }, questionnaire: { complete: true, strengths: ['Problem-solving'], growthAreas: ['Public speaking'], learningPreferences: ['Hands-on activities'], updatedAt: '2026-08-01T09:00:00+08:00' }, options: { strengths: [], growthAreas: [], learningPreferences: [] }, riasec: { sessionReference: 'ASMT-000001', availableAt: '2026-08-01T08:20:01+08:00', primary: { code: 'I', label: 'Investigative' }, secondary: { code: 'C', label: 'Conventional' }, code: 'I-C', dimensions: [] }, careerInterests: ['Software and application development'], about: 'The latest recorded RIASEC result is I-C (Investigative and Conventional).' },
      attempts: [{ id: 1, reference: 'ASMT-000001', studentId: 10, studentName: 'Ana Santos', studentEmail: 'ana@example.test', attemptNumber: 2, retakeReason: 'I wanted to review my current course interests.', status: 'result_available', topCode: 'I-C', startedAt: '2026-08-01T08:00:00+08:00', submittedAt: '2026-08-01T08:20:00+08:00', resultAvailableAt: '2026-08-01T08:20:01+08:00', processingErrorCode: null, dimensions: [{ code: 'I', label: 'Investigative', value: 19 }, { code: 'C', label: 'Conventional', value: 18 }], recommendations: [{ id: 'bs-information-technology', rank: 1, code: 'BSIT', name: 'BS Information Technology', match: 90 }] }],
    } })
  }

  if (url === '/api/v1/admin/assessments') {
    return Response.json({ data: [{ id: 1, reference: 'ASMT-000001', studentId: 10, studentName: 'Ana Santos', studentEmail: 'ana@example.test', attemptNumber: 1, status: 'result_available', topCode: 'I-C', startedAt: '2026-08-01T08:00:00+08:00', submittedAt: '2026-08-01T08:20:00+08:00', resultAvailableAt: '2026-08-01T08:20:01+08:00', processingErrorCode: null }] })
  }

  if (url === '/api/v1/admin/programmes') {
    return Response.json({ data: { academicYear: '2026-2027', catalogueVersion: 1, catalogueStatus: 'approved_current_scope', programmes: [{ id: 'bs-information-technology', code: 'BSIT', name: 'BS Information Technology', profile: ['I', 'C', 'R'], profileStatus: 'researcher_proposed_temporary', profileVersion: 'TEMP-2026-01', majors: [], recommendedStrands: ['STEM', 'TVL-ICT'], description: 'Applies computing technologies to organisational needs.', learningAreas: ['Software development'], learningAreaDescriptions: { 'Software development': 'Design, build, test, and maintain applications.' }, learningAreaTopics: { 'Software development': ['Programming fundamentals'] }, careerDirections: ['Software and application development'], strandGuidance: 'STEM and TVL-ICT may be helpful preparation.', requirements: ['Meet published admission requirements.'], readinessPrompt: 'Discuss your interest in technology.', contentVersion: 'GUIDANCE-2026-01', degreeType: "Bachelor's degree", duration: { status: 'ched_psg', display: '4 years', source_name: 'CHED CMO No. 25, series of 2015', source_url: 'https://legacy.ched.gov.ph/2015-ched-memorandum-orders/' }, salary: { status: 'not_published', display: 'Not published', source_name: 'Philippine Statistics Authority', source_url: 'https://psa.gov.ph/', note: 'No official Philippine course-specific figure is available.' }, jobGrowth: { status: 'not_published', display: 'Not published', source_name: 'Philippine Statistics Authority OpenSTAT', source_url: 'https://openstat.psa.gov.ph/', note: 'No official Philippine course-specific percentage is available.' }, outlookVersion: 'PH-OUTLOOK-2026-08-09', monitoring: { savedByStudents: 3 } }] } })
  }

  if (url === '/api/v1/admin/programmes/bs-information-technology/media' && init?.method === 'POST') {
    return Response.json({ data: { kind: 'cover', url: '/storage/programme-media/bs-information-technology/cover/new-cover.webp' } }, { status: 201 })
  }

  if (url === '/api/v1/admin/programme-sources' && (!init?.method || init.method === 'GET')) {
    return Response.json({ data: [{ reference: 'source-reference', sourceName: 'CHED CMO No. 25, series of 2015', sourceUrl: 'https://legacy.ched.gov.ph/2015-ched-memorandum-orders/', programmeIds: ['bs-information-technology'], fields: ['duration'], recordedStatuses: ['ched_psg'], lastVerifiedAt: null, verifiedBy: null, reviewIntervalDays: 180, nextReviewAt: null, reviewStatus: 'not_verified' }] })
  }

  if (url === '/api/v1/admin/programme-sources/source-reference' && init?.method === 'PUT') {
    const body = JSON.parse(String(init.body)) as { lastVerifiedAt: string }
    return Response.json({ data: { reference: 'source-reference', sourceName: 'CHED CMO No. 25, series of 2015', sourceUrl: 'https://legacy.ched.gov.ph/2015-ched-memorandum-orders/', programmeIds: ['bs-information-technology'], fields: ['duration'], recordedStatuses: ['ched_psg'], lastVerifiedAt: body.lastVerifiedAt, verifiedBy: 'Authenticated User', reviewIntervalDays: 180, nextReviewAt: '2027-02-08', reviewStatus: 'current' } })
  }

  if (url === '/api/v1/admin/configurations/catalogue' && (!init?.method || init.method === 'GET')) {
    const programme = { id: 'bs-information-technology', short_label: 'BSIT', display_name: 'BS Information Technology', description: 'Applies computing technologies to organisational needs.', majors: [], riasec_profile: ['I', 'C', 'R'], learning_areas: ['Software development'], learning_area_descriptions: { 'Software development': 'Design, build, test, and maintain applications.' }, learning_area_topics: { 'Software development': ['Programming fundamentals'] }, career_directions: ['Software and application development'], recommended_strands: ['STEM', 'TVL-ICT'], strand_guidance: 'STEM and TVL-ICT may be helpful preparation.', requirements: ['Meet published admission requirements.'], readiness_prompt: 'Discuss your interest in technology.', degree_type: "Bachelor's degree", duration: { display: '4 years' }, salary: { display: 'Not published' }, job_growth: { display: 'Not published' } }
    return Response.json({ data: { kind: 'catalogue', runtime: { programmes: [programme] }, versions: [{ id: 7, kind: 'catalogue', version: 2, status: 'draft', academicYear: '2026-2027', payload: { programmes: [programme] }, createdBy: 'Authenticated User', publishedBy: null, createdAt: '2026-08-08T12:00:00+08:00', publishedAt: null }] } })
  }

  if (url.match(/\/api\/v1\/admin\/configurations\/(catalogue|methodology)$/) && init?.method === 'POST') {
    const kind = url.endsWith('catalogue') ? 'catalogue' : 'methodology'
    return Response.json({ data: { id: 1, kind, version: 2, status: 'draft', academicYear: '2026-2027', payload: {}, createdBy: 'Authenticated User', publishedBy: null, createdAt: '2026-08-08T12:00:00+08:00', publishedAt: null } }, { status: 201 })
  }

  if (url === '/api/v1/admin/configurations/versions/7/preview' && init?.method === 'POST') {
    return Response.json({ data: { hasChanges: true, changedSections: ['programmes'], changedProgrammeCount: 1, programmeChanges: [{ programmeId: 'bs-information-technology', code: 'BSIT', name: 'BS Information Technology', fields: [{ field: 'description', before: 'Applies computing technologies to organisational needs.', after: 'Updated description.' }] }] } })
  }

  if (url.match(/\/api\/v1\/admin\/configurations\/versions\/\d+(\/publish)?$/) && ['PUT', 'POST'].includes(init?.method ?? '')) {
    return Response.json({ data: { id: 1, kind: 'methodology', version: 2, status: url.endsWith('/publish') ? 'published' : 'draft', academicYear: null, payload: {}, createdBy: 'Authenticated User', publishedBy: url.endsWith('/publish') ? 'Authenticated User' : null, createdAt: '2026-08-08T12:00:00+08:00', publishedAt: url.endsWith('/publish') ? '2026-08-08T12:05:00+08:00' : null } })
  }

  if (url.startsWith('/api/v1/admin/reports')) {
    return Response.json({ data: { generatedAt: '2026-08-08T12:00:00+08:00', from: null, to: null, scope: 'institution', studentCount: 2, assessmentActivity: 2, completedAssessments: 2, assessmentCompletionRate: 100, recommendationRuns: 2, programmeSaves: 1, assessmentCompletionsByMonth: [{ month: '2026-08', count: 2 }] } })
  }

  if (url === '/api/v1/admin/activity') {
    return Response.json({ data: [{ id: 1, actor: 'Authenticated User', action: 'configuration.published', subjectType: 'configuration_version', subjectReference: '7', metadata: null, createdAt: '2026-08-08T12:00:00+08:00' }] })
  }

  if (url === '/api/v1/student/assessments/riasec/session') {
    return Response.json({
      data: {
        status: 'not_started',
        question_count: 30,
      },
    })
  }

  if (url === '/api/v1/student/profile') {
    return Response.json({ data: {
      student: { id: 1, name: 'Authenticated User', email: 'user@example.com', photoUrl: null },
      questionnaire: { complete: true, strengths: ['Problem-solving'], growthAreas: ['Public speaking'], learningPreferences: ['Hands-on activities'], updatedAt: '2026-08-09T10:00:00+08:00' },
      options: { strengths: ['Problem-solving', 'Creativity'], growthAreas: ['Public speaking', 'Time management'], learningPreferences: ['Hands-on activities', 'Independent work'] },
      riasec: { sessionReference: 'ASMT-000001', availableAt: '2026-08-09T09:00:00+08:00', primary: { code: 'I', label: 'Investigative' }, secondary: { code: 'C', label: 'Conventional' }, code: 'I-C', dimensions: [{ code: 'I', label: 'Investigative', value: 20 }, { code: 'C', label: 'Conventional', value: 18 }] },
      careerInterests: ['Software and application development'],
      about: 'The latest recorded RIASEC result is I-C (Investigative and Conventional). The student selected Problem-solving as a self-reported strength.',
    } })
  }

  if (url === '/api/v1/student/saved-programmes') {
    return Response.json({ data: { programmeIds: [] } })
  }

  if (url.startsWith('/api/v1/student/saved-programmes/')) {
    return Response.json({ data: {
      programmeId: decodeURIComponent(url.split('/').at(-1) ?? ''),
      saved: init?.method === 'PUT',
    } }, { status: init?.method === 'PUT' ? 201 : 200 })
  }

  if (url === '/api/v1/student/assessments/riasec/history') {
    return Response.json({
      data: [],
      policy: {
        status: 'proposed',
        version: 'RETAKE-PROPOSED-2026-01',
        minimum_days_between_completed_attempts: 30,
        completed_attempts_are_read_only: true,
      },
    })
  }

  if (url === '/api/v1/student/entrance-examination') {
    return Response.json({
      data: {
        status: 'declared',
        result: {
          id: 1,
          score: 2.5,
          eligibilityGroup: 'board',
          ruleReference: 'SELF-DECLARED-TCC-ENTRANCE-2026-01',
          source: 'student_self_declared',
          declaredAt: '2026-08-28T09:00:00+08:00',
        },
        policy: {
          ruleReference: 'SELF-DECLARED-TCC-ENTRANCE-2026-01',
          minimum: 1,
          maximum: 5,
          decimalPlaces: 1,
          boardRange: { minimum: 1, maximum: 2.5 },
          nonBoardRange: { minimum: 2.6, maximum: 5 },
          source: 'student_self_declared',
        },
      },
    })
  }

  if (url === '/api/v1/student/assessments/riasec/questions') {
    return Response.json({
      data: {
        instrument: {
          code: 'tcc-riasec-42-v1',
          name: 'TCC RIASEC Interest Questionnaire',
          question_count: 6,
          content_version: 'researcher-questionnaire-v1', status: 'proposed', instructions: 'Answer honestly.',
        },
        answer_options: [
          { value: 1, name: 'Agree' },
          { value: 2, name: 'Do not agree' },
        ],
        questions: Array.from({ length: 6 }, (_, index) => ({
          index: index + 1,
          text: `Interest question ${index + 1}`,
        })),

      },
    })
  }

  if (url === '/api/v1/student/recommendations/latest') {
    return Response.json({ data: { status: 'not_available', recommendation: null } })
  }

  if (url === '/api/v1/student/programmes') {
    return Response.json({ data: {
      academicYear: '2026-2027', catalogueVersion: 1,
      programmes: [{ id: 'bs-information-technology', name: 'BS Information Technology', code: 'BSIT', majors: [], riasecProfile: ['I', 'C', 'R'], description: 'Focuses on applying computing to organisational needs.', learningAreas: ['Software development'], requirements: ['Meet published admission requirements.'], readinessPrompt: 'Discuss your interest in technology.' }],
    } })
  }

  if (url === '/api/v1/student/assessments/riasec/sessions' && init?.method === 'POST') {
    return Response.json({
      data: {
        id: 1,
        reference: 'ASMT-000001',
        instrument_code: 'tcc-riasec-42-v1',
        status: 'in_progress',
        answers: {},
        answer_count: 0,
        question_count: 6,
        current_question: 1,
      },
    }, { status: 201 })
  }

  if (url.match(/\/api\/v1\/student\/assessments\/riasec\/sessions\/\d+$/) && init?.method === 'PATCH') {
    const body = JSON.parse(String(init.body ?? '{}')) as { answers: Record<string, number>; current_question: number }
    return Response.json({
      data: {
        id: 1,
        reference: 'ASMT-000001',
        status: 'in_progress',
        answers: body.answers,
        answer_count: Object.keys(body.answers).length,
        question_count: 6,
        current_question: body.current_question,
      },
    })
  }

  if (url.endsWith('/submit') && init?.method === 'POST') {
    return Response.json({
      data: {
        id: 1,
        status: 'result_available',
        question_count: 6,
        result_available_at: '2026-08-08T02:30:00+08:00',
        result: {
          instrument_code: 'tcc-riasec-42-v1',
          answer_count: 6,
          result: [
            { area: 'Realistic', score: 5 },
            { area: 'Investigative', score: 5 },
            { area: 'Artistic', score: 5 },
            { area: 'Social', score: 5 },
            { area: 'Enterprising', score: 5 },
            { area: 'Conventional', score: 5 },
          ],
        },
      },
    })
  }

  if (url.endsWith('/retry-result') && init?.method === 'POST') {
    return Response.json({ data: { id: 1, status: 'preparing_result', question_count: 6 } }, { status: 202 })
  }

  return Response.json({ message: 'Unauthenticated.' }, { status: 401 })
}

vi.stubGlobal('fetch', vi.fn(defaultFetch))

class XMLHttpRequestMock {
  status = 0
  responseText = ''
  withCredentials = false
  private url = ''
  private listeners: Record<string, Array<() => void>> = {}
  private uploadListeners: Record<string, Array<(event: ProgressEvent) => void>> = {}
  upload = {
    addEventListener: (type: string, listener: (event: ProgressEvent) => void) => {
      this.uploadListeners[type] = [...(this.uploadListeners[type] ?? []), listener]
    },
  }

  open(_method: string, url: string) { this.url = url }
  setRequestHeader() {}
  addEventListener(type: string, listener: () => void) { this.listeners[type] = [...(this.listeners[type] ?? []), listener] }
  send(body: Document | XMLHttpRequestBodyInit | null) {
    const image = body instanceof FormData ? body.get('image') : null
    queueMicrotask(() => {
      this.uploadListeners.progress?.forEach((listener) => listener({ lengthComputable: true, loaded: 1, total: 2 } as ProgressEvent))
      window.setTimeout(() => {
        if (image instanceof File && image.name.startsWith('fail')) {
          this.status = 500
          this.responseText = JSON.stringify({ message: 'The image upload failed.' })
        } else {
          this.status = 201
          const kind = body instanceof FormData ? body.get('kind') : 'cover'
          this.responseText = JSON.stringify({ data: { kind, url: `${this.url}/${String(kind)}.webp` } })
        }
        this.listeners.load?.forEach((listener) => listener())
      }, 100)
    })
  }
}

vi.stubGlobal('XMLHttpRequest', XMLHttpRequestMock)

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
})
