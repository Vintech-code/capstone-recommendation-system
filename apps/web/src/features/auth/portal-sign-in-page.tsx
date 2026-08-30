import { Link, useNavigate, useSearchParams } from 'react-router'

import type { AccessRole } from '@/features/auth/access-types'
import { useAuth } from '@/features/auth/auth-context'
import { AuthSplitLayout } from '@/features/auth/components/auth-split-layout'
import { SignInForm } from '@/features/auth/components/sign-in-form'

interface PortalSignInPageProps {
  role: AccessRole
}

const googleErrorMessages: Record<string, string> = {
  account_conflict:
    'This Student account is already connected to another Google account.',
  account_inactive:
    'This account is not active. Contact an authorized administrator.',
  email_unverified:
    'Google could not confirm a verified email address for this account.',
  not_configured:
    'Google sign-in is temporarily unavailable. Please use email and password.',
  oauth_failed:
    'Google sign-in could not be completed. Please try again.',
  portal_forbidden:
    'This Google account cannot access the Student portal.',
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
  const [searchParams] = useSearchParams()
  const { signIn } = useAuth()
  const googleError = searchParams.get('google_error')
  const googleAuthOrigin = (import.meta.env.VITE_API_ORIGIN ?? '').replace(/\/$/, '')

  function continueWithGoogle() {
    window.location.assign(`${googleAuthOrigin}/auth/google/redirect`)
  }

  return (
    <AuthSplitLayout>
      <div className="text-center">
        <h1
          id="sign-in-title"
          className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl"
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

      {role === 'student' ? (
        <>
          {googleError ? (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              {googleErrorMessages[googleError] ?? googleErrorMessages.oauth_failed}
            </p>
          ) : null}

          <div className="my-7 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">Or continue with</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={continueWithGoogle}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-input bg-background px-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
          >
            <GmailIcon />
            Continue with Google
          </button>
        </>
      ) : null}

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
