import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Target,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getProgrammeImages } from '@/features/student/programmes/programme-images'
import { programmeMediaStyle } from '@/features/student/programmes/programme-media-position'
import { CareerDirectionsSection } from '@/features/student/programmes/components/career-directions-section'
import type { StudentRecommendedCourse } from '@/features/student/recommendations/recommendation-types'

interface StudentRecommendationDetailPageProps {
  course: StudentRecommendedCourse
  generatedAt: string
  onBack: () => void
  onExploreProgrammes: () => void
}

const interestAreaNames: Record<string, string> = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
}

function describeFactor(factor: string) {
  const match = factor.match(/^Profile includes ([RIASEC])$/)
  if (!match) return factor

  const code = match[1]
  const name = interestAreaNames[code] ?? code
  return `${name} is one of the interest areas in this programme's recorded profile.`
}

function StudentRecommendationDetailPage({
  course,
  generatedAt,
  onBack,
  onExploreProgrammes,
}: StudentRecommendationDetailPageProps) {
  const fitLabel = course.match >= 80
    ? 'High Fit'
    : course.match >= 60
      ? 'Good Fit'
      : 'Developing Fit'
  const circleRadius = 43
  const circleLength = 2 * Math.PI * circleRadius
  const circleOffset = circleLength * (1 - Math.min(Math.max(course.match, 0), 100) / 100)
  const fallback = getProgrammeImages(course.id)
  const cover = course.coverImageUrl || fallback.cover
  const logo = course.logoImageUrl || fallback.logo
  const coverStyle = course.coverImageUrl ? programmeMediaStyle(course.coverImagePosition) : undefined
  const logoStyle = course.logoImageUrl ? programmeMediaStyle(course.logoImagePosition) : undefined
  const fitReasons = course.explanation
    ? [
        ...course.explanation.recordedProgrammeAreas.map((area) => `${area.label} recorded score: ${area.score}`),
        ...(course.explanation.learningAreas.length > 0
          ? [`Catalogue learning areas: ${course.explanation.learningAreas.join(', ')}`]
          : []),
      ]
    : course.factors.length > 0
      ? course.factors
      : course.interestAreas.map((area) => `Profile includes ${area}`)

  const programmeTypeLabel = course.eligibilityGroup === 'non_board'
    ? 'Non-board programme'
    : 'Board programme'

  const facts = [
    { label: 'Duration', value: course.duration || 'Not published', accent: false, icon: Clock3 },
    { label: 'Degree type', value: course.degreeType || 'Not published', accent: false, icon: GraduationCap },
    { label: 'Programme type', value: programmeTypeLabel, accent: true, icon: ShieldCheck },
    { label: 'Career directions', value: course.careerDirections.length > 0 ? `${course.careerDirections.length} to explore` : 'Not configured', accent: false, icon: BriefcaseBusiness },
  ]

  return (
    <article className="pb-16" aria-labelledby="course-detail-title">
      <header className="relative isolate min-h-[25rem] overflow-hidden bg-primary-fixed/45">
        {cover ? <img src={cover} alt="" style={coverStyle} className="absolute inset-0 -z-20 size-full object-cover object-center" /> : null}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-background/90 via-background/55 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/25 to-transparent" />
        <div className="student-page relative z-10 flex min-h-[25rem] items-center py-12 sm:py-16">
          {logo ? <img src={logo} alt={`${course.name} logo`} style={logoStyle} className={`absolute right-5 top-8 size-20 rounded-xl bg-white/90 p-2 shadow-sm sm:right-8 sm:size-28 lg:right-10 lg:top-12 lg:size-36 ${logoStyle ? 'object-cover' : 'object-contain'}`} /> : null}
          <div className="w-full">
            <span className="inline-flex rounded bg-primary px-3 py-1.5 font-label text-xs font-medium text-primary-foreground">
              Recommendation {course.rank} · {course.code}
            </span>
            <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-4xl pr-0 sm:pr-32 lg:pr-0">
                <h1 id="course-detail-title" className="font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                  {course.name}
                </h1>
                {course.summary ? (
                  <p className="mt-5 max-w-3xl text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8">
                    {course.summary}
                  </p>
                ) : null}
                <p className="mt-5 font-label text-xs text-muted-foreground">
                  Recommendation generated {generatedAt}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:pb-8">
                <Button type="button" variant="outline" onClick={onBack} className="min-h-12 bg-card">
                  <ArrowLeft aria-hidden="true" />
                  Back to matches
                </Button>
                <Button type="button" onClick={onExploreProgrammes} className="min-h-12">
                  Explore programmes
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="student-page mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.72fr)]">
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

          <section aria-labelledby="learning-areas-title" className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <BookOpen aria-hidden="true" className="size-5 text-primary" />
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Programme overview</p>
                <h2 id="learning-areas-title" className="font-display text-lg font-bold text-foreground sm:text-xl">Core learning areas</h2>
              </div>
            </div>
            {course.learningAreas.length > 0 ? (
              <ol className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card/60 overflow-hidden shadow-xs">
                {course.learningAreas.map((area, index) => (
                  <li key={area} className="flex items-start gap-4 p-4.5 sm:p-5 transition-colors hover:bg-card">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-fixed font-label text-xs font-bold text-on-primary-fixed">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-sm font-bold text-foreground sm:text-base">{area}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {course.learningAreaDescriptions?.[area] ?? 'A recorded learning area in the current programme catalogue.'}
                      </p>
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

          <section aria-labelledby="fit-reasons-title" className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <Target aria-hidden="true" className="size-5 text-primary" />
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Assessment connection</p>
                <h2 id="fit-reasons-title" className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">Why this fits you</h2>
              </div>
            </div>
            {fitReasons.length > 0 ? (
              <ol className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card/60 overflow-hidden shadow-xs">
                {fitReasons.map((reason, index) => (
                  <li key={`${reason}-${index}`} className="flex items-start gap-4 p-4.5 sm:p-5 transition-colors hover:bg-card">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary font-label text-xs font-bold text-foreground/80">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="pt-0.5 text-xs leading-relaxed text-foreground sm:text-sm sm:leading-6">
                      {describeFactor(reason)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No additional match factors were supplied for this recommendation.</p>
            )}
          </section>

        </div>

        <aside className="space-y-6">
          <section aria-labelledby="match-score-title" className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 id="match-score-title" className="text-center font-display text-lg font-bold">Your match score</h2>
            <div className="relative mx-auto mt-4 size-32" aria-hidden="true">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r={circleRadius} fill="none" stroke="currentColor" strokeWidth="7" className="text-secondary" />
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circleLength}
                  strokeDashoffset={circleOffset}
                  className="text-accent"
                />
              </svg>
              <strong className="absolute inset-0 flex items-center justify-center font-display text-3xl font-bold text-primary tabular-nums">
                {course.match}%
              </strong>
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-primary">{fitLabel}</p>
            <p className="mt-2 text-center text-xs leading-5 text-muted-foreground sm:text-sm">
              Based on the interest profile recorded in your completed assessment.
            </p>
            <div
              role="progressbar"
              aria-label={`${course.name} recorded match`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={course.match}
              className="sr-only"
            />
            <Button type="button" onClick={onBack} className="mt-5 w-full">
              View all matches
            </Button>

            <div className="mt-6 border-t border-border pt-5">
              <dl className="space-y-4">
                <div>
                  <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Programme code</dt>
                  <dd className="mt-1 font-semibold">{course.code}</dd>
                </div>
                <div>
                  <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Matched interest areas</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {course.interestAreas.length > 0
                      ? course.interestAreas.map((area) => (
                          <span key={area} className="outcome-chip" title={interestAreaNames[area]}>{area}</span>
                        ))
                      : <span className="text-sm text-muted-foreground">Not supplied</span>}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <CareerDirectionsSection directions={course.careerDirections} opportunities={course.careerOpportunities} />

        </aside>
      </div>
    </article>
  )
}

export { StudentRecommendationDetailPage }
