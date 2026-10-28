interface ApiErrorPayload {
  message?: string
  errors?: Record<string, string[]>
}

type ApiErrorFactory = (
  message: string,
  status: number,
  fieldErrors: Record<string, string[]>,
) => Error

interface ApiRequestOptions {
  errorFactory?: ApiErrorFactory
  fallbackMessage?: string
  networkMessage?: string
}

const apiOrigin = (import.meta.env.VITE_API_ORIGIN ?? '').replace(/\/$/, '')

function apiUrl(path: string) {
  return apiOrigin ? `${apiOrigin}${path}` : path
}

class ApiClientError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string[]>

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function csrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('XSRF-TOKEN='))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

function createError(
  options: ApiRequestOptions,
  message: string,
  status: number,
  fieldErrors: Record<string, string[]> = {},
) {
  return options.errorFactory
    ? options.errorFactory(message, status, fieldErrors)
    : new ApiClientError(message, status, fieldErrors)
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = csrfToken()
  if (token) headers.set('X-XSRF-TOKEN', token)

  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      credentials: 'include',
      headers,
    })
  } catch {
    throw createError(
      options,
      options.networkMessage ?? 'Unable to reach the server. Check your connection and try again.',
      0,
    )
  }

  const payload = (await response.json().catch(() => ({}))) as T & ApiErrorPayload
  if (!response.ok) {
    throw createError(
      options,
      payload.message ?? options.fallbackMessage ?? 'The request could not be completed.',
      response.status,
      payload.errors,
    )
  }

  return payload
}

async function apiDataRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const payload = await apiRequest<{ data?: T; message?: string; errors?: Record<string, string[]> }>(
    path,
    init,
    options,
  )

  if (payload.data === undefined) {
    throw createError(
      options,
      payload.message ?? options.fallbackMessage ?? 'The server returned an incomplete response.',
      200,
      payload.errors,
    )
  }

  return payload.data
}

export { ApiClientError, apiDataRequest, apiRequest, apiUrl, csrfToken }
export type { ApiErrorFactory, ApiRequestOptions }
