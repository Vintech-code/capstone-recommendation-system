import { Link, useNavigate } from 'react-router'

import type { AccessRole } from '@/features/auth/access-types'
import { useAuth } from '@/features/auth/auth-context'
import { AuthSplitLayout } from '@/features/auth/components/auth-split-layout'
import { SignInForm } from '@/features/auth/components/sign-in-form'

interface PortalSignInPageProps {
  role: AccessRole
}

function GmailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path fill="#4285F4" d="M4 7.6 7 9.85V19H4V7.6Z" />
      <path fill="#34A853" d="M20 7.6 17 9.85V19h3V7.6Z" />
      <path fill="#FBBC04" d="m4 7.6 3 2.25V7.4L4 5.15V7.6Z" />
      <path fill="#EA4335" d="M20 7.6 12 13.6 4 7.6V6.25c0-1.22 1.4-1.91 2.38-1.18L12 9.3l5.62-4.23C18.6 4.34 20 5.03 20 6.25V7.6Z" />
    </svg>
  )
}

function PortalSignInPage({ role }: PortalSignInPageProps) {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  return (
    <AuthSplitLayout>
      <div className="text-center">
        <h1
          id="sign-in-title"
          className="text-3xl font-bold tracking-[-0.045em] sm:text-4xl"
        >
          Welcome back!
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Sign in to continue your learning journey.
        </p>
      </div>

      <div className="mt-9">
        <SignInForm
          onSignIn={async (credentials) => {
            await signIn({ ...credentials, portal: role })
            navigate(`/${role}`, { replace: true })
          }}
        />
      </div>

      <p className="mt-4 text-right text-sm">
        <Link
          to={`/forgot-password?portal=${role}`}
          className="font-bold text-primary underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </p>

      <div className="my-7 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">Or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        disabled
        className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-input bg-background px-4 text-sm font-semibold text-muted-foreground opacity-70 shadow-sm"
      >
        <GmailIcon />
        Continue with Gmail
      </button>

      {role === 'student' ? (
        <p className="mt-7 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            to="/student/register"
            className="font-extrabold text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      ) : null}
    </AuthSplitLayout>
  )
}

export { PortalSignInPage }
