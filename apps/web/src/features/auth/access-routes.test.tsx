import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'

async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByRole('textbox', { name: 'Email address' }),
    'user@example.com',
  )
  await user.type(screen.getByLabelText('Password'), 'password')
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('access portals and workspace shell', () => {
  it('opens the Student portal without exposing role selection', async () => {
    await renderAppAt('/student/login')

    expect(
      screen.getByRole('heading', { name: 'Sign in to your account' }),
    ).toBeVisible()
    expect(screen.getAllByText('Student Applicant').length).toBeGreaterThan(0)
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByText(/frontend ui preview/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/no backend/i)).not.toBeInTheDocument()
  })

  it('validates required fields without inventing password policy', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student/login')

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByText('Enter your email address.')).toBeVisible()
    expect(screen.getByText('Enter your password.')).toBeVisible()
  })

  it('provides an accessible password visibility control', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student/login')

    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show password' }))

    expect(password).toHaveAttribute('type', 'text')
    expect(
      screen.getByRole('button', { name: 'Hide password' }),
    ).toBeVisible()
  })

  it('moves from the Student portal to the Student workspace and signs out', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student/login')

    await signIn(user)

    expect(window.location.pathname).toBe('/student')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Student dashboard',
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('navigation', { name: 'Workspace navigation' }),
    ).toBeVisible()
    expect(screen.getAllByText('Profile & application').length).toBeGreaterThan(
      0,
    )
    expect(screen.getAllByText('Official result').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(window.location.pathname).toBe('/student/login')
    expect(
      screen.getByRole('heading', { name: 'Sign in to your account' }),
    ).toBeVisible()
  })

  it('uses a separate portal and workspace for the combined Admin role', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/login')

    expect(
      screen.getAllByText('Guidance / Psychometrician / Admin').length,
    ).toBeGreaterThan(0)

    await signIn(user)

    expect(window.location.pathname).toBe('/admin')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Operational overview',
      }),
    ).toBeVisible()
    expect(screen.getAllByText('Applicants').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Assessments & questionnaires').length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('Recommendations').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Courses & rules').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0)
  })

  it('uses a separate portal and workspace for the System Administrator', async () => {
    const user = userEvent.setup()
    await renderAppAt('/system-admin/login')

    expect(screen.getAllByText('System Administrator').length).toBeGreaterThan(0)

    await signIn(user)

    expect(window.location.pathname).toBe('/system-admin')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'System administration',
      }),
    ).toBeVisible()
    expect(screen.getAllByText('User access').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Role assignments').length).toBeGreaterThan(0)
  })

  it('filters the active role modules from the dashboard search', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student')

    await user.type(
      screen.getByRole('searchbox', { name: 'Search modules' }),
      'official',
    )
    const modules = screen.getByRole('region', { name: 'Matching modules' })

    expect(within(modules).getByText('Official result')).toBeVisible()
    expect(within(modules).queryByText('Course guidance')).not.toBeInTheDocument()
    expect(within(modules).getByText('1 result')).toBeVisible()
  })

  it('opens a role module and returns to the dashboard overview', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const main = screen.getByRole('main')
    const modules = screen.getByRole('region', { name: 'Admin modules' })
    await user.click(
      within(modules).getByRole('button', {
        name: /applicants.*open module/i,
      }),
    )

    expect(
      within(main).getByRole('heading', { level: 1, name: 'Applicants' }),
    ).toBeVisible()
    expect(window.location.pathname).toBe('/admin/applicants')

    await user.click(
      screen.getByRole('button', { name: 'Dashboard' }),
    )

    expect(
      within(main).getByRole('heading', {
        level: 1,
        name: 'Operational overview',
      }),
    ).toBeVisible()
    expect(window.location.pathname).toBe('/admin')
  })
})
