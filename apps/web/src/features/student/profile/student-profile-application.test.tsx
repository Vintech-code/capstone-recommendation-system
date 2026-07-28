import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { StudentProfileApplicationPage } from '@/features/student/profile/components/student-profile-application-page'
import { renderAppAt } from '@/test/render-app'

async function openStudentProfile() {
  const user = userEvent.setup()
  await renderAppAt('/student')

  const navigation = screen.getByRole('navigation', {
    name: 'Workspace navigation',
  })
  await user.click(
    within(navigation).getByRole('button', {
      name: 'Profile & application',
    }),
  )

  return user
}

describe('Student profile and application', () => {
  it('opens a Student-specific mobile-first profile workspace', async () => {
    await openStudentProfile()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Profile & application',
      }),
    ).toBeVisible()
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Profile & application',
    })
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(
      heading.compareDocumentPosition(breadcrumb) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: 'Back to Student dashboard' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Profile completion' }),
    ).toHaveAttribute('aria-valuenow', '86')
    expect(screen.getByText('Missing information')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Review submission' }),
    ).toBeDisabled()
    expect(screen.queryByText('Applicants')).not.toBeInTheDocument()
  })

  it('validates editable profile fields with accessible messages', async () => {
    const user = await openStudentProfile()
    await user.click(screen.getByRole('button', { name: 'Edit details' }))

    const fullName = screen.getByRole('textbox', { name: 'Full name' })
    const email = screen.getByRole('textbox', { name: 'Contact email' })
    await user.clear(fullName)
    await user.clear(email)
    await user.type(email, 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Enter your full name.')).toBeVisible()
    expect(screen.getByText('Enter a valid email address.')).toBeVisible()
    expect(fullName).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAttribute('aria-invalid', 'true')
  })

  it('saves completed details and submits the sample application', async () => {
    const user = await openStudentProfile()
    await user.click(screen.getByRole('button', { name: 'Edit details' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Home address' }),
      'Sample residential address',
    )
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Edit details' })).toBeVisible(),
    )
    expect(
      screen.getByRole('progressbar', { name: 'Profile completion' }),
    ).toHaveAttribute('aria-valuenow', '100')

    await user.click(
      screen.getByRole('checkbox', {
        name: 'I reviewed the information shown on this page.',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Review submission' }))
    expect(
      screen.getByRole('alertdialog', { name: 'Submit this application?' }),
    ).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Submit application' }),
    )

    expect(await screen.findByText('Application submitted')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Edit details' })).not.toBeInTheDocument()
  })

  it('protects unsaved changes before returning to the dashboard', async () => {
    const user = await openStudentProfile()
    await user.click(screen.getByRole('button', { name: 'Edit details' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Home address' }),
      'Unsaved address',
    )
    await user.click(
      screen.getByRole('button', { name: 'Go to Student dashboard' }),
    )

    expect(
      screen.getByRole('alertdialog', { name: 'Leave without saving?' }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Discard changes' }))
    expect(
      await screen.findByRole('heading', {
        name: /your guidance journey, one step at a time/i,
      }),
    ).toBeVisible()
  })

  it('defines recoverable loading and error states', async () => {
    const { unmount } = render(
      <StudentProfileApplicationPage
        onBack={vi.fn()}
        initialLoadState="loading"
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading your profile',
    )

    unmount()
    render(
      <StudentProfileApplicationPage
        onBack={vi.fn()}
        initialLoadState="error"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'We could not load your profile',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      screen.getByRole('heading', { name: 'Profile & application' }),
    ).toBeVisible()
  })

  it('has no automatically detectable accessibility violations', async () => {
    const user = await openStudentProfile()
    const main = screen.getByRole('main')
    const results = await axe.run(main, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(user).toBeDefined()
    expect(results.violations).toEqual([])
  })
})
