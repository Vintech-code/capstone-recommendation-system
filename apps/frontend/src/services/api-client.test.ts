import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiBlobRequest, apiDataRequest } from './api-client'

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('sends the shared JSON, session, and CSRF request contract', async () => {
    document.cookie = 'XSRF-TOKEN=token%20value; path=/'
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ data: { saved: true } }))

    const result = await apiDataRequest<{ saved: boolean }>('/api/v1/example', {
      method: 'POST',
      body: JSON.stringify({ name: 'Example' }),
    })

    expect(result).toEqual({ saved: true })
    expect(fetch).toHaveBeenCalledOnce()

    const [, init] = vi.mocked(fetch).mock.calls[0]
    const headers = new Headers(init?.headers)
    expect(init?.credentials).toBe('include')
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('X-XSRF-TOKEN')).toBe('token value')
  })

  it('preserves status and field errors from failed responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({
      message: 'The request is invalid.',
      errors: { email: ['The email field is required.'] },
    }, { status: 422 }))

    await expect(apiDataRequest('/api/v1/example')).rejects.toMatchObject({
      name: 'ApiClientError',
      message: 'The request is invalid.',
      status: 422,
      fieldErrors: { email: ['The email field is required.'] },
    })
  })

  it('resolves relative media paths against the configured API origin', async () => {
    vi.stubEnv('VITE_API_ORIGIN', 'https://api.example.test/')
    vi.resetModules()
    const { apiUrl } = await import('./api-client')

    expect(apiUrl('/api/v1/admin/profile/photo?v=2')).toBe(
      'https://api.example.test/api/v1/admin/profile/photo?v=2',
    )
    expect(apiUrl('https://images.example.test/avatar.png')).toBe(
      'https://images.example.test/avatar.png',
    )
  })

  it('loads protected images using the authenticated request contract', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('profile', { headers: { 'Content-Type': 'image/png' } }),
    )

    const result = await apiBlobRequest('/api/v1/admin/profile/photo?v=3')

    expect(result).toMatchObject({ size: 7, type: 'image/png' })
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/admin/profile/photo?v=3',
      expect.objectContaining({
        credentials: 'include',
        headers: { Accept: 'image/*' },
      }),
    )
  })
})
