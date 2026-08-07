import { BrowserRouter } from 'react-router'

import { ApplicationErrorBoundary } from '@/components/shared'
import { SiteFooter } from '@/components/shared/site-footer'
import { AccessRoutes } from '@/features/auth/access-routes'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh flex-col">
        <div className="flex-1">
          <ApplicationErrorBoundary>
            <AccessRoutes />
          </ApplicationErrorBoundary>
        </div>
        <SiteFooter />
      </div>
    </BrowserRouter>
  )
}

export default App
