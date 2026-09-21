import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import { renderAppAt } from '@/test/render-app'

it('lets an authorized account manager invite an Administrator without creating a password', async () => {
  const user = userEvent.setup()
  await renderAppAt('/admin/administrators')

  expect(await screen.findByRole('heading', { name: 'Administrators' })).toBeVisible()
  await user.click(screen.getByRole('tab', { name: /invitation/i }))
  expect(screen.getByText('Pending Administrator')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Invite administrator' }))
  expect(screen.queryByLabelText(/temporary password/i)).not.toBeInTheDocument()
  await user.type(screen.getByLabelText('Name'), 'New Administrator')
  await user.type(screen.getByLabelText('Email address'), 'new-admin@example.test')
  await user.type(screen.getByLabelText('Confirm with your password'), 'password')
  await user.click(screen.getByRole('button', { name: 'Send invitation' }))

  await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalledWith(
    '/api/v1/admin/administrators/invitations',
    expect.objectContaining({ method: 'POST' }),
  ))
}, 20_000)

it('hides Administrator management navigation from a standard Administrator', async () => {
  await renderAppAt('/admin', { authUser: { id: 4, name: 'Standard Admin', email: 'standard@example.test', roles: ['admin'], canManageAdministrators: false } })

  expect(await screen.findByRole('heading', { name: 'System overview' })).toBeVisible()
  expect(screen.queryByText('Administrators')).not.toBeInTheDocument()
}, 15_000)

it('revokes sessions through the active Administrator endpoint', async () => {
  const user = userEvent.setup()
  await renderAppAt('/admin/administrators')

  await user.click(await screen.findByRole('button', { name: 'Open menu for Records Administrator' }))
  await user.click(screen.getByRole('menuitem', { name: 'Revoke active sessions' }))
  await user.type(screen.getByLabelText('Confirm with your password'), 'password')
  await user.click(screen.getByRole('button', { name: 'Revoke active sessions' }))

  await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalledWith(
    '/api/v1/admin/administrators/3/sessions/revoke',
    expect.objectContaining({ method: 'POST' }),
  ))
}, 15_000)

it('renders profile picture in administrator table when available and falls back to initials', async () => {
  await renderAppAt('/admin/administrators')

  expect(await screen.findByRole('heading', { name: 'Administrators' })).toBeVisible()

  // Admin User has photoUrl, should render img with referrerPolicy
  const userAvatar = await screen.findByRole('img', { name: 'Admin User' })
  expect(userAvatar).toBeVisible()
  expect(userAvatar).toHaveAttribute('src', 'https://lh3.googleusercontent.com/avatar-2.png')

  // Records Administrator has no photoUrl, should render initials RA
  expect(screen.getByText('RA')).toBeVisible()

  // Verify status and access badges render
  expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
  expect(screen.getByText('Standard')).toBeVisible()
}, 15_000)
