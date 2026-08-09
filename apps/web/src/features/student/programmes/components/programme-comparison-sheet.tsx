import { BookOpen, BriefcaseBusiness, Clock3, ExternalLink, GraduationCap } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { StudentProgramme } from '@/features/student/programmes/programme-types'

interface ProgrammeComparisonSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programmes: StudentProgramme[]
}

function ProgrammeComparisonSheet({ open, onOpenChange, programmes }: ProgrammeComparisonSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(70rem,96vw)] max-w-none overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl font-semibold">Compare programmes</SheetTitle>
          <SheetDescription>Review two or three API-provided programme records side by side.</SheetDescription>
        </SheetHeader>

        <div className={`mt-3 grid gap-4 ${programmes.length === 3 ? 'lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {programmes.map((programme) => (
            <article key={programme.id} className="rounded-xl bg-card p-5 shadow-sm">
              <p className="font-label text-xs font-semibold uppercase tracking-[0.12em] text-primary">{programme.code}</p>
              <h3 className="mt-2 font-display text-xl font-semibold">{programme.name}</h3>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="flex items-center gap-2 font-semibold"><Clock3 aria-hidden="true" className="size-4 text-primary" />Duration</dt>
                  <dd className="mt-1 text-muted-foreground">{programme.duration?.display || 'Not published'}</dd>
                  {programme.duration?.source_url ? (
                    <a href={programme.duration.source_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4">
                      {programme.duration.source_name || 'CHED source'} <ExternalLink aria-hidden="true" className="size-3" />
                    </a>
                  ) : null}
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-semibold"><GraduationCap aria-hidden="true" className="size-4 text-primary" />RIASEC alignment</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">{programme.riasecProfile.map((code) => <span key={code} className="outcome-chip">{code}</span>)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-semibold"><BookOpen aria-hidden="true" className="size-4 text-primary" />Learning areas</dt>
                  <dd><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{programme.learningAreas.map((area) => <li key={area}>{area}</li>)}</ul></dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-semibold"><BriefcaseBusiness aria-hidden="true" className="size-4 text-primary" />Career directions</dt>
                  <dd><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{programme.careerDirections.map((direction) => <li key={direction}>{direction}</li>)}</ul></dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { ProgrammeComparisonSheet }
