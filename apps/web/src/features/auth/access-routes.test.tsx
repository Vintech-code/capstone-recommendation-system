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

    expect(screen.getByRole('main')).toHaveClass('portal-sign-in-theme', 'text-foreground')
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Welcome back!' }),
    ).toBeVisible()
    expect(screen.getAllByRole('img', { name: 'Pathways' })).toHaveLength(1)
    screen.getAllByRole('img', { name: 'Pathways' }).forEach((brandLogo) => {
      expect(brandLogo).toHaveAttribute(
        'src',
        expect.stringMatching(/logo-optimized\.png$/),
      )
    })
    expect(
      screen.getByRole('img', { name: /illustrated academic path/i }),
    ).toHaveAttribute('src', expect.stringMatching(/student-journey-hero\.png$/))
    expect(screen.getByText('Discover a programme direction built from your recorded interests.')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeEnabled()
    expect(screen.queryByText('Gmail sign-in is not configured yet.')).not.toBeInTheDocument()
    expect(screen.queryByText(/facebook/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/microsoft/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Student Applicant')).not.toBeInTheDocument()
    expect(screen.queryByText('Course Recommendation System')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /dark mode|light mode/i })).not.toBeInTheDocument()
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
    expect(screen.getByRole('main')).toHaveClass('portal-sign-in-theme', 'text-foreground')
    expect(screen.getAllByRole('img', { name: 'Pathways' })).toHaveLength(1)
    expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveAttribute(
      'placeholder',
      ' ',
    )
    expect(screen.getByLabelText('Password')).toHaveAttribute('placeholder', ' ')
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

  it('shows a safe Google callback error on the Student sign-in page', async () => {
    await renderAppAt('/student/login?google_error=account_inactive')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This account is not active. Contact an authorized administrator.',
    )
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
      await screen.findByRole('button', { name: 'Go to dashboard' }),
    ).toBeVisible()
    expect(screen.queryByLabelText('Workspace sidebar')).not.toBeInTheDocument()

    // Navigate to dashboard overview to open user menu and sign out
    await user.click(screen.getByRole('button', { name: 'Go to dashboard' }))
    await user.click(await screen.findByRole('button', { name: 'Open user menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }))

    expect(window.location.pathname).toBe('/student/login')
    expect(
      await screen.findByRole('heading', { name: 'Welcome back!' }),
    ).toBeVisible()
  }, 10_000)

  it('uses a separate portal and workspace for the Administrator role', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/login')

    expect(screen.queryByText('Administrator')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue with Google' })).not.toBeInTheDocument()

    await signIn(user)

    expect(window.location.pathname).toBe('/admin')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'System overview',
      }, { timeout: 5_000 }),
    ).toBeVisible()
    expect(screen.getAllByText('Students').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Assessments' })).not.toBeInTheDocument()
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
        name: 'System overview',
      }),
    ).toBeVisible()
    expect(window.location.pathname).toBe('/admin')
  })
})
