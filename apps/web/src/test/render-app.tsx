import { render, screen, waitFor } from '@testing-library/react'
import { expect } from 'vitest'

import App from '@/App'
import { AppProviders } from '@/app/providers'
import type { AccessRole } from '@/features/auth/access-types'
import type { AuthUser } from '@/features/auth/auth-provider'

interface RenderAppOptions {
  authUser?: AuthUser | null
}

const testUsers: Record<AccessRole, AuthUser> = {
  student: {
    id: 1,
    name: 'Student Applicant',
    email: 'student@example.test',
    roles: ['student'],
  },
  admin: {
    id: 2,
    name: 'Admin User',
    email: 'admin@example.test',
    roles: ['admin'],
  },
  'system-admin': {
    id: 3,
    name: 'System Administrator',
    email: 'system-admin@example.test',
    roles: ['system-admin'],
  },
}

function defaultUserForPath(path: string) {
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    return testUsers.admin
  }
  if (path.startsWith('/student') && !path.startsWith('/student/login')) {
    return testUsers.student
  }
  if (
    path.startsWith('/system-admin') &&
    !path.startsWith('/system-admin/login')
  ) {
    return testUsers['system-admin']
  }
  return null
}

async function renderAppAt(path: string, options: RenderAppOptions = {}) {
  window.history.pushState({}, '', path)
  const initialAuthUser =
    'authUser' in options ? options.authUser : defaultUserForPath(path)

  const result = render(
    <AppProviders initialAuthUser={initialAuthUser}>
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
    !path.startsWith('/admin/login') &&
    initialAuthUser?.roles.includes('admin')
  ) {
    await screen.findByLabelText('Workspace sidebar')
  }

  return result
}

export { renderAppAt }
