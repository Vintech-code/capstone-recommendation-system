import { BrowserRouter } from 'react-router'

import { AccessRoutes } from '@/features/auth/access-routes'

function App() {
  return (
    <BrowserRouter>
      <AccessRoutes />
    </BrowserRouter>
  )
}

export default App
