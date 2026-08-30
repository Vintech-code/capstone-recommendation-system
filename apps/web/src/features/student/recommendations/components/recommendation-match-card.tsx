import { ArrowRight, BookOpen, ListChecks } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getProgrammeImages } from '@/features/student/programmes/programme-images'
import { programmeMediaStyle } from '@/features/student/programmes/programme-media-position'
import type { StudentRecommendedCourse } from '@/features/student/recommendations/recommendation-types'

const interestAreaNames: Record<string, string> = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
}

interface RecommendationMatchCardProps {
  course: StudentRecommendedCourse
  onViewDetails: () => void
}

function RecommendationMatchCard({
  course,
  onViewDetails,
}: RecommendationMatchCardProps) {
  const fallback = getProgrammeImages(course.id)
  const cover = course.coverImageUrl || fallback.cover
  const coverStyle = course.coverImageUrl ? programmeMediaStyle(course.coverImagePosition) : undefined

  return (
    <article
      className="group py-6 sm:py-8"
    >
      <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-stretch lg:grid-cols-[11rem_minmax(0,1fr)]">
        <div
          className="relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl bg-secondary text-primary sm:aspect-auto sm:min-h-44"
        >
          {cover ? (
            <img src={cover} alt={`${course.name} programme`} loading="lazy" decoding="async" style={coverStyle} className="absolute inset-0 size-full object-cover" />
          ) : (
            <>
              <BookOpen aria-hidden="true" className="mb-2 size-8 text-muted-foreground" />
              <span className="font-display text-2xl font-bold tracking-[-0.04em]">{course.code}</span>
            </>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className={course.rank === 1 ? 'inline-flex min-h-8 items-center rounded-full bg-primary px-3 font-label text-xs font-semibold text-primary-foreground' : 'outcome-chip'}>
                Rank {course.rank}
              </span>
              <span className="font-label text-sm font-semibold text-foreground">
                {course.match}% provisional match
              </span>
            </div>
            <h3 className="mt-3 font-display text-xl font-semibold leading-7 transition-colors group-hover:text-primary">
              {course.name} <span className="whitespace-nowrap">({course.code})</span>
            </h3>
            {course.summary ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {course.summary}
              </p>
            ) : null}
            {course.explanation ? (
              <div className="mt-4 flex items-start gap-2 border-l-2 border-primary/25 pl-3 text-xs leading-5 text-muted-foreground">
                <ListChecks aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p>
                  {course.explanation.sharedTopAreas.length > 0
                    ? `Your recorded ${course.explanation.sharedTopAreas.map((area) => `${area.label} (${area.score})`).join(' and ')} scores are also listed in this programme's configured interest profile.`
                    : `This programme uses the configured ${course.explanation.programmeInterestAreas.join(' and ')} interest areas in the current catalogue.`}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-label text-xs font-semibold text-muted-foreground">
                Matched interest areas
              </p>
              <div className="mt-2 flex flex-wrap gap-2" aria-label="Matched RIASEC areas">
                {course.interestAreas.slice(0, 3).map((area) => (
                  <span
                    key={area}
                    className="outcome-chip"
                  >
                    {area} · {interestAreaNames[area] ?? 'Recorded area'}
                  </span>
                ))}
              </div>
            </div>
            <Button type="button" variant="ghost" onClick={onViewDetails} className="self-start text-primary md:self-auto">
              View programme
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export { RecommendationMatchCard }
