import { createContext, useContext } from 'react'

import type {
  AuthUser,
  SignInCredentials,
} from '@/features/auth/auth-api'

type SessionStatus = 'loading' | 'ready' | 'error'

interface AuthContextValue {
  user: AuthUser | null
  status: SessionStatus
  signIn: (credentials: SignInCredentials) => Promise<AuthUser>
  signOut: () => Promise<void>
  refreshUser: () => Promise<AuthUser>
  retrySession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}

export { AuthContext, useAuth }
export type { AuthContextValue, SessionStatus }
