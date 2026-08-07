import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApplicationErrorBoundary } from '@/components/shared/application-error-boundary'

let shouldThrow = true

function UnstableContent() {
  if (shouldThrow) throw new Error('Test-only render failure')
  return <p>Recovered content</p>
}

describe('ApplicationErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true
    window.history.replaceState({}, '', '/student')
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a focused recovery screen without exposing the exception message', () => {
    render(
      <ApplicationErrorBoundary>
        <UnstableContent />
      </ApplicationErrorBoundary>,
    )

    const heading = screen.getByRole('heading', { name: 'Something went wrong' })
    expect(heading).toHaveFocus()
    expect(screen.getByText(/^APP-/)).toBeVisible()
    expect(screen.queryByText('Test-only render failure')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return to dashboard' })).toHaveAttribute('href', '/student')
  })

  it('retries the failed page without reloading the application', async () => {
    const user = userEvent.setup()
    render(
      <ApplicationErrorBoundary>
        <UnstableContent />
      </ApplicationErrorBoundary>,
    )

    shouldThrow = false
    await user.click(screen.getByRole('button', { name: 'Retry page' }))

    expect(screen.getByText('Recovered content')).toBeVisible()
  })
})
