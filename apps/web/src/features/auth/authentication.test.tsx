import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderAppAt } from '@/test/render-app'

describe('server-backed authentication', () => {
  it('requests password recovery without exposing whether the account exists', async () => {
    const user = userEvent.setup()
    await renderAppAt('/forgot-password?portal=student')

    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'student@example.test')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(await screen.findByRole('status')).toHaveTextContent('If an active account matches that email')
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/forgot-password', expect.objectContaining({
      body: JSON.stringify({ email: 'student@example.test' }),
    }))
  })

  it('resets a password from a tokenized recovery link', async () => {
    const user = userEvent.setup()
    await renderAppAt('/reset-password/test-token?email=student%40example.test')

    await user.type(screen.getByLabelText('New password'), 'new-password')
    await user.type(screen.getByLabelText('Confirm new password'), 'new-password')
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Your password has been reset')
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/reset-password', expect.objectContaining({
      body: JSON.stringify({ token: 'test-token', email: 'student@example.test', password: 'new-password', password_confirmation: 'new-password' }),
    }))
  })

  it('registers a Student account and enters the Student workspace', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student/register')

    await user.type(screen.getByRole('textbox', { name: 'Full name' }), 'New Student')
    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'new.student@example.test')
    await user.type(screen.getByLabelText('Password'), 'student-password')
    await user.type(screen.getByLabelText('Confirm password'), 'student-password')
    await user.click(screen.getByRole('button', { name: 'Create student account' }))

    await waitFor(() => expect(window.location.pathname).toBe('/student'))
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/register', expect.objectContaining({
      body: JSON.stringify({
        name: 'New Student',
        email: 'new.student@example.test',
        password: 'student-password',
        password_confirmation: 'student-password',
      }),
    }))
  })

  it('redirects an unauthenticated Admin request to the Admin portal', async () => {
    await renderAppAt('/admin/applicants', { authUser: null })

    await waitFor(() => expect(window.location.pathname).toBe('/admin/login'))
    expect(
      await screen.findByRole(
        'heading',
        { name: 'Welcome back!' },
        { timeout: 5_000 },
      ),
    ).toBeVisible()
  })

  it('sends the selected portal with the credentials and enters Admin', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/login')

    await user.type(
      screen.getByRole('textbox', { name: 'Email address' }),
      'admin@example.test',
    )
    await user.type(screen.getByLabelText('Password'), 'correct-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(window.location.pathname).toBe('/admin'))
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/auth/login',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'admin@example.test',
          password: 'correct-password',
          portal: 'admin',
        }),
      }),
    )
  })

  it('keeps credentials in the form and shows a server validation error', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      if (input.toString() === '/sanctum/csrf-cookie') {
        return new Response(null, { status: 204 })
      }
      if (input.toString() === '/api/v1/auth/login') {
        return Response.json(
          {
            message: 'The provided credentials are incorrect.',
            errors: {
              email: ['The provided credentials are incorrect.'],
            },
          },
          { status: 422 },
        )
      }
      return Response.json({ message: 'Unexpected request.' }, { status: 500 })
    })

    const user = userEvent.setup()
    await renderAppAt('/admin/login')
    const email = screen.getByRole('textbox', { name: 'Email address' })

    await user.type(email, 'admin@example.test')
    await user.type(screen.getByLabelText('Password'), 'incorrect-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('The provided credentials are incorrect.'),
    ).toBeVisible()
    expect(email).toHaveValue('admin@example.test')
    expect(window.location.pathname).toBe('/admin/login')
  })

  it('blocks an authenticated user from another role', async () => {
    await renderAppAt('/admin', {
      authUser: {
        id: 4,
        name: 'Student Applicant',
        email: 'student@example.test',
        roles: ['student'],
      },
    })

    expect(window.location.pathname).toBe('/forbidden')
    expect(
      screen.getByRole('heading', { name: 'You cannot open this page' }),
    ).toBeVisible()
  })

  it('uses the server portal boundary before rendering a protected workspace', async () => {
    await renderAppAt('/student')

    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/auth/authorize/student',
      expect.objectContaining({
        credentials: 'include',
      }),
    )
    expect(
      await screen.findByRole('button', { name: 'Go to dashboard' }),
    ).toBeVisible()
  })

  it('opens session recovery when the server rejects an expired session', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      if (input.toString() === '/api/v1/auth/authorize/student') {
        return Response.json(
          {
            message: 'Unauthenticated.',
            error: {
              code: 'AUTHENTICATION_REQUIRED',
            },
          },
          { status: 401 },
        )
      }
      return Response.json({ message: 'Unexpected request.' }, { status: 500 })
    })

    await renderAppAt('/student')

    await waitFor(() =>
      expect(window.location.pathname).toBe('/session-expired'),
    )
    expect(
      screen.getByRole('heading', { name: 'Sign in to continue' }),
    ).toBeVisible()
  })

  it('opens permission recovery when the server denies the portal role', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      if (input.toString() === '/api/v1/auth/authorize/student') {
        return Response.json(
          {
            message: 'You do not have permission to access this portal.',
            error: {
              code: 'ROLE_FORBIDDEN',
            },
          },
          { status: 403 },
        )
      }
      return Response.json({ message: 'Unexpected request.' }, { status: 500 })
    })

    await renderAppAt('/student')

    await waitFor(() => expect(window.location.pathname).toBe('/forbidden'))
    expect(
      screen.getByRole('heading', { name: 'You cannot open this page' }),
    ).toBeVisible()
  })
})
