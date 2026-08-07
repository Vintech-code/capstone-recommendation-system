import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  Laptop,
  LibraryBig,
  Route,
  Scale,
  School,
  Stethoscope,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ErrorState, LoadingState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { StudentBreadcrumbs } from '@/features/student/components/student-breadcrumbs'
import { getProgrammeCatalogue } from '@/features/student/programmes/programme-api'
import type { StudentProgramme, StudentProgrammeCatalogue } from '@/features/student/programmes/programme-types'

interface StudentProgrammeCataloguePageProps {
  initialCatalogue?: StudentProgrammeCatalogue
}

const categoryDefinitions = [
  { id: 'technology', title: 'Technology', icon: Laptop, ids: ['bs-information-technology'] },
  { id: 'business', title: 'Business & Hospitality', icon: BriefcaseBusiness, ids: ['bs-business-administration', 'bs-hospitality-management'] },
  { id: 'education', title: 'Education', icon: GraduationCap, ids: ['bachelor-elementary-education', 'bachelor-secondary-education', 'bachelor-physical-education'] },
  { id: 'safety', title: 'Criminology & Public Safety', icon: Scale, ids: ['bs-criminology'] },
  { id: 'allied', title: 'Community, Health & Information', icon: HeartHandshake, ids: ['bs-midwifery', 'bachelor-library-information-science', 'bs-sociology', 'bs-community-development'] },
]

const strandLabels: Record<string, string> = {
  ABM: 'Accountancy, Business and Management',
  GAS: 'General Academic Strand',
  HUMSS: 'Humanities and Social Sciences',
  STEM: 'Science, Technology, Engineering and Mathematics',
  'Sports Track': 'Sports Track',
  'TVL-HE': 'Technical-Vocational-Livelihood – Home Economics',
  'TVL-ICT': 'Technical-Vocational-Livelihood – Information and Communications Technology',
}

function StudentProgrammeCataloguePage({ initialCatalogue }: StudentProgrammeCataloguePageProps) {
  const [catalogue, setCatalogue] = useState<StudentProgrammeCatalogue | null>(initialCatalogue ?? null)
  const [state, setState] = useState(initialCatalogue ? 'ready' : 'loading')
  const [selected, setSelected] = useState<StudentProgramme | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (initialCatalogue) return
    let active = true
    getProgrammeCatalogue()
      .then((data) => { if (active) { setCatalogue(data); setState('ready') } })
      .catch(() => active && setState('error'))
    return () => { active = false }
  }, [attempt, initialCatalogue])

  const groups = useMemo(() => categoryDefinitions.map((category) => ({
    ...category,
    programmes: category.ids
      .map((id) => catalogue?.programmes.find((programme) => programme.id === id))
      .filter(Boolean) as StudentProgramme[],
  })).filter((category) => category.programmes.length > 0), [catalogue])

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
    <div className="student-page pb-10">
      <section className="catalogue-hero" aria-labelledby="catalogue-title">
        <div className="relative z-10 max-w-3xl">
          <p className="student-kicker"><span /> Academic catalogue</p>
          <h1 id="catalogue-title" className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
            Discover your pathway to purpose
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/70">
            Explore the degree programmes currently covered by Pathways for Academic Year {catalogue.academicYear}.
          </p>
        </div>
        <div className="catalogue-count" aria-label={`${catalogue.programmes.length} degree programmes`}>
          <strong>{catalogue.programmes.length}</strong>
          <span>Degree programmes</span>
        </div>
      </section>

      <div className="mt-9 space-y-11">
        {groups.map((group, groupIndex) => (
          <section key={group.id} aria-labelledby={`${group.id}-title`} className={groupIndex % 2 ? 'catalogue-band' : ''}>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                <group.icon aria-hidden="true" className="size-5" />
              </span>
              <h2 id={`${group.id}-title`} className="font-display text-2xl font-semibold">{group.title}</h2>
            </div>
            <div className={`grid gap-4 ${group.programmes.length === 1 ? '' : 'md:grid-cols-2'} ${group.programmes.length >= 4 ? 'xl:grid-cols-4' : ''}`}>
              {group.programmes.map((programme, index) => (
                <ProgrammeCard
                  key={programme.id}
                  programme={programme}
                  featured={group.programmes.length === 1 || (groupIndex === 0 && index === 0)}
                  onSelect={() => setSelected(programme)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function ProgrammeCard({ programme, featured, onSelect }: { programme: StudentProgramme; featured: boolean; onSelect: () => void }) {
  const recommendedStrands = programme.recommendedStrands ?? []

  return (
    <article className={`programme-card ${featured ? 'programme-card-featured' : ''}`}>
      <div className="programme-visual" aria-hidden="true">
        <span className="programme-monogram">{programme.code.slice(0, 4)}</span>
        <Building2 className="size-16 opacity-25" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap gap-2" aria-label="Helpful Senior High School preparation">
          {recommendedStrands.map((strand) => <span key={strand} className="outcome-chip">{strand}</span>)}
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold leading-7">
          {programme.name} <span className="whitespace-nowrap">({programme.code})</span>
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{programme.description}</p>
        <Button type="button" onClick={onSelect} className="mt-5 w-fit rounded bg-primary px-5 font-label">
          Explore programme <ArrowRight aria-hidden="true" />
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

  return (
    <article className="pb-10">
      <StudentBreadcrumbs
        parentLabel="Explore Programs"
        currentLabel={programme.code}
        onParentSelect={onBack}
      />

      <div className="student-page">
      <header className="programme-detail-hero">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="outcome-chip">Academic Year {academicYear}</span>
            {recommendedStrands.map((strand) => <span key={strand} className="outcome-chip">{strand}</span>)}
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">{programme.name}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-foreground/70">{programme.description}</p>
        </div>
        <div className="programme-detail-mark" aria-hidden="true">
          <DetailIcon className="size-16" />
          <strong>{programme.code}</strong>
        </div>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <section aria-labelledby="learning-title" className="academic-panel">
          <p className="student-kicker"><span /> Programme overview</p>
          <h2 id="learning-title" className="mt-3 font-display text-2xl font-semibold">Learning areas</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {programme.learningAreas.map((area, index) => (
              <div key={area} className="learning-row">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{area}</h3>
                  {programme.learningAreaDescriptions?.[area] ? (
                    <p>{programme.learningAreaDescriptions[area]}</p>
                  ) : null}
                  {(programme.learningAreaTopics?.[area]?.length ?? 0) > 0 ? (
                    <ul className="learning-topics" aria-label={`${area} key topics`}>
                      {programme.learningAreaTopics?.[area]?.map((topic) => <li key={topic}>{topic}</li>)}
                    </ul>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="programme-facts-title" className="academic-panel">
          <h2 id="programme-facts-title" className="font-display text-xl font-semibold">Programme information</h2>
          <dl className="mt-5 divide-y divide-outline-variant/40">
            <div className="py-3 first:pt-0">
              <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Programme code</dt>
              <dd className="mt-1 font-semibold">{programme.code}</dd>
            </div>
            <div className="py-3">
              <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Academic year</dt>
              <dd className="mt-1 font-semibold">{academicYear}</dd>
            </div>
            <div className="py-3">
              <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">RIASEC profile</dt>
              <dd className="mt-1 font-semibold">{programme.riasecProfile.join(' / ')}</dd>
            </div>
            {programme.majors.length > 0 ? (
              <div className="py-3 last:pb-0">
                <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Available majors</dt>
                <dd className="mt-2">
                  <ul className="space-y-2">
                    {programme.majors.map((major) => (
                      <li key={major} className="flex gap-2 text-sm">
                        <GraduationCap aria-hidden="true" className="size-4 shrink-0 text-primary" />{major}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section aria-labelledby="strand-title" className="academic-panel programme-info-card">
          <div className="flex items-start gap-4">
            <span className="programme-section-icon"><School aria-hidden="true" /></span>
            <div>
              <p className="font-label text-xs font-medium uppercase tracking-[0.13em] text-primary">Senior High preparation</p>
              <h2 id="strand-title" className="mt-1 font-display text-2xl font-semibold">Helpful tracks and strands</h2>
            </div>
          </div>
          <ul className="mt-5 grid gap-3">
            {recommendedStrands.map((strand) => (
              <li key={strand} className="strand-row">
                <span className="strand-chip">{strand}</span>
                <span>{strandLabels[strand] ?? strand}</span>
              </li>
            ))}
          </ul>
          {programme.strandGuidance ? <p className="mt-4 text-sm leading-6 text-muted-foreground">{programme.strandGuidance}</p> : null}
          <p className="mt-4 rounded bg-primary-fixed/55 p-4 text-sm leading-6 text-foreground/80">
            These are helpful preparation pathways, not admission requirements. Students from other tracks or strands may still explore this programme and should follow TCC&apos;s current admission guidelines.
          </p>
        </section>

        <section aria-labelledby="career-title" className="academic-panel programme-info-card">
          <div className="flex items-start gap-4">
            <span className="programme-section-icon"><Route aria-hidden="true" /></span>
            <div>
              <p className="font-label text-xs font-medium uppercase tracking-[0.13em] text-primary">After graduation</p>
              <h2 id="career-title" className="mt-1 font-display text-2xl font-semibold">Possible career directions</h2>
            </div>
          </div>
          <ul className="mt-5 grid gap-3">
            {careerDirections.map((direction) => (
              <li key={direction} className="flex min-h-14 items-center gap-3 rounded bg-secondary p-4 text-sm font-medium">
                <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-primary" />
                {direction}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="readiness-title" className="programme-readiness mt-5">
        <Compass aria-hidden="true" className="size-8 shrink-0 text-secondary-container" />
        <div>
          <p className="font-label text-xs font-medium uppercase tracking-[0.13em] text-primary-fixed-dim">Student guide</p>
          <h2 id="readiness-title" className="mt-1 font-display text-2xl font-semibold text-white">Is this programme for you?</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/80">{programme.readinessPrompt}</p>
        </div>
      </section>
      </div>
    </article>
  )
}

export { StudentProgrammeCataloguePage }
