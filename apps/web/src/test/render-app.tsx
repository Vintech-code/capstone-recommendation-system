import { render, screen, waitFor } from '@testing-library/react'
import { expect } from 'vitest'

import App from '@/App'
import { AppProviders } from '@/app/providers'

async function renderAppAt(path: string) {
  window.history.pushState({}, '', path)

  const result = render(
    <AppProviders>
      <App />
    </AppProviders>,
  )

  await waitFor(
    () => {
      expect(screen.queryByText('Loading application')).not.toBeInTheDocument()
    },
    { timeout: 5_000 },
  )

  if (
    (path === '/admin' || path.startsWith('/admin/')) &&
    !path.startsWith('/admin/login')
  ) {
    await screen.findByLabelText('Workspace sidebar')
  }

  return result
}

export { renderAppAt }
