import { BrowserRouter, useLocation } from 'react-router'

import { ApplicationErrorBoundary } from '@/components/shared'
import { SiteFooter } from '@/components/shared/site-footer'
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
  const location = useLocation()
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

  const isStaffWorkspace = location.pathname === '/admin' || location.pathname.startsWith('/admin/') || location.pathname === '/counselor' || location.pathname.startsWith('/counselor/')
  const isAuthenticationPage =
    location.pathname.endsWith('/login') ||
    location.pathname === '/student/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname === '/change-password'

  return <div className="flex min-h-svh flex-col">
    <div className="flex-1">
      <ApplicationErrorBoundary>
        <AccessRoutes />
      </ApplicationErrorBoundary>
    </div>
    {!isStaffWorkspace && !isAuthenticationPage ? <SiteFooter /> : null}
  </div>
}

export default App
