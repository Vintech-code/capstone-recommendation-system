import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { dashboards } from '@/features/auth/workspace-definitions'
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
  it('separates Administrator and Counselor responsibilities', () => {
    expect(dashboards.admin.accessFacts).toContain(
      'Individual Administrator accounts',
    )
    expect(dashboards.counselor.boundary).toMatch(/cannot edit programme governance/i)
  })

  it('opens the Student portal without exposing role selection', async () => {
    await renderAppAt('/student/login')

    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(
      screen.getByRole('heading', { name: 'Institutional' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Sign in to your account' }),
    ).toBeVisible()
    expect(screen.getAllByText('Student Applicant').length).toBeGreaterThan(0)
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByText(/frontend ui preview/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/no backend/i)).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Create an account' }),
    ).toHaveAttribute('href', '/student/register')
  })

  it('provides the backend-ready Student registration form without role selection', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student/register')

    expect(
      screen.getByRole('heading', { name: 'Create your account' }),
    ).toBeVisible()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Create student account' }),
    )
    expect(screen.getByText('Enter your full name.')).toBeVisible()
    expect(screen.getByText('Enter your email address.')).toBeVisible()
    expect(screen.getByText('Enter a password.')).toBeVisible()
    expect(screen.getByText('Confirm your password.')).toBeVisible()
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
        name: /Turn your assessment into a confident course choice|Start with what genuinely interests you/,
      }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Go to dashboard' }).querySelector('img')).toHaveAttribute('src', expect.stringMatching(/logo\.png$/))
    expect(
      screen.getByRole('navigation', { name: 'Workspace navigation' }),
    ).toBeVisible()
    expect(screen.queryByLabelText('Workspace sidebar')).not.toBeInTheDocument()
    expect(screen.getAllByText('Assessment').length).toBeGreaterThan(0)
    expect(screen.queryByText('Assessment result')).not.toBeInTheDocument()
    expect(screen.getAllByText('Explore Programs').length).toBeGreaterThan(0)
    expect(screen.getAllByText('My Matches').length).toBeGreaterThan(0)
    expect(screen.queryByText('My report')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }))

    expect(window.location.pathname).toBe('/student/login')
    expect(
      await screen.findByRole('heading', { name: 'Sign in to your account' }),
    ).toBeVisible()
  }, 10_000)

  it('uses a separate portal and workspace for the Administrator role', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/login')

    expect(
      screen.getAllByText('Administrator').length,
    ).toBeGreaterThan(0)

    await signIn(user)

    expect(window.location.pathname).toBe('/admin')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Welcome back, Admin/i,
      }, { timeout: 5_000 }),
    ).toBeVisible()
    expect(screen.getAllByText('Students').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Counselor accounts').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Assessments').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Programmes').length).toBeGreaterThan(0)
    expect(screen.queryByText('Methodology')).not.toBeInTheDocument()
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0)
    expect(screen.queryByText('Official results')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()

    const navigationToggle = screen.getByRole('button', {
      name: 'Collapse workspace navigation',
    })
    await user.click(navigationToggle)
    expect(
      screen.getByRole('button', { name: 'Expand workspace navigation' }),
    ).toBeVisible()
  }, 10_000)

  it('uses a separate portal and workspace for Counselors', async () => {
    const user = userEvent.setup()
    await renderAppAt('/counselor/login')

    expect(screen.getAllByText('Counselor').length).toBeGreaterThan(0)

    await signIn(user)

    expect(window.location.pathname).toBe('/counselor')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Good day,/,
      }),
    ).toBeVisible()
    expect(screen.getAllByText('Student records').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Guidance requests').length).toBeGreaterThan(0)
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('opens a role module and returns to the dashboard overview', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const main = screen.getByRole('main')
    await user.click(
      screen.getByRole('button', { name: 'Students' }),
    )

    expect(
      within(main).getByRole('heading', { level: 1, name: 'Student records' }),
    ).toBeVisible()
    expect(window.location.pathname).toBe('/admin/students')

    await user.click(
      screen.getByRole('button', { name: 'Dashboard' }),
    )

    expect(
      within(main).getByRole('heading', {
        level: 1,
        name: /Welcome back, Admin/i,
      }),
    ).toBeVisible()
    expect(window.location.pathname).toBe('/admin')
  })
})
