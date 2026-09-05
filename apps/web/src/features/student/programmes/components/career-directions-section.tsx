import { BriefcaseBusiness, ExternalLink } from 'lucide-react'

import type { CareerOpportunity } from '@/features/student/programmes/programme-types'

interface CareerDirectionsSectionProps {
  directions: string[]
  opportunities?: CareerOpportunity[]
  heading?: string
}

function CareerDirectionsSection({
  directions,
  opportunities = [],
  heading = 'Possible career directions',
}: CareerDirectionsSectionProps) {
  if (directions.length === 0 && opportunities.length === 0) return null

  return (
    <section aria-labelledby="career-directions-title" className="space-y-4">
      <div className="flex items-start gap-2.5">
        <BriefcaseBusiness aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <h2 id="career-directions-title" className="font-display text-lg font-bold text-foreground sm:text-xl">{heading}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
            Explore several directions connected to this programme. These are guidance options, not job or admission guarantees.
          </p>
        </div>
      </div>

      {directions.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {directions.map((direction) => (
            <li key={direction} className="flex min-h-12 items-center rounded-2xl border border-border/70 bg-secondary/55 px-4 py-3 text-sm font-semibold leading-5 text-foreground">
              {direction}
            </li>
          ))}
        </ul>
      ) : null}

      {opportunities.length > 0 ? (
        <div className="space-y-3 border-t border-border pt-4">
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-primary">ESCO occupation references</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              External occupation descriptions selected for this programme by an Administrator.
            </p>
          </div>
          <ul className="space-y-3">
            {opportunities.map((opportunity) => (
              <li key={opportunity.escoUri} className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-foreground">{opportunity.label}</h3>
                  <span className="rounded-full bg-info-soft px-2.5 py-1 font-label text-[11px] font-bold text-info">External reference</span>
                </div>
                {opportunity.description ? <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">{opportunity.description}</p> : null}
                {opportunity.skills.length > 0 ? (
                  <div className="mt-3">
                    <p className="font-label text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Related ESCO skills</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {opportunity.skills.map((skill) => <li key={skill} className="rounded-full bg-primary-fixed px-2.5 py-1 text-[11px] font-semibold text-on-primary-fixed">{skill}</li>)}
                    </ul>
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  {opportunity.iscoCode ? <span>ISCO-08 {opportunity.iscoCode}</span> : null}
                  {opportunity.escoCode ? <span>ESCO {opportunity.escoCode}</span> : null}
                  <span>Taxonomy {opportunity.sourceVersion}</span>
                  <a href={opportunity.escoUri} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center gap-1 font-semibold text-primary underline underline-offset-4">
                    View ESCO record <ExternalLink aria-hidden="true" className="size-3" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

export { CareerDirectionsSection }
