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

  if (url === '/api/v1/auth/logout') {
    return Response.json({ message: 'Signed out.' })
  }

  if (url.startsWith('/api/v1/auth/authorize/')) {
    return Response.json({
      authorized: true,
      portal: url.split('/').at(-1),
    })
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
