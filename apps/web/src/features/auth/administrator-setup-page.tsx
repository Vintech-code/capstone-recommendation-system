import { CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  acceptAdministratorInvitation,
  getAdministratorInvitation,
  type AdministratorInvitationPreview,
} from '@/features/auth/auth-api'
import { PASSWORD_MIN_LENGTH, PASSWORD_POLICY_MESSAGE, passwordMeetsPolicy } from '@/features/auth/password-policy'
import { AuthRecoveryFrame } from '@/features/auth/password-recovery-page'

function AdministratorSetupPage() {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '')
  const [invitation, setInvitation] = useState<AdministratorInvitationPreview | null>(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState(token ? '' : 'This setup link is incomplete. Ask an authorized Administrator for a new invitation.')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!token) {
      return
    }
    void getAdministratorInvitation(token)
      .then((response) => {
        setInvitation(response.data)
        window.history.replaceState(window.history.state, '', '/admin/setup')
      })
      .catch(() => setError('This setup link is invalid or has expired. Ask an authorized Administrator for a new invitation.'))
      .finally(() => setLoading(false))
  }, [token])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!passwordMeetsPolicy(password)) {
      setError(PASSWORD_POLICY_MESSAGE)
      return
    }
    if (password !== confirmation) {
      setError('The password confirmation does not match.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await acceptAdministratorInvitation({ token, password, passwordConfirmation: confirmation })
      setAccepted(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The Administrator account could not be activated.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthRecoveryFrame
      title="Set up your Administrator account"
      description="Create your private password to accept this individual account invitation."
    >
      {loading ? (
        <div role="status" className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" /> Validating secure invitation…
        </div>
      ) : accepted ? (
        <div className="space-y-5">
          <div role="status" className="flex gap-3 rounded-xl bg-success/10 p-4 text-sm font-semibold text-success-ink">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            Your Administrator account is active. Sign in through the dedicated Administrator portal.
          </div>
          <Button asChild className="min-h-12 w-full"><Link to="/admin/login">Continue to Administrator sign in</Link></Button>
        </div>
      ) : invitation ? (
        <form onSubmit={submit} className="space-y-5">
          <div className="border-y border-border py-4 text-sm">
            <p className="font-semibold text-foreground">{invitation.name}</p>
            <p className="mt-1 text-muted-foreground">{invitation.maskedEmail}</p>
            <p className="mt-2 text-xs text-muted-foreground">Link expires {new Date(invitation.expiresAt).toLocaleString()}.</p>
          </div>
          {error ? <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive-ink">{error}</p> : null}
          <div className="space-y-2">
            <Label htmlFor="admin-setup-password">Password</Label>
            <Input id="admin-setup-password" type="password" minLength={PASSWORD_MIN_LENGTH} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <p className="text-xs text-muted-foreground">{PASSWORD_POLICY_MESSAGE}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-setup-confirmation">Confirm password</Label>
            <Input id="admin-setup-confirmation" type="password" minLength={PASSWORD_MIN_LENGTH} required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
          </div>
          <Button type="submit" disabled={submitting} className="min-h-12 w-full">
            {submitting ? 'Activating account…' : 'Activate Administrator account'}
          </Button>
        </form>
      ) : (
        <div className="space-y-5">
          <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive-ink">{error}</p>
          <Button asChild variant="outline" className="min-h-12 w-full"><Link to="/admin/login">Return to Administrator sign in</Link></Button>
        </div>
      )}
    </AuthRecoveryFrame>
  )
}

export { AdministratorSetupPage }
