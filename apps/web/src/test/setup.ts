import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, vi } from 'vitest'

import { THEME_STORAGE_KEY } from '@/app/theme-context'

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
  window.localStorage.removeItem(THEME_STORAGE_KEY)
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
      portal: 'student' | 'admin' | 'system-admin'
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

  if (url.startsWith('/api/v1/auth/authorize/')) {
    return Response.json({
      authorized: true,
      portal: url.split('/').at(-1),
    })
  }

  if (url === '/api/v1/student/assessments/onet-mini-ip/session') {
    return Response.json({
      data: {
        status: 'not_started',
        question_count: 30,
      },
    })
  }

  if (url === '/api/v1/student/assessments/onet-mini-ip/history') {
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

  if (url === '/api/v1/student/assessments/onet-mini-ip/questions') {
    return Response.json({
      data: {
        instrument: {
          code: 'onet-mini-ip-30',
          name: 'O*NET Interest Profiler Mini-IP',
          question_count: 6,
          api_version: '2.0',
        },
        answer_options: [
          { value: 1, name: 'Strongly dislike' },
          { value: 2, name: 'Dislike' },
          { value: 3, name: 'Unsure' },
          { value: 4, name: 'Like' },
          { value: 5, name: 'Strongly like' },
        ],
        questions: Array.from({ length: 6 }, (_, index) => ({
          index: index + 1,
          text: `Interest question ${index + 1}`,
        })),
        attribution: { text: 'O*NET attribution', url: 'https://services.onetcenter.org/' },
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

  if (url === '/api/v1/student/assessments/onet-mini-ip/sessions' && init?.method === 'POST') {
    return Response.json({
      data: {
        id: 1,
        reference: 'ASMT-000001',
        instrument_code: 'onet-mini-ip-30',
        status: 'in_progress',
        answers: {},
        answer_count: 0,
        question_count: 6,
        current_question: 1,
      },
    }, { status: 201 })
  }

  if (url.match(/\/api\/v1\/student\/assessments\/onet-mini-ip\/sessions\/\d+$/) && init?.method === 'PATCH') {
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
    return Response.json({ data: { id: 1, status: 'preparing_result', question_count: 6 } }, { status: 202 })
  }

  if (url.endsWith('/retry-result') && init?.method === 'POST') {
    return Response.json({ data: { id: 1, status: 'preparing_result', question_count: 6 } }, { status: 202 })
  }

  return Response.json({ message: 'Unauthenticated.' }, { status: 401 })
}

vi.stubGlobal('fetch', vi.fn(defaultFetch))

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
