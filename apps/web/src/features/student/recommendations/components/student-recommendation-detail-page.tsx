import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  Compass,
  GraduationCap,
  Target,
  TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getProgrammeImages } from '@/features/student/programmes/programme-images'
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
  const fitReasons = course.factors.length > 0
    ? course.factors
    : course.interestAreas.map((area) => `Profile includes ${area}`)
  const facts = [
    { label: 'Duration', value: course.duration || 'Not published', accent: false, icon: Clock3 },
    { label: 'Degree type', value: course.degreeType || 'Not published', accent: false, icon: GraduationCap },
    { label: 'Starting salary', value: course.salary?.display || 'Not published', accent: false, icon: BadgeDollarSign },
    { label: 'Job growth', value: course.jobGrowth?.display || 'Not published', accent: true, icon: TrendingUp },
  ]

  return (
    <article className="pb-16" aria-labelledby="course-detail-title">
      <header className="relative isolate min-h-[25rem] overflow-hidden bg-primary-fixed/45">
        {cover ? <img src={cover} alt="" className="absolute inset-0 -z-20 size-full object-cover object-center" /> : null}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-background/90 via-background/55 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/25 to-transparent" />
        <div className="student-page relative z-10 flex min-h-[25rem] items-center py-12 sm:py-16">
          {logo ? <img src={logo} alt={`${course.name} logo`} className="absolute right-5 top-8 size-20 rounded-xl bg-white/90 object-contain p-2 shadow-sm sm:right-8 sm:size-28 lg:right-10 lg:top-12 lg:size-36" /> : null}
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

      <div className="student-page mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.72fr)]">
        <div className="space-y-10">
          <dl className="relative grid overflow-hidden rounded-xl bg-card p-6 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
            <span aria-hidden="true" className="absolute -right-12 -top-12 size-28 rounded-full bg-primary/5 blur-2xl" />
            {facts.map((fact) => (
              <div key={fact.label} className="relative min-w-0 py-3 sm:px-4 sm:py-1 first:pl-0 last:pr-0">
                <dt className="flex items-center gap-2 font-label text-[11px] font-medium uppercase tracking-[0.11em] text-muted-foreground">
                  <fact.icon aria-hidden="true" className="size-4 text-primary" />
                  {fact.label}
                </dt>
                <dd className="mt-1.5">
                  <span className={`block font-display text-xl font-semibold leading-7 ${fact.accent ? 'text-accent' : 'text-foreground'}`}>
                    {fact.value}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="learning-areas-title">
            <div className="mb-5 flex items-center gap-3">
              <BookOpen aria-hidden="true" className="size-7 text-primary" />
              <div>
                <p className="font-label text-xs uppercase tracking-[0.12em] text-muted-foreground">Programme overview</p>
                <h2 id="learning-areas-title" className="font-display text-2xl font-semibold sm:text-3xl">Core learning areas</h2>
              </div>
            </div>
            {course.learningAreas.length > 0 ? (
              <ol className="grid gap-4 sm:grid-cols-2">
                {course.learningAreas.map((area, index) => (
                  <li key={area} className="min-h-32 rounded-lg bg-secondary p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-lg font-semibold leading-6">{area}</h3>
                      <span className="font-label text-xs font-semibold text-primary">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {course.learningAreaDescriptions?.[area] ?? 'A recorded learning area in the current programme catalogue.'}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-lg bg-card p-5 text-sm text-muted-foreground shadow-sm">
                Learning areas are not available for this programme.
              </p>
            )}
          </section>

          <section aria-labelledby="fit-reasons-title" className="overflow-hidden rounded-xl bg-brand-dark px-6 py-7 text-white shadow-sm sm:px-8 sm:py-9">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded bg-white/10">
                <Target aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-label text-xs uppercase tracking-[0.12em] text-white/65">Assessment connection</p>
                <h2 id="fit-reasons-title" className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Why this fits you</h2>
              </div>
            </div>
            {fitReasons.length > 0 ? (
              <ol className="mt-7 grid gap-3 sm:grid-cols-2">
                {fitReasons.map((reason, index) => (
                  <li key={`${reason}-${index}`} className="flex min-h-28 items-start gap-4 rounded bg-white/[0.08] p-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded bg-accent font-label text-xs font-bold text-accent-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm leading-6 text-white/85">{describeFactor(reason)}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 text-sm text-white/75">No additional match factors were supplied for this recommendation.</p>
            )}
          </section>

        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <section aria-labelledby="match-score-title" className="overflow-hidden rounded-lg bg-card shadow-[inset_0_3px_0_var(--accent),0_2px_8px_var(--shadow-primary)]">
            <div className="p-6 text-center">
              <h2 id="match-score-title" className="font-display text-xl font-semibold">Your match score</h2>
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
              <p className="mt-3 text-sm font-semibold text-primary">{fitLabel}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
            </div>
          </section>

          <section aria-labelledby="career-directions-title" className="rounded-xl bg-secondary p-5">
            <div className="flex items-center gap-3">
              <BriefcaseBusiness aria-hidden="true" className="size-5 text-primary" />
              <h2 id="career-directions-title" className="font-display text-xl font-semibold">Related fields</h2>
            </div>
            {course.careerDirections.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {course.careerDirections.map((direction) => (
                  <li key={direction} className="flex min-h-14 items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 shadow-sm">
                    <span className="text-sm font-semibold leading-5">{direction}</span>
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            ) : <p className="mt-4 text-sm text-muted-foreground">Related fields are not available.</p>}
          </section>

          <section aria-labelledby="profile-title" className="rounded-lg bg-secondary p-5">
            <div className="flex items-center gap-3">
              <Compass aria-hidden="true" className="size-5 text-primary" />
              <h2 id="profile-title" className="font-display text-xl font-semibold">Match profile</h2>
            </div>
            <dl className="mt-5 space-y-4">
              <div className="rounded bg-card p-4 shadow-sm">
                <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Programme code</dt>
                <dd className="mt-1 font-semibold">{course.code}</dd>
              </div>
              <div className="rounded bg-card p-4 shadow-sm">
                <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Matched interest areas</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {course.interestAreas.length > 0
                    ? course.interestAreas.map((area) => (
                        <span key={area} className="outcome-chip" title={interestAreaNames[area]}>{area}</span>
                      ))
                    : <span className="text-sm text-muted-foreground">Not supplied</span>}
                </dd>
              </div>
            </dl>
          </section>

        </aside>
      </div>
    </article>
  )
}

export { StudentRecommendationDetailPage }
