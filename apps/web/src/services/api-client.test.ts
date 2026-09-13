import { describe, expect, it, vi } from 'vitest'

import { apiDataRequest } from './api-client'

describe('api client', () => {
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
})
