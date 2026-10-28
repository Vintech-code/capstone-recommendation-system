import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Route, Routes } from 'react-router'
import { expect, it } from 'vitest'

import { PasswordResetPage } from '@/features/auth/password-reset-page'

it('returns an Administrator to the Administrator portal after password reset', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/reset-password/test-token?email=admin%40example.test&portal=admin')
  render(
    <BrowserRouter>
      <Routes>
        <Route path="/reset-password/:token" element={<PasswordResetPage />} />
      </Routes>
    </BrowserRouter>,
  )

  await user.type(screen.getByLabelText('New password'), 'NewSecure!2026')
  await user.type(screen.getByLabelText('Confirm new password'), 'NewSecure!2026')
  await user.click(screen.getByRole('button', { name: 'Reset password' }))

  expect(await screen.findByRole('status')).toHaveTextContent('Your password has been reset')
  expect(screen.getByRole('link', { name: 'Continue to Administrator sign in' })).toHaveAttribute('href', '/admin/login')
  expect(fetch).toHaveBeenCalledWith(
    '/api/v1/auth/reset-password',
    expect.objectContaining({
      body: JSON.stringify({
        token: 'test-token',
        email: 'admin@example.test',
        password: 'NewSecure!2026',
        password_confirmation: 'NewSecure!2026',
      }),
    }),
  )
})
