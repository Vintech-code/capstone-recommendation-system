import { KeyRound, Mail } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'

import { ThemeToggle } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from '@/features/auth/auth-api'

function PasswordRecoveryPage() {
  const [searchParams] = useSearchParams()
  const portal = searchParams.get('portal') ?? 'student'
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true); setError('')
    try {
      const response = await requestPasswordReset(email)
      setMessage(response.message)
    } catch {
      setError('The reset request could not be completed. Please try again.')
    } finally { setSubmitting(false) }
  }

  return <AuthRecoveryFrame title="Reset your password" description="Enter your account email. The response is the same whether or not an account exists.">
    {message ? <p role="status" className="rounded-xl bg-success/10 p-4 text-sm font-semibold text-success">{message}</p> : (
      <form onSubmit={submit} className="space-y-5">
        {error ? <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</p> : null}
        <div className="space-y-2"><Label htmlFor="recovery-email">Email address</Label><div className="relative"><Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="recovery-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 pl-10" /></div></div>
        <Button type="submit" disabled={submitting} className="min-h-12 w-full">{submitting ? 'Sending reset link…' : 'Send reset link'}</Button>
      </form>
    )}
    <Link to={`/${portal}/login`} className="mt-6 block text-center text-sm font-bold text-primary hover:underline">Return to sign in</Link>
  </AuthRecoveryFrame>
}

function AuthRecoveryFrame({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <main className="relative flex min-h-svh items-center justify-center bg-secondary/70 px-4 py-10"><ThemeToggle className="absolute right-4 top-4 bg-background shadow-sm" /><section className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-sm sm:p-9"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary"><KeyRound className="size-5" aria-hidden="true" /></span><h1 className="mt-6 text-3xl font-bold">{title}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p><div className="mt-8">{children}</div></section></main>
}

export { AuthRecoveryFrame, PasswordRecoveryPage }
