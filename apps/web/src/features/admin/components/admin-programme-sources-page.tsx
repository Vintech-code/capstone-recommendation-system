import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Database, ExternalLink } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { AdminPageError, AdminPageHeader, AdminPageSkeleton, EmptyPanel } from '@/features/admin/components/admin-shared'
import { mutateAdmin, useAdminResource, type ProgrammeSourceRegistryEntry } from '@/features/admin/data/admin-api'

function AdminProgrammeSourcesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const resource = useAdminResource<ProgrammeSourceRegistryEntry[]>('/programme-sources')
  const [dates, setDates] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function recordVerification(source: ProgrammeSourceRegistryEntry) {
    const date = dates[source.reference]
    if (!date) { setError('Choose the date on which you verified the official source.'); return }
    setBusy(source.reference); setError(null); setMessage(null)
    try {
      await mutateAdmin(`/programme-sources/${source.reference}`, 'PUT', { lastVerifiedAt: date })
      setMessage(`Verification recorded for ${source.sourceName}.`)
      resource.retry()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The source verification could not be recorded.') }
    finally { setBusy(null) }
  }

  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'The catalogue evidence registry is unavailable.'} onRetry={resource.retry} />

  const verified = resource.data.filter((source) => source.lastVerifiedAt).length
  const needsReview = resource.data.filter((source) => source.reviewStatus !== 'current').length

  return <div className="space-y-5">
    <AdminPageHeader eyebrow="Programme governance" title="Catalogue evidence" description="Review the sources recorded for student-facing programme facts and record a verification date only after checking the linked source." action={<Button type="button" variant="outline" className="rounded-lg" onClick={() => onNavigate('/admin/programmes')}><ArrowLeft aria-hidden="true" />Back to programmes</Button>} />

    <section className="grid gap-3 sm:grid-cols-3" aria-label="Catalogue evidence summary">
      <SourceSummary label="Recorded sources" value={resource.data.length} tone="blue" />
      <SourceSummary label="With verification date" value={verified} tone="green" />
      <SourceSummary label="Needs review" value={needsReview} tone="orange" />
    </section>

    {message ? <p role="status" className="rounded-lg bg-success/10 px-4 py-3 text-sm font-semibold text-success">{message}</p> : null}
    {error ? <p role="alert" className="rounded-lg bg-destructive/8 px-4 py-3 text-sm font-semibold text-destructive">{error}</p> : null}

    {resource.data.length ? <section className="overflow-hidden rounded-xl bg-card shadow-sm" aria-labelledby="source-registry-heading">
      <div className="flex items-start gap-3 bg-primary-fixed/45 p-5 sm:p-6"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Database aria-hidden="true" className="size-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Official source registry</p><h2 id="source-registry-heading" className="mt-1 font-display text-xl font-semibold">Recorded catalogue sources</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Administrators recheck each linked source every 180 days under the approved project implementation policy.</p></div></div>
      <div className="divide-y">{resource.data.map((source) => <article key={source.reference} className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_13rem_auto] lg:items-end"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><a href={source.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4">{source.sourceName}<ExternalLink aria-hidden="true" className="size-4" /></a><SourceReviewBadge status={source.reviewStatus} /></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Used for {source.fields.map(humanizeSourceField).join(', ')} across {source.programmeIds.length} programme{source.programmeIds.length === 1 ? '' : 's'}.</p><p className="mt-1 text-xs text-muted-foreground">Last verified: {source.lastVerifiedAt ?? 'Not recorded'}{source.verifiedBy ? ` by ${source.verifiedBy}` : ''}</p>{source.nextReviewAt ? <p className="mt-1 text-xs text-muted-foreground">Next review: {source.nextReviewAt}</p> : null}</div><label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">Verification date<input type="date" value={dates[source.reference] ?? ''} onChange={(event) => setDates((current) => ({ ...current, [source.reference]: event.target.value }))} className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground" /></label><Button type="button" variant="outline" className="min-h-11 rounded-lg" disabled={busy === source.reference} onClick={() => void recordVerification(source)}>{busy === source.reference ? 'Recording…' : 'Record verification'}</Button></article>)}</div>
    </section> : <EmptyPanel title="No catalogue sources recorded" description="Sources will appear when the published programme catalogue contains linked source metadata." />}
  </div>
}

function SourceReviewBadge({ status }: { status: ProgrammeSourceRegistryEntry['reviewStatus'] }) {
  if (status === 'current') return <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success"><CheckCircle2 aria-hidden="true" className="size-3.5" />Current</span>
  if (status === 'review_due') return <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold text-orange-800 dark:bg-orange-500/15 dark:text-orange-200"><Clock3 aria-hidden="true" className="size-3.5" />Review due</span>
  return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive"><AlertTriangle aria-hidden="true" className="size-3.5" />Not verified</span>
}

function SourceSummary({ label, value, tone }: { label: string; value: number; tone: 'blue' | 'green' | 'orange' }) {
  const tones = { blue: 'bg-primary-fixed text-on-primary-fixed', green: 'bg-success/10 text-success', orange: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200' }
  return <article className={`rounded-xl p-4 shadow-sm ${tones[tone]}`}><p className="text-xs font-semibold">{label}</p><p className="mt-2 font-display text-3xl font-bold">{value}</p></article>
}

function humanizeSourceField(field: ProgrammeSourceRegistryEntry['fields'][number]) {
  return field === 'job_growth' ? 'job growth' : field
}

export { AdminProgrammeSourcesPage }
