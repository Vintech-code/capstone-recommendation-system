import type { AccessRole } from '@/features/auth/access-types'

interface AuthUser {
  id: number
  name: string
  email: string
  roles: AccessRole[]
}

interface SignInCredentials {
  email: string
  password: string
  portal: AccessRole
}

interface AuthResponse {
  user: AuthUser
}

interface ErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

class AuthApiError extends Error {
  status: number
  fieldErrors: Record<string, string[]>

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function csrfCookie() {
  const response = await fetch('/sanctum/csrf-cookie', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new AuthApiError(
      'The sign-in service is unavailable. Please try again.',
      response.status,
    )
  }
}

function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('XSRF-TOKEN='))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  const token = csrfToken()
  if (token) headers.set('X-XSRF-TOKEN', token)
  if (init.body) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'include',
      headers,
    })
  } catch {
    throw new AuthApiError(
      'Unable to reach the server. Check your connection and try again.',
      0,
    )
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ErrorResponse
    throw new AuthApiError(
      payload.message ?? 'The request could not be completed.',
      response.status,
      payload.errors,
    )
  }

  return response.json() as Promise<T>
}

async function signIn(credentials: SignInCredentials) {
  await csrfCookie()

  return request<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

async function currentUser() {
  return request<AuthResponse>('/api/v1/auth/me')
}

async function authorizePortal(portal: AccessRole) {
  return request<{ authorized: true; portal: AccessRole }>(
    `/api/v1/auth/authorize/${portal}`,
  )
}

async function signOut() {
  return request<{ message: string }>('/api/v1/auth/logout', { method: 'POST' })
}

export { AuthApiError, authorizePortal, currentUser, signIn, signOut }
export type { AuthUser, SignInCredentials }
