import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import App from '@/App'
import { AppProviders } from '@/app/providers'
import { renderAppAt } from '@/test/render-app'

describe('shared application states', () => {
  it('renders an unknown route as a recoverable not-found screen', async () => {
    const user = userEvent.setup()
    await renderAppAt('/unknown-workspace')

    expect(
      screen.getByRole('heading', { level: 1, name: 'This page is unavailable' }),
    ).toBeVisible()
    expect(await screen.findByTestId('not-found-animation')).toBeVisible()
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

  it('does not render page content while restoring a protected session', () => {
    window.history.pushState({}, '', '/student')
    vi.mocked(fetch).mockImplementation(() => new Promise<Response>(() => undefined))

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Restoring your session.')
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

  it('omits a global footer from application pages', async () => {
    await renderAppAt('/student/login')

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })

})
