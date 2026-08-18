interface StudentGuidanceRequest {
  id: number
  programmeId: string | null
  programmeCode: string | null
  programmeName: string | null
  concernCategory: 'programme_comparison' | 'programme_fit' | 'course_requirements' | 'career_direction' | 'general_guidance'
  message: string
  preferredFormat: 'in_person' | 'video_call' | 'phone'
  preferredDate: string | null
  status: 'pending' | 'accepted' | 'declined' | 'closed' | 'expired' | 'cancelled'
  acceptedBy: string | null
  acceptedAt: string | null
  closedAt: string | null
  resolutionReason: string | null
  createdAt: string
}

interface StudentGuidanceSummary {
  id: number
  body: string
  counselor: string | null
  publishedBy: string | null
  publishedAt: string
}

interface CreateGuidanceRequestFields {
  programmeId: string | null
  concernCategory: StudentGuidanceRequest['concernCategory']
  message: string
  preferredFormat: StudentGuidanceRequest['preferredFormat']
  preferredDate: string | null
}

async function getStudentGuidanceRequests(): Promise<StudentGuidanceRequest[]> {
  const response = await fetch('/api/v1/student/guidance-requests', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Guidance requests could not be loaded.')
  const body = await response.json() as { data: StudentGuidanceRequest[] }
  return body.data
}

async function getStudentGuidanceSummaries(): Promise<StudentGuidanceSummary[]> {
  const response = await fetch('/api/v1/student/guidance-summaries', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Published guidance summaries could not be loaded.')
  const body = await response.json() as { data: StudentGuidanceSummary[] }
  return body.data
}

async function createStudentGuidanceRequest(fields: CreateGuidanceRequestFields): Promise<StudentGuidanceRequest> {
  const token = csrfToken()
  const response = await fetch('/api/v1/student/guidance-requests', {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { 'X-XSRF-TOKEN': token } : {}) },
    body: JSON.stringify(fields),
  })
  const body = await response.json().catch(() => ({})) as { data?: StudentGuidanceRequest; message?: string }
  if (!response.ok || !body.data) throw new Error(body.message ?? 'Your guidance request could not be sent.')
  return body.data
}

function csrfToken() {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='))
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

async function cancelStudentGuidanceRequest(requestId: number, reason: string): Promise<StudentGuidanceRequest> {
  const token = csrfToken()
  const response = await fetch(`/api/v1/student/guidance-requests/${requestId}/cancel`, {
    method: 'POST', credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { 'X-XSRF-TOKEN': token } : {}) },
    body: JSON.stringify({ reason }),
  })
  const payload = await response.json().catch(() => ({})) as { data?: StudentGuidanceRequest; message?: string }
  if (!response.ok || !payload.data) throw new Error(payload.message ?? 'The guidance request could not be cancelled.')
  return payload.data
}

export { cancelStudentGuidanceRequest, createStudentGuidanceRequest, getStudentGuidanceRequests, getStudentGuidanceSummaries }
export type { CreateGuidanceRequestFields, StudentGuidanceRequest, StudentGuidanceSummary }
