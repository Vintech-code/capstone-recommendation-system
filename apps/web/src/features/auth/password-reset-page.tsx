import { useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/features/auth/auth-api'
import { AuthRecoveryFrame } from '@/features/auth/password-recovery-page'

function PasswordResetPage() {
  const [params] = useSearchParams()
  const route = useParams()
  const token = route.token ?? params.get('token') ?? ''
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!token) { setError('This reset link is incomplete. Request a new link.'); return }
    if (password !== confirmation) { setError('Passwords must match.'); return }
    setSubmitting(true); setError('')
    try { const response = await resetPassword({ token, email, password, passwordConfirmation: confirmation }); setMessage(response.message) }
    catch { setError('This reset link is invalid or has expired. Request a new link.') }
    finally { setSubmitting(false) }
  }

  return <AuthRecoveryFrame title="Choose a new password" description="Use at least eight characters and keep your account password private.">
    {message ? <><p role="status" className="rounded-xl bg-success/10 p-4 text-sm font-semibold text-success">{message}</p><Link to="/student/login" className="mt-6 block text-center text-sm font-bold text-primary hover:underline">Continue to sign in</Link></> : <form onSubmit={submit} className="space-y-5">
      {error ? <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</p> : null}
      <div className="space-y-2"><Label htmlFor="reset-email">Email address</Label><Input id="reset-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12" /></div>
      <div className="space-y-2"><Label htmlFor="reset-password">New password</Label><Input id="reset-password" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12" /></div>
      <div className="space-y-2"><Label htmlFor="reset-confirmation">Confirm new password</Label><Input id="reset-confirmation" type="password" minLength={8} required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="h-12" /></div>
      <Button type="submit" disabled={submitting} className="min-h-12 w-full">{submitting ? 'Resetting password…' : 'Reset password'}</Button>
    </form>}
  </AuthRecoveryFrame>
}

export { PasswordResetPage }
