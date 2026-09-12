import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  AuthApiError,
  currentUser,
  restoreSession,
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
import { clearStudentResourceCache } from '@/features/student/student-resource-cache'

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
  const sessionRequest = useRef<ReturnType<typeof restoreSession> | null>(null)

  useEffect(() => {
    if (initialUser !== undefined) return

    let active = true

    const restoration = sessionRequest.current ?? restoreSession()
    sessionRequest.current = restoration

    restoration
      .then(({ user: restoredUser }) => {
        if (!active) return
        setUser(restoredUser)
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
      clearStudentResourceCache()
      setUser(null)
      setStatus('ready')
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const response = await currentUser()
    setUser(response.user)
    setStatus('ready')
    return response.user
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signIn,
      signOut,
      refreshUser,
      retrySession: () => {
        sessionRequest.current = null
        setStatus('loading')
        setSessionAttempt((attempt) => attempt + 1)
      },
    }),
    [refreshUser, signIn, signOut, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
export type { AuthUser }
