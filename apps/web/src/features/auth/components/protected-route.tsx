import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { ErrorState } from '@/components/shared'
import type { AccessRole } from '@/features/auth/access-types'
import {
  AuthApiError,
  authorizePortal,
} from '@/features/auth/auth-api'
import { useAuth } from '@/features/auth/auth-context'

interface ProtectedRouteProps {
  role: AccessRole
  children: ReactNode
}

function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { retrySession, status, user } = useAuth()
  const location = useLocation()
  const [authorizationAttempt, setAuthorizationAttempt] = useState(0)
  const authorizationKey = `${user?.id ?? 'guest'}:${role}:${authorizationAttempt}`
  const [authorizationResult, setAuthorizationResult] = useState<{
    key: string
    status: 'allowed' | 'expired' | 'forbidden' | 'error'
  } | null>(null)
  const authorization =
    authorizationResult?.key === authorizationKey
      ? authorizationResult.status
      : 'checking'

  useEffect(() => {
    if (
      status !== 'ready' ||
      !user ||
      !user.roles.includes(role)
    ) {
      return
    }

    let active = true

    authorizePortal(role)
      .then(() => {
        if (active) {
          setAuthorizationResult({
            key: authorizationKey,
            status: 'allowed',
          })
        }
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof AuthApiError && error.status === 401) {
          setAuthorizationResult({
            key: authorizationKey,
            status: 'expired',
          })
          return
        }
        if (error instanceof AuthApiError && error.status === 403) {
          setAuthorizationResult({
            key: authorizationKey,
            status: 'forbidden',
          })
          return
        }
        setAuthorizationResult({
          key: authorizationKey,
          status: 'error',
        })
      })

    return () => {
      active = false
    }
  }, [authorizationKey, role, status, user])

  if (status === 'loading') {
    return <span role="status" className="sr-only">Checking your session.</span>
  }

  if (status === 'error') {
    return (
      <main className="min-h-svh bg-secondary/70 p-4 sm:p-8">
        <ErrorState
          title="Session could not be checked"
          description="The authentication service could not be reached."
          retryLabel="Try again"
          onRetry={retrySession}
          className="mx-auto mt-24 max-w-xl"
        />
      </main>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={`/${role}/login`}
        replace
        state={{ from: location.pathname, reason: 'session-required' }}
      />
    )
  }

  if (!user.roles.includes(role)) {
    return <Navigate to="/forbidden" replace />
  }

  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace state={{ role }} />
  }

  if (authorization === 'expired') {
    return <Navigate to="/session-expired" replace />
  }

  if (authorization === 'forbidden') {
    return <Navigate to="/forbidden" replace />
  }

  if (authorization === 'error') {
    return (
      <main className="min-h-svh bg-secondary/70 p-4 sm:p-8">
        <ErrorState
          title="Access could not be verified"
          description="The authorization service could not be reached."
          retryLabel="Try again"
          onRetry={() => {
            setAuthorizationAttempt((attempt) => attempt + 1)
          }}
          className="mx-auto mt-24 max-w-xl"
        />
      </main>
    )
  }

  if (authorization === 'checking') {
    return <span role="status" className="sr-only">Verifying your access.</span>
  }

  return children
}

export { ProtectedRoute }
