import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  History,
  Printer,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import tccBanner from '@/assets/tccbanner.jpg'
import {
  AdminPageError,
  AdminPageHeader,
  AdminPageSkeleton,
  EmptyPanel,
} from '@/features/admin/components/admin-shared'
import { formatDate, humanize } from '@/features/admin/data/admin-formatters'
import {
  useAdminResource,
  type AdminAssessment,
  type AdminActivity,
  type AdminOverview,
  type AdminReport,
  type AdminStudent,
  type AdminStudentRecord,
} from '@/features/admin/data/admin-api'

interface NavigateProps {
  onNavigate: (path: string) => void
}

function AdminDashboardPage({ onNavigate }: NavigateProps) {
  const resource = useAdminResource<AdminOverview>('/overview')
  const activityResource = useAdminResource<AdminActivity[]>('/activity')
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No dashboard data was returned.'} onRetry={resource.retry} />
  const data = resource.data
  const tracked = data.completed + data.inProgress + data.needsAttention
  const completionRate = tracked ? Math.round((data.completed / tracked) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <header className="relative min-h-48 overflow-hidden rounded-3xl border border-border/80 bg-card px-6 py-8 shadow-xs sm:px-8">
            <img src={tccBanner} alt="" className="absolute inset-y-0 right-0 h-full w-[58%] object-cover opacity-25 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-primary-fixed/30" />
            <div className="absolute inset-y-0 right-0 w-[58%] bg-gradient-to-t from-primary-fixed/50 via-canvas-cream/20 to-transparent" />
            <div className="relative max-w-xl">
              <p className="flex items-center gap-2 font-label text-xs font-bold uppercase tracking-wider text-primary">
                <span className="size-2 rounded-full bg-primary" />
                Programme administration
              </p>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Welcome back, Admin
              </h1>
              <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Monitor student programme activity, govern the catalogue, and review system records.
              </p>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Administration metrics">
            <article className="relative flex min-h-60 flex-col justify-between overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary-fixed/60 via-card to-info/10 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="font-label text-xs font-bold uppercase tracking-wider text-primary">Assessment readiness</p>
                <span className="flex size-9 items-center justify-center rounded-xl bg-card text-primary shadow-xs">
                  <ClipboardList className="size-4" aria-hidden="true" />
                </span>
              </div>
              <div className="relative mx-auto my-3 flex size-24 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${completionRate * 3.6}deg, var(--border) 0deg)` }}>
                <div className="flex size-20 items-center justify-center rounded-full bg-card shadow-xs">
                  <strong className="font-display text-3xl font-bold text-foreground">{completionRate}<span className="text-xl text-primary">%</span></strong>
                </div>
              </div>
              <p className="text-center font-label text-xs text-muted-foreground">
                of student records have results ready
              </p>
            </article>

            <DashboardMetricCard label="Student records" value={data.students} note="Total students in the system" icon={UsersRound} tone="violet" />
            <DashboardMetricCard label="Results ready" value={data.completed} note="Assessments with results ready" icon={CheckCircle2} tone="green" />
            <DashboardMetricCard label="In progress" value={data.inProgress} note="Assessments in progress" icon={Clock3} tone="blue" />
            <DashboardMetricCard label="Needs review" value={data.needsAttention} note="Records needing review" icon={AlertTriangle} tone="orange" />
          </section>

          <section className="grid overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs sm:grid-cols-[1fr_1fr_1.1fr]" aria-label="Student coverage">
            <DashboardStripDatum icon={UsersRound} label="Students with assessment activity" value={data.assessments} />
            <DashboardStripDatum icon={BarChart3} label="Students with recommendations" value={data.recommendations} />
            <div className="p-3">
              <button
                type="button"
                onClick={() => onNavigate('/admin/students')}
                className="flex h-full min-h-12 w-full items-center justify-between rounded-2xl bg-primary px-5 font-label text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
              >
                Open student directory <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs" aria-labelledby="recent-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-label text-xs font-bold uppercase tracking-wider text-muted-foreground">Student journey</p>
                <h2 id="recent-heading" className="mt-1 font-display text-xl font-bold text-foreground">Recent assessment activity</h2>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl font-label text-xs font-semibold" onClick={() => onNavigate('/admin/students')}>
                View all <ArrowRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
            {data.recentActivity.length ? (
              <div className="mt-5 divide-y divide-border/60 rounded-2xl border border-border/70 bg-card overflow-hidden">
                {data.recentActivity.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(`/admin/students/${item.studentId}`)}
                    className="grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{item.studentName}</span>
                      <span className="mt-0.5 block font-label text-xs text-muted-foreground">
                        Attempt {item.attemptNumber} · {formatDate(item.resultAvailableAt ?? item.submittedAt)}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <StatusBadge status={item.status} />
                      {item.topCode ? (
                        <span className="inline-flex min-h-7 items-center rounded-lg bg-primary-fixed px-2.5 font-display text-xs font-bold text-on-primary-fixed">
                          {item.topCode}
                        </span>
                      ) : null}
                      <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                  <ClipboardList className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-display text-base font-semibold">No recent activity</h3>
                <p className="mt-1 text-xs text-muted-foreground">Completed or failed assessment attempts will appear here.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs" aria-labelledby="quick-actions-heading">
            <h2 id="quick-actions-heading" className="font-label text-xs font-bold uppercase tracking-wider text-foreground">Quick actions</h2>
            <div className="mt-4 space-y-2.5">
              <DashboardAction title="Open students" description="Review student assessment records" icon={UsersRound} onClick={() => onNavigate('/admin/students')} />
              <DashboardAction title="Open programmes" description="View and manage programmes" icon={BookOpen} onClick={() => onNavigate('/admin/programmes')} />
              <DashboardAction title="Generate reports" description="Create and export reports" icon={BarChart3} onClick={() => onNavigate('/admin/reports')} />
            </div>
          </section>

          <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs" aria-labelledby="attention-heading">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="attention-heading" className="font-label text-xs font-bold uppercase tracking-wider text-foreground">Operational attention</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Live records that may require Administrator action.</p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4 divide-y divide-border/60">
              <OperationalAttentionRow label="Assessment processing failures" value={data.operationalAttention.processingFailures} path="/admin/students" onNavigate={onNavigate} />
              <OperationalAttentionRow label="Sources without a verification date" value={data.operationalAttention.unverifiedSources} path="/admin/programmes/sources" onNavigate={onNavigate} />
              <OperationalAttentionRow label="Unpublished programme drafts" value={data.operationalAttention.unpublishedDrafts} path="/admin/programmes" onNavigate={onNavigate} />
            </div>
          </section>

          <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs" aria-labelledby="audit-heading">
            <div className="flex items-center justify-between">
              <h2 id="audit-heading" className="font-label text-xs font-bold uppercase tracking-wider text-foreground">Recent activity</h2>
              <button type="button" onClick={() => onNavigate('/admin/activity')} className="font-label text-xs font-semibold text-primary hover:text-primary/80">
                View all
              </button>
            </div>
            {activityResource.data?.length ? (
              <ol className="mt-4 divide-y divide-border/60">
                {activityResource.data.slice(0, 3).map((event) => (
                  <li key={event.id} className="flex gap-3 py-3.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                      <Activity className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <strong className="block truncate text-xs font-semibold text-foreground">{humanize(event.action)}</strong>
                      <p className="mt-0.5 truncate font-label text-[11px] text-muted-foreground">{event.actor} · {humanize(event.subjectType)}</p>
                      <p className="mt-1 font-label text-[10px] text-muted-foreground/80">{formatDate(event.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-4 rounded-2xl bg-secondary/70 p-4 text-xs text-muted-foreground">
                No administrative activity has been recorded.
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

function DashboardMetricCard({ label, value, note, icon: Icon, tone }: { label: string; value: number; note: string; icon: typeof Activity; tone: 'violet' | 'green' | 'blue' | 'orange' }) {
  const tones = { violet: 'bg-primary-fixed text-primary', green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', blue: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', orange: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' }
  const accents = { violet: 'bg-primary', green: 'bg-emerald-500', blue: 'bg-sky-500', orange: 'bg-amber-500' }
  return (
    <article className="flex min-h-60 flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`flex size-9 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className={`size-2 rounded-full ${accents[tone]}`} aria-hidden="true" />
      </div>
      <div className="my-2">
        <p className="font-label text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1.5 font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 font-label text-xs leading-relaxed text-muted-foreground">{note}</p>
      </div>
      <span className={`h-1 w-10 rounded-full ${accents[tone]}`} aria-hidden="true" />
    </article>
  )
}

function DashboardStripDatum({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <dt className="font-label text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 font-display text-xl font-bold text-foreground">{value}</dd>
      </div>
    </div>
  )
}

function DashboardAction({ title, description, icon: Icon, onClick }: { title: string; description: string; icon: typeof Activity; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-14 w-full items-center gap-3 rounded-2xl border border-border/70 bg-secondary/50 px-4 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-xs font-semibold text-foreground">{title}</strong>
        <span className="block truncate font-label text-[11px] text-muted-foreground">{description}</span>
      </span>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
    </button>
  )
}

function OperationalAttentionRow({ label, value, path, onNavigate }: { label: string; value: number; path: string; onNavigate: (path: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(path)}
      className="group flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <span className="font-label text-xs font-medium text-muted-foreground group-hover:text-foreground">{label}</span>
      <span className={`flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 font-label text-xs font-bold ${value > 0 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
        {value}
      </span>
    </button>
  )
}

function AdminStudentsPage({ onNavigate }: NavigateProps) {
  const studentResource = useAdminResource<AdminStudent[]>('/students')
  const assessmentResource = useAdminResource<AdminAssessment[]>('/assessments')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'not_started' | AdminAssessment['status']>('all')
  const students = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const assessmentsByStudent = new Map(assessmentResource.data?.map((assessment) => [assessment.studentId, assessment]) ?? [])
    return studentResource.data?.filter((student) => {
      const assessment = assessmentsByStudent.get(student.id)
      const matchesQuery = !normalized || `${student.name} ${student.email} ${assessment?.reference ?? ''} ${assessment?.topCode ?? ''}`.toLowerCase().includes(normalized)
      const matchesStatus = status === 'all' || (status === 'not_started' ? !assessment : assessment?.status === status)
      return matchesQuery && matchesStatus
    }) ?? []
  }, [assessmentResource.data, query, status, studentResource.data])

  if (studentResource.loading || assessmentResource.loading) return <AdminPageSkeleton />
  if (studentResource.error || assessmentResource.error || !studentResource.data || !assessmentResource.data) {
    return (
      <AdminPageError
        message={studentResource.error ?? assessmentResource.error ?? 'No student monitoring data was returned.'}
        onRetry={() => { studentResource.retry(); assessmentResource.retry() }}
      />
    )
  }

  const studentData = studentResource.data
  const assessmentData = assessmentResource.data
  const assessmentsByStudent = new Map(assessmentData.map((assessment) => [assessment.studentId, assessment]))
  const count = (value: AdminAssessment['status']) => assessmentData.filter((assessment) => assessment.status === value).length

  return (
    <div className="min-w-0 space-y-6">
      <AdminPageHeader
        eyebrow="Student and assessment monitoring"
        title="Student records"
        description="Find every student, monitor current assessment states, and open immutable assessment, RIASEC, and programme-match records."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Assessment lifecycle summary">
        <AssessmentMetric label="In progress" value={count('in_progress')} note="Students currently answering" icon={Clock3} tone="warning" />
        <AssessmentMetric label="Finalizing" value={count('preparing_result')} note="Submitted and processing" icon={Activity} tone="info" />
        <AssessmentMetric label="Results ready" value={count('result_available')} note="Ready for student review" icon={CheckCircle2} tone="success" />
        <AssessmentMetric label="Needs attention" value={count('result_failed')} note="Processing did not finish" icon={AlertTriangle} tone="danger" />
      </section>

      <section className="min-w-0 rounded-3xl border border-border/80 bg-card p-6 shadow-xs" aria-labelledby="student-directory-heading" data-student-records>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-wider text-muted-foreground">Complete student directory</p>
            <h2 id="student-directory-heading" className="mt-1 font-display text-xl font-bold text-foreground">Student and assessment records</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">One row per student, including students who have not started an assessment.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(15rem,1fr)_13rem]">
            <label className="relative">
              <span className="sr-only">Search student records</span>
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input type="search" aria-label="Search student records" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student or reference" className="min-h-11 rounded-xl pl-10" />
            </label>
            <label>
              <span className="sr-only">Filter by assessment status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 w-full rounded-xl border border-input bg-background px-3 font-label text-xs font-semibold text-foreground">
                <option value="all">All statuses</option>
                <option value="not_started">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="preparing_result">Finalizing</option>
                <option value="result_available">Result available</option>
                <option value="result_failed">Needs attention</option>
              </select>
            </label>
          </div>
        </div>

        {students.length ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border/70">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[58rem] text-left text-sm">
                <thead className="bg-secondary/80 font-label text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Latest attempt</th>
                    <th className="px-5 py-3.5">Current state</th>
                    <th className="px-5 py-3.5">Latest profile</th>
                    <th className="px-5 py-3.5">Last update</th>
                    <th className="px-5 py-3.5 text-right"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card">
                  {students.map((student) => {
                    const assessment = assessmentsByStudent.get(student.id)
                    return (
                      <tr key={student.id} className="align-middle transition-colors hover:bg-secondary/40">
                        <td className="px-5 py-4">
                          <strong className="block font-semibold text-foreground">{student.name}</strong>
                          <span className="font-label text-xs text-muted-foreground">{student.email}</span>
                        </td>
                        <td className="px-5 py-4">
                          {assessment ? (
                            <>
                              <strong className="block font-semibold text-foreground">Attempt {assessment.attemptNumber}</strong>
                              <span className="font-label text-xs text-muted-foreground">{student.attemptCount} total · {assessment.reference}</span>
                            </>
                          ) : (
                            <span className="font-label text-xs text-muted-foreground">No attempts</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {assessment ? <StatusBadge status={assessment.status} /> : <Badge variant="secondary" className="font-label text-xs">Not started</Badge>}
                        </td>
                        <td className="px-5 py-4">
                          {assessment?.topCode ? (
                            <span className="inline-flex min-h-8 items-center rounded-lg bg-primary-fixed px-2.5 font-display text-sm font-bold text-on-primary-fixed">
                              {assessment.topCode}
                            </span>
                          ) : (
                            <span className="font-label text-xs text-muted-foreground">Pending result</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-label text-xs text-muted-foreground">
                          {assessment ? formatDate(assessment.resultAvailableAt ?? assessment.submittedAt ?? assessment.startedAt) : '—'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button type="button" variant="ghost" size="sm" className="rounded-xl font-label text-xs font-semibold" onClick={() => onNavigate(`/admin/students/${student.id}`)}>
                            Open student record <ArrowRight className="size-3.5" aria-hidden="true" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <EmptyPanel title="No student records match" description="Clear the search or choose another assessment status." />
          </div>
        )}

        <p className="mt-4 font-label text-xs text-muted-foreground">Showing {students.length} of {studentData.length} student records. Assessment evidence remains read-only.</p>
      </section>
    </div>
  )
}

function AdminStudentDetailPage({ studentId, onNavigate }: { studentId: string; onNavigate: (path: string) => void }) {
  const resource = useAdminResource<AdminStudentRecord>(`/students/${studentId}`)
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No student record was returned.'} onRetry={resource.retry} />
  const student = resource.data

  return (
    <div className="space-y-6" data-report-print>
      <AdminPageHeader
        eyebrow="Student record oversight"
        title={student.name}
        description={`${student.email} · ${student.attempts.length} recorded assessment ${student.attempts.length === 1 ? 'attempt' : 'attempts'}`}
        action={<Button variant="outline" className="rounded-xl font-label text-xs font-semibold" onClick={() => onNavigate('/admin/students')}>Back to students</Button>}
      />
      <StaffStudentProfile profile={student.profile} />
      <RetakeReasonSummary attempts={student.attempts} />
      {student.attempts.length ? (
        <div className="space-y-6">
          {student.attempts.map((attempt) => (
            <article key={attempt.id} className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-label text-xs font-bold uppercase tracking-wider text-muted-foreground">Attempt {attempt.attemptNumber}</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                    {attempt.topCode ? `${attempt.topCode} interest profile` : 'Assessment attempt'}
                  </h2>
                  <p className="mt-1 font-label text-xs text-muted-foreground">
                    {attempt.reference} · {formatDate(attempt.resultAvailableAt ?? attempt.submittedAt ?? attempt.startedAt)}
                  </p>
                </div>
                <StatusBadge status={attempt.status} />
              </div>

              {attempt.dimensions?.length ? (
                <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {attempt.dimensions.map((dimension) => (
                    <div key={dimension.code} className="rounded-2xl bg-secondary/80 p-3.5 text-center">
                      <dt className="font-label text-xs font-semibold text-muted-foreground">{dimension.code} · {dimension.label}</dt>
                      <dd className="mt-1.5 font-display text-2xl font-bold text-primary">{dimension.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {attempt.recommendations?.length ? (
                <div className="mt-6">
                  <h3 className="font-display text-lg font-bold text-foreground">Programme matches from this attempt</h3>
                  <ol className="mt-3 grid gap-3 lg:grid-cols-3">
                    {attempt.recommendations.slice(0, 3).map((course) => (
                      <li key={course.id} className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-label text-xs font-bold uppercase tracking-wider text-muted-foreground">#{course.rank} · {course.code}</span>
                          <strong className="font-display text-base font-bold text-primary">{course.match}%</strong>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-foreground">{course.name}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyPanel title="No assessment attempts" description="This student has not started an interest assessment." />
      )}
    </div>
  )
}

function RetakeReasonSummary({ attempts }: { attempts: AdminAssessment[] }) {
  const recorded = attempts.filter((attempt) => attempt.retakeReason)
  if (!recorded.length) return null

  return (
    <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs" aria-labelledby="retake-context-heading">
      <h2 id="retake-context-heading" className="font-display text-lg font-bold text-foreground">Student-provided retake context</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Optional reasons recorded when the student started each retake.</p>
      <dl className="mt-4 divide-y divide-border/60">
        {recorded.map((attempt) => (
          <div key={attempt.id} className="grid gap-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
            <dt className="font-label text-xs font-bold uppercase tracking-wider text-foreground">Attempt {attempt.attemptNumber}</dt>
            <dd className="text-xs leading-relaxed text-muted-foreground">{attempt.retakeReason}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function StaffStudentProfile({ profile }: { profile: AdminStudentRecord['profile'] }) {
  const rows = [
    { label: 'Student-reported strengths', values: profile.questionnaire.strengths },
    { label: 'Areas for growth', values: profile.questionnaire.growthAreas },
    { label: 'Learning preferences', values: profile.questionnaire.learningPreferences },
    { label: 'Career interests', values: profile.careerInterests },
  ]
  return (
    <section className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs" aria-labelledby="staff-student-profile-heading">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-on-primary-fixed">
            <UserRound className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-wider text-muted-foreground">Student profile</p>
            <h2 id="staff-student-profile-heading" className="mt-1 font-display text-2xl font-bold text-foreground">About {profile.student.name}</h2>
            <p className="mt-2 max-w-4xl text-xs leading-relaxed text-muted-foreground">{profile.about}</p>
          </div>
        </div>
      </div>
      <dl className="divide-y divide-border/60 border-t border-border/60">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 px-6 py-3.5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-5">
            <dt className="font-label text-xs font-semibold text-foreground">{row.label}</dt>
            <dd className="font-label text-xs leading-relaxed text-muted-foreground">{row.values.length ? row.values.join(', ') : 'Not recorded.'}</dd>
          </div>
        ))}
      </dl>
      <p className="bg-secondary/60 px-6 py-3 font-label text-[11px] leading-relaxed text-muted-foreground">
        Self-report selections are read-only for staff and are not a diagnosis or validated measure of ability or personality.
      </p>
    </section>
  )
}

function AssessmentMetric({ label, value, note, icon: Icon, tone }: { label: string; value: number; note: string; icon: typeof Activity; tone: 'warning' | 'info' | 'success' | 'danger' }) {
  const tones = { warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', info: 'bg-primary-fixed text-primary', success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' }
  return (
    <article className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-label text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 font-label text-xs text-muted-foreground">{note}</p>
        </div>
        <span className={`flex size-10 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  )
}

function AdminReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [query, setQuery] = useState('')
  const resource = useAdminResource<AdminReport>(`/reports${query}`)
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No report data was returned.'} onRetry={resource.retry} />
  const data = resource.data
  const exportQuery = query || (from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString()}` : '')
  const invalidRange = Boolean(from && to && to < from)

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-10" data-report-print>
      <AdminPageHeader
        eyebrow="Aggregate system records"
        title="System reports"
        description="Review aggregate student, assessment, recommendation, and programme-save activity from real system records."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl font-label text-xs font-semibold" onClick={() => window.print()}>
              <Printer aria-hidden="true" /> Print
            </Button>
            <Button className="rounded-xl font-label text-xs font-semibold" onClick={() => { window.location.href = `/api/v1/admin/reports/export${exportQuery}` }}>
              <Download aria-hidden="true" /> Export aggregate CSV
            </Button>
          </div>
        }
      />
      <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs" aria-labelledby="report-filter-heading">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="report-filter-heading" className="font-display text-lg font-bold text-foreground">Report period</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Dates filter records by their relevant recorded event date. Leave both blank for all records.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_auto_auto] sm:items-end">
            <label className="font-label text-xs font-semibold text-foreground">
              From
              <Input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className="mt-1.5 rounded-xl font-sans text-xs" />
            </label>
            <label className="font-label text-xs font-semibold text-foreground">
              To
              <Input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className="mt-1.5 rounded-xl font-sans text-xs" />
            </label>
            <Button className="rounded-xl font-label text-xs font-semibold" disabled={invalidRange} onClick={() => setQuery(from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString()}` : '')}>
              Apply dates
            </Button>
            <Button variant="ghost" className="rounded-xl font-label text-xs font-semibold" onClick={() => { setFrom(''); setTo(''); setQuery('') }}>
              Clear
            </Button>
          </div>
        </div>
        {invalidRange ? <p className="mt-3 font-label text-xs text-destructive" role="alert">The end date must be on or after the start date.</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Assessment and programme activity">
        <ReportMetric label="Students in scope" value={data.studentCount} note="Registered Student accounts" icon={UsersRound} />
        <ReportMetric label="Assessment completion" value={`${data.assessmentCompletionRate}%`} note={`${data.completedAssessments} of ${data.assessmentActivity} started students completed`} icon={CheckCircle2} />
        <ReportMetric label="Students with recommendations" value={data.recommendationRuns} note="Distinct students with recommendation runs" icon={BarChart3} />
        <ReportMetric label="Programme saves" value={data.programmeSaves} note="Saved programme actions recorded" icon={BookmarkCheck} />
      </section>

      <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs" aria-labelledby="monthly-completions-heading">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="monthly-completions-heading" className="font-display text-xl font-bold text-foreground">Assessment completion by month</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Distinct students whose result became available in each month.</p>
          </div>
          <ClipboardList className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        {data.assessmentCompletionsByMonth.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.assessmentCompletionsByMonth.map((entry) => {
              const maximum = Math.max(...data.assessmentCompletionsByMonth.map((item) => item.count), 1)
              return (
                <div key={entry.month} className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
                  <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                    <span className="text-foreground">{formatReportMonth(entry.month)}</span>
                    <strong className="font-display text-sm text-primary">{entry.count}</strong>
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(entry.count / maximum) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyPanel title="No completed assessments in this period" description="Change the report dates or clear the filter to review all recorded completions." />
          </div>
        )}
      </section>

      <p className="font-label text-xs leading-relaxed text-muted-foreground">Generated {formatDate(data.generatedAt)}. This report contains aggregate counts only. Identifiable exports are disabled for the current MVP.</p>
    </div>
  )
}

function AdminActivityPage() {
  const resource = useAdminResource<AdminActivity[]>('/activity')
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No activity data was returned.'} onRetry={resource.retry} />
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Accountability" title="Admin activity" description="Review auditable configuration, security, and aggregate-export actions performed through individual Administrator accounts." />
      {resource.data.length ? (
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs" aria-label="Admin activity log">
          <ol className="divide-y divide-border/60">
            {resource.data.map((event) => (
              <li key={event.id} className="grid gap-2 py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-center">
                <span className="flex size-9 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <History className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <strong className="block text-xs font-semibold text-foreground">{humanize(event.action)}</strong>
                  <span className="font-label text-xs text-muted-foreground">{event.actor} · {humanize(event.subjectType)} {event.subjectReference}</span>
                </span>
                <time className="font-label text-[11px] text-muted-foreground">{formatDate(event.createdAt)}</time>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <EmptyPanel title="No recorded activity" description="Configuration publishing and report exports will appear here." />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: AdminAssessment['status'] }) {
  const variants = { in_progress: 'warning', preparing_result: 'info', result_available: 'success', result_failed: 'destructive' } as const
  const labels = { in_progress: 'In progress', preparing_result: 'Finalizing', result_available: 'Result available', result_failed: 'Needs attention' }
  return <Badge variant={variants[status]} className="font-label text-xs">{labels[status]}</Badge>
}

function ReportMetric({ label, value, note, icon: Icon }: { label: string; value: number | string; note?: string; icon: typeof Activity }) {
  return (
    <article className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-label text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      {note ? <p className="mt-2 font-label text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
    </article>
  )
}

function formatReportMonth(month: string) { const [year, monthNumber] = month.split('-').map(Number); return new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' }).format(new Date(year, monthNumber - 1, 1)) }

export {
  AdminActivityPage,
  AdminDashboardPage,
  AdminReportsPage,
  AdminStudentDetailPage,
  AdminStudentsPage,
}
