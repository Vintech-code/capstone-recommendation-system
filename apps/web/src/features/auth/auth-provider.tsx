import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  AuthApiError,
  currentUser,
  signIn as requestSignIn,
  signOut as requestSignOut,
  type AuthUser,
  type SignInCredentials,
} from '@/features/auth/auth-api'
import {
  AuthContext,
  type AuthContextValue,
  type SessionStatus,
} from '@/features/auth/auth-context'

interface AuthProviderProps {
  children: ReactNode
  initialUser?: AuthUser | null
}

function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null)
  const [status, setStatus] = useState<SessionStatus>(
    initialUser === undefined ? 'loading' : 'ready',
  )
  const [sessionAttempt, setSessionAttempt] = useState(0)

  useEffect(() => {
    if (initialUser !== undefined) return

    let active = true

    currentUser()
      .then(({ user: authenticatedUser }) => {
        if (!active) return
        setUser(authenticatedUser)
        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof AuthApiError && error.status === 401) {
          setUser(null)
          setStatus('ready')
          return
        }
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [initialUser, sessionAttempt])

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    const response = await requestSignIn(credentials)
    setUser(response.user)
    setStatus('ready')
    return response.user
  }, [])

  const signOut = useCallback(async () => {
    try {
      await requestSignOut()
    } finally {
      setUser(null)
      setStatus('ready')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signIn,
      signOut,
      retrySession: () => {
        setStatus('loading')
        setSessionAttempt((attempt) => attempt + 1)
      },
    }),
    [signIn, signOut, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
export type { AuthUser }
