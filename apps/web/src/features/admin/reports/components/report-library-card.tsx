import { ArrowUpRight, CalendarDays, FileText, Layers3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ReportStatusBadge } from '@/features/admin/reports/components/report-status-badge'
import type { MockReport } from '@/features/admin/reports/data/mock-reports'
import { cn } from '@/lib/utils'

function ReportLibraryCard({
  report,
  featured = false,
  onOpen,
}: {
  report: MockReport
  featured?: boolean
  onOpen: (id: string) => void
}) {
  return (
    <article
      className={cn(
        'rounded-2xl bg-background p-5 shadow-sm',
        featured && 'grid gap-6 sm:p-7 lg:grid-cols-[13rem_1fr]',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-secondary/70 p-5',
          featured ? 'min-h-52' : 'min-h-36',
        )}
        aria-hidden="true"
      >
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10" />
        <div className="relative h-full rounded-xl bg-background p-4 shadow-sm">
          <div className="h-2 w-12 rounded-full bg-primary/30" />
          <div className="mt-4 h-2 w-full rounded-full bg-secondary" />
          <div className="mt-2 h-2 w-4/5 rounded-full bg-secondary" />
          <div className="mt-6 grid grid-cols-3 gap-2">
            <div className="h-10 rounded-lg bg-primary/8" />
            <div className="h-10 rounded-lg bg-primary/12" />
            <div className="h-10 rounded-lg bg-primary/16" />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <FileText aria-hidden="true" className="size-4.5" />
          </span>
          <ReportStatusBadge status={report.status} />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {report.type}
        </p>
        <h2
          className={cn(
            'mt-2 font-extrabold',
            featured ? 'text-2xl tracking-[-0.035em]' : 'text-lg',
          )}
        >
          {report.title}
        </h2>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {report.id} · version {report.version}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4" />
            <time dateTime={report.generatedAt}>{report.generatedLabel}</time>
          </span>
          <span className="flex items-center gap-2">
            <Layers3 aria-hidden="true" className="size-4" />
            {report.coverage}
          </span>
        </div>

        <Button
          type="button"
          variant={featured ? 'default' : 'secondary'}
          className="mt-6 w-full sm:w-fit"
          onClick={() => onOpen(report.id)}
        >
          Open report
          <ArrowUpRight aria-hidden="true" />
        </Button>
      </div>
    </article>
  )
}

export { ReportLibraryCard }
