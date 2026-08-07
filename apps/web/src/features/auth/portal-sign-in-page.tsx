import { ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { ThemeToggle } from '@/components/shared'
import type { AccessRole } from '@/features/auth/access-types'
import { roleOptions } from '@/features/auth/access-types'
import { useAuth } from '@/features/auth/auth-context'
import { SignInForm } from '@/features/auth/components/sign-in-form'

interface PortalSignInPageProps {
  role: AccessRole
}

function PortalSignInPage({ role }: PortalSignInPageProps) {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const portal = roleOptions.find((option) => option.value === role)!

  return (
    <main className="relative grid min-h-svh bg-background lg:grid-cols-[.88fr_1.12fr]">
      <ThemeToggle className="absolute right-4 top-4 z-20 bg-background/80 shadow-sm backdrop-blur sm:right-6 sm:top-6" />
      <section className="relative hidden overflow-hidden bg-brand-dark p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div className="absolute -left-32 -top-32 size-120 rounded-full border border-white/8" />
        <div className="absolute -left-16 -top-16 size-88 rounded-full border border-white/8" />
        <div className="absolute -bottom-36 -right-24 size-112 rounded-full bg-primary/60 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white">
            <span className="size-3.5 rotate-45 rounded-[0.2rem] bg-primary" />
          </span>
          <div>
            <p className="font-bold">TCC Guidance</p>
            <p className="text-[10px] uppercase tracking-[0.17em] text-white/45">
              Course Recommendation System
            </p>
          </div>
        </div>

        <div className="relative my-auto max-w-lg py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-soft">
            {portal.shortLabel} portal
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.06em] xl:text-6xl">
            Welcome back.
            <span className="block text-brand-soft">
              Continue your work.
            </span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-white/60">
            {portal.description}
          </p>
        </div>

        <p className="relative text-xs text-white/40">
          Tagoloan Community College Course Recommendation System
        </p>
      </section>

      <section
        aria-labelledby="sign-in-title"
        className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12"
      >
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-dark">
              <span className="size-3.5 rotate-45 rounded-[0.2rem] bg-brand-soft" />
            </span>
            <div>
              <p className="font-bold">TCC Guidance</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {portal.shortLabel} portal
              </p>
            </div>
          </div>

          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {portal.label}
          </p>
          <h2
            id="sign-in-title"
            className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-4xl"
          >
            Sign in to your account
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Enter your credentials to continue.
          </p>

          <div className="mt-8">
            <SignInForm
              onSignIn={async (credentials) => {
                await signIn({ ...credentials, portal: role })
                navigate(`/${role}`, { replace: true })
              }}
            />
          </div>
          <p className="mt-5 text-center text-sm"><Link to={`/forgot-password?portal=${role}`} className="font-bold text-primary underline-offset-4 hover:underline">Forgot password?</Link></p>
          {role === 'student' ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              New student?{' '}
              <Link
                to="/student/register"
                className="font-extrabold text-primary underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export { PortalSignInPage }
