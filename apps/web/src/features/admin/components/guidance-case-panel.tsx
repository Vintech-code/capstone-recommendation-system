import { CalendarDays, CheckCircle2, FilePlus2, MessageSquareText, Printer, Save, Send } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { mutateWorkspace, type GuidanceCase } from '@/features/admin/data/admin-api'
import { formatDate } from '@/features/admin/data/admin-formatters'

function GuidanceCasePanel({ studentId, guidanceCase, onChanged }: { studentId: string; guidanceCase: GuidanceCase | null; onChanged: () => void }) {
  const [status, setStatus] = useState<GuidanceCase['status']>(guidanceCase?.status ?? 'open')
  const [followUpOn, setFollowUpOn] = useState(guidanceCase?.followUpOn ?? '')
  const [note, setNote] = useState('')
  const latestDraft = guidanceCase?.summaries.find((summary) => summary.status === 'draft') ?? null
  const [summary, setSummary] = useState(latestDraft?.body ?? '')
  const [draftId, setDraftId] = useState<number | null>(latestDraft?.id ?? null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function saveProgress() {
    setBusy(true); setError(null); setMessage(null)
    try {
      await mutateWorkspace('counselor', `/students/${studentId}/guidance-case`, 'PUT', { status, followUpOn: followUpOn || null })
      setMessage('Guidance progress saved.')
      onChanged()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The guidance progress could not be saved.') }
    finally { setBusy(false) }
  }

  async function addNote() {
    if (!note.trim()) return
    setBusy(true); setError(null); setMessage(null)
    try {
      await mutateWorkspace('counselor', `/students/${studentId}/guidance-notes`, 'POST', { body: note })
      setNote(''); setMessage('Guidance note added.'); onChanged()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The guidance note could not be added.') }
    finally { setBusy(false) }
  }

  async function saveSummaryDraft() {
    if (summary.trim().length < 2) return
    setBusy(true); setError(null); setMessage(null)
    try {
      const saved = await mutateWorkspace<{ id: number }>('counselor', draftId ? `/students/${studentId}/guidance-summaries/${draftId}` : `/students/${studentId}/guidance-summaries`, draftId ? 'PUT' : 'POST', { body: summary })
      setDraftId(saved.id); setMessage('Student guidance summary saved as a private draft.'); onChanged()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The student guidance summary could not be saved.') }
    finally { setBusy(false) }
  }

  async function publishSummary() {
    if (summary.trim().length < 2) return
    setBusy(true); setError(null); setMessage(null)
    try {
      let id = draftId
      if (id === null) {
        const saved = await mutateWorkspace<{ id: number }>('counselor', `/students/${studentId}/guidance-summaries`, 'POST', { body: summary })
        id = saved.id
      } else if (latestDraft?.body !== summary) {
        await mutateWorkspace('counselor', `/students/${studentId}/guidance-summaries/${id}`, 'PUT', { body: summary })
      }
      await mutateWorkspace('counselor', `/students/${studentId}/guidance-summaries/${id}/publish`, 'POST')
      setSummary(''); setDraftId(null); setMessage('Student guidance summary published.'); onChanged()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The student guidance summary could not be published.') }
    finally { setBusy(false) }
  }

  return <section className="overflow-hidden rounded-xl bg-card shadow-sm" aria-labelledby="guidance-case-heading">
    <div className="flex flex-col gap-4 bg-primary px-5 py-6 text-primary-foreground sm:flex-row sm:items-start sm:justify-between sm:px-6"><div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10"><MessageSquareText className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Counselor workspace</p><h2 id="guidance-case-heading" className="mt-1 font-display text-2xl font-bold">Notes, progress, and next steps</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">Record the guidance provided and leave the student’s assessment and programme evidence unchanged.</p></div></div><Button type="button" variant="secondary" className="rounded-lg" onClick={() => window.print()}><Printer aria-hidden="true" />Print summary</Button></div>
    <div className="divide-y divide-border lg:grid lg:grid-cols-[minmax(18rem,.72fr)_minmax(0,1.28fr)] lg:divide-x lg:divide-y-0">
      <div className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-primary-fixed text-on-primary-fixed"><CheckCircle2 className="size-4" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">Case direction</p><h3 className="font-display text-lg font-bold">Guidance progress</h3></div></div><div className="mt-5 space-y-4"><div><Label htmlFor="guidance-status">Current status</Label><select id="guidance-status" value={status} onChange={(event) => setStatus(event.target.value as GuidanceCase['status'])} className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><option value="open">Open</option><option value="follow_up">Follow-up scheduled</option><option value="closed">Closed</option></select></div><div><Label htmlFor="follow-up-date">Next follow-up</Label><div className="relative mt-2"><CalendarDays aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input id="follow-up-date" type="date" value={followUpOn} onChange={(event) => setFollowUpOn(event.target.value)} className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></div></div><Button type="button" className="w-full rounded-lg" disabled={busy} onClick={() => void saveProgress()}><Save aria-hidden="true" />Save guidance progress</Button></div></div>
      <div className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-secondary-fixed text-on-secondary-fixed"><FilePlus2 className="size-4" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">Append-only record</p><h3 className="font-display text-lg font-bold">Add counseling note</h3></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">Capture the concern discussed, advice provided, agreed action, and anything needed for the next conversation. The author and timestamp are recorded automatically.</p><Label htmlFor="guidance-note" className="mt-5 block">Guidance note</Label><Textarea id="guidance-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={4000} placeholder="Record the concern discussed, advice provided, and agreed next step." className="mt-2 min-h-32 rounded-lg" /><div className="mt-3 flex justify-end"><Button type="button" className="rounded-lg" disabled={busy || note.trim().length < 2} onClick={() => void addNote()}><FilePlus2 aria-hidden="true" />Add note</Button></div></div>
    </div>
    <div className="bg-primary-fixed/35 px-5 py-6 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">Student-visible guidance</p><h3 className="mt-1 font-display text-xl font-bold">Summary and next steps</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">This is separate from private counseling notes. Saving keeps it private; publishing makes it visible to the student and sends an in-app notification.</p></div><span className="w-fit rounded-full bg-card px-3 py-1 text-xs font-semibold shadow-sm">{draftId ? 'Draft saved' : 'Not published'}</span></div>
      <Label htmlFor="student-guidance-summary" className="mt-5 block">Student guidance summary</Label><Textarea id="student-guidance-summary" value={summary} onChange={(event) => setSummary(event.target.value)} maxLength={4000} placeholder="Write the guidance and agreed next steps the student should be able to review." className="mt-2 min-h-28 rounded-lg bg-card" />
      <div className="mt-3 flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={busy || summary.trim().length < 2} onClick={() => void saveSummaryDraft()}><Save aria-hidden="true" />Save private draft</Button><Button type="button" disabled={busy || summary.trim().length < 2} onClick={() => void publishSummary()}><Send aria-hidden="true" />Publish to student</Button></div>
    </div>
    {message ? <p role="status" className="mx-5 mb-5 mt-5 rounded-lg bg-success/10 px-4 py-3 text-sm font-medium text-success sm:mx-6">{message}</p> : null}{error ? <p role="alert" className="mx-5 mb-5 mt-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive sm:mx-6">{error}</p> : null}
    <div className="border-t border-border px-5 py-6 sm:px-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">Private counselor record</p><h3 className="mt-1 font-display text-xl font-bold">Internal note history</h3></div><span className="text-sm font-semibold text-muted-foreground">{guidanceCase?.notes.length ?? 0} note{guidanceCase?.notes.length === 1 ? '' : 's'}</span></div>{guidanceCase?.notes.length ? <ol className="relative mt-5 space-y-0 before:absolute before:bottom-5 before:left-4 before:top-5 before:w-px before:bg-border">{guidanceCase.notes.map((item) => <li key={item.id} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-4 py-4"><span className="relative z-10 mt-1 size-8 rounded-full bg-primary-fixed ring-4 ring-card" aria-hidden="true" /><div><p className="text-sm leading-6">{item.body}</p><p className="mt-2 text-xs font-medium text-muted-foreground">{item.author} · {formatDate(item.createdAt)}</p></div></li>)}</ol> : <p className="mt-5 rounded-lg bg-secondary/60 p-4 text-sm text-muted-foreground">No private counselor notes have been recorded.</p>}</div>
  </section>
}

function GuidanceRecordSummary({ guidanceCase }: { guidanceCase: GuidanceCase | null }) {
  return <section className="bg-card p-5 shadow-sm" aria-labelledby="guidance-monitoring-heading"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Read-only monitoring</p><h2 id="guidance-monitoring-heading" className="mt-1 font-display text-xl font-semibold">Counseling activity</h2><p className="mt-1 text-sm text-muted-foreground">Administrators can monitor recorded guidance but cannot assign students, write counseling notes, or change follow-up decisions.</p>{guidanceCase ? <><dl className="mt-5 grid gap-3 sm:grid-cols-3"><SummaryDatum label="Counselor" value={guidanceCase.assignedTo ?? 'Not yet handled'} /><SummaryDatum label="Status" value={guidanceCase.status === 'follow_up' ? 'Follow-up scheduled' : guidanceCase.status === 'closed' ? 'Closed' : 'Open'} /><SummaryDatum label="Next follow-up" value={guidanceCase.followUpOn ? formatDate(guidanceCase.followUpOn) : 'Not scheduled'} /></dl>{guidanceCase.notes.length ? <ol className="mt-5 space-y-3">{guidanceCase.notes.map((note) => <li key={note.id} className="bg-secondary p-4"><p className="text-sm leading-6">{note.body}</p><p className="mt-2 text-xs text-muted-foreground">{note.author} · {formatDate(note.createdAt)}</p></li>)}</ol> : null}</> : <p className="mt-5 bg-secondary/60 p-4 text-sm text-muted-foreground">No counselor interaction has been recorded for this student.</p>}</section>
}

function SummaryDatum({ label, value }: { label: string; value: string }) { return <div className="bg-secondary p-4"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div> }

export { GuidanceCasePanel, GuidanceRecordSummary }
