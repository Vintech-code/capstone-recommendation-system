import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Circle,
  Compass,
  GraduationCap,
  Shield,
  Target,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { StudentBreadcrumbs } from '@/features/student/components/student-breadcrumbs'
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
  if (!match) {
    return { title: 'Recorded match factor', description: factor }
  }

  const code = match[1]
  const name = interestAreaNames[code] ?? code
  return {
    title: `${name} interest alignment`,
    description: `This programme's recorded profile includes ${name}, one of the interest areas used to calculate this recommendation.`,
  }
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
  const matchText = `${course.match}%`
  const usesCompactMatchSize = matchText.length > 5
  const fitReasons = course.factors.length > 0
    ? course.factors.map(describeFactor)
    : course.interestAreas.map((area) => describeFactor(`Profile includes ${area}`))

  return (
    <article className="pb-12">
      <StudentBreadcrumbs
        parentLabel="My Matches"
        currentLabel={course.code}
        onParentSelect={onBack}
      />
      <header className="bg-primary-fixed/55 py-10 shadow-sm sm:py-12">
        <div className="student-page grid gap-7 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="outcome-chip">Recommendation {course.rank}</span>
              <span className="outcome-chip">{course.code}</span>
              {course.duration ? <span className="outcome-chip">{course.duration}</span> : null}
            </div>
            <h1 className="mt-5 max-w-4xl font-display text-3xl font-bold tracking-[-0.035em] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
              {course.name}
            </h1>
            {course.summary ? (
              <p className="mt-4 max-w-3xl text-base leading-7 text-foreground/75">
                {course.summary}
              </p>
            ) : null}
            <p className="mt-5 font-label text-xs text-muted-foreground">
              Recommendation generated {generatedAt}
            </p>
          </div>

          <section aria-labelledby="match-strength-title" className="relative isolate overflow-hidden rounded-lg bg-card p-6 shadow-[0_12px_28px_rgba(0,30,64,0.12)]">
            <div aria-hidden="true" className="pointer-events-none absolute -right-2 top-8 z-0 flex size-36 items-center justify-center text-primary opacity-[0.09]">
              <Shield className="absolute size-36 stroke-[3]" />
              <Circle className="size-14 stroke-[5]" />
            </div>
            <div className="relative z-10">
              <p id="match-strength-title" className="font-serif text-xl tracking-[0.04em] text-foreground/80">
                Your match strength
              </p>
              <div className="mt-3 grid min-h-20 grid-cols-[minmax(0,1fr)_5rem] items-end gap-2">
                <strong className={`min-w-0 whitespace-nowrap font-display font-bold leading-none tabular-nums tracking-[-0.06em] text-primary ${usesCompactMatchSize ? 'text-[2.65rem]' : 'text-6xl'}`}>
                  {matchText}
                </strong>
                <span className="mb-1 text-right font-display text-xl font-bold leading-6 text-accent">
                  {fitLabel}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`${course.name} recorded match`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={course.match}
                className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${course.match}%` }} />
              </div>
              <div className="mt-5 grid gap-2">
                <Button type="button" onClick={onBack} className="w-full rounded font-serif text-base tracking-wide">
                  <ArrowLeft aria-hidden="true" />
                  Back to matches
                </Button>
                <Button type="button" variant="outline" onClick={onExploreProgrammes} className="w-full rounded bg-card font-serif text-base tracking-wide">
                  Explore programmes
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </section>
        </div>
      </header>

      <div className="student-page mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.7fr)]">
        <div className="space-y-10">
          <section aria-labelledby="fit-title">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded bg-primary/10 text-primary">
                <Target aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-label text-xs uppercase tracking-[0.12em] text-muted-foreground">Profile connection</p>
                <h2 id="fit-title" className="font-display text-2xl font-semibold">Why this fits you</h2>
              </div>
            </div>
            {fitReasons.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {fitReasons.map((reason, index) => (
                  <li
                    key={`${reason.title}-${index}`}
                    className={`flex min-h-32 gap-4 rounded-lg bg-card p-5 shadow-sm ${index === 2 && fitReasons.length % 2 === 1 ? 'sm:col-span-2' : ''}`}
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded bg-primary-fixed font-label text-xs font-semibold text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{reason.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{reason.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg bg-card p-5 text-sm text-muted-foreground shadow-sm">
                No additional match factors were supplied for this recommendation.
              </p>
            )}
          </section>

          <section aria-labelledby="learning-areas-title">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded bg-primary/10 text-primary">
                <BookOpen aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-label text-xs uppercase tracking-[0.12em] text-muted-foreground">Programme overview</p>
                <h2 id="learning-areas-title" className="font-display text-2xl font-semibold">Learning areas</h2>
              </div>
            </div>
            {course.learningAreas.length > 0 ? (
              <ol className="space-y-4">
                {course.learningAreas.map((area, index) => (
                  <li key={area} className="grid overflow-hidden rounded-lg bg-card shadow-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
                    <div className="flex min-h-28 items-center justify-between bg-gradient-to-br from-primary via-[#174a7c] to-[#7b94b5] p-5 text-primary-foreground">
                      <BookOpen aria-hidden="true" className="size-8 opacity-70" />
                      <span className="font-label text-xs font-semibold">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="flex min-h-28 items-center p-5">
                      <div>
                        <p className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Learning area {index + 1}</p>
                        <h3 className="mt-2 font-display text-lg font-semibold">{area}</h3>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-lg bg-card p-5 text-sm text-muted-foreground shadow-sm">
                Learning areas are not available for this programme.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          {course.careerDirections.length > 0 ? (
            <section aria-labelledby="career-directions-title" className="rounded-xl bg-secondary p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Compass aria-hidden="true" className="size-5 text-secondary-foreground" />
                <h2 id="career-directions-title" className="font-display text-xl font-semibold">Career directions</h2>
              </div>
              <ul className="mt-5 space-y-3">
                {course.careerDirections.map((direction, index) => (
                  <li key={direction} className="flex items-center gap-4 rounded-lg bg-card p-4 shadow-sm">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                      <GraduationCap aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-label text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Direction {index + 1}</p>
                      <p className="mt-1 text-sm font-semibold leading-5">{direction}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="profile-title" className="rounded-xl bg-primary-fixed/55 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Compass aria-hidden="true" className="size-5 text-primary" />
              <h2 id="profile-title" className="font-display text-xl font-semibold">Match profile</h2>
            </div>
            <dl className="mt-5 divide-y divide-outline-variant/50">
              <div className="py-3 first:pt-0">
                <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Ranking</dt>
                <dd className="mt-1 font-semibold">Recommendation {course.rank}</dd>
              </div>
              <div className="py-3">
                <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Programme code</dt>
                <dd className="mt-1 font-semibold">{course.code}</dd>
              </div>
              <div className="py-3 last:pb-0">
                <dt className="font-label text-xs uppercase tracking-[0.1em] text-muted-foreground">Matched RIASEC areas</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {course.interestAreas.length > 0
                    ? course.interestAreas.map((area) => <span key={area} className="outcome-chip">{area}</span>)
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
