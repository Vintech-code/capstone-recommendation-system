import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Layers3,
  Printer,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ReportStatusBadge } from '@/features/admin/reports/components/report-status-badge'
import { mockReports } from '@/features/admin/reports/data/mock-reports'

function ReportDetailPage({
  reportId,
  onBack,
  onOpenApplicant,
  onOpenRecommendation,
}: {
  reportId: string
  onBack: () => void
  onOpenApplicant: (id: string) => void
  onOpenRecommendation: (id: string) => void
}) {
  const report = mockReports.find((item) => item.id === reportId)

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-background p-8 text-center shadow-sm">
        <FileText className="mx-auto size-7 text-muted-foreground" />
        <h1 className="mt-5 text-2xl font-extrabold">Report not found</h1>
        <Button type="button" className="mt-6" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Back to reports
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div
        data-print-hidden
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
          <ArrowLeft aria-hidden="true" />
          Reports
        </Button>
        <Button type="button" onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          Print report
        </Button>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(18rem,.52fr)_minmax(0,1.48fr)]">
        <aside data-print-hidden className="space-y-5">
          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                <FileText aria-hidden="true" className="size-5" />
              </span>
              <ReportStatusBadge status={report.status} />
            </div>
            <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {report.id} · version {report.version}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.035em]">
              {report.title}
            </h1>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Report type</dt>
                <dd className="mt-1 font-semibold">{report.type}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  Prepared
                </dt>
                <dd className="mt-1 font-semibold">
                  <time dateTime={report.generatedAt}>
                    {report.generatedLabel}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Coverage</dt>
                <dd className="mt-1 font-semibold">
                  {report.coverage} · {report.cycle}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Layers3 aria-hidden="true" className="size-4 text-primary" />
              <h2 className="font-extrabold">Source versions</h2>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {report.sourceVersions.map((version) => (
                <li
                  key={version}
                  className="rounded-lg bg-secondary px-3 py-2 font-mono text-xs font-bold"
                >
                  {version}
                </li>
              ))}
            </ul>
          </section>

          {report.applicantId ? (
            <section className="rounded-2xl bg-background p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <UserRound aria-hidden="true" className="size-4 text-primary" />
                <h2 className="font-extrabold">Linked record</h2>
              </div>
              <p className="mt-4 font-bold">{report.applicantName}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {report.applicantId}
              </p>
              <div className="mt-5 grid gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenApplicant(report.applicantId!)}
                >
                  Open applicant
                </Button>
                {report.recommendationId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      onOpenRecommendation(report.recommendationId!)
                    }
                  >
                    Open recommendation
                  </Button>
                ) : null}
              </div>
            </section>
          ) : null}
        </aside>

        <article
          data-report-print
          className="rounded-2xl bg-background p-6 shadow-sm sm:p-9 lg:p-12"
        >
          <header className="border-b border-border pb-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              TCC Guidance System
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em]">
              {report.title}
            </h2>
            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-sm text-muted-foreground">
              <span>{report.id}</span>
              <span>Version {report.version}</span>
              <span>{report.cycle}</span>
              <time dateTime={report.generatedAt}>{report.generatedLabel}</time>
            </div>
          </header>

          <section className="py-7">
            <h3 className="text-lg font-extrabold">Report overview</h3>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              {report.introduction}
            </p>
            {report.applicantName ? (
              <dl className="mt-6 grid gap-4 rounded-2xl bg-secondary/65 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold text-muted-foreground">
                    Applicant
                  </dt>
                  <dd className="mt-1 font-extrabold">
                    {report.applicantName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-muted-foreground">
                    Applicant reference
                  </dt>
                  <dd className="mt-1 font-mono font-semibold">
                    {report.applicantId}
                  </dd>
                </div>
              </dl>
            ) : null}
          </section>

          <section className="border-t border-border pt-7">
            <h3 className="text-lg font-extrabold">Included sections</h3>
            <ol className="mt-5 space-y-4">
              {report.sections.map((section, index) => (
                <li
                  key={section.title}
                  className="grid gap-3 rounded-2xl bg-secondary/65 p-5 sm:grid-cols-[2.5rem_1fr]"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-background text-sm font-extrabold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-extrabold">{section.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <footer className="mt-9 border-t border-border pt-6 text-xs leading-5 text-muted-foreground">
            Source snapshot: {report.sourceVersions.join(' · ')}
          </footer>
        </article>
      </div>
    </div>
  )
}

export { ReportDetailPage }
