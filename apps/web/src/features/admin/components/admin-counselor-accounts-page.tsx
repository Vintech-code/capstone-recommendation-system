import { KeyRound, Plus, ShieldCheck, UserRoundCheck, UserRoundX } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminPageError, AdminPageHeader, AdminPageSkeleton, EmptyPanel } from '@/features/admin/components/admin-shared'
import { mutateAdmin, useAdminResource, type AdminStaff } from '@/features/admin/data/admin-api'

const passwordHelp = 'Use at least 12 characters with uppercase and lowercase letters, a number, and a symbol.'

function AdminCounselorAccountsPage() {
  const resource = useAdminResource<AdminStaff[]>('/counselors')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [resetAccount, setResetAccount] = useState<AdminStaff | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetPasswordConfirmation, setResetPasswordConfirmation] = useState('')
  const [busyId, setBusyId] = useState<number | 'create' | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'Counselor accounts are unavailable.'} onRetry={resource.retry} />

  function closeResetDialog() {
    setResetAccount(null)
    setResetPassword('')
    setResetPasswordConfirmation('')
  }

  async function createAccount() {
    if (!name.trim() || !email.trim()) return setError('Enter the counselor name and email address.')
    if (!password) return setError('Enter an initial temporary password.')
    if (password !== passwordConfirmation) return setError('The initial password confirmation does not match.')

    setBusyId('create')
    setError(null)
    setMessage(null)
    try {
      await mutateAdmin<AdminStaff>('/counselors', 'POST', {
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      })
      setMessage('Counselor account created. The counselor must change the Administrator-set temporary password at first sign-in.')
      setName('')
      setEmail('')
      setPassword('')
      setPasswordConfirmation('')
      resource.retry()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The counselor account could not be created.')
    } finally {
      setBusyId(null)
    }
  }

  async function changeStatus(account: AdminStaff) {
    const next = account.accountStatus === 'active' ? 'suspended' : 'active'
    setBusyId(account.id)
    setError(null)
    setMessage(null)
    try {
      await mutateAdmin(`/counselors/${account.id}`, 'PUT', { name: account.name, email: account.email, accountStatus: next })
      setMessage(`${account.name} is now ${next}.`)
      resource.retry()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The account status could not be changed.')
    } finally {
      setBusyId(null)
    }
  }

  async function submitPasswordReset() {
    if (!resetAccount) return
    if (!resetPassword) return setError('Enter a new temporary password.')
    if (resetPassword !== resetPasswordConfirmation) return setError('The new password confirmation does not match.')

    setBusyId(resetAccount.id)
    setError(null)
    setMessage(null)
    try {
      await mutateAdmin(`/counselors/${resetAccount.id}/reset-password`, 'POST', {
        password: resetPassword,
        password_confirmation: resetPasswordConfirmation,
      })
      setMessage(`Temporary password set for ${resetAccount.name}. The counselor must change it at first sign-in.`)
      closeResetDialog()
      resource.retry()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The password could not be reset.')
    } finally {
      setBusyId(null)
    }
  }

  return <div className="space-y-6">
    <AdminPageHeader eyebrow="Access governance" title="Counselor accounts" description="Provision individual counselor access and monitor account state. Administrators set temporary passwords, which are stored only as secure hashes and must be changed at first sign-in." />
    <section className="grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <form className="bg-card p-6 shadow-sm" onSubmit={(event) => { event.preventDefault(); void createAccount() }}>
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary-fixed text-on-primary-fixed"><Plus aria-hidden="true" /></div>
        <h2 className="mt-4 font-display text-xl font-semibold">Add counselor</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Set the initial temporary password. The counselor must replace it after signing in.</p>
        <div className="mt-5 space-y-4">
          <div><Label htmlFor="counselor-name">Full name</Label><Input id="counselor-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2" autoComplete="name" /></div>
          <div><Label htmlFor="counselor-email">Email address</Label><Input id="counselor-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2" autoComplete="email" /></div>
          <div><Label htmlFor="counselor-password">Initial temporary password</Label><Input id="counselor-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2" minLength={12} autoComplete="new-password" aria-describedby="counselor-password-help" /></div>
          <div><Label htmlFor="counselor-password-confirmation">Confirm initial temporary password</Label><Input id="counselor-password-confirmation" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} className="mt-2" minLength={12} autoComplete="new-password" /></div>
        </div>
        <p id="counselor-password-help" className="mt-3 text-xs leading-5 text-muted-foreground">{passwordHelp}</p>
        <Button type="submit" className="mt-5 w-full" disabled={busyId === 'create'}><UserRoundCheck aria-hidden="true" />Create counselor account</Button>
      </form>
      <section className="bg-card p-6 shadow-sm" aria-labelledby="counselor-directory-heading">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Authorized staff</p><h2 id="counselor-directory-heading" className="mt-1 font-display text-xl font-semibold">Counselor directory</h2></div><Badge variant="secondary">{resource.data.length} accounts</Badge></div>
        {resource.data.length ? <ul className="mt-5 divide-y">{resource.data.map((account) => <li key={account.id} className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><strong>{account.name}</strong><Badge variant={account.accountStatus === 'active' ? 'success' : 'warning'}>{account.accountStatus}</Badge>{account.mustChangePassword ? <Badge variant="outline">Password change required</Badge> : null}</div><p className="mt-1 text-sm text-muted-foreground">{account.email}</p><p className="mt-2 text-xs text-muted-foreground">{account.activeCaseCount} active cases · {account.followUpCount} follow-ups · {account.overdueCount} overdue</p></div><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={busyId === account.id} onClick={() => { setResetAccount(account); setError(null); setMessage(null) }}><KeyRound aria-hidden="true" />Reset password</Button><Button type="button" size="sm" variant="outline" disabled={busyId === account.id} onClick={() => void changeStatus(account)}>{account.accountStatus === 'active' ? <UserRoundX aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}{account.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}</Button></div></li>)}</ul> : <div className="mt-5"><EmptyPanel title="No counselor accounts" description="Create the first individual counselor account using the form." /></div>}
      </section>
    </section>
    {message ? <p className="text-sm font-semibold text-success" role="status">{message}</p> : null}
    {error ? <p className="text-sm font-semibold text-destructive" role="alert">{error}</p> : null}

    <Dialog open={Boolean(resetAccount)} onOpenChange={(open) => { if (!open && busyId === null) closeResetDialog() }}>
      <DialogContent aria-describedby="reset-password-description">
        <form className="p-6" onSubmit={(event) => { event.preventDefault(); void submitPasswordReset() }}>
          <DialogHeader>
            <DialogTitle>Set a new temporary password</DialogTitle>
            <DialogDescription id="reset-password-description">Set the temporary password for {resetAccount?.name}. Existing sessions will be revoked, and the counselor must change this password at the next sign-in.</DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div><Label htmlFor="reset-counselor-password">New temporary password</Label><Input id="reset-counselor-password" type="password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} className="mt-2" minLength={12} autoComplete="new-password" aria-describedby="reset-password-help" /></div>
            <div><Label htmlFor="reset-counselor-password-confirmation">Confirm new temporary password</Label><Input id="reset-counselor-password-confirmation" type="password" value={resetPasswordConfirmation} onChange={(event) => setResetPasswordConfirmation(event.target.value)} className="mt-2" minLength={12} autoComplete="new-password" /></div>
          </div>
          <p id="reset-password-help" className="mt-3 text-xs leading-5 text-muted-foreground">{passwordHelp}</p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" disabled={busyId !== null} onClick={closeResetDialog}>Cancel</Button>
            <Button type="submit" disabled={busyId !== null}><KeyRound aria-hidden="true" />Set temporary password</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
}

export { AdminCounselorAccountsPage }
