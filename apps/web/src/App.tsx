import { BrowserRouter, useLocation } from 'react-router'

import { ApplicationErrorBoundary } from '@/components/shared'
import { SiteFooter } from '@/components/shared/site-footer'
import { AccessRoutes } from '@/features/auth/access-routes'

function App() {
  return (
    <BrowserRouter>
      <ApplicationFrame />
    </BrowserRouter>
  )
}

function ApplicationFrame() {
  const location = useLocation()
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
