import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  Clock3,
  GraduationCap,
  GitCompareArrows,
  HeartHandshake,
  Laptop,
  LibraryBig,
  Scale,
  Search,
  School,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { ErrorState, LoadingState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import tccBanner from '@/assets/tccbanner.jpg'
import { ProgrammeComparisonSheet } from '@/features/student/programmes/components/programme-comparison-sheet'
import { getProgrammeCatalogue, getSavedProgrammeIds, updateSavedProgramme } from '@/features/student/programmes/programme-api'
import { getProgrammeImages } from '@/features/student/programmes/programme-images'
import { programmeMediaStyle } from '@/features/student/programmes/programme-media-position'
import type { StudentProgramme, StudentProgrammeCatalogue, StudentProgrammeMatchContext } from '@/features/student/programmes/programme-types'

interface StudentProgrammeCataloguePageProps {
  initialCatalogue?: StudentProgrammeCatalogue
  matchContext?: StudentProgrammeMatchContext[]
}

const categoryDefinitions = [
  { id: 'technology', title: 'Technology', icon: Laptop, ids: ['bs-information-technology'] },
  { id: 'business', title: 'Business & Hospitality', icon: BriefcaseBusiness, ids: ['bs-business-administration', 'bs-hospitality-management'] },
  { id: 'education', title: 'Education', icon: GraduationCap, ids: ['bachelor-elementary-education', 'bachelor-secondary-education', 'bachelor-physical-education'] },
  { id: 'safety', title: 'Criminology & Public Safety', icon: Scale, ids: ['bs-criminology'] },
  { id: 'allied', title: 'Community, Health & Information', icon: HeartHandshake, ids: ['bs-midwifery', 'bachelor-library-information-science', 'bs-sociology', 'bs-community-development'] },
]

const programmesPerBatch = 6

const riasecDefinitions = [
  { code: 'R', label: 'Realistic' },
  { code: 'I', label: 'Investigative' },
  { code: 'A', label: 'Artistic' },
  { code: 'S', label: 'Social' },
  { code: 'E', label: 'Enterprising' },
  { code: 'C', label: 'Conventional' },
]

type FilterSectionId = 'field' | 'riasec' | 'duration' | 'strand'

function FilterSection({ id, title, open, activeCount, onToggle, children }: { id: FilterSectionId; title: string; open: boolean; activeCount: number; onToggle: () => void; children: ReactNode }) {
  const panelId = `programme-filter-${id}`
  return (
    <section className="border-t border-outline-variant/50">
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle} className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left">
        <span className="font-label text-xs font-semibold uppercase tracking-[0.1em] text-foreground">{title}</span>
        <span className="flex items-center gap-2">
          {activeCount > 0 ? <span className="flex size-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">{activeCount}</span> : null}
          <ChevronDown aria-hidden="true" className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open ? <div id={panelId} role="group" aria-label={title} className="pb-3">{children}</div> : null}
    </section>
  )
}

const strandLabels: Record<string, string> = {
  ABM: 'Accountancy, Business and Management',
  GAS: 'General Academic Strand',
  HUMSS: 'Humanities and Social Sciences',
  STEM: 'Science, Technology, Engineering and Mathematics',
  'Sports Track': 'Sports Track',
  'TVL-HE': 'Technical-Vocational-Livelihood – Home Economics',
  'TVL-ICT': 'Technical-Vocational-Livelihood – Information and Communications Technology',
}

function StudentProgrammeCataloguePage({ initialCatalogue, matchContext = [] }: StudentProgrammeCataloguePageProps) {
  const [catalogue, setCatalogue] = useState<StudentProgrammeCatalogue | null>(initialCatalogue ?? null)
  const [state, setState] = useState(initialCatalogue ? 'ready' : 'loading')
  const [selected, setSelected] = useState<StudentProgramme | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRiasec, setSelectedRiasec] = useState<string[]>([])
  const [selectedStrands, setSelectedStrands] = useState<string[]>([])
  const [openFilterSection, setOpenFilterSection] = useState<FilterSectionId | null>('field')
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name')
  const [durationFilter, setDurationFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(programmesPerBatch)
  const [savedProgrammeIds, setSavedProgrammeIds] = useState<Set<string>>(new Set())
  const [savingProgrammeIds, setSavingProgrammeIds] = useState<Set<string>>(new Set())
  const [saveError, setSaveError] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  const [comparisonIds, setComparisonIds] = useState<Set<string>>(new Set())
  const [comparisonOpen, setComparisonOpen] = useState(false)

  const durationOptions = useMemo(() => Array.from(new Set(
    (catalogue?.programmes ?? [])
      .map((programme) => programme.duration?.display)
      .filter((value): value is string => Boolean(value)),
  )).sort((left, right) => left.localeCompare(right, undefined, { numeric: true })), [catalogue])
  const strandOptions = useMemo(() => Array.from(new Set(
    (catalogue?.programmes ?? []).flatMap((programme) => programme.recommendedStrands),
  )).sort(), [catalogue])
  useEffect(() => {
    if (initialCatalogue) return
    let active = true
    getProgrammeCatalogue()
      .then((data) => { if (active) { setCatalogue(data); setState('ready') } })
      .catch(() => active && setState('error'))
    return () => { active = false }
  }, [attempt, initialCatalogue])

  useEffect(() => {
    let active = true
    getSavedProgrammeIds()
      .then(({ programmeIds }) => { if (active) setSavedProgrammeIds(new Set(programmeIds)) })
      .catch(() => { if (active) setSaveError('Saved programmes could not be loaded.') })
    return () => { active = false }
  }, [])

  const visibleProgrammes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = (catalogue?.programmes ?? []).filter((programme) => {
      const category = categoryDefinitions.find((definition) => definition.ids.includes(programme.id))
      const matchesCategory = selectedCategories.length === 0 || (category && selectedCategories.includes(category.id))
      const matchesRiasec = selectedRiasec.length === 0 || selectedRiasec.some((code) => programme.riasecProfile.includes(code))
      const matchesDuration = durationFilter === 'all' || programme.duration?.display === durationFilter
      const matchesStrands = selectedStrands.length === 0 || selectedStrands.some((strand) => programme.recommendedStrands.includes(strand))
      const matchesSaved = !savedOnly || savedProgrammeIds.has(programme.id)
      const searchable = [programme.name, programme.code, programme.description, ...programme.learningAreas, ...programme.careerDirections]
        .join(' ')
        .toLowerCase()

      return matchesCategory && matchesRiasec && matchesDuration && matchesStrands && matchesSaved && (!normalizedQuery || searchable.includes(normalizedQuery))
    })

    return [...filtered].sort((left, right) => {
      if (sortBy === 'category') {
        const leftCategory = categoryDefinitions.find((definition) => definition.ids.includes(left.id))?.title ?? ''
        const rightCategory = categoryDefinitions.find((definition) => definition.ids.includes(right.id))?.title ?? ''
        const categoryOrder = leftCategory.localeCompare(rightCategory)
        if (categoryOrder !== 0) return categoryOrder
      }

      return left.name.localeCompare(right.name)
    })
  }, [catalogue, durationFilter, query, savedOnly, savedProgrammeIds, selectedCategories, selectedRiasec, selectedStrands, sortBy])
  const displayedProgrammes = visibleProgrammes.slice(0, visibleCount)
  const comparisonProgrammes = (catalogue?.programmes ?? []).filter((programme) => comparisonIds.has(programme.id))

  const toggleSavedProgramme = async (programmeId: string) => {
    const nextSaved = !savedProgrammeIds.has(programmeId)
    setSaveError('')
    setSavingProgrammeIds((current) => new Set(current).add(programmeId))
    try {
      await updateSavedProgramme(programmeId, nextSaved)
      setSavedProgrammeIds((current) => {
        const next = new Set(current)
        if (nextSaved) next.add(programmeId)
        else next.delete(programmeId)
        return next
      })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'The saved programme could not be updated.')
    } finally {
      setSavingProgrammeIds((current) => {
        const next = new Set(current)
        next.delete(programmeId)
        return next
      })
    }
  }

  const toggleComparison = (programmeId: string) => {
    setComparisonIds((current) => {
      const next = new Set(current)
      if (next.has(programmeId)) next.delete(programmeId)
      else if (next.size < 3) next.add(programmeId)
      return next
    })
  }

  if (state === 'loading') {
    return <LoadingState variant="catalogue" title="Loading academic programmes" description="Connecting to the current TCC catalogue." />
  }
  if (state === 'error' || !catalogue) {
    return (
      <ErrorState
        title="The programme catalogue could not be loaded"
        description="Check your connection and try again."
        onRetry={() => { setState('loading'); setAttempt((value) => value + 1) }}
      />
    )
  }
  if (selected) {
    return (
      <StudentProgrammeDetail
        programme={selected}
        academicYear={catalogue.academicYear}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div className="pb-16">
      <header className="relative isolate min-h-[25rem] overflow-hidden bg-primary text-primary-foreground shadow-sm lg:min-h-[30rem]">
        <img
          src={tccBanner}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/80 via-primary/35 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-primary/35 via-transparent to-white/5" />
        <div className="student-page py-12 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
          <p className="flex items-center gap-3 font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary-fixed sm:text-sm">
            <span className="h-9 w-1 rounded-full bg-secondary-container" />
            Academic catalogue
          </p>
          <h1 id="catalogue-title" className="mt-6 font-display text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">Explore TCC programmes</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            Search and filter the {catalogue.programmes.length} degree programmes covered for Academic Year {catalogue.academicYear}.
          </p>
          </div>
        </div>
      </header>

      <div className="student-page relative z-10 -mt-10 grid items-start gap-7 sm:-mt-14 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside aria-labelledby="programme-filters-title" className="rounded-xl bg-secondary p-5 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal aria-hidden="true" className="size-5 text-primary" />
              <h2 id="programme-filters-title" className="font-display text-xl font-semibold">Filters</h2>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedCategories([]); setSelectedRiasec([]); setSelectedStrands([]); setDurationFilter('all'); setSavedOnly(false); setQuery(''); setVisibleCount(programmesPerBatch) }}
              className="min-h-11 text-sm font-semibold text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="mt-3">
          <FilterSection id="field" title="Field of study" open={openFilterSection === 'field'} activeCount={selectedCategories.length} onToggle={() => setOpenFilterSection((current) => current === 'field' ? null : 'field')}>
            <div className="grid gap-1">
              {categoryDefinitions.map((category) => {
                const checked = selectedCategories.includes(category.id)
                return (
                  <label key={category.id} className="flex min-h-9 cursor-pointer items-center gap-2 rounded px-1 text-sm font-medium hover:bg-card/70">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedCategories((current) => checked
                          ? current.filter((id) => id !== category.id)
                          : [...current, category.id])
                        setVisibleCount(programmesPerBatch)
                      }}
                      className="size-4 rounded accent-primary"
                    />
                    <category.icon aria-hidden="true" className="size-4 text-primary" />
                    <span>{category.title}</span>
                  </label>
                )
              })}
            </div>
          </FilterSection>
          <FilterSection id="riasec" title="RIASEC interest" open={openFilterSection === 'riasec'} activeCount={selectedRiasec.length} onToggle={() => setOpenFilterSection((current) => current === 'riasec' ? null : 'riasec')}>
            <div className="grid grid-cols-3 gap-2">
              {riasecDefinitions.map(({ code, label }) => {
                const checked = selectedRiasec.includes(code)
                return (
                  <label key={code} className="cursor-pointer" title={label}>
                    <input
                      type="checkbox"
                      checked={checked}
                      aria-label={`${label} (${code})`}
                      onChange={() => {
                        setSelectedRiasec((current) => checked ? current.filter((item) => item !== code) : [...current, code])
                        setVisibleCount(programmesPerBatch)
                      }}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-9 items-center justify-center rounded border border-outline-variant bg-card text-sm font-bold text-primary transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-3 peer-focus-visible:ring-ring/30">
                      {code}
                    </span>
                  </label>
                )
              })}
            </div>
          </FilterSection>
          <FilterSection id="duration" title="Duration" open={openFilterSection === 'duration'} activeCount={durationFilter === 'all' ? 0 : 1} onToggle={() => setOpenFilterSection((current) => current === 'duration' ? null : 'duration')}>
            <div className="grid gap-1">
              {[['all', 'All durations'], ...durationOptions.map((duration) => [duration, duration])].map(([value, label]) => (
                <label key={value} className="flex min-h-9 cursor-pointer items-center gap-2 rounded px-1 text-sm font-medium hover:bg-card">
                  <input
                    type="radio"
                    name="programme-duration"
                    value={value}
                    checked={durationFilter === value}
                    onChange={() => { setDurationFilter(value); setVisibleCount(programmesPerBatch) }}
                    className="size-4 accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </FilterSection>
          <FilterSection id="strand" title="Recommended SHS strand" open={openFilterSection === 'strand'} activeCount={selectedStrands.length} onToggle={() => setOpenFilterSection((current) => current === 'strand' ? null : 'strand')}>
            <div className="grid gap-1">
              {strandOptions.map((strand) => (
                <label key={strand} className="flex min-h-9 cursor-pointer items-center gap-2 rounded px-1 text-sm hover:bg-card">
                  <input
                    type="checkbox"
                    checked={selectedStrands.includes(strand)}
                    onChange={() => {
                      setSelectedStrands((current) => current.includes(strand) ? current.filter((item) => item !== strand) : [...current, strand])
                      setVisibleCount(programmesPerBatch)
                    }}
                    className="size-4 rounded accent-primary"
                  />
                  {strand}
                </label>
              ))}
            </div>
          </FilterSection>
          <div className="border-t border-outline-variant/50 py-2">
            <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded px-1 text-sm font-medium hover:bg-card">
              <input
                type="checkbox"
                checked={savedOnly}
                onChange={(event) => { setSavedOnly(event.target.checked); setVisibleCount(programmesPerBatch) }}
                className="size-4 rounded accent-primary"
              />
              <BookmarkCheck aria-hidden="true" className="size-4 text-primary" />
              Show saved only
            </label>
          </div>
          </div>
          <p className="mt-4 rounded bg-card px-3 py-2.5 text-xs text-muted-foreground shadow-sm" role="status">
            Showing {displayedProgrammes.length} of {visibleProgrammes.length} matching programmes
          </p>
        </aside>

        <main aria-labelledby="catalogue-title">
          <div className="grid gap-4 rounded-xl bg-card p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center">
            <label className="relative block">
              <span className="sr-only">Search programmes</span>
              <Search aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setVisibleCount(programmesPerBatch) }}
                placeholder="Search courses, skills, or careers"
                className="min-h-12 w-full rounded-lg border border-input bg-secondary pl-12 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => { setSortBy(event.target.value as 'name' | 'category'); setVisibleCount(programmesPerBatch) }}
                className="min-h-12 rounded-lg border border-input bg-secondary px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="name">Course name</option>
                <option value="category">Field of study</option>
              </select>
            </label>
          </div>

          {visibleProgrammes.length > 0 ? (
            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              {displayedProgrammes.map((programme, index) => (
                <ProgrammeCard
                  key={programme.id}
                  programme={programme}
                  matchContext={matchContext.find((context) => context.programmeId === programme.id)}
                  saved={savedProgrammeIds.has(programme.id)}
                  saving={savingProgrammeIds.has(programme.id)}
                  selectedForComparison={comparisonIds.has(programme.id)}
                  comparisonDisabled={comparisonIds.size >= 3 && !comparisonIds.has(programme.id)}
                  priority={index < 2}
                  onSelect={() => setSelected(programme)}
                  onToggleSaved={() => void toggleSavedProgramme(programme.id)}
                  onToggleComparison={() => toggleComparison(programme.id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-xl bg-card p-8 text-center shadow-sm">
              <h2 className="font-display text-xl font-semibold">No programmes match these filters</h2>
              <p className="mt-2 text-sm text-muted-foreground">Clear a filter or try a broader search term.</p>
            </div>
          )}
          {displayedProgrammes.length < visibleProgrammes.length ? (
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-h-12 bg-card px-6"
                onClick={() => setVisibleCount((current) => Math.min(current + programmesPerBatch, visibleProgrammes.length))}
              >
                Load more programmes
                <ChevronDown aria-hidden="true" />
              </Button>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {visibleProgrammes.length - displayedProgrammes.length} more programmes available
              </p>
            </div>
          ) : null}
          {saveError ? <p role="alert" className="mt-5 rounded-lg bg-destructive/10 p-4 text-sm font-medium text-destructive">{saveError}</p> : null}
        </main>
      </div>

      {comparisonIds.size > 0 ? (
        <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-xl bg-primary px-5 py-4 text-primary-foreground shadow-xl" data-print-hidden>
          <div>
            <p className="font-semibold">{comparisonIds.size} of 3 selected</p>
            <p className="text-xs text-primary-foreground/75">{comparisonIds.size < 2 ? 'Select one more programme to compare.' : 'Ready for side-by-side comparison.'}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" onClick={() => setComparisonIds(new Set())}>Clear</Button>
            <Button type="button" className="bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim" disabled={comparisonIds.size < 2} onClick={() => setComparisonOpen(true)}>
              Compare now
            </Button>
          </div>
        </div>
      ) : null}

      <ProgrammeComparisonSheet open={comparisonOpen} onOpenChange={setComparisonOpen} programmes={comparisonProgrammes} />
    </div>
  )
}

function ProgrammeCard({
  programme,
  matchContext,
  saved,
  saving,
  selectedForComparison,
  comparisonDisabled,
  priority,
  onSelect,
  onToggleSaved,
  onToggleComparison,
}: {
  programme: StudentProgramme
  matchContext?: StudentProgrammeMatchContext
  saved: boolean
  saving: boolean
  selectedForComparison: boolean
  comparisonDisabled: boolean
  priority: boolean
  onSelect: () => void
  onToggleSaved: () => void
  onToggleComparison: () => void
}) {
  const fallback = getProgrammeImages(programme.id)
  const cover = programme.coverImageUrl || fallback.cover
  const coverStyle = programme.coverImageUrl ? programmeMediaStyle(programme.coverImagePosition) : undefined
  const category = categoryDefinitions.find((definition) => definition.ids.includes(programme.id))

  return (
    <article className="group relative flex min-h-[27rem] w-full flex-col overflow-hidden rounded-3xl border border-border bg-card text-left shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <button type="button" onClick={onSelect} aria-label={`View programme details: ${programme.name}`} className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/40" />
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-secondary">
        {cover ? (
          <img src={cover} alt={`${programme.name} programme`} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" style={coverStyle} className={`absolute inset-0 size-full object-cover transition-transform duration-300 ${coverStyle ? '' : 'group-hover:scale-105'}`} />
        ) : (
          <>
            <span className="programme-monogram">{programme.code.slice(0, 4)}</span>
            <Building2 className="size-16 opacity-25" />
          </>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
          {category?.title ?? 'Degree programme'}
        </span>
        <button
          type="button"
          disabled={saving}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${programme.name} from saved programmes` : `Save ${programme.name}`}
          onClick={onToggleSaved}
          className="absolute right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full bg-card/95 text-primary shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          {saved ? <BookmarkCheck aria-hidden="true" className="size-5" /> : <Bookmark aria-hidden="true" className="size-5" />}
        </button>
        <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold leading-7 transition-colors group-hover:text-primary">
          {programme.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{programme.description}</p>

        {matchContext ? (
          <div className="mt-3 rounded-lg bg-primary-fixed/65 px-3 py-2 text-xs text-on-primary-fixed">
            <strong>{matchContext.match}% match</strong>
            <span className="ml-2">Why this matches me: {matchContext.factors[0] || 'Aligned with your recorded RIASEC profile.'}</span>
          </div>
        ) : null}

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div className="min-w-0">
            <dt className="flex items-center gap-1.5 text-muted-foreground"><ShieldCheck aria-hidden="true" className="size-4 text-primary" />Programme type</dt>
            <dd className="mt-1 truncate font-semibold">{programme.eligibilityGroup === 'non_board' ? 'Non-board programme' : 'Board programme'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="flex items-center gap-1.5 text-muted-foreground"><BriefcaseBusiness aria-hidden="true" className="size-4 text-primary" />Career field</dt>
            <dd className="mt-1 truncate font-semibold">{programme.careerDirections[0] || 'Various pathways'}</dd>
          </div>
        </dl>

        <div className="mt-auto grid grid-cols-2 gap-3 border-t border-outline-variant/45 pt-4 text-xs">
          <span className="font-semibold">
            <span className="flex items-center gap-1.5" title={programme.duration?.source_name}><Clock3 aria-hidden="true" className="size-4 text-primary" />{programme.duration?.display || 'Not published'}</span>
            {programme.duration?.source_url ? <a href={programme.duration.source_url} target="_blank" rel="noreferrer" className="relative z-20 mt-1 inline-block text-[11px] text-primary underline underline-offset-4">CHED source</a> : null}
          </span>
          <span className="flex items-center justify-end gap-1.5 truncate text-right text-muted-foreground"><GraduationCap aria-hidden="true" className="size-4 shrink-0 text-primary" />{programme.degreeType || 'Not published'}</span>
        </div>
        <Button
          type="button"
          variant={selectedForComparison ? 'secondary' : 'outline'}
          disabled={comparisonDisabled}
          aria-pressed={selectedForComparison}
          onClick={onToggleComparison}
          className="relative z-20 mt-4 w-full"
        >
          <GitCompareArrows aria-hidden="true" />
          {selectedForComparison ? 'Selected to compare' : 'Add to comparison'}
        </Button>
      </div>
    </article>
  )
}

function StudentProgrammeDetail({ programme, academicYear, onBack }: { programme: StudentProgramme; academicYear: string; onBack: () => void }) {
  const careerDirections = programme.careerDirections ?? []
  const recommendedStrands = programme.recommendedStrands ?? []
  const DetailIcon = programme.id.includes('midwifery')
    ? Stethoscope
    : programme.id.includes('library')
      ? LibraryBig
      : BookOpen
  const fallback = getProgrammeImages(programme.id)
  const cover = programme.coverImageUrl || fallback.cover
  const logo = programme.logoImageUrl || fallback.logo
  const coverStyle = programme.coverImageUrl ? programmeMediaStyle(programme.coverImagePosition) : undefined
  const logoStyle = programme.logoImageUrl ? programmeMediaStyle(programme.logoImagePosition) : undefined

  const facts = [
    { label: 'Programme code', value: programme.code, icon: BookOpen, accent: false },
    { label: 'Programme type', value: programme.eligibilityGroup === 'non_board' ? 'Non-board programme' : 'Board programme', icon: ShieldCheck, accent: true },
    { label: 'Academic year', value: academicYear, icon: CalendarDays, accent: false },
    { label: 'Degree type', value: programme.degreeType || "Bachelor's degree", icon: GraduationCap, accent: false },
  ]

  return (
    <article className="pb-16" aria-labelledby="catalogue-detail-title">
      <header className="relative isolate min-h-[24rem] overflow-hidden bg-primary-fixed/45">
        {cover ? <img src={cover} alt="" style={coverStyle} className="absolute inset-0 -z-20 size-full object-cover object-center" /> : null}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="student-page grid min-h-[24rem] items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_12rem] lg:py-14">
          <div className="pr-0 sm:pr-28 lg:pr-0">
            <Button type="button" variant="outline" onClick={onBack} className="mb-5 bg-card/80">
              Back to programmes
            </Button>
            <div className="flex flex-wrap gap-2">
              <span className="outcome-chip">Academic Year {academicYear}</span>
              {recommendedStrands.map((strand) => <span key={strand} className="outcome-chip">{strand}</span>)}
            </div>
            <h1 id="catalogue-detail-title" className="mt-4 max-w-4xl font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">{programme.name}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-foreground/70">{programme.description}</p>
          </div>
          {logo ? (
            <img src={logo} alt={`${programme.name} logo`} style={logoStyle} className={`absolute right-5 top-7 size-20 rounded-xl bg-white/90 p-2 shadow-sm sm:right-8 sm:size-28 lg:static lg:size-44 lg:justify-self-end ${logoStyle ? 'object-cover' : 'object-contain'}`} />
          ) : (
            <div className="programme-detail-mark" aria-hidden="true"><DetailIcon className="size-16" /><strong>{programme.code}</strong></div>
          )}
        </div>
      </header>

      <div className="student-page mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.75fr)]">
        <div className="space-y-8">
          <dl className="grid grid-cols-2 gap-4 border-b border-border/80 pb-6 sm:grid-cols-4 sm:gap-6">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0">
                <dt className="flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <fact.icon aria-hidden="true" className="size-3.5 text-primary" />
                  {fact.label}
                </dt>
                <dd className="mt-1.5">
                  <span className={`block font-display text-base font-bold sm:text-lg ${fact.accent ? 'text-primary' : 'text-foreground'}`}>
                    {fact.value}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="learning-title" className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <BookOpen aria-hidden="true" className="size-5 text-primary" />
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Programme overview</p>
                <h2 id="learning-title" className="font-display text-lg font-bold text-foreground sm:text-xl">Learning areas</h2>
              </div>
            </div>
            {programme.learningAreas.length > 0 ? (
              <ol className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card/60 overflow-hidden shadow-xs">
                {programme.learningAreas.map((area, index) => (
                  <li key={area} className="flex items-start gap-4 p-4.5 sm:p-5 transition-colors hover:bg-card">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-fixed font-label text-xs font-bold text-on-primary-fixed">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-sm font-bold text-foreground sm:text-base">{area}</h3>
                      {programme.learningAreaDescriptions?.[area] ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                          {programme.learningAreaDescriptions[area]}
                        </p>
                      ) : null}
                      {(programme.learningAreaTopics?.[area]?.length ?? 0) > 0 ? (
                        <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label={`${area} key topics`}>
                          {programme.learningAreaTopics?.[area]?.map((topic) => (
                            <li key={topic} className="rounded-md bg-secondary/80 px-2.5 py-0.5 font-label text-[11px] font-medium text-foreground/80">
                              {topic}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                Learning areas are not available for this programme.
              </p>
            )}
          </section>

          {recommendedStrands.length > 0 ? (
            <section aria-labelledby="strand-title" className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <School aria-hidden="true" className="size-5 text-primary" />
                <div>
                  <p className="font-label text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Senior High preparation</p>
                  <h2 id="strand-title" className="font-display text-lg font-bold text-foreground sm:text-xl">Helpful tracks and strands</h2>
                </div>
              </div>
              <ul className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card/60 overflow-hidden shadow-xs">
                {recommendedStrands.map((strand) => (
                  <li key={strand} className="flex items-center gap-3.5 p-4 transition-colors hover:bg-card sm:px-5">
                    <span className="inline-flex min-h-7 items-center rounded-lg bg-primary-fixed px-2.5 font-label text-xs font-bold text-on-primary-fixed">
                      {strand}
                    </span>
                    <span className="text-xs font-medium text-foreground sm:text-sm">
                      {strandLabels[strand] ?? strand}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section aria-labelledby="programme-facts-title" className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 id="programme-facts-title" className="font-display text-base font-bold text-foreground">Programme information</h2>
            <dl className="mt-4 space-y-4 text-xs sm:text-sm">
              <div>
                <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Programme code</dt>
                <dd className="mt-1 font-semibold text-foreground">{programme.code}</dd>
              </div>
              <div>
                <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">RIASEC profile</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {programme.riasecProfile.map((code) => (
                    <span key={code} className="outcome-chip">{code}</span>
                  ))}
                </dd>
              </div>
              {programme.majors.length > 0 ? (
                <div>
                  <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Available majors</dt>
                  <dd className="mt-2">
                    <ul className="space-y-1.5">
                      {programme.majors.map((major) => (
                        <li key={major} className="flex items-center gap-2 text-xs font-medium text-foreground">
                          <GraduationCap aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
                          {major}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          {careerDirections.length > 0 ? (
            <section aria-labelledby="career-title" className="space-y-3">
              <div className="flex items-center gap-2.5">
                <BriefcaseBusiness aria-hidden="true" className="size-4 text-primary" />
                <h2 id="career-title" className="font-display text-base font-bold text-foreground">Possible career directions</h2>
              </div>
              <ul className="space-y-2">
                {careerDirections.map((direction) => (
                  <li key={direction} className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-secondary/70 px-4 py-2.5 transition-colors">
                    <span className="text-xs font-medium leading-5 text-foreground sm:text-sm">{direction}</span>
                    <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  )
}

export { StudentProgrammeCataloguePage }
