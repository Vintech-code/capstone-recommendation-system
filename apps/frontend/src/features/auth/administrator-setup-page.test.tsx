import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router'
import { expect, it } from 'vitest'

import { AdministratorSetupPage } from '@/features/auth/administrator-setup-page'

it('validates an invitation and lets the recipient create their own password', async () => {
  const user = userEvent.setup()
  const token = 'a'.repeat(64)
  window.history.pushState({}, '', `/admin/setup#token=${token}`)
  render(<BrowserRouter><AdministratorSetupPage /></BrowserRouter>)

  expect(await screen.findByRole('heading', { name: 'Set up your Administrator account' })).toBeVisible()
  expect(await screen.findByText('Invited Administrator')).toBeVisible()
  expect(window.location.hash).toBe('')
  await user.type(screen.getByLabelText('Password'), 'AdminSecure!2026')
  await user.type(screen.getByLabelText('Confirm password'), 'AdminSecure!2026')
  await user.click(screen.getByRole('button', { name: 'Activate Administrator account' }))

  expect(await screen.findByText(/Administrator account is active/i)).toBeVisible()
  expect(screen.getByRole('link', { name: 'Continue to Administrator sign in' })).toHaveAttribute('href', '/admin/login')
})
