import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'

describe('shared application states', () => {
  it('renders an unknown route as a recoverable not-found screen', async () => {
    const user = userEvent.setup()
    await renderAppAt('/unknown-workspace')

    expect(
      screen.getByRole('heading', { level: 1, name: 'This page is unavailable' }),
    ).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Return to application' }),
    )
    expect(window.location.pathname).toBe('/student/login')
  })

  it('provides dedicated permission and session recovery screens', async () => {
    const user = userEvent.setup()
    const { unmount } = await renderAppAt('/forbidden')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'You cannot open this page',
      }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Return to portal' }))
    expect(window.location.pathname).toBe('/student/login')

    unmount()
    await renderAppAt('/session-expired')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sign in to continue' }),
    ).toBeVisible()
  })

  it('provides retryable error and recoverable empty Admin states', async () => {
    const user = userEvent.setup()
    const { unmount } = await renderAppAt('/admin/applicants?state=error')

    expect(screen.getByRole('alert')).toBeVisible()
    expect(screen.getByText('Workspace could not be loaded')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(window.location.search).toBe('')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Applicants',
      }),
    ).toBeVisible()

    unmount()
    await renderAppAt('/admin/reports?state=empty')
    expect(
      screen.getByRole('heading', { name: 'No records in this view' }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Clear view' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reports' }),
    ).toBeVisible()
  })

  it('announces a loading state for every Admin route boundary', async () => {
    await renderAppAt('/admin/recommendations?state=loading')

    const loading = screen.getByRole('status')
    expect(loading).toHaveTextContent('Loading workspace')
    expect(loading).toHaveAttribute('aria-busy', 'true')
  })
})
