import {
  BookOpenCheck,
  CalendarDays,
  Download,
  FileKey2,
  FileText,
  Info,
  Printer,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { mockStudentDecision } from '@/features/student/decision/data/mock-student-decision'
import { StudentPageHeader } from '@/features/student/components/student-page-header'
import { mockStudentRecommendationSnapshot } from '@/features/student/recommendations/data/mock-student-recommendations'
import { mockStudentReport } from '@/features/student/report/data/mock-student-report'

type StudentReportLoadState =
  | 'ready'
  | 'loading'
  | 'error'
  | 'empty'
  | 'preparing'

interface StudentReportPageProps {
  onBack: () => void
  onOpenGuidance: () => void
  initialLoadState?: StudentReportLoadState
}

function StudentReportPage({
  onBack,
  onOpenGuidance,
  initialLoadState = 'ready',
}: StudentReportPageProps) {
  const [loadState, setLoadState] = useState(initialLoadState)
  const report = mockStudentReport
  const preferredCourse =
    mockStudentRecommendationSnapshot.courses.find(
      (course) => course.id === mockStudentDecision.courseId,
    ) ?? mockStudentRecommendationSnapshot.courses[0]
  const downloadContent = useMemo(
    () =>
      [
        report.title,
        `Report reference: ${report.id}`,
        `Prepared: ${report.preparedAt}`,
        `Applicant: ${report.applicantName}`,
        `Assessment: ${report.assessmentReference}`,
        `Recommendation: ${report.recommendationReference}`,
        '',
        report.summary,
        '',
        'Ranked course guidance',
        ...mockStudentRecommendationSnapshot.courses.map(
          (course) =>
            `${course.rank}. ${course.name} - ${course.match}% - ${course.eligibility}`,
        ),
        '',
        'Current decision',
        `${preferredCourse.name} - Still deciding`,
        '',
        ...report.boundaries,
      ].join('\n'),
    [preferredCourse.name, report],
  )
  const downloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(downloadContent)}`

  if (loadState === 'loading') {
    return (
      <LoadingState
        title="Loading your report"
        description="Preparing the course-guidance report available to your account."
      />
    )
  }

  if (loadState === 'error') {
    return (
      <ErrorState
        title="We could not load your report"
        description="Your records were not changed. Try loading the report again."
        onRetry={() => setLoadState('ready')}
      />
    )
  }

  if (loadState === 'empty') {
    return (
      <EmptyState
        title="No report is available"
        description="A report will appear here when course guidance is available to your account."
        icon={FileText}
        action={
          <Button type="button" onClick={onOpenGuidance}>
            Open course guidance
          </Button>
        }
      />
    )
  }

  if (loadState === 'preparing') {
    return (
      <div className="w-full">
        <StudentPageHeader
          title="My report"
          description="Check the availability of your course-guidance report."
          onBack={onBack}
          actions={<StatusBadge label="Preparing" tone="info" />}
        />
        <EmptyState
          className="mt-4"
          title="Your report is being prepared"
          description="The report will appear here when the current recommendation snapshot is ready."
          icon={FileText}
          action={
            <Button type="button" variant="secondary" onClick={onBack}>
              Return to dashboard
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="w-full pb-24 sm:pb-8">
      <StudentPageHeader
        title="My report"
        description="Preview, print, or download the course-guidance summary available to your account."
        onBack={onBack}
        actions={<StatusBadge label={report.status} tone="success" />}
      />

      <div
        data-print-hidden
        className="mt-4 flex flex-col gap-3 rounded-2xl bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <FileText aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="font-extrabold">Report actions</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Print the visible document or download a readable text copy.
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:flex">
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.print()}
            className="min-h-12"
          >
            <Printer aria-hidden="true" />
            Print report
          </Button>
          <Button asChild className="min-h-12">
            <a
              href={downloadHref}
              download="course-guidance-summary.txt"
              aria-label="Download course guidance summary"
            >
              <Download aria-hidden="true" />
              Download copy
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(18rem,.42fr)_minmax(0,1.58fr)]">
        <aside data-print-hidden className="space-y-4">
          <section className="rounded-2xl bg-background p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <FileKey2 aria-hidden="true" className="size-5" />
              </span>
              <StatusBadge label={report.status} tone="success" />
            </div>
            <h2 className="mt-5 text-lg font-extrabold">Report details</h2>
            <dl className="mt-4 space-y-3">
              <ReportValue label="Report reference" value={report.id} />
              <ReportValue label="Document version" value={report.version} />
              <ReportValue label="Prepared" value={report.preparedAt} />
              <ReportValue label="Coverage" value={report.cycle} />
            </dl>
          </section>

          <section className="rounded-2xl bg-canvas-cream p-5 shadow-sm">
            <ShieldCheck aria-hidden="true" className="size-5 text-warning" />
            <h2 className="mt-4 font-extrabold">Own-record report</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              This Student view contains only the report connected to the
              signed-in applicant record.
            </p>
          </section>
        </aside>

        <article
          data-report-print
          aria-labelledby="student-report-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-8 lg:p-10"
        >
          <header className="border-b border-border pb-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              TCC Guidance System
            </p>
            <h2
              id="student-report-title"
              className="mt-3 text-3xl font-extrabold tracking-[-0.04em]"
            >
              {report.title}
            </h2>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span>{report.id}</span>
              <span>Version {report.version}</span>
              <span>{report.preparedAt}</span>
            </div>
          </header>

          <section className="py-7">
            <div className="flex items-center gap-3">
              <UserRound aria-hidden="true" className="size-5 text-primary" />
              <h3 className="text-lg font-extrabold">Applicant record</h3>
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <DocumentValue label="Applicant" value={report.applicantName} />
              <DocumentValue
                label="Applicant reference"
                value={report.applicantReference}
              />
              <DocumentValue
                label="Assessment reference"
                value={report.assessmentReference}
              />
              <DocumentValue
                label="Recommendation reference"
                value={report.recommendationReference}
              />
            </dl>
          </section>

          <section className="border-t border-border py-7">
            <div className="flex items-center gap-3">
              <BookOpenCheck
                aria-hidden="true"
                className="size-5 text-primary"
              />
              <h3 className="text-lg font-extrabold">Guidance summary</h3>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              {report.summary}
            </p>
            <ol className="mt-5 space-y-3">
              {mockStudentRecommendationSnapshot.courses.slice(0, 3).map(
                (course) => (
                  <li
                    key={course.id}
                    className="grid gap-3 rounded-xl bg-secondary/55 p-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground">
                      {course.rank}
                    </span>
                    <div>
                      <p className="font-extrabold">{course.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {course.code} / {course.eligibility}
                      </p>
                    </div>
                    <span className="text-lg font-extrabold">
                      {course.match}%
                    </span>
                  </li>
                ),
              )}
            </ol>
          </section>

          <section className="border-t border-border py-7">
            <div className="flex items-center gap-3">
              <CalendarDays aria-hidden="true" className="size-5 text-primary" />
              <h3 className="text-lg font-extrabold">Current decision</h3>
            </div>
            <div className="mt-5 rounded-xl bg-secondary/55 p-5">
              <StatusBadge label="Still deciding" tone="info" />
              <p className="mt-3 font-extrabold">{preferredCourse.name}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {mockStudentDecision.note}
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                {report.decisionReference}
              </p>
            </div>
          </section>

          <section className="border-t border-border pt-7">
            <div className="flex items-center gap-3">
              <Info aria-hidden="true" className="size-5 text-warning" />
              <h3 className="text-lg font-extrabold">Important limitations</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {report.boundaries.map((boundary) => (
                <li
                  key={boundary}
                  className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
                >
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-warning"
                  />
                  {boundary}
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </div>
  )
}

function ReportValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-extrabold">{value}</dd>
    </div>
  )
}

function DocumentValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/55 p-4">
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-extrabold">{value}</dd>
    </div>
  )
}

export { StudentReportPage }
export type { StudentReportLoadState }
