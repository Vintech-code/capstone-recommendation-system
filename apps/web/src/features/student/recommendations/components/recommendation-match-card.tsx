import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getProgrammeImages } from '@/features/student/programmes/programme-images'
import { programmeMediaStyle } from '@/features/student/programmes/programme-media-position'
import type { StudentRecommendedCourse } from '@/features/student/recommendations/recommendation-types'

interface RecommendationMatchCardProps {
  course: StudentRecommendedCourse
  featured?: boolean
  onViewDetails: () => void
}

function RecommendationMatchCard({
  course,
  featured = false,
  onViewDetails,
}: RecommendationMatchCardProps) {
  const fallback = getProgrammeImages(course.id)
  const cover = course.coverImageUrl || fallback.cover
  const coverStyle = course.coverImageUrl ? programmeMediaStyle(course.coverImagePosition) : undefined

  return (
    <article
      className={
        featured
          ? 'group relative overflow-hidden rounded-lg bg-card p-5 shadow-sm sm:p-6'
          : 'group relative overflow-hidden rounded-lg bg-card p-5 shadow-sm'
      }
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1 ${course.rank === 1 ? 'bg-secondary-container' : 'bg-primary'}`}
      />

      <div
        className={
          featured
            ? 'grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-stretch lg:grid-cols-[12rem_minmax(0,1fr)]'
            : 'grid gap-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center'
        }
      >
        <div
          className={`relative flex min-h-32 items-center justify-center overflow-hidden rounded bg-gradient-to-br from-primary via-[#174a7c] to-[#7b94b5] text-primary-foreground ${featured ? 'sm:min-h-48' : ''}`}
        >
          {cover ? (
            <img src={cover} alt={`${course.name} programme`} loading="lazy" decoding="async" style={coverStyle} className={`absolute inset-0 size-full object-cover transition-transform duration-300 ${coverStyle ? '' : 'group-hover:scale-105'}`} />
          ) : (
            <>
              <BookOpen aria-hidden="true" className="absolute -bottom-3 -right-2 size-24 opacity-15" />
              <span className="font-display text-2xl font-bold tracking-[-0.04em]">{course.code}</span>
            </>
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
          <span className="absolute right-2 top-2 rounded bg-secondary-container px-2.5 py-1 font-label text-xs font-medium text-[#221b00] shadow-sm">
            {course.match}% match
          </span>
        </div>

        <div className="flex min-w-0 flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="outcome-chip">Recommendation {course.rank}</span>
              {course.interestAreas.slice(0, 2).map((area) => (
                <span key={area} className="outcome-chip">
                  {area}
                </span>
              ))}
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
              <div className="mt-4 flex items-start gap-2 rounded bg-primary-fixed/45 px-3 py-2.5 text-xs leading-5 text-on-primary-fixed">
                <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p>
                  {course.explanation.sharedTopAreas.length > 0
                    ? `Your recorded ${course.explanation.sharedTopAreas.map((area) => `${area.label} (${area.score})`).join(' and ')} scores are also listed in this programme's configured interest profile.`
                    : `This programme uses the configured ${course.explanation.programmeInterestAreas.join(' and ')} interest areas in the current catalogue.`}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex -space-x-1.5" aria-label="Matched RIASEC areas">
              {course.interestAreas.slice(0, 3).map((area) => (
                <span
                  key={area}
                  title={`RIASEC area ${area}`}
                  className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-card"
                >
                  {area}
                </span>
              ))}
            </div>
            <Button type="button" variant="ghost" onClick={onViewDetails} className="text-primary">
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
