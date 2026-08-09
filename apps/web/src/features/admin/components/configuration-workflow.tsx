import { GitBranch, ImageUp, LockKeyhole, Save, Send } from 'lucide-react'
import { useState } from 'react'

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
import { mutateAdmin, uploadProgrammeMedia, useAdminResource, type ConfigurationVersion, type ConfigurationWorkspace } from '@/features/admin/data/admin-api'
import { formatDate, humanize } from '@/features/admin/data/admin-formatters'

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
  if (resource.error || !resource.data) return <p role="alert" className="bg-destructive/8 p-4 text-sm text-destructive">{resource.error ?? 'Configuration data is unavailable.'}</p>

  return <section className="bg-card p-5 shadow-sm" aria-labelledby={`${kind}-governance-heading`}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Programme update</p><h2 id={`${kind}-governance-heading`} className="mt-1 font-display text-xl font-semibold">{kind === 'catalogue' ? 'Edit student-visible information' : 'Methodology governance'}</h2><p className="mt-1 text-sm text-muted-foreground">Change only the fields you need, confirm image previews, then publish once to update the student pages.</p></div>{!draft ? <Button type="button" className="rounded" disabled={busy} onClick={() => void createDraft()}><GitBranch aria-hidden="true" /> Start editing</Button> : null}</div>
    {message ? <p role="status" className="mt-4 text-sm font-medium text-success">{message}</p> : null}{error ? <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p> : null}
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
  const changedSections = Array.from(new Set([...Object.keys(baseline), ...Object.keys(payload)]))
    .filter((key) => JSON.stringify(baseline[key]) !== JSON.stringify(payload[key]))

  async function save() {
    setBusy(true); setError(null); setMessage(null)
    try { await mutateAdmin(`/configurations/versions/${draft.id}`, 'PUT', { payload }); setMessage('Draft saved.'); onChanged() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The draft could not be saved.') }
    finally { setBusy(false) }
  }

  async function publish() {
    setBusy(true); setError(null); setMessage(null)
    try { await mutateAdmin(`/configurations/versions/${draft.id}`, 'PUT', { payload }); await mutateAdmin(`/configurations/versions/${draft.id}/publish`, 'POST'); setMessage('Published successfully. Student programme cards and details now use these changes.'); onChanged(); onPublished?.() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The draft could not be published.') }
    finally { setBusy(false); setConfirmOpen(false) }
  }

  return <div className="mt-6 bg-secondary p-4">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Unpublished changes · Version {draft.version}</p><p className="mt-1 text-sm">Change only what you need. Save for later, or publish once to update every student programme view.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="rounded bg-background" disabled={busy} onClick={() => void save()}><Save aria-hidden="true" /> Save for later</Button><Button type="button" className="rounded" disabled={busy} onClick={() => setConfirmOpen(true)}><Send aria-hidden="true" /> Publish to student pages</Button></div></div>
    <p className="mt-4 text-xs text-muted-foreground">Changed sections compared with the active runtime: <strong>{changedSections.length ? changedSections.map(humanize).join(', ') : 'None'}</strong></p>
    {draft.kind === 'catalogue' ? <CatalogueProfileEditor payload={payload} programmeId={programmeId} onChange={setPayload} /> : <MethodologyEditor payload={payload} onChange={setPayload} />}
    {message ? <p role="status" className="mt-4 text-sm font-medium text-success">{message}</p> : null}{error ? <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p> : null}
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Publish these programme changes?</AlertDialogTitle><AlertDialogDescription>This saves the current fields and uploaded images, then updates Explore Programmes and future match records. Existing historical recommendations will not change.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continue editing</AlertDialogCancel><AlertDialogAction onClick={() => void publish()}>Save and publish</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
}

function CatalogueProfileEditor({ payload, programmeId, onChange }: { payload: Record<string, unknown>; programmeId?: string; onChange: (payload: Record<string, unknown>) => void }) {
  const programmes = (payload.programmes as Array<Record<string, unknown>> | undefined) ?? []
  const [openId, setOpenId] = useState<string | null>(programmeId ?? String(programmes[0]?.id ?? ''))
  const [uploading, setUploading] = useState<string | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [mediaMessage, setMediaMessage] = useState<string | null>(null)
  function updateProgramme(index: number, changes: Record<string, unknown>) {
    onChange({ ...payload, programmes: programmes.map((programme, itemIndex) => itemIndex === index ? { ...programme, ...changes } : programme) })
  }
  function stringList(value: unknown) { return Array.isArray(value) ? value.join('\n') : '' }
  function list(value: string) { return value.split('\n').map((item) => item.trim()).filter(Boolean) }
  function keyedLines(value: unknown, topics = false) { if (!value || typeof value !== 'object') return ''; return Object.entries(value as Record<string, unknown>).map(([key, item]) => `${key}: ${topics && Array.isArray(item) ? item.join('; ') : String(item ?? '')}`).join('\n') }
  function keyedRecord(value: string, topics = false) { return Object.fromEntries(value.split('\n').map((line) => { const divider = line.indexOf(':'); if (divider < 1) return null; const key = line.slice(0, divider).trim(); const raw = line.slice(divider + 1).trim(); return [key, topics ? raw.split(';').map((item) => item.trim()).filter(Boolean) : raw] as const }).filter((entry): entry is readonly [string, string | string[]] => entry !== null)) }
  async function upload(index: number, programmeId: string, kind: 'cover' | 'logo', file?: File) {
    if (!file) return
    setUploading(`${programmeId}-${kind}`); setMediaError(null); setMediaMessage(null)
    try {
      const media = await uploadProgrammeMedia(programmeId, kind, file)
      updateProgramme(index, { [kind === 'cover' ? 'cover_image_url' : 'logo_image_url']: media.url })
      setMediaMessage(`${kind === 'cover' ? 'Cover photo' : 'Programme logo'} uploaded and ready. Publish the changes to show it on student pages.`)
    } catch (reason) { setMediaError(reason instanceof Error ? reason.message : 'The image could not be uploaded.') }
    finally { setUploading(null) }
  }
  const visibleProgrammes = programmeId ? programmes.map((programme, index) => ({ programme, index })).filter(({ programme }) => String(programme.id) === programmeId) : programmes.map((programme, index) => ({ programme, index }))
  return <div className="mt-5 space-y-3">{mediaError ? <p role="alert" className="text-sm font-semibold text-destructive">{mediaError}</p> : null}{mediaMessage ? <p role="status" className="bg-success/10 p-3 text-sm font-semibold text-success">{mediaMessage}</p> : null}{visibleProgrammes.map(({ programme, index }) => {
    const id = String(programme.id)
    const open = openId === id
    const locked = [
      ['Degree type', String(programme.degree_type ?? 'Not published')],
      ['Duration', String((programme.duration as { display?: string } | null)?.display ?? 'Not published')],
      ['Starting salary', String((programme.salary as { display?: string } | null)?.display ?? 'Not published')],
      ['Job growth', String((programme.job_growth as { display?: string } | null)?.display ?? 'Not published')],
    ]
    return <section key={id} className="bg-background p-4 shadow-sm"><button type="button" className="flex min-h-12 w-full items-center justify-between gap-4 text-left" onClick={() => setOpenId(open ? null : id)} aria-expanded={open}><span><strong className="block font-display text-lg">{String(programme.short_label)}</strong><span className="text-sm text-muted-foreground">{String(programme.display_name)}</span></span><Badge variant={open ? 'secondary' : 'outline'}>{open ? 'Editing' : 'Edit programme'}</Badge></button>{open ? <div className="mt-5 space-y-6">
      <div className="grid gap-4 md:grid-cols-2"><EditField label="Programme name" id={`${id}-name`} value={String(programme.display_name ?? '')} onChange={(value) => updateProgramme(index, { display_name: value })} /><EditField label="Short label" id={`${id}-code`} value={String(programme.short_label ?? '')} onChange={(value) => updateProgramme(index, { short_label: value })} /></div>
      <div><Label htmlFor={`${id}-description`}>Student-facing description</Label><Textarea id={`${id}-description`} value={String(programme.description ?? '')} onChange={(event) => updateProgramme(index, { description: event.target.value })} className="mt-2 min-h-24" /></div>
      <div className="grid gap-4 md:grid-cols-2"><ListField label="Majors, one per line" id={`${id}-majors`} value={stringList(programme.majors)} onChange={(value) => updateProgramme(index, { majors: list(value) })} /><ListField label="RIASEC codes, one per line" id={`${id}-profile`} value={stringList(programme.riasec_profile)} onChange={(value) => updateProgramme(index, { riasec_profile: list(value).map((item) => item.toUpperCase()).slice(0, 3) })} /><ListField label="Learning areas, one per line" id={`${id}-areas`} value={stringList(programme.learning_areas)} onChange={(value) => updateProgramme(index, { learning_areas: list(value) })} /><ListField label="Learning descriptions, Area: description" id={`${id}-area-descriptions`} value={keyedLines(programme.learning_area_descriptions)} onChange={(value) => updateProgramme(index, { learning_area_descriptions: keyedRecord(value) })} /><ListField label="Learning topics, Area: topic; topic" id={`${id}-area-topics`} value={keyedLines(programme.learning_area_topics, true)} onChange={(value) => updateProgramme(index, { learning_area_topics: keyedRecord(value, true) })} /><ListField label="Career directions, one per line" id={`${id}-careers`} value={stringList(programme.career_directions)} onChange={(value) => updateProgramme(index, { career_directions: list(value) })} /><ListField label="Recommended SHS strands" id={`${id}-strands`} value={stringList(programme.recommended_strands)} onChange={(value) => updateProgramme(index, { recommended_strands: list(value) })} /></div>
      <div><h4 className="text-sm font-semibold">Images shown to students</h4><p className="mt-1 text-xs text-muted-foreground">Choose a JPEG, PNG, or WebP up to 5 MB. Confirm the preview, then use Publish to student pages above.</p><div className="mt-3 grid gap-4 md:grid-cols-2"><MediaField label="Programme cover photo" id={`${id}-cover`} preview={String(programme.cover_image_url ?? '')} busy={uploading === `${id}-cover`} onFile={(file) => void upload(index, id, 'cover', file)} /><MediaField label="Programme logo" id={`${id}-logo`} preview={String(programme.logo_image_url ?? '')} busy={uploading === `${id}-logo`} onFile={(file) => void upload(index, id, 'logo', file)} /></div></div>
      <section className="rounded-lg bg-secondary p-4"><div className="flex items-center gap-2"><LockKeyhole aria-hidden="true" className="size-4 text-primary" /><h4 className="text-sm font-semibold">API-controlled information</h4></div><p className="mt-1 text-xs text-muted-foreground">These values are read-only and are restored server-side if a request attempts to alter them.</p><dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{locked.map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}</dl></section>
    </div> : null}</section>
  })}</div>
}

function EditField({ label, id, value, onChange }: { label: string; id: string; value: string; onChange: (value: string) => void }) { return <div><Label htmlFor={id}>{label}</Label><Input id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2" /></div> }
function ListField({ label, id, value, onChange }: { label: string; id: string; value: string; onChange: (value: string) => void }) { return <div><Label htmlFor={id}>{label}</Label><Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-28" /></div> }
function MediaField({ label, id, preview, busy, onFile }: { label: string; id: string; preview: string; busy: boolean; onFile: (file?: File) => void }) { return <div className="rounded-lg bg-secondary p-4"><div className="flex items-center gap-3">{preview ? <img src={preview} alt="" className="size-16 rounded-lg bg-white object-cover" /> : <span className="flex size-16 items-center justify-center rounded-lg bg-background text-muted-foreground"><ImageUp aria-hidden="true" /></span>}<div className="min-w-0"><Label htmlFor={id}>{label}</Label><Input id={id} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => onFile(event.target.files?.[0])} className="mt-2" /></div></div></div> }

function MethodologyEditor({ payload, onChange }: { payload: Record<string, unknown>; onChange: (payload: Record<string, unknown>) => void }) {
  const display = (payload.display as Record<string, unknown>) ?? {}
  const tieBreak = (payload.tie_break as Record<string, unknown>) ?? {}
  return <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><Label htmlFor="default-count">Default recommendation count</Label><input id="default-count" type="number" min="1" max="11" value={Number(display.default_count ?? 3)} onChange={(event) => onChange({ ...payload, display: { ...display, default_count: Number(event.target.value) } })} className="mt-2 h-10 w-full rounded border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></div><div><Label htmlFor="tie-direction">Alphabetical tie direction</Label><select id="tie-direction" value={String(tieBreak.direction ?? 'ascending')} onChange={(event) => onChange({ ...payload, tie_break: { ...tieBreak, direction: event.target.value } })} className="mt-2 h-10 w-full rounded border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><option value="ascending">Ascending</option><option value="descending">Descending</option></select></div></div>
}

export { ConfigurationWorkflow }
