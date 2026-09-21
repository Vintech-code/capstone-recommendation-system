import { useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/features/auth/auth-api'
import { PASSWORD_MIN_LENGTH, PASSWORD_POLICY_MESSAGE, passwordMeetsPolicy } from '@/features/auth/password-policy'
import { AuthRecoveryFrame } from '@/features/auth/components/auth-recovery-frame'

function PasswordResetPage() {
  const [params] = useSearchParams()
  const route = useParams()
  const token = route.token ?? params.get('token') ?? ''
  const portal = params.get('portal') === 'admin' ? 'admin' : 'student'
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!token) { setError('This reset link is incomplete. Request a new link.'); return }
    if (!passwordMeetsPolicy(password)) { setError(PASSWORD_POLICY_MESSAGE); return }
    if (password !== confirmation) { setError('Passwords must match.'); return }
    setSubmitting(true); setError('')
    try { const response = await resetPassword({ token, email, password, passwordConfirmation: confirmation }); setMessage(response.message) }
    catch { setError('This reset link is invalid or has expired. Request a new link.') }
    finally { setSubmitting(false) }
  }

  return <AuthRecoveryFrame title="Choose a new password" description={PASSWORD_POLICY_MESSAGE}>
    {message ? <><p role="status" className="rounded-xl bg-success/10 p-4 text-sm font-semibold text-success-ink">{message}</p><Link to={`/${portal}/login`} className="mt-6 block text-center text-sm font-bold text-primary-ink hover:underline">Continue to {portal === 'admin' ? 'Administrator' : 'Student'} sign in</Link></> : <form onSubmit={submit} className="space-y-5">
      {error ? <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive-ink">{error}</p> : null}
      <div className="space-y-2"><Label htmlFor="reset-email">Email address</Label><Input id="reset-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12" /></div>
      <div className="space-y-2"><Label htmlFor="reset-password">New password</Label><Input id="reset-password" type="password" minLength={PASSWORD_MIN_LENGTH} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12" /></div>
      <div className="space-y-2"><Label htmlFor="reset-confirmation">Confirm new password</Label><Input id="reset-confirmation" type="password" minLength={PASSWORD_MIN_LENGTH} required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="h-12" /></div>
      <Button type="submit" disabled={submitting} className="min-h-12 w-full">{submitting ? 'Resetting password…' : 'Reset password'}</Button>
    </form>}
  </AuthRecoveryFrame>
}

export { PasswordResetPage }
