import { Eye, ExternalLink, GitBranch, ImageUp, LockKeyhole, RefreshCw, Save, Search, Send, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getEscoOccupation, mutateAdmin, searchEscoOccupations, uploadProgrammeMedia, useAdminResource, type ConfigurationPreview, type ConfigurationVersion, type ConfigurationWorkspace, type EscoOccupationSearchResult } from '@/features/admin/data/admin-api'
import { formatDate, humanize } from '@/features/admin/data/admin-formatters'
import type { CareerOpportunity } from '@/features/student/programmes/programme-types'

function ConfigurationWorkflow({ kind, programmeId, onPublished }: { kind: 'catalogue' | 'methodology'; programmeId?: string; onPublished?: () => void }) {
  const resource = useAdminResource<ConfigurationWorkspace>(`/configurations/${kind}`)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const draft = resource.data?.versions.find((version) => version.status === 'draft')

  async function createDraft(sourceVersionId?: number) {
    setBusy(true); setError(null); setMessage(null)
    try {
      await mutateAdmin(`/configurations/${kind}`, 'POST', sourceVersionId ? { sourceVersionId } : {})
      setMessage(sourceVersionId ? 'A new draft was created from the selected historical version.' : 'Draft created from the current runtime configuration.')
      resource.retry()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The draft could not be created.') }
    finally { setBusy(false) }
  }

  if (resource.loading) return <div className="h-48 animate-pulse rounded bg-muted" role="status"><span className="sr-only">Loading configuration workflow</span></div>
  if (resource.error || !resource.data) return <p role="alert" className="bg-destructive/8 p-4 text-sm text-destructive-ink">{resource.error ?? 'Configuration data is unavailable.'}</p>

  return <section className="border-y border-border bg-background py-5" aria-labelledby={`${kind}-governance-heading`}>
    <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Controlled programme update</p><h2 id={`${kind}-governance-heading`} className="mt-1 font-display text-xl font-semibold">{kind === 'catalogue' ? 'Student enrichment and media' : 'Methodology governance'}</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Official programme facts and recommendation profiles are protected. Editable fields are limited to clearly labelled guidance, external career mappings, and media.</p></div>{!draft ? <Button type="button" className="rounded-xs" disabled={busy} onClick={() => void createDraft()}><GitBranch aria-hidden="true" /> Start a catalogue draft</Button> : null}</div>
    {message ? <p role="status" className="mt-4 text-sm font-medium text-success-ink">{message}</p> : null}{error ? <p role="alert" className="mt-4 text-sm font-medium text-destructive-ink">{error}</p> : null}
    {draft ? <ConfigurationEditor key={draft.id} draft={draft} baseline={resource.data.runtime} programmeId={programmeId} onChanged={resource.retry} onPublished={onPublished} /> : null}
    {!programmeId ? <div className="mt-6"><h3 className="text-sm font-semibold">Version history</h3><ol className="mt-3 divide-y">{resource.data.versions.length ? resource.data.versions.map((version) => <li key={version.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"><span><strong>Version {version.version}</strong><span className="ml-2 text-sm text-muted-foreground">Created by {version.createdBy ?? 'Unknown'} · {formatDate(version.createdAt)}</span></span><span className="flex items-center gap-2"><Badge variant={version.status === 'published' ? 'success' : version.status === 'draft' ? 'warning' : 'secondary'}>{humanize(version.status)}</Badge>{!draft && version.status !== 'draft' ? <Button type="button" size="sm" variant="outline" className="rounded" disabled={busy} onClick={() => void createDraft(version.id)}>Use as new draft</Button> : null}</span></li>) : <li className="py-3 text-sm text-muted-foreground">No database versions yet. The bundled runtime configuration is active.</li>}</ol></div> : null}
  </section>
}

function ConfigurationEditor({ draft, baseline, programmeId, onChanged, onPublished }: { draft: ConfigurationVersion; baseline: Record<string, unknown>; programmeId?: string; onChanged: () => void; onPublished?: () => void }) {
  const [payload, setPayload] = useState<Record<string, unknown>>(draft.payload)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [preview, setPreview] = useState<ConfigurationPreview | null>(null)
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'pending' | 'saving' | 'failed'>('saved')
  const lastSavedPayload = useRef(JSON.stringify(draft.payload))
  const saveSequence = useRef(0)
  const autosaveTimer = useRef<number | null>(null)
  const changedSections = Array.from(new Set([...Object.keys(baseline), ...Object.keys(payload)]))
    .filter((key) => JSON.stringify(baseline[key]) !== JSON.stringify(payload[key]))
  const programmeScope = programmeChangeScope(baseline, payload, programmeId)
  function changePayload(nextPayload: Record<string, unknown>) {
    setPayload(nextPayload)
    setPreview(null)
  }

  useEffect(() => {
    const serialized = JSON.stringify(payload)
    if (serialized === lastSavedPayload.current) return
    const sequence = ++saveSequence.current
    setAutosaveStatus('pending')
    autosaveTimer.current = window.setTimeout(() => {
      setAutosaveStatus('saving')
      void mutateAdmin<ConfigurationVersion>(`/configurations/versions/${draft.id}`, 'PUT', { payload })
        .then((saved) => {
          if (sequence !== saveSequence.current) return
          lastSavedPayload.current = JSON.stringify(saved.payload)
          setAutosaveStatus('saved')
        })
        .catch((reason) => {
          if (sequence !== saveSequence.current) return
          setAutosaveStatus('failed')
          setError(reason instanceof Error ? reason.message : 'Autosave failed. Your changes remain in this editor; retry before publishing.')
        })
    }, 700)
    return () => {
      if (autosaveTimer.current !== null) window.clearTimeout(autosaveTimer.current)
    }
  }, [draft.id, payload])

  async function save() {
    saveSequence.current += 1
    if (autosaveTimer.current !== null) window.clearTimeout(autosaveTimer.current)
    setBusy(true); setError(null); setMessage(null)
    try { const saved = await mutateAdmin<ConfigurationVersion>(`/configurations/versions/${draft.id}`, 'PUT', { payload }); lastSavedPayload.current = JSON.stringify(saved.payload); setAutosaveStatus('saved'); setMessage('Draft saved.'); onChanged() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The draft could not be saved.') }
    finally { setBusy(false) }
  }

  async function previewChanges() {
    setBusy(true); setError(null); setMessage(null)
    try { setPreview(await mutateAdmin(`/configurations/versions/${draft.id}/preview`, 'POST', { payload })) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The preview could not be prepared.') }
    finally { setBusy(false) }
  }

  async function publish() {
    saveSequence.current += 1
    if (autosaveTimer.current !== null) window.clearTimeout(autosaveTimer.current)
    setBusy(true); setError(null); setMessage(null)
    try { await mutateAdmin(`/configurations/versions/${draft.id}`, 'PUT', { payload }); await mutateAdmin(`/configurations/versions/${draft.id}/publish`, 'POST'); setMessage('Published successfully. Student programme cards and details now use these changes.'); onChanged(); onPublished?.() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The draft could not be published.') }
    finally { setBusy(false); setConfirmOpen(false) }
  }

  return <div className="mt-6 border-t border-border pt-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Shared catalogue draft - Version {draft.version}</p><p className="mt-1 max-w-2xl text-sm">Changes autosave to one shared catalogue draft. Publishing applies every pending programme change in that draft, not only the programme currently open.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="rounded-xs bg-background" disabled={busy} onClick={() => void previewChanges()}><Eye aria-hidden="true" /> Review changes</Button><Button type="button" className="rounded-xs" disabled={busy || !preview?.hasChanges} onClick={() => setConfirmOpen(true)}><Send aria-hidden="true" /> Publish full catalogue</Button></div></div>
    <p className="mt-4 text-xs text-muted-foreground">{programmeId ? <><strong>{programmeScope.selectedFieldCount}</strong> editable field{programmeScope.selectedFieldCount === 1 ? '' : 's'} changed in this programme; <strong>{programmeScope.changedProgrammeCount}</strong> programme{programmeScope.changedProgrammeCount === 1 ? '' : 's'} changed across the full draft.</> : <>Changed sections compared with the active runtime: <strong>{changedSections.length ? changedSections.map(humanize).join(', ') : 'None'}</strong>.</>}</p>
    <p className={`mt-2 text-xs font-semibold ${autosaveStatus === 'failed' ? 'text-destructive-ink' : 'text-muted-foreground'}`} role="status">{autosaveStatus === 'saved' ? 'Draft autosaved' : autosaveStatus === 'pending' ? 'Autosave pending…' : autosaveStatus === 'saving' ? 'Saving draft…' : 'Autosave failed — retry before publishing.'}</p>
    {autosaveStatus === 'failed' ? <Button type="button" size="sm" variant="outline" className="mt-3 rounded-xs bg-background" disabled={busy} onClick={() => void save()}><Save aria-hidden="true" /> Retry saving draft</Button> : null}
    {draft.kind === 'catalogue' ? <CatalogueProfileEditor payload={payload} programmeId={programmeId} onChange={changePayload} /> : <MethodologyEditor payload={payload} onChange={changePayload} />}
    {preview ? <ConfigurationDiffPreview preview={preview} programmeId={programmeId} /> : null}
    {message ? <p role="status" className="mt-4 text-sm font-medium text-success-ink">{message}</p> : null}{error ? <p role="alert" className="mt-4 text-sm font-medium text-destructive-ink">{error}</p> : null}
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Publish the full catalogue draft?</AlertDialogTitle><AlertDialogDescription>This publishes pending editable-field and media changes for {programmeScope.changedProgrammeCount} programme{programmeScope.changedProgrammeCount === 1 ? '' : 's'}. Protected CMO facts and recommendation profiles cannot be overwritten. Existing historical recommendations will not change.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continue reviewing</AlertDialogCancel><AlertDialogAction onClick={() => void publish()}>Publish full catalogue</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
}

function ConfigurationDiffPreview({ preview, programmeId }: { preview: ConfigurationPreview; programmeId?: string }) {
  const changes = programmeId ? preview.programmeChanges.filter((item) => item.programmeId === programmeId) : preview.programmeChanges
  return <section className="mt-5 bg-background p-4 shadow-sm" aria-live="polite"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-ink">Before and after</p><h3 className="mt-1 font-display text-lg font-semibold">Publication preview</h3></div><Badge variant={preview.hasChanges ? 'warning' : 'secondary'}>{preview.hasChanges ? `${preview.changedProgrammeCount} programme${preview.changedProgrammeCount === 1 ? '' : 's'} changed` : 'No changes'}</Badge></div>{changes.length ? <div className="mt-4 space-y-4">{changes.map((change) => <article key={change.programmeId}><h4 className="font-semibold">{change.name ?? change.code ?? change.programmeId}</h4><div className="mt-2 divide-y">{change.fields.map((field) => <div key={field.field} className="grid gap-2 py-3 text-sm sm:grid-cols-[10rem_1fr_1fr]"><strong>{humanize(field.field)}</strong><DiffValue label="Before" value={field.before} /><DiffValue label="After" value={field.after} /></div>)}</div></article>)}</div> : <p className="mt-3 text-sm text-muted-foreground">The current draft matches the active student catalogue.</p>}</section>
}

function DiffValue({ label, value }: { label: string; value: unknown }) {
  const displayed = Array.isArray(value) ? value.join(', ') : typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? 'Not set')
  return <p className="min-w-0 break-words"><span className="block text-xs font-semibold text-muted-foreground">{label}</span>{displayed}</p>
}

const EDITABLE_PROGRAMME_FIELDS = [
  'recommended_strands',
  'strand_guidance',
  'career_opportunities',
  'cover_image_url',
  'logo_image_url',
  'cover_image_position',
  'logo_image_position',
] as const

function programmeChangeScope(baseline: Record<string, unknown>, payload: Record<string, unknown>, selectedId?: string) {
  const baselineProgrammes = ((baseline.programmes as Array<Record<string, unknown>> | undefined) ?? [])
  const currentProgrammes = ((payload.programmes as Array<Record<string, unknown>> | undefined) ?? [])
  const baselineById = new Map(baselineProgrammes.map((programme) => [String(programme.id), programme]))
  const fieldCounts = new Map<string, number>()

  currentProgrammes.forEach((programme) => {
    const id = String(programme.id)
    const original = baselineById.get(id) ?? {}
    const count = EDITABLE_PROGRAMME_FIELDS.filter(
      (field) => JSON.stringify(original[field]) !== JSON.stringify(programme[field]),
    ).length
    if (count > 0) fieldCounts.set(id, count)
  })

  return {
    changedProgrammeCount: fieldCounts.size,
    selectedFieldCount: selectedId ? fieldCounts.get(selectedId) ?? 0 : 0,
  }
}

function CatalogueProfileEditor({ payload, programmeId, onChange }: { payload: Record<string, unknown>; programmeId?: string; onChange: (payload: Record<string, unknown>) => void }) {
  const programmes = (payload.programmes as Array<Record<string, unknown>> | undefined) ?? []
  const [openId, setOpenId] = useState<string | null>(programmeId ?? String(programmes[0]?.id ?? ''))
  const [uploading, setUploading] = useState<string | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [mediaMessage, setMediaMessage] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [failedUpload, setFailedUpload] = useState<{ index: number; programmeId: string; kind: 'cover' | 'logo'; file: File } | null>(null)
  function updateProgramme(index: number, changes: Record<string, unknown>) {
    onChange({ ...payload, programmes: programmes.map((programme, itemIndex) => itemIndex === index ? { ...programme, ...changes } : programme) })
  }
  function stringList(value: unknown) { return Array.isArray(value) ? value.join('\n') : '' }
  function list(value: string) { return value.split('\n').map((item) => item.trim()).filter(Boolean) }
  async function upload(index: number, programmeId: string, kind: 'cover' | 'logo', file?: File) {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMediaError('Choose a JPEG, PNG, or WebP image no larger than 5 MB.')
      return
    }
    setUploading(`${programmeId}-${kind}`); setMediaError(null); setMediaMessage(null)
    try {
      setUploadProgress(0); setFailedUpload(null)
      const media = await uploadProgrammeMedia(programmeId, kind, file, setUploadProgress)
      updateProgramme(index, { [kind === 'cover' ? 'cover_image_url' : 'logo_image_url']: media.url })
      setMediaMessage(`${kind === 'cover' ? 'Cover photo' : 'Programme logo'} uploaded and ready. Publish the changes to show it on student pages.`)
    } catch (reason) { setFailedUpload({ index, programmeId, kind, file }); setMediaError(reason instanceof Error ? reason.message : 'The image could not be uploaded.') }
    finally { setUploading(null); setUploadProgress(null) }
  }
  const visibleProgrammes = programmeId ? programmes.map((programme, index) => ({ programme, index })).filter(({ programme }) => String(programme.id) === programmeId) : programmes.map((programme, index) => ({ programme, index }))
  return <div className="mt-5 space-y-3">{mediaError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 bg-destructive/8 p-3 text-sm font-semibold text-destructive-ink"><span>{mediaError}</span>{failedUpload ? <Button type="button" size="sm" variant="outline" className="rounded bg-background" onClick={() => void upload(failedUpload.index, failedUpload.programmeId, failedUpload.kind, failedUpload.file)}><RefreshCw aria-hidden="true" /> Retry upload</Button> : null}</div> : null}{uploadProgress !== null ? <div role="status" aria-label={`Uploading image ${uploadProgress}%`} className="bg-background p-3"><div className="flex justify-between text-xs font-semibold"><span>Uploading image</span><span>{uploadProgress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} /></div></div> : null}{mediaMessage ? <p role="status" className="bg-success/10 p-3 text-sm font-semibold text-success-ink">{mediaMessage}</p> : null}{visibleProgrammes.map(({ programme, index }) => {
    const id = String(programme.id)
    const open = openId === id
    return <section key={id} className="border-t border-border pt-4"><button type="button" className="flex min-h-12 w-full items-center justify-between gap-4 text-left" onClick={() => setOpenId(open ? null : id)} aria-expanded={open}><span><strong className="block font-display text-lg">{String(programme.short_label)}</strong><span className="text-sm text-muted-foreground">{String(programme.display_name)}</span></span><Badge variant={open ? 'secondary' : 'outline'}>{open ? 'Open' : 'Manage'}</Badge></button>{open ? <div className="mt-5 space-y-7">
      <ProtectedProgrammeFacts programme={programme} />
      <section aria-labelledby={`${id}-guidance-heading`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-ink">Editable student guidance</p>
        <h4 id={`${id}-guidance-heading`} className="mt-1 font-display text-lg font-semibold">Proposed SHS preparation</h4>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">These suggestions are separate from CHED programme standards and must not be presented as admission requirements.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ListField label="Recommended SHS strands, one per line" id={`${id}-strands`} value={stringList(programme.recommended_strands)} onChange={(value) => updateProgramme(index, { recommended_strands: list(value) })} />
          <div><Label htmlFor={`${id}-strand-guidance`}>Preparation guidance</Label><Textarea id={`${id}-strand-guidance`} value={String(programme.strand_guidance ?? '')} onChange={(event) => updateProgramme(index, { strand_guidance: event.target.value })} className="mt-2 min-h-28" /></div>
        </div>
      </section>
      <CareerOpportunityEditor
        programmeId={id}
        opportunities={careerOpportunities(programme.career_opportunities)}
        onChange={(careerOpportunities) => updateProgramme(index, { career_opportunities: careerOpportunities })}
      />
      <div><h4 className="text-sm font-semibold">Images shown to students</h4><p className="mt-1 text-xs text-muted-foreground">Choose a JPEG, PNG, or WebP up to 5 MB. Confirm the preview, review all pending changes, then publish the full catalogue draft.</p><div className="mt-3 grid gap-4 md:grid-cols-2"><MediaField label="Programme cover photo" id={`${id}-cover`} preview={String(programme.cover_image_url ?? '')} busy={uploading === `${id}-cover`} onFile={(file) => void upload(index, id, 'cover', file)} /><MediaField label="Programme logo" id={`${id}-logo`} preview={String(programme.logo_image_url ?? '')} busy={uploading === `${id}-logo`} onFile={(file) => void upload(index, id, 'logo', file)} /></div></div>
      <MediaPositionEditor programme={programme} programmeId={id} onChange={(field, value) => updateProgramme(index, { [field]: value })} />
    </div> : null}</section>
  })}</div>
}

function ProtectedProgrammeFacts({ programme }: { programme: Record<string, unknown> }) {
  const source = programme.content_source && typeof programme.content_source === 'object'
    ? programme.content_source as Record<string, unknown>
    : null
  const majors = asStringList(programme.majors)
  const areas = asStringList(programme.learning_areas)
  const careers = asStringList(programme.career_directions)
  const profile = asStringList(programme.riasec_profile)

  return <section className="border-y border-border bg-secondary/45 px-4 py-5" aria-labelledby={`${String(programme.id)}-protected-heading`}>
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xs bg-background text-primary-ink"><LockKeyhole aria-hidden="true" className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-ink">Protected source-controlled facts</p>
        <h4 id={`${String(programme.id)}-protected-heading`} className="mt-1 font-display text-lg font-semibold">{String(programme.display_name ?? 'Programme information')}</h4>
        <p className="mt-1 text-sm text-muted-foreground">Programme identity, CMO-grounded content, recorded majors, and the RIASEC profile are read-only here. Corrections require an updated authoritative source and a new controlled catalogue version.</p>
      </div>
    </div>
    <dl className="mt-4 grid gap-x-6 gap-y-3 border-y border-border py-4 text-sm sm:grid-cols-2">
      <div><dt className="text-xs font-semibold text-muted-foreground">Official label</dt><dd className="mt-1 font-semibold">{String(programme.short_label ?? 'Not recorded')}</dd></div>
      <div><dt className="text-xs font-semibold text-muted-foreground">RIASEC profile</dt><dd className="mt-1 font-semibold">{profile.join(' / ') || 'Pending authoritative basis'}</dd></div>
      <div><dt className="text-xs font-semibold text-muted-foreground">Recorded majors</dt><dd className="mt-1">{majors.join(', ') || 'No majors recorded'}</dd></div>
      <div><dt className="text-xs font-semibold text-muted-foreground">Content status</dt><dd className="mt-1">{humanize(String(programme.content_status ?? 'proposed'))}</dd></div>
    </dl>
    <div className="mt-4 grid gap-5 lg:grid-cols-2">
      <div><h5 className="text-sm font-semibold">CMO-grounded summary</h5><p className="mt-1 text-sm leading-6 text-muted-foreground">{String(programme.description ?? 'No description recorded.')}</p></div>
      <div><h5 className="text-sm font-semibold">Source</h5><p className="mt-1 text-sm text-muted-foreground">{String(source?.reference ?? source?.note ?? 'Source review is pending.')}</p>{source?.source_url && source?.source_name ? <a href={String(source.source_url)} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-primary-ink underline underline-offset-4">{String(source.source_name)}<ExternalLink aria-hidden="true" className="size-3" /></a> : null}</div>
    </div>
    <div className="mt-4 grid gap-5 sm:grid-cols-2">
      <ProtectedList title="Learning areas" items={areas} />
      <ProtectedList title="CMO career directions" items={careers} />
    </div>
  </section>
}

function ProtectedList({ title, items }: { title: string; items: string[] }) {
  return <div><h5 className="text-sm font-semibold">{title}</h5>{items.length ? <ul className="mt-2 space-y-1 text-sm text-muted-foreground">{items.map((item) => <li key={item}>• {item}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No entries recorded.</p>}</div>
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item !== '') : []
}

function CareerOpportunityEditor({ programmeId, opportunities, onChange }: { programmeId: string; opportunities: CareerOpportunity[]; onChange: (opportunities: CareerOpportunity[]) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EscoOccupationSearchResult[]>([])
  const [status, setStatus] = useState<'idle' | 'searching' | 'adding'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function searchOccupations(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = query.trim()
    if (normalized.length < 2) {
      setError('Enter at least two characters to search ESCO occupations.')
      return
    }
    setStatus('searching'); setError(null)
    try { setResults(await searchEscoOccupations(normalized)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'ESCO occupation search is unavailable.') }
    finally { setStatus('idle') }
  }

  async function addOccupation(result: EscoOccupationSearchResult) {
    if (opportunities.some((item) => item.escoUri === result.uri)) return
    setStatus('adding'); setError(null)
    try { onChange([...opportunities, await getEscoOccupation(result.uri)]) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The ESCO occupation could not be added.') }
    finally { setStatus('idle') }
  }

  return <section className="border-y border-border py-5" aria-labelledby={`${programmeId}-esco-heading`}>
    <div className="max-w-3xl"><p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-primary-ink">External career reference</p><h4 id={`${programmeId}-esco-heading`} className="mt-1 font-display text-lg font-bold">ESCO occupation mappings</h4><p className="mt-1 text-sm leading-6 text-muted-foreground">Search the European Commission taxonomy, review the exact occupation, then publish the mapping. ESCO enriches programme guidance; it does not change RIASEC scores or rank courses.</p></div>
    <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => void searchOccupations(event)}>
      <div className="min-w-0 flex-1"><Label htmlFor={`${programmeId}-esco-search`}>Occupation name</Label><Input id={`${programmeId}-esco-search`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Example: software developer" className="mt-2" /></div>
      <Button type="submit" variant="outline" disabled={status !== 'idle'} className="self-end"><Search aria-hidden="true" />{status === 'searching' ? 'Searching…' : 'Search ESCO'}</Button>
    </form>
    {error ? <p role="alert" className="mt-3 text-sm font-semibold text-destructive-ink">{error}</p> : null}
    {results.length > 0 ? <ul className="mt-4 divide-y divide-border border-y border-border">{results.map((result) => <li key={result.uri} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div><strong className="text-sm">{result.title}</strong><p className="mt-1 text-xs text-muted-foreground">{[result.escoCode ? `ESCO ${result.escoCode}` : null, result.iscoCode ? `ISCO-08 ${result.iscoCode}` : null].filter(Boolean).join(' · ') || 'Occupation reference'}</p></div><Button type="button" size="sm" variant="outline" disabled={status !== 'idle' || opportunities.some((item) => item.escoUri === result.uri)} onClick={() => void addOccupation(result)}>{opportunities.some((item) => item.escoUri === result.uri) ? 'Added' : 'Add mapping'}</Button></li>)}</ul> : null}
    <div className="mt-5"><p className="text-sm font-semibold">Selected mappings ({opportunities.length})</p>{opportunities.length > 0 ? <ul className="mt-2 divide-y divide-border border-y border-border">{opportunities.map((opportunity) => <li key={opportunity.escoUri} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><strong className="text-sm">{opportunity.label}</strong>{opportunity.description ? <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">{opportunity.description}</p> : null}<a href={opportunity.escoUri} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-primary-ink underline underline-offset-4">Open ESCO record <ExternalLink aria-hidden="true" className="size-3" /></a></div><Button type="button" size="sm" variant="ghost" onClick={() => onChange(opportunities.filter((item) => item.escoUri !== opportunity.escoUri))}><Trash2 aria-hidden="true" />Remove</Button></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No ESCO occupations have been selected. The existing local career directions will remain visible.</p>}</div>
  </section>
}

function careerOpportunities(value: unknown): CareerOpportunity[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is CareerOpportunity => Boolean(item && typeof item === 'object' && typeof (item as CareerOpportunity).label === 'string' && typeof (item as CareerOpportunity).escoUri === 'string'))
}

type MediaPosition = { x: number; y: number; zoom: number }

function MediaPositionEditor({ programme, programmeId, onChange }: { programme: Record<string, unknown>; programmeId: string; onChange: (field: string, value: MediaPosition) => void }) {
  return <section><h4 className="text-sm font-semibold">Crop and position preview</h4><p className="mt-1 text-xs text-muted-foreground">Adjust how each uploaded image will be framed. Position changes stay in this draft until published.</p><div className="mt-3 grid gap-4 md:grid-cols-2"><PositionedMedia label="Cover photo framing" id={`${programmeId}-cover-position`} url={String(programme.cover_image_url ?? '')} position={mediaPosition(programme.cover_image_position)} onChange={(value) => onChange('cover_image_position', value)} wide /><PositionedMedia label="Logo framing" id={`${programmeId}-logo-position`} url={String(programme.logo_image_url ?? '')} position={mediaPosition(programme.logo_image_position)} onChange={(value) => onChange('logo_image_position', value)} /></div></section>
}

function PositionedMedia({ label, id, url, position, onChange, wide = false }: { label: string; id: string; url: string; position: MediaPosition; onChange: (value: MediaPosition) => void; wide?: boolean }) {
  const set = (key: keyof MediaPosition, value: number) => onChange({ ...position, [key]: value })
  return <div className="bg-secondary p-4"><p className="text-sm font-semibold">{label}</p><div className={`mt-3 overflow-hidden rounded-xs bg-background ${wide ? 'aspect-video' : 'mx-auto aspect-square max-w-52'}`}>{url ? <img src={url} alt={`${label} preview`} className="size-full object-cover transition-transform duration-200" style={{ objectPosition: `${position.x}% ${position.y}%`, transform: `scale(${position.zoom})` }} /> : <span className="flex size-full items-center justify-center text-xs text-muted-foreground">Upload an image to adjust its framing.</span>}</div><div className="mt-4 grid gap-3"><RangeControl id={`${id}-horizontal`} label="Horizontal position" value={position.x} min={0} max={100} onChange={(value) => set('x', value)} /><RangeControl id={`${id}-vertical`} label="Vertical position" value={position.y} min={0} max={100} onChange={(value) => set('y', value)} /><RangeControl id={`${id}-zoom`} label="Zoom" value={position.zoom} min={1} max={2.5} step={0.1} onChange={(value) => set('zoom', value)} /></div></div>
}

function RangeControl({ id, label, value, min, max, step = 1, onChange }: { id: string; label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return <label htmlFor={id} className="grid gap-1 text-xs font-semibold text-muted-foreground"><span className="flex justify-between"><span>{label}</span><span>{value}</span></span><input id={id} type="range" min={min} max={max} step={step} value={value} disabled={false} onChange={(event) => onChange(Number(event.target.value))} className="min-h-11 w-full accent-primary" /></label>
}

function mediaPosition(value: unknown): MediaPosition {
  const candidate = value && typeof value === 'object' ? value as Partial<MediaPosition> : {}
  return {
    x: typeof candidate.x === 'number' ? candidate.x : 50,
    y: typeof candidate.y === 'number' ? candidate.y : 50,
    zoom: typeof candidate.zoom === 'number' ? candidate.zoom : 1,
  }
}

function ListField({ label, id, value, onChange }: { label: string; id: string; value: string; onChange: (value: string) => void }) { return <div><Label htmlFor={id}>{label}</Label><Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-28" /></div> }
function MediaField({ label, id, preview, busy, onFile }: { label: string; id: string; preview: string; busy: boolean; onFile: (file?: File) => void }) { return <div className="rounded-xs bg-secondary p-4"><div className="flex items-center gap-3">{preview ? <img src={preview} alt="" className="size-16 rounded-xs bg-white object-cover" /> : <span className="flex size-16 items-center justify-center rounded-xs bg-background text-muted-foreground"><ImageUp aria-hidden="true" /></span>}<div className="min-w-0"><Label htmlFor={id}>{label}</Label><Input id={id} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => onFile(event.target.files?.[0])} className="mt-2" /></div></div></div> }

function MethodologyEditor({ payload, onChange }: { payload: Record<string, unknown>; onChange: (payload: Record<string, unknown>) => void }) {
  const display = (payload.display as Record<string, unknown>) ?? {}
  const tieBreak = (payload.tie_break as Record<string, unknown>) ?? {}
  return <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><Label htmlFor="default-count">Default recommendation count</Label><input id="default-count" type="number" min="1" max="11" value={Number(display.default_count ?? 3)} onChange={(event) => onChange({ ...payload, display: { ...display, default_count: Number(event.target.value) } })} className="mt-2 h-10 w-full rounded border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></div><div><Label htmlFor="tie-direction">Alphabetical tie direction</Label><select id="tie-direction" value={String(tieBreak.direction ?? 'ascending')} onChange={(event) => onChange({ ...payload, tie_break: { ...tieBreak, direction: event.target.value } })} className="mt-2 h-10 w-full rounded border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><option value="ascending">Ascending</option><option value="descending">Descending</option></select></div></div>
}

export { ConfigurationWorkflow }
