import { BrowserRouter } from 'react-router'

import { ApplicationErrorBoundary } from '@/components/shared'
import { AccessRoutes } from '@/features/auth/access-routes'
import { useAuth } from '@/features/auth/auth-context'

function App() {
  return (
    <BrowserRouter>
      <ApplicationFrame />
    </BrowserRouter>
  )
}

function ApplicationFrame() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div
        aria-busy="true"
        className="min-h-svh bg-background"
      >
        <span role="status" className="sr-only">
          Restoring your session.
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-svh">
      <ApplicationErrorBoundary>
        <AccessRoutes />
      </ApplicationErrorBoundary>
    </div>
  )
}

export default App
