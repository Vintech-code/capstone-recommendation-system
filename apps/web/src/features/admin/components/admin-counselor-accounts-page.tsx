import { Copy, KeyRound, Plus, ShieldCheck, UserRoundCheck, UserRoundX } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AdminPageError, AdminPageHeader, AdminPageSkeleton, EmptyPanel } from '@/features/admin/components/admin-shared'
import { mutateAdmin, useAdminResource, type AdminStaff } from '@/features/admin/data/admin-api'

function AdminCounselorAccountsPage() {
  const resource = useAdminResource<AdminStaff[]>('/counselors')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [busyId, setBusyId] = useState<number | 'create' | null>(null)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'Counselor accounts are unavailable.'} onRetry={resource.retry} />

  async function createAccount() {
    if (!name.trim() || !email.trim()) return setError('Enter the counselor name and email address.')
    setBusyId('create'); setError(null); setMessage(null); setTemporaryPassword(null)
    try {
      const account = await mutateAdmin<AdminStaff>('/counselors', 'POST', { name: name.trim(), email: email.trim() })
      setTemporaryPassword(account.temporaryPassword ?? null)
      setMessage('Counselor account created. Copy the one-time password now; it will not be shown again.')
      setName(''); setEmail(''); resource.retry()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The counselor account could not be created.') }
    finally { setBusyId(null) }
  }

  async function changeStatus(account: AdminStaff) {
    const next = account.accountStatus === 'active' ? 'suspended' : 'active'
    setBusyId(account.id); setError(null); setMessage(null)
    try {
      await mutateAdmin(`/counselors/${account.id}`, 'PUT', { name: account.name, email: account.email, accountStatus: next })
      setMessage(`${account.name} is now ${next}.`); resource.retry()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The account status could not be changed.') }
    finally { setBusyId(null) }
  }

  async function resetPassword(account: AdminStaff) {
    setBusyId(account.id); setError(null); setMessage(null); setTemporaryPassword(null)
    try {
      const updated = await mutateAdmin<AdminStaff>(`/counselors/${account.id}/reset-password`, 'POST')
      setTemporaryPassword(updated.temporaryPassword ?? null)
      setMessage(`A new one-time password was generated for ${account.name}.`); resource.retry()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The password could not be reset.') }
    finally { setBusyId(null) }
  }

  return <div className="space-y-6">
    <AdminPageHeader eyebrow="Access governance" title="Counselor accounts" description="Provision individual counselor access and monitor account state. Passwords are hashed and temporary credentials are displayed once only." />
    <section className="grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <form className="bg-card p-6 shadow-sm" onSubmit={(event) => { event.preventDefault(); void createAccount() }}>
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary-fixed text-on-primary-fixed"><Plus aria-hidden="true" /></div>
        <h2 className="mt-4 font-display text-xl font-semibold">Add counselor</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">The counselor must replace the generated password after signing in.</p>
        <div className="mt-5 space-y-4"><div><Label htmlFor="counselor-name">Full name</Label><Input id="counselor-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2" /></div><div><Label htmlFor="counselor-email">Email address</Label><Input id="counselor-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2" /></div></div>
        <Button type="submit" className="mt-5 w-full" disabled={busyId === 'create'}><UserRoundCheck aria-hidden="true" />Create counselor account</Button>
      </form>
      <section className="bg-card p-6 shadow-sm" aria-labelledby="counselor-directory-heading"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Authorized staff</p><h2 id="counselor-directory-heading" className="mt-1 font-display text-xl font-semibold">Counselor directory</h2></div><Badge variant="secondary">{resource.data.length} accounts</Badge></div>
        {resource.data.length ? <ul className="mt-5 divide-y">{resource.data.map((account) => <li key={account.id} className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><strong>{account.name}</strong><Badge variant={account.accountStatus === 'active' ? 'success' : 'warning'}>{account.accountStatus}</Badge>{account.mustChangePassword ? <Badge variant="outline">Password change required</Badge> : null}</div><p className="mt-1 text-sm text-muted-foreground">{account.email}</p><p className="mt-2 text-xs text-muted-foreground">{account.activeCaseCount} active cases · {account.followUpCount} follow-ups · {account.overdueCount} overdue</p></div><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={busyId === account.id} onClick={() => void resetPassword(account)}><KeyRound aria-hidden="true" />Reset password</Button><Button type="button" size="sm" variant="outline" disabled={busyId === account.id} onClick={() => void changeStatus(account)}>{account.accountStatus === 'active' ? <UserRoundX aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}{account.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}</Button></div></li>)}</ul> : <div className="mt-5"><EmptyPanel title="No counselor accounts" description="Create the first individual counselor account using the form." /></div>}
      </section>
    </section>
    {temporaryPassword ? <section className="bg-primary p-5 text-primary-foreground shadow-sm" role="status"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">One-time temporary password</p><div className="mt-2 flex flex-wrap items-center gap-3"><code className="rounded-lg bg-white/10 px-4 py-3 text-lg font-bold tracking-wide">{temporaryPassword}</code><Button type="button" variant="secondary" onClick={() => void navigator.clipboard.writeText(temporaryPassword)}><Copy aria-hidden="true" />Copy</Button></div><p className="mt-3 text-sm text-primary-foreground/75">Store it through an approved secure channel. It cannot be retrieved after this page changes.</p></section> : null}
    {message ? <p className="text-sm font-semibold text-success" role="status">{message}</p> : null}{error ? <p className="text-sm font-semibold text-destructive" role="alert">{error}</p> : null}
  </div>
}

export { AdminCounselorAccountsPage }
