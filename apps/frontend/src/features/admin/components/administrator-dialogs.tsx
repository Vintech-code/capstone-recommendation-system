import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  mutateAdmin,
  type AdministratorInvitation,
  type ManagedAdministrator,
} from '@/features/admin/data/admin-api'

export type AccountAction =
  | { kind: 'resend'; invitation: AdministratorInvitation }
  | { kind: 'revoke-invitation'; invitation: AdministratorInvitation }
  | { kind: 'status'; administrator: ManagedAdministrator }
  | { kind: 'permission'; administrator: ManagedAdministrator }
  | { kind: 'sessions'; administrator: ManagedAdministrator }

interface InviteAdministratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited: () => void
}

export function InviteAdministratorDialog({
  open,
  onOpenChange,
  onInvited,
}: InviteAdministratorDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [canManageAdministrators, setCanManageAdministrators] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setName('')
    setEmail('')
    setCanManageAdministrators(false)
    setCurrentPassword('')
    setError(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await mutateAdmin('/administrators/invitations', 'POST', {
        name,
        email,
        canManageAdministrators,
        currentPassword,
      })
      toast.success(`Invitation sent to ${email}`)
      reset()
      onOpenChange(false)
      onInvited()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The invitation could not be sent.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-lg rounded-2xl p-6 shadow-lg border border-border/80">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Invite administrator</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Invitations expire in 48 hours. The recipient completes their own account setup and sets their password securely.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {error ? (
            <p role="alert" className="rounded-lg border-l-2 border-destructive bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive-ink">
              {error}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="invite-admin-name" className="text-xs font-bold">
              Name
            </Label>
            <Input
              id="invite-admin-name"
              required
              placeholder="e.g. Maria Santos"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-admin-email" className="text-xs font-bold">
              Email address
            </Label>
            <Input
              id="invite-admin-email"
              type="email"
              required
              placeholder="admin@tcc.edu.ph"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface/40 p-3.5 cursor-pointer hover:bg-muted/40 transition-colors">
            <input
              type="checkbox"
              checked={canManageAdministrators}
              onChange={(event) => setCanManageAdministrators(event.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            <div className="text-xs">
              <span className="font-bold text-foreground">Grant administrator-management authority</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Allows this administrator to invite others and adjust account permissions.
              </p>
            </div>
          </label>

          <div className="space-y-1.5">
            <Label htmlFor="invite-admin-current-password" className="text-xs font-bold">
              Confirm with your password
            </Label>
            <Input
              id="invite-admin-current-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Your administrator password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-6 font-bold text-foreground hover:bg-[#70c21d]"
            >
              {submitting ? 'Sending invitation…' : 'Send invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface AdministratorActionDialogProps {
  action: AccountAction
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function AdministratorActionDialog({
  action: selectedAction,
  onOpenChange,
  onSaved,
}: AdministratorActionDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title =
    selectedAction.kind === 'resend'
      ? 'Resend invitation'
      : selectedAction.kind === 'revoke-invitation'
        ? 'Revoke invitation'
        : selectedAction.kind === 'sessions'
          ? 'Revoke active sessions'
          : selectedAction.kind === 'status'
            ? selectedAction.administrator.accountStatus === 'active'
              ? 'Suspend administrator'
              : 'Reactivate administrator'
            : selectedAction.administrator.canManageAdministrators
              ? 'Revoke administrator management'
              : 'Grant administrator management'

  const reasonRequired = selectedAction.kind === 'status' || selectedAction.kind === 'permission'

  function changeOpen(next: boolean) {
    if (!next) {
      setCurrentPassword('')
      setReason('')
      setError(null)
    }
    onOpenChange(next)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (selectedAction.kind === 'resend') {
        await mutateAdmin(`/administrators/invitations/${selectedAction.invitation.id}/resend`, 'POST', {
          currentPassword,
        })
      } else if (selectedAction.kind === 'revoke-invitation') {
        await mutateAdmin(`/administrators/invitations/${selectedAction.invitation.id}`, 'DELETE', {
          currentPassword,
          reason,
        })
      } else if (selectedAction.kind === 'sessions') {
        await mutateAdmin(`/administrators/${selectedAction.administrator.id}/sessions/revoke`, 'POST', {
          currentPassword,
          reason,
        })
      } else if (selectedAction.kind === 'status') {
        await mutateAdmin(`/administrators/${selectedAction.administrator.id}/status`, 'PUT', {
          currentPassword,
          reason,
          status: selectedAction.administrator.accountStatus === 'active' ? 'suspended' : 'active',
        })
      } else {
        await mutateAdmin(`/administrators/${selectedAction.administrator.id}/permission`, 'PUT', {
          currentPassword,
          reason,
          canManageAdministrators: !selectedAction.administrator.canManageAdministrators,
        })
      }
      toast.success(`${title} completed.`)
      changeOpen(false)
      onSaved()
    } catch (reasonValue) {
      setError(reasonValue instanceof Error ? reasonValue.message : 'The account change could not be completed.')
    } finally {
      setSaving(false)
    }
  }

  const subject = 'invitation' in selectedAction ? selectedAction.invitation : selectedAction.administrator
  const isDestructive =
    selectedAction.kind === 'revoke-invitation' ||
    (selectedAction.kind === 'status' && selectedAction.administrator.accountStatus === 'active')

  return (
    <Dialog open onOpenChange={changeOpen}>
      <DialogContent className="max-w-lg rounded-2xl p-6 shadow-lg border border-border/80">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            This sensitive action affects <strong>{subject.name}</strong> ({subject.email}) and will be recorded in the audit history.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {error ? (
            <p role="alert" className="rounded-lg border-l-2 border-destructive bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive-ink">
              {error}
            </p>
          ) : null}

          {selectedAction.kind !== 'resend' ? (
            <div className="space-y-1.5">
              <Label htmlFor="administrator-action-reason" className="text-xs font-bold">
                Reason{reasonRequired ? '' : ' (optional)'}
              </Label>
              <Textarea
                id="administrator-action-reason"
                required={reasonRequired}
                placeholder="Audit note explaining this action"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="administrator-action-password" className="text-xs font-bold">
              Confirm with your password
            </Label>
            <Input
              id="administrator-action-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Your administrator password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" className="rounded-full px-5" onClick={() => changeOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              variant={isDestructive ? 'destructive' : 'default'}
              className={`rounded-full px-5 font-bold ${!isDestructive ? 'bg-primary text-foreground hover:bg-[#70c21d]' : ''}`}
            >
              {saving ? 'Saving…' : title}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
