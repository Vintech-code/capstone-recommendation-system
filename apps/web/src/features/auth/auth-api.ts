import type { AccessRole } from '@/features/auth/access-types'
import { apiRequest } from '@/services/api-client'

interface AuthUser {
  id: number
  name: string
  email: string
  roles: AccessRole[]
  accountStatus?: 'active' | 'pending' | 'suspended' | 'archived'
  mustChangePassword?: boolean
  photoUrl?: string | null
}

interface SignInCredentials {
  email: string
  password: string
  portal: AccessRole
}

interface StudentRegistrationFields {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

interface AuthResponse {
  user: AuthUser
}

interface SessionResponse {
  user: AuthUser | null
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
  await apiRequest('/sanctum/csrf-cookie', {}, {
    fallbackMessage: 'The sign-in service is unavailable. Please try again.',
    networkMessage: 'The sign-in service is unavailable. Please try again.',
    errorFactory: (message, status) => new AuthApiError(message, status),
  })
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  return apiRequest<T>(path, init, {
    errorFactory: (message, status, errors) => new AuthApiError(message, status, errors),
  })
}

async function signIn(credentials: SignInCredentials) {
  await csrfCookie()

  return request<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

async function registerStudent(fields: StudentRegistrationFields) {
  await csrfCookie()

  return request<{ message: string }>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: fields.name,
      email: fields.email,
      password: fields.password,
      password_confirmation: fields.passwordConfirmation,
    }),
  })
}

async function currentUser() {
  return request<AuthResponse>('/api/v1/auth/me')
}

async function restoreSession() {
  return request<SessionResponse>('/api/v1/auth/session')
}

async function authorizePortal(portal: AccessRole) {
  return request<{ authorized: true; portal: AccessRole }>(
    `/api/v1/auth/authorize/${portal}`,
  )
}

async function signOut() {
  return request<{ message: string }>('/api/v1/auth/logout', { method: 'POST' })
}

async function requestPasswordReset(email: string) {
  await csrfCookie()
  return request<{ message: string }>('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

async function resetPassword(fields: { token: string; email: string; password: string; passwordConfirmation: string }) {
  await csrfCookie()
  return request<{ message: string }>('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      token: fields.token,
      email: fields.email,
      password: fields.password,
      password_confirmation: fields.passwordConfirmation,
    }),
  })
}

async function changePassword(fields: { currentPassword: string; password: string; passwordConfirmation: string }) {
  return request<{ data: { changed: true } }>('/api/v1/auth/password', {
    method: 'PUT',
    body: JSON.stringify({
      currentPassword: fields.currentPassword,
      password: fields.password,
      password_confirmation: fields.passwordConfirmation,
    }),
  })
}

export {
  AuthApiError,
  authorizePortal,
  currentUser,
  restoreSession,
  registerStudent,
  signIn,
  signOut,
  requestPasswordReset,
  resetPassword,
  changePassword,
}
export type { AuthUser, SignInCredentials, StudentRegistrationFields }
