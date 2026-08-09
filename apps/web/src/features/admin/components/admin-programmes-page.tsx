import {
  AlertTriangle,
  BadgeDollarSign,
  BookOpen,
  Clock3,
  ExternalLink,
  Eye,
  GraduationCap,
  Pencil,
  Search,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AdminPageError, AdminPageHeader, AdminPageSkeleton, EmptyPanel } from '@/features/admin/components/admin-shared'
import { ConfigurationWorkflow } from '@/features/admin/components/configuration-workflow'
import { useAdminResource, type AdminProgramme, type AdminProgrammeCatalogue } from '@/features/admin/data/admin-api'
import { getProgrammeImages } from '@/features/student/programmes/programme-images'

const programmeGroups = [
  { label: 'Technology', ids: ['bs-information-technology'] },
  { label: 'Business & Hospitality', ids: ['bs-business-administration', 'bs-hospitality-management'] },
  { label: 'Education', ids: ['bachelor-elementary-education', 'bachelor-secondary-education', 'bachelor-physical-education'] },
  { label: 'Criminology & Public Safety', ids: ['bs-criminology'] },
  { label: 'Community, Health & Information', ids: ['bs-midwifery', 'bachelor-library-information-science', 'bs-sociology', 'bs-community-development'] },
]

function programmeGroup(programmeId: string) {
  return programmeGroups.find((group) => group.ids.includes(programmeId))?.label ?? 'Academic programme'
}

function AdminProgrammesPage() {
  const resource = useAdminResource<AdminProgrammeCatalogue>('/programmes')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'review'>('all')
  const [selected, setSelected] = useState<AdminProgramme | null>(null)
  const [editing, setEditing] = useState<AdminProgramme | null>(null)

  const visibleProgrammes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return (resource.data?.programmes ?? []).filter((programme) => {
      const searchable = [programme.code, programme.name, programme.description, programmeGroup(programme.id), ...programme.learningAreas, ...programme.careerDirections].join(' ').toLowerCase()
      const matchesFilter = filter === 'all'
        || (filter === 'confirmed' && programme.duration?.status === 'ched_psg')
        || (filter === 'review' && programme.duration?.status !== 'ched_psg')
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [filter, query, resource.data])

  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No programme data was returned.'} onRetry={resource.retry} />

  const catalogue = resource.data
  const confirmedDurations = catalogue.programmes.filter((programme) => programme.duration?.status === 'ched_psg').length

  return <div className="space-y-6">
    <AdminPageHeader
      eyebrow={`Academic Year ${catalogue.academicYear}`}
      title="Programme monitoring"
      description="Monitor the same catalogue content students see, its official-source coverage, and how programmes appear across saved choices, recommendations, and guidance requests."
    />

    <section className="grid gap-4 rounded-xl bg-card p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center" aria-labelledby="catalogue-monitoring-heading">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Active student catalogue</p><h2 id="catalogue-monitoring-heading" className="mt-1 font-display text-xl font-bold">Academic Year {catalogue.academicYear}</h2><p className="mt-1 text-sm text-muted-foreground">The same programme content currently shown in Explore and My Matches.</p></div>
      <div className="bg-secondary px-5 py-3"><p className="text-xs text-muted-foreground">Programmes</p><p className="mt-1 font-display text-2xl font-bold">{catalogue.programmes.length}</p></div>
      <div className="bg-primary-fixed px-5 py-3 text-on-primary-fixed"><p className="text-xs">CHED durations</p><p className="mt-1 font-display text-2xl font-bold">{confirmedDurations}/{catalogue.programmes.length}</p></div>
    </section>

    <section className="grid gap-4 rounded-xl bg-card p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_15rem]" aria-label="Programme filters">
      <label className="relative"><span className="sr-only">Search programme catalogue</span><Search aria-hidden="true" className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search programmes, learning areas, or careers" className="min-h-12 rounded-lg pl-11" /></label>
      <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Source status<select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="min-h-12 rounded-lg border border-input bg-background px-3 text-sm font-semibold text-foreground"><option value="all">All programmes</option><option value="confirmed">CHED duration confirmed</option><option value="review">Needs source review</option></select></label>
    </section>

    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Student-view parity</p><h2 className="mt-1 font-display text-2xl font-semibold">Active programme cards</h2></div><p className="text-sm text-muted-foreground">Showing {visibleProgrammes.length} of {catalogue.programmes.length}</p></div>

    {visibleProgrammes.length ? <section className="grid gap-6 xl:grid-cols-2" aria-label="Programme catalogue monitoring cards">{visibleProgrammes.map((programme) => <AdminProgrammeCard key={programme.id} programme={programme} onInspect={() => setSelected(programme)} onEdit={() => setEditing(programme)} />)}</section> : <EmptyPanel title="No programmes match this view" description="Clear the search or choose another monitoring filter." />}

    <AdminProgrammeSheet programme={selected} onOpenChange={(open) => { if (!open) setSelected(null) }} />
    <ProgrammeEditorSheet programme={editing} onOpenChange={(open) => { if (!open) setEditing(null) }} onPublished={resource.retry} />
  </div>
}

function AdminProgrammeCard({ programme, onInspect, onEdit }: { programme: AdminProgramme; onInspect: () => void; onEdit: () => void }) {
  const fallback = getProgrammeImages(programme.id)
  const cover = programme.coverImageUrl || fallback.cover
  const needsReview = programme.duration?.status !== 'ched_psg'
  return <article className="group overflow-hidden rounded-xl bg-card shadow-sm">
    <div className="relative h-44 overflow-hidden bg-primary/10">{cover ? <img src={cover} alt={`${programme.name} programme`} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <BookOpen aria-hidden="true" className="absolute inset-0 m-auto size-16 text-primary/25" />}<div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent" /><span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">{programmeGroup(programme.id)}</span><Badge variant={needsReview ? 'warning' : 'success'} className="absolute bottom-4 left-4">{needsReview ? 'Source review needed' : 'CHED duration sourced'}</Badge></div>
    <div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{programme.code}</p><h3 className="mt-2 font-display text-xl font-semibold leading-7">{programme.name}</h3></div><div className="flex shrink-0 gap-1" aria-label={`RIASEC profile ${programme.profile.join(', ')}`}>{programme.profile.map((code) => <span key={code} className="flex size-8 items-center justify-center rounded-lg bg-primary-fixed text-xs font-bold text-on-primary-fixed">{code}</span>)}</div></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{programme.description}</p>
      <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm"><CardDatum icon={Clock3} label="Duration" value={programme.duration?.display || 'Not published'} /><CardDatum icon={GraduationCap} label="Degree type" value={programme.degreeType || 'Not published'} /><CardDatum icon={BadgeDollarSign} label="Starting salary" value={programme.salary?.display || 'Not published'} /><CardDatum icon={TrendingUp} label="Job growth" value={programme.jobGrowth?.display || 'Not published'} /></dl>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">{programme.duration?.source_url ? <a href={programme.duration.source_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary underline underline-offset-4">{programme.duration.source_name || 'CHED source'}<ExternalLink aria-hidden="true" className="size-3" /></a> : <span className="text-xs text-muted-foreground">No duration source published</span>}<div className="flex gap-2"><Button type="button" variant="ghost" className="rounded-lg" onClick={onInspect}><Eye aria-hidden="true" />View details</Button><Button type="button" className="rounded-lg" onClick={onEdit}><Pencil aria-hidden="true" />Edit programme</Button></div></div>
    </div>
  </article>
}

function ProgrammeEditorSheet({ programme, onOpenChange, onPublished }: { programme: AdminProgramme | null; onOpenChange: (open: boolean) => void; onPublished: () => void }) {
  if (!programme) return null
  return <Sheet open onOpenChange={onOpenChange}><SheetContent className="w-[min(56rem,96vw)] max-w-none overflow-y-auto p-0"><div className="sticky top-0 z-10 bg-primary px-6 py-5 text-primary-foreground"><SheetHeader><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">Programme editor · {programme.code}</p><SheetTitle className="text-primary-foreground">Edit {programme.name}</SheetTitle><SheetDescription className="text-primary-foreground/75">Update student-visible content and media here. CHED and Philippine API fields remain locked.</SheetDescription></SheetHeader></div><div className="p-5"><ConfigurationWorkflow kind="catalogue" programmeId={programme.id} onPublished={onPublished} /></div></SheetContent></Sheet>
}

function AdminProgrammeSheet({ programme, onOpenChange }: { programme: AdminProgramme | null; onOpenChange: (open: boolean) => void }) {
  if (!programme) return null
  const fallback = getProgrammeImages(programme.id)
  const cover = programme.coverImageUrl || fallback.cover
  const logo = programme.logoImageUrl || fallback.logo
  return <Sheet open onOpenChange={onOpenChange}><SheetContent className="w-[min(48rem,96vw)] max-w-none overflow-y-auto p-0"><div className="relative h-52 overflow-hidden bg-primary">{cover ? <img src={cover} alt="" className="size-full object-cover" /> : null}<div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />{logo ? <img src={logo} alt="" className="absolute bottom-5 right-6 size-16 rounded-lg bg-white object-contain p-1 shadow-sm" /> : null}</div><div className="p-6"><SheetHeader><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{programme.code} · {programmeGroup(programme.id)}</p><SheetTitle className="font-display text-3xl font-semibold">{programme.name}</SheetTitle><SheetDescription>{programme.description}</SheetDescription></SheetHeader>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2"><DetailDatum label="Degree type" value={programme.degreeType || 'Not published'} /><DetailDatum label="Duration" value={programme.duration?.display || 'Not published'} /><DetailDatum label="Starting salary" value={programme.salary?.display || 'Not published'} /><DetailDatum label="Job growth" value={programme.jobGrowth?.display || 'Not published'} /></dl>
      <SourcePanel title="Duration source" value={programme.duration} /><SourcePanel title="Starting salary source" value={programme.salary} /><SourcePanel title="Job growth source" value={programme.jobGrowth} />
      <DetailSection title="Learning areas" items={programme.learningAreas} descriptions={programme.learningAreaDescriptions} topics={programme.learningAreaTopics} /><DetailSection title="Possible career directions" items={programme.careerDirections} />{programme.majors.length ? <DetailSection title="Recorded majors" items={programme.majors} /> : null}<DetailSection title="Recommended SHS strands" items={programme.recommendedStrands} />
    </div></SheetContent></Sheet>
}

function CardDatum({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) { return <div><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Icon aria-hidden="true" className="size-4 text-primary" />{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div> }
function DetailDatum({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-secondary p-4"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div> }
function SourcePanel({ title, value }: { title: string; value: AdminProgramme['duration'] }) { if (!value) return null; return <section className="mt-4 rounded-lg bg-secondary p-4"><div className="flex items-start gap-3">{value.status === 'ched_psg' ? <BookOpen aria-hidden="true" className="mt-0.5 size-5 text-primary" /> : <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 text-warning" />}<div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{value.note || value.display}</p>{value.source_url ? <a href={value.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4">{value.source_name || 'Open source'}<ExternalLink aria-hidden="true" className="size-3" /></a> : null}</div></div></section> }
function DetailSection({ title, items, descriptions, topics }: { title: string; items: string[]; descriptions?: Record<string, string>; topics?: Record<string, string[]> }) { return <section className="mt-6"><h3 className="font-display text-lg font-semibold">{title}</h3>{items.length ? <ul className="mt-3 grid gap-3 sm:grid-cols-2">{items.map((item) => <li key={item} className="rounded-lg bg-secondary p-4"><strong className="text-sm">{item}</strong>{descriptions?.[item] ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{descriptions[item]}</p> : null}{topics?.[item]?.length ? <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">{topics[item].map((topic) => <li key={topic}>{topic}</li>)}</ul> : null}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No published entries.</p>}</section> }

export { AdminProgrammesPage }
