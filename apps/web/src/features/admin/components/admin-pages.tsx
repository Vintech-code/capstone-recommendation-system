import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookmarkCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Compass,
  Download,
  History,
  Mail,
  MessageSquareText,
  Printer,
  Search,
  Target,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import tccBanner from '@/assets/tccbanner.jpg'
import { GuidanceCasePanel, GuidanceRecordSummary } from '@/features/admin/components/guidance-case-panel'
import {
  AdminPageError,
  AdminPageHeader,
  AdminPageSkeleton,
  EmptyPanel,
} from '@/features/admin/components/admin-shared'
import { formatDate, humanize } from '@/features/admin/data/admin-formatters'
import {
  useAdminResource,
  useWorkspaceResource,
  type AdminAssessment,
  type AdminActivity,
  type AdminOverview,
  type AdminReport,
  type AdminStaff,
  type AdminStudent,
  type AdminStudentRecord,
  type StaffApiScope,
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
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-4">
          <header className="relative min-h-48 overflow-hidden rounded-2xl border border-border bg-card px-6 py-7 shadow-sm dark:border-white/6 dark:shadow-[0_24px_60px_rgba(0,0,0,.22)] sm:px-8">
            <img src={tccBanner} alt="" className="absolute inset-y-0 right-0 h-full w-[58%] object-cover opacity-30 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-blue-950/25" />
            <div className="absolute inset-y-0 right-0 w-[58%] bg-gradient-to-t from-violet-600/20 via-blue-500/8 to-transparent" />
            <div className="relative max-w-xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-violet-300"><span className="size-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />Programme administration</p><h1 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, Admin <span aria-hidden="true">👋</span></h1><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground dark:text-slate-300">Monitor student programme activity, oversee the catalogue, and manage individual counselor access.</p></div>
          </header>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Administration metrics">
            <article className="relative min-h-64 overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-card p-5 shadow-sm dark:border-violet-400/55 dark:from-violet-950/90 dark:via-indigo-950/85 dark:to-card dark:shadow-[0_0_28px_rgba(124,58,237,.16)]"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-900 dark:text-violet-100">Assessment readiness</p><span className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-violet-500/18 dark:text-violet-300"><ClipboardList className="size-5" aria-hidden="true" /></span></div><div className="relative mx-auto mt-5 flex size-28 items-center justify-center rounded-full" style={{ background: `conic-gradient(#5b8cff ${completionRate * 3.6}deg, #6d43de ${completionRate * 3.6}deg, rgba(101,116,153,.22) 0deg)` }}><div className="flex size-24 items-center justify-center rounded-full bg-background"><strong className="font-display text-4xl">{completionRate}<span className="text-2xl">%</span></strong></div></div><p className="mt-5 text-xs leading-5 text-muted-foreground dark:text-slate-300">of current student assessment records have results available</p></article>
            <DashboardMetricCard label="Student records" value={data.students} note="Total students in the system" icon={UsersRound} tone="violet" />
            <DashboardMetricCard label="Results ready" value={data.completed} note="Assessments with results ready" icon={CheckCircle2} tone="green" />
            <DashboardMetricCard label="In progress" value={data.inProgress} note="Assessments currently in progress" icon={Clock3} tone="blue" />
            <DashboardMetricCard label="Needs review" value={data.needsAttention} note="Assessment records needing review" icon={AlertTriangle} tone="orange" />
          </section>

          <section className="grid overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm dark:border-white/6 dark:bg-card/80 sm:grid-cols-[1fr_1fr_1.1fr]" aria-label="Student coverage"><DashboardStripDatum icon={UsersRound} label="Students with assessment activity" value={data.assessments} /><DashboardStripDatum icon={BarChart3} label="Students with recommendations" value={data.recommendations} /><button type="button" onClick={() => onNavigate('/admin/students')} className="m-3 flex min-h-14 items-center justify-between rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-left font-semibold text-white ring-1 ring-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/60 dark:from-violet-950 dark:to-indigo-900 dark:text-violet-100 dark:ring-violet-500/20 dark:hover:from-violet-900 dark:hover:to-indigo-800 dark:focus-visible:ring-violet-400/60">Open student directory <ArrowRight className="size-4" aria-hidden="true" /></button></section>

          <section className="min-h-64 rounded-xl border border-border bg-card/90 p-6 shadow-sm dark:border-white/6 dark:bg-card/80" aria-labelledby="recent-heading"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Student journey</p><h2 id="recent-heading" className="mt-2 font-display text-xl font-semibold">Recent assessment activity</h2></div><Button variant="outline" className="rounded-lg bg-background" onClick={() => onNavigate('/admin/assessments')}>View all <ArrowRight aria-hidden="true" /></Button></div>{data.recentActivity.length ? <div className="mt-5 divide-y divide-border dark:divide-white/8">{data.recentActivity.map((item) => <button key={item.id} type="button" onClick={() => onNavigate(`/admin/students/${item.studentId}`)} className="grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 text-left hover:text-blue-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/50 dark:hover:text-violet-200 dark:focus-visible:ring-violet-400/50"><span><span className="block font-semibold">{item.studentName}</span><span className="mt-1 block text-xs text-muted-foreground">Attempt {item.attemptNumber} · {formatDate(item.resultAvailableAt ?? item.submittedAt)}</span></span><span className="flex items-center gap-3"><StatusBadge status={item.status} />{item.topCode ? <strong className="text-blue-600 dark:text-cyan-300">{item.topCode}</strong> : null}<ArrowRight className="size-4" aria-hidden="true" /></span></button>)}</div> : <div className="flex min-h-44 flex-col items-center justify-center text-center"><span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 dark:from-violet-500/25 dark:to-blue-500/10 dark:text-violet-300"><ClipboardList className="size-8" aria-hidden="true" /></span><h3 className="mt-4 text-lg font-semibold">No recent activity</h3><p className="mt-1 text-sm text-muted-foreground">Completed or failed assessment attempts will appear here.</p></div>}</section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card/90 p-5 shadow-sm dark:border-white/6 dark:bg-card/80" aria-labelledby="quick-actions-heading"><h2 id="quick-actions-heading" className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">Quick actions</h2><div className="mt-4 space-y-3"><DashboardAction title="Manage counselors" description="View and manage counselor accounts" icon={UsersRound} onClick={() => onNavigate('/admin/counselors')} /><DashboardAction title="Open programmes" description="View and manage programmes" icon={BookOpen} onClick={() => onNavigate('/admin/programmes')} /><DashboardAction title="Generate reports" description="Create and export reports" icon={BarChart3} onClick={() => onNavigate('/admin/reports')} /></div></section>

          <section className="rounded-xl border border-border bg-card/90 p-5 shadow-sm dark:border-white/6 dark:bg-card/80" aria-labelledby="attention-heading"><div className="flex items-start justify-between gap-4"><div><h2 id="attention-heading" className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">Operational attention</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Live records that may require an Administrator action.</p></div><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"><AlertTriangle className="size-5" aria-hidden="true" /></span></div><div className="mt-4 divide-y divide-border dark:divide-white/8"><OperationalAttentionRow label="Assessment processing failures" value={data.operationalAttention.processingFailures} path="/admin/assessments" onNavigate={onNavigate} /><OperationalAttentionRow label="Sources without a verification date" value={data.operationalAttention.unverifiedSources} path="/admin/programmes/sources" onNavigate={onNavigate} /><OperationalAttentionRow label="Unpublished programme drafts" value={data.operationalAttention.unpublishedDrafts} path="/admin/programmes" onNavigate={onNavigate} /><OperationalAttentionRow label="Suspended counselor accounts" value={data.operationalAttention.suspendedCounselors} path="/admin/counselors" onNavigate={onNavigate} /></div><div className="mt-4"><DashboardStatusDatum label="Pending guidance concerns" value={data.operationalAttention.pendingGuidanceRequests} /></div></section>

          <section className="rounded-xl border border-border bg-card/90 p-5 shadow-sm dark:border-white/6 dark:bg-card/80" aria-labelledby="audit-heading"><div className="flex items-center justify-between"><h2 id="audit-heading" className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">Recent activity</h2><button type="button" onClick={() => onNavigate('/admin/activity')} className="text-xs text-blue-600 hover:text-blue-800 dark:text-slate-300 dark:hover:text-white">View all</button></div>{activityResource.data?.length ? <ol className="mt-4 divide-y divide-border dark:divide-white/8">{activityResource.data.slice(0, 3).map((event) => <li key={event.id} className="flex gap-3 py-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-violet-500/20 dark:text-violet-300"><Activity className="size-4" aria-hidden="true" /></span><div className="min-w-0"><strong className="block truncate text-sm">{humanize(event.action)}</strong><p className="mt-1 truncate text-xs text-muted-foreground">{event.actor} · {humanize(event.subjectType)}</p><p className="mt-2 text-[11px] text-muted-foreground">{formatDate(event.createdAt)}</p></div></li>)}</ol> : <div className="mt-5 rounded-lg bg-secondary p-4 text-sm text-muted-foreground dark:bg-white/3">No administrative activity has been recorded.</div>}</section>
        </aside>
      </div>
    </div>
  )
}

function DashboardMetricCard({ label, value, note, icon: Icon, tone }: { label: string; value: number; note: string; icon: typeof Activity; tone: 'violet' | 'green' | 'blue' | 'orange' }) {
  const tones = { violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300', green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300', blue: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300', orange: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300' }
  const accents = { violet: 'bg-violet-400', green: 'bg-emerald-400', blue: 'bg-sky-400', orange: 'bg-orange-400' }
  return <article className="flex min-h-64 flex-col rounded-xl border border-border bg-card/90 p-5 shadow-sm dark:border-white/6 dark:bg-gradient-to-b dark:from-white/[.045] dark:to-white/[.018]"><span className={`flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="size-5" aria-hidden="true" /></span><div className="mt-7"><p className="text-xs font-bold uppercase tracking-[0.12em] text-foreground dark:text-slate-300">{label}</p><p className="mt-4 font-display text-4xl font-bold">{value}</p><p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground dark:text-slate-400">{note}</p></div><span className={`mt-auto h-0.5 w-12 rounded-full ${accents[tone]}`} aria-hidden="true" /></article>
}

function DashboardStripDatum({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number }) { return <div className="flex items-center gap-4 px-5 py-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"><Icon className="size-4" aria-hidden="true" /></span><div><dt className="text-xs leading-5 text-muted-foreground dark:text-slate-400">{label}</dt><dd className="font-display text-lg font-bold">{value}</dd></div></div> }
function DashboardAction({ title, description, icon: Icon, onClick }: { title: string; description: string; icon: typeof Activity; onClick: () => void }) { return <button type="button" onClick={onClick} className="group flex min-h-16 w-full items-center gap-3 rounded-xl border border-border bg-secondary/65 px-4 text-left transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/50 dark:border-white/6 dark:bg-white/[.035] dark:hover:border-violet-400/25 dark:hover:bg-violet-500/8 dark:focus-visible:ring-violet-400/50"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-cyan-50 text-blue-600 dark:from-violet-500/18 dark:to-cyan-400/8 dark:text-violet-300"><Icon className="size-5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="mt-1 block truncate text-xs text-muted-foreground dark:text-slate-400">{description}</span></span><ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-violet-300" aria-hidden="true" /></button> }
function OperationalAttentionRow({ label, value, path, onNavigate }: { label: string; value: number; path: string; onNavigate: (path: string) => void }) { return <button type="button" onClick={() => onNavigate(path)} className="group flex min-h-12 w-full items-center justify-between gap-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{label}</span><span className={`flex min-w-8 items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${value > 0 ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200' : 'bg-success/10 text-success'}`}>{value}</span></button> }
function DashboardStatusDatum({ label, value }: { label: string; value: number }) { return <div className="rounded-lg bg-secondary/70 px-3 py-3 dark:bg-white/[.035]"><p className="font-display text-xl font-bold">{value}</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{label}</p></div> }

function AdminStudentsPage({ onNavigate }: NavigateProps) {
  const resource = useAdminResource<AdminStudent[]>('/students')
  const [query, setQuery] = useState('')
  const students = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return resource.data?.filter((student) => `${student.name} ${student.email}`.toLowerCase().includes(normalized)) ?? []
  }, [query, resource.data])
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No student data was returned.'} onRetry={resource.retry} />

  return <div className="space-y-5">
    <AdminPageHeader eyebrow="Student guidance" title="Student records" description="Find a student and review immutable assessment attempts, RIASEC results, and saved programme matches." />
    <section className="bg-card p-5 shadow-sm" aria-labelledby="student-directory-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="student-directory-heading" className="font-display text-xl font-semibold">Directory</h2><p className="mt-1 text-sm text-muted-foreground">{resource.data.length} student records available</p></div><div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><label htmlFor="student-search" className="sr-only">Search students</label><Input id="student-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" className="rounded pl-9" /></div></div>
      {students.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[44rem] text-left text-sm"><thead className="bg-secondary text-xs uppercase tracking-[0.1em] text-muted-foreground"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Attempts</th><th className="px-4 py-3">Latest profile</th><th className="px-4 py-3">Latest result</th><th className="px-4 py-3"><span className="sr-only">Open</span></th></tr></thead><tbody className="divide-y">{students.map((student) => <StudentRow key={student.id} student={student} onOpen={() => onNavigate(`/admin/students/${student.id}`)} />)}</tbody></table></div> : <div className="mt-5"><EmptyPanel title="No students found" description="Try a different name or email address." /></div>}
    </section>
  </div>
}

function StudentRow({ student, onOpen }: { student: AdminStudent; onOpen: () => void }) {
  return <tr><td className="px-4 py-4"><strong className="block">{student.name}</strong><span className="text-xs text-muted-foreground">{student.email}</span></td><td className="px-4 py-4">{student.attemptCount}</td><td className="px-4 py-4"><strong>{student.latestTopCode ?? '—'}</strong></td><td className="px-4 py-4 text-muted-foreground">{formatDate(student.latestResultAt)}</td><td className="px-4 py-4 text-right"><Button variant="ghost" className="rounded" onClick={onOpen}>Open record <ArrowRight aria-hidden="true" /></Button></td></tr>
}

function AdminCounselorsPage({ onNavigate }: NavigateProps) {
  const resource = useAdminResource<AdminStaff[]>('/counselors')
  const [query, setQuery] = useState('')
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No counselor data was returned.'} onRetry={resource.retry} />
  const staff = resource.data
  const normalizedQuery = query.trim().toLowerCase()
  const visibleStaff = normalizedQuery
    ? staff.filter((member) => `${member.name} ${member.email} ${member.assignments.map((assignment) => assignment.studentName).join(' ')}`.toLowerCase().includes(normalizedQuery))
    : staff
  const activeStaff = staff.filter((member) => member.accountStatus === 'active').length
  const activeCases = staff.reduce((total, member) => total + member.activeCaseCount, 0)
  const dueFollowUps = staff.reduce((total, member) => total + member.followUpCount, 0)

  return <div className="space-y-5"><AdminPageHeader eyebrow="Guidance team" title="Counselor activity" description="Monitor authorized counselor accounts and the student guidance work each counselor has handled. Administrators do not assign students." />
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Counselor workload summary"><ReportMetric label="Active counselors" value={activeStaff} icon={UsersRound} /><ReportMetric label="Active cases" value={activeCases} icon={ClipboardList} /><ReportMetric label="Follow-ups" value={dueFollowUps} icon={CalendarDays} /></section>
    {staff.length ? <section className="bg-card p-5 shadow-sm" aria-labelledby="counselor-table-heading"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="counselor-table-heading" className="font-display text-xl font-semibold">Counselor monitoring</h2><p className="mt-1 text-sm text-muted-foreground">{visibleStaff.length} of {staff.length} authorized counselors shown</p></div><div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><label htmlFor="counselor-search" className="sr-only">Search counselor or student handled</label><Input id="counselor-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search counselor or student" className="rounded pl-9" /></div></div>{visibleStaff.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[64rem] text-left text-sm"><thead className="bg-secondary text-xs uppercase tracking-[0.1em] text-muted-foreground"><tr><th className="px-4 py-3">Counselor</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Active cases</th><th className="px-4 py-3 text-center">Follow-ups</th><th className="px-4 py-3 text-center">Overdue</th><th className="px-4 py-3">Students handled</th></tr></thead><tbody className="divide-y">{visibleStaff.map((member) => <tr key={member.id} className="align-top"><td className="px-4 py-4"><strong className="block">{member.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{member.email}</span></td><td className="px-4 py-4"><Badge variant={member.accountStatus === 'active' ? 'success' : 'secondary'}>{humanize(member.accountStatus)}</Badge></td><td className="px-4 py-4 text-center font-semibold">{member.activeCaseCount}</td><td className="px-4 py-4 text-center font-semibold">{member.followUpCount}</td><td className="px-4 py-4 text-center"><span className={member.overdueCount ? 'font-semibold text-destructive' : 'text-muted-foreground'}>{member.overdueCount}</span></td><td className="px-4 py-3">{member.assignments.length ? <ul className="space-y-1">{member.assignments.map((assignment) => <li key={assignment.caseId}><button type="button" onClick={() => onNavigate(`/admin/students/${assignment.studentId}`)} className="flex min-h-9 w-full items-center justify-between gap-3 rounded px-2 py-1 text-left hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><span><strong className="block text-sm">{assignment.studentName}</strong><span className="text-xs text-muted-foreground">{humanize(assignment.status)}{assignment.followUpOn ? ` · ${formatDate(assignment.followUpOn)}` : ''}</span></span><ArrowRight className="size-4 shrink-0" aria-hidden="true" /></button></li>)}</ul> : <span className="text-sm text-muted-foreground">No guidance activity</span>}</td></tr>)}</tbody></table></div> : <div className="mt-5"><EmptyPanel title="No matching counselors" description="Try another counselor name, email, or student." /></div>}</section> : <EmptyPanel title="No counselor accounts" description="Counselor accounts will appear after an Administrator creates them." />}
  </div>
}

function StaffStudentDetailPage({ studentId, onNavigate, apiScope }: { studentId: string; onNavigate: (path: string) => void; apiScope: StaffApiScope }) {
  const resource = useWorkspaceResource<AdminStudentRecord>(apiScope, `/students/${studentId}`)
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No student record was returned.'} onRetry={resource.retry} />
  const student = resource.data

  return <div className="space-y-5" data-report-print>
    <AdminPageHeader eyebrow={apiScope === 'admin' ? 'Student record oversight' : 'Counselor student record'} title={student.name} description={`${student.email} · ${student.attempts.length} recorded assessment ${student.attempts.length === 1 ? 'attempt' : 'attempts'}`} action={<Button variant="secondary" className="rounded" onClick={() => onNavigate(`/${apiScope}/students`)}>Back to students</Button>} />
    <StaffStudentProfile profile={student.profile} />
    {apiScope === 'admin' ? <GuidanceRecordSummary guidanceCase={student.guidanceCase} /> : <GuidanceCasePanel studentId={studentId} guidanceCase={student.guidanceCase} onChanged={resource.retry} />}
    <RetakeReasonSummary attempts={student.attempts} />
    {student.attempts.length ? <div className="space-y-5">{student.attempts.map((attempt) => <article key={attempt.id} className="bg-card p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Attempt {attempt.attemptNumber}</p><h2 className="mt-1 font-display text-2xl font-semibold">{attempt.topCode ? `${attempt.topCode} interest profile` : 'Assessment attempt'}</h2><p className="mt-1 text-sm text-muted-foreground">{attempt.reference} · {formatDate(attempt.resultAvailableAt ?? attempt.submittedAt ?? attempt.startedAt)}</p></div><StatusBadge status={attempt.status} /></div>{attempt.dimensions?.length ? <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{attempt.dimensions.map((dimension) => <div key={dimension.code} className="bg-secondary p-3"><dt className="text-xs text-muted-foreground">{dimension.code} · {dimension.label}</dt><dd className="mt-1 font-display text-2xl font-semibold">{dimension.value}</dd></div>)}</dl> : null}{attempt.recommendations?.length ? <div className="mt-6"><h3 className="font-display text-lg font-semibold">Programme matches from this attempt</h3><ol className="mt-3 grid gap-3 lg:grid-cols-3">{attempt.recommendations.slice(0, 3).map((course) => <li key={course.id} className="bg-secondary p-4"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-[0.12em]">#{course.rank} · {course.code}</span><strong className="text-primary">{course.match}%</strong></div><p className="mt-3 font-semibold">{course.name}</p></li>)}</ol></div> : null}</article>)}</div> : <EmptyPanel title="No assessment attempts" description="This student has not started an interest assessment." />}
  </div>
}

function RetakeReasonSummary({ attempts }: { attempts: AdminAssessment[] }) {
  const recorded = attempts.filter((attempt) => attempt.retakeReason)
  if (!recorded.length) return null

  return <section className="bg-card px-5 py-4 shadow-sm" aria-labelledby="retake-context-heading"><h2 id="retake-context-heading" className="font-display text-lg font-semibold">Student-provided retake context</h2><p className="mt-1 text-sm text-muted-foreground">Optional reasons recorded when the student started each retake.</p><dl className="mt-4 divide-y divide-border">{recorded.map((attempt) => <div key={attempt.id} className="grid gap-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4"><dt className="text-sm font-semibold">Attempt {attempt.attemptNumber}</dt><dd className="text-sm leading-6 text-muted-foreground">{attempt.retakeReason}</dd></div>)}</dl></section>
}

function AdminStudentDetailPage(props: { studentId: string; onNavigate: (path: string) => void }) { return <StaffStudentDetailPage {...props} apiScope="admin" /> }

function CounselorStudentDetailPage({ studentId, onNavigate }: { studentId: string; onNavigate: (path: string) => void }) {
  const resource = useWorkspaceResource<AdminStudentRecord>('counselor', `/students/${studentId}`)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No student record was returned.'} onRetry={resource.retry} />

  const student = resource.data
  const completedAttempt = student.attempts.find((attempt) => attempt.status === 'result_available') ?? null
  const latestAttempt = student.attempts[0] ?? null
  const initials = student.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ST'
  const recordReference = `STU-${String(student.id).padStart(6, '0')}`
  const guidanceStatus = student.guidanceCase?.status ?? 'not_started'
  const recommendationCount = completedAttempt?.recommendations?.length ?? 0

  return <div className="mx-auto w-full max-w-[1500px] space-y-5 pb-10" data-report-print>
    <button type="button" onClick={() => onNavigate('/counselor/students')} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-muted-foreground transition hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><ArrowLeft className="size-4" aria-hidden="true" />Back to student records</button>

    <header className="relative overflow-hidden rounded-2xl bg-primary px-5 py-6 text-primary-foreground shadow-sm sm:px-7 sm:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_15%,rgba(134,160,205,.28),transparent_32%),linear-gradient(120deg,transparent_55%,rgba(254,151,67,.10))]" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-fixed text-3xl font-bold text-on-primary-fixed shadow-sm" aria-label={student.profile.student.photoUrl ? `${student.name} profile photo` : `${student.name} profile placeholder`}>{student.profile.student.photoUrl ? <img src={student.profile.student.photoUrl} alt="" className="size-full object-cover" /> : initials}</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">Student applicant</span><span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">{humanize(student.accountStatus)}</span></div>
            <h1 className="mt-3 truncate font-display text-3xl font-bold tracking-tight sm:text-4xl">{student.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75"><span className="inline-flex items-center gap-2"><Mail className="size-4" aria-hidden="true" />{student.email}</span><span className="inline-flex items-center gap-2"><UserRound className="size-4" aria-hidden="true" />{recordReference}</span><span className="inline-flex items-center gap-2"><BookOpen className="size-4" aria-hidden="true" />TCC programme guidance record</span></div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2"><Button type="button" className="rounded-lg bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim" onClick={() => setWorkspaceOpen(true)}><MessageSquareText aria-hidden="true" />Open counseling workspace</Button><Button type="button" variant="secondary" className="rounded-lg" onClick={() => window.print()}><Printer aria-hidden="true" />Print student summary</Button></div>
      </div>
      <dl className="relative mt-7 grid gap-px overflow-hidden rounded-xl bg-white/15 sm:grid-cols-2 xl:grid-cols-4">
        <ProfileMetric label="Assessment attempts" value={String(student.attempts.length)} note={latestAttempt ? `Latest: ${humanize(latestAttempt.status)}` : 'No activity yet'} />
        <ProfileMetric label="Current interest profile" value={completedAttempt?.topCode ?? 'Not available'} note={completedAttempt?.resultAvailableAt ? `Result ${formatDate(completedAttempt.resultAvailableAt)}` : 'Complete assessment first'} />
        <ProfileMetric label="Programme matches" value={String(recommendationCount)} note={completedAttempt?.recommendations?.[0]?.name ?? 'No recorded matches'} />
        <ProfileMetric label="Guidance progress" value={guidanceStatus === 'not_started' ? 'Not started' : humanize(guidanceStatus)} note={student.guidanceCase?.followUpOn ? `Follow-up ${formatDate(student.guidanceCase.followUpOn)}` : 'No follow-up scheduled'} />
      </dl>
    </header>

    <main className="space-y-5">
        <StaffStudentProfile profile={student.profile} />
        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]" data-testid="student-evidence-band">
        <section className="h-full rounded-xl bg-card p-5 shadow-sm sm:p-6" aria-labelledby="interest-snapshot-heading">
          <SectionHeading icon={Target} eyebrow="Current assessment evidence" title="Interest profile at a glance" id="interest-snapshot-heading" description="Recorded RIASEC dimensions from the latest completed assessment. Assessment evidence is read-only." />
          {completedAttempt?.dimensions?.length ? <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_15rem]"><RiasecProfile dimensions={completedAttempt.dimensions} /><div className="rounded-xl bg-primary-fixed/55 p-5 text-on-primary-fixed"><p className="text-xs font-semibold uppercase tracking-[0.13em]">Recorded profile</p><p className="mt-3 font-display text-4xl font-bold">{completedAttempt.topCode}</p><p className="mt-3 text-sm leading-6 text-on-primary-fixed-variant">This profile summarizes the student’s recorded interest scores. Use the detailed values and programme evidence during counseling.</p><p className="mt-5 text-xs font-medium">{completedAttempt.reference} · Attempt {completedAttempt.attemptNumber}</p></div></div> : <div className="mt-5"><EmptyPanel title="No completed interest profile" description="The latest assessment has not produced a result yet." /></div>}
        </section>

        <section className="h-full rounded-xl bg-card p-5 shadow-sm sm:p-6" aria-labelledby="programme-direction-heading">
          <SectionHeading icon={Compass} eyebrow="Programme direction" title="Current programme matches" id="programme-direction-heading" description="The highest recorded matches from the latest completed assessment, shown as guidance rather than admission eligibility." />
          {completedAttempt?.recommendations?.length ? <ol className="mt-5 divide-y divide-border">{completedAttempt.recommendations.slice(0, 5).map((course) => <li key={course.id} className="grid gap-3 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center"><span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{course.rank}</span><div><p className="font-semibold">{course.name}</p><p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{course.code}</p></div><div className="sm:text-right"><strong className="text-lg text-primary">{course.match}%</strong><span className="block text-xs text-muted-foreground">recorded match</span></div></li>)}</ol> : <div className="mt-5"><EmptyPanel title="No programme matches" description="Programme matches will appear after an assessment result is available." /></div>}
        </section>
        </div>
    </main>
    <Sheet open={workspaceOpen} onOpenChange={setWorkspaceOpen}><SheetContent closeLabel="Close counseling workspace" className="w-[min(72rem,96vw)] max-w-none overflow-y-auto p-0"><SheetHeader className="sr-only"><SheetTitle>Counseling workspace for {student.name}</SheetTitle><SheetDescription>Update guidance progress, add an append-only counseling note, and review guidance history.</SheetDescription></SheetHeader><GuidanceCasePanel studentId={studentId} guidanceCase={student.guidanceCase} onChanged={resource.retry} /></SheetContent></Sheet>
  </div>
}

function ProfileMetric({ label, value, note }: { label: string; value: string; note: string }) { return <div className="min-w-0 bg-primary-container/80 p-4"><dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">{label}</dt><dd className="mt-2 truncate font-display text-xl font-bold text-white">{value}</dd><p className="mt-1 truncate text-xs text-white/65">{note}</p></div> }
function StaffStudentProfile({ profile }: { profile: AdminStudentRecord['profile'] }) { const rows = [{ label: 'Student-reported strengths', values: profile.questionnaire.strengths }, { label: 'Areas for growth', values: profile.questionnaire.growthAreas }, { label: 'Learning preferences', values: profile.questionnaire.learningPreferences }, { label: 'Career interests', values: profile.careerInterests }]; return <section className="overflow-hidden rounded-xl bg-card shadow-sm" aria-labelledby="staff-student-profile-heading"><div className="p-5 sm:p-6"><div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-on-primary-fixed"><UserRound className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Student profile</p><h2 id="staff-student-profile-heading" className="mt-1 font-display text-xl font-bold sm:text-2xl">About {profile.student.name}</h2><p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">{profile.about}</p></div></div></div><dl className="divide-y divide-border">{rows.map((row) => <div key={row.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-5 sm:px-6"><dt className="text-sm font-semibold">{row.label}</dt><dd className="text-sm leading-6 text-muted-foreground">{row.values.length ? row.values.join(', ') : 'Not recorded.'}</dd></div>)}</dl><p className="bg-secondary px-5 py-3 text-xs leading-5 text-muted-foreground sm:px-6">Self-report selections are read-only for staff and are not a diagnosis or validated measure of ability or personality.</p></section> }
function SectionHeading({ icon: Icon, eyebrow, title, id, description }: { icon: typeof Target; eyebrow: string; title: string; id: string; description: string }) { return <div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-on-primary-fixed"><Icon className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p><h2 id={id} className="mt-1 font-display text-xl font-bold sm:text-2xl">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p></div></div> }
function RiasecProfile({ dimensions }: { dimensions: NonNullable<AdminAssessment['dimensions']> }) { const maximum = Math.max(...dimensions.map((dimension) => dimension.value), 1); return <dl className="space-y-4">{dimensions.map((dimension) => <div key={dimension.code}><div className="flex items-center justify-between gap-4 text-sm"><dt><strong>{dimension.code}</strong><span className="ml-2 text-muted-foreground">{dimension.label}</span></dt><dd className="font-display text-lg font-bold">{dimension.value}</dd></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-secondary-container" style={{ width: `${Math.max(5, (dimension.value / maximum) * 100)}%` }} /></div></div>)}</dl> }

function AdminAssessmentsPage({ onNavigate }: NavigateProps) {
  const resource = useAdminResource<AdminAssessment[]>('/assessments')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | AdminAssessment['status']>('all')
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No assessment data was returned.'} onRetry={resource.retry} />
  const data = resource.data
  const normalized = query.trim().toLowerCase()
  const attempts = data.filter((attempt) => {
    const matchesQuery = !normalized || `${attempt.studentName ?? ''} ${attempt.studentEmail ?? ''} ${attempt.reference} ${attempt.topCode ?? ''}`.toLowerCase().includes(normalized)
    return matchesQuery && (status === 'all' || attempt.status === status)
  })
  const count = (value: AdminAssessment['status']) => data.filter((attempt) => attempt.status === value).length
  return <div className="space-y-5">
    <AdminPageHeader eyebrow="Assessment monitoring" title="Assessment activity" description="Monitor each student’s current assessment state. Earlier attempts remain available inside the student record without repeating the same user in this ledger." />
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Assessment lifecycle summary">
      <AssessmentMetric label="In progress" value={count('in_progress')} note="Students still answering" icon={Clock3} tone="warning" />
      <AssessmentMetric label="Finalizing" value={count('preparing_result')} note="Submitted and processing" icon={Activity} tone="info" />
      <AssessmentMetric label="Results available" value={count('result_available')} note="Ready for student review" icon={CheckCircle2} tone="success" />
      <AssessmentMetric label="Needs attention" value={count('result_failed')} note="Processing did not finish" icon={AlertTriangle} tone="danger" />
    </section>
    <section className="bg-card p-5 shadow-sm" aria-labelledby="assessment-ledger-heading">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Current status by student</p><h2 id="assessment-ledger-heading" className="mt-1 font-display text-xl font-semibold">Student assessment records</h2><p className="mt-1 text-sm text-muted-foreground">One row per student. Open the record to review that student’s complete assessment history.</p></div><div className="grid gap-3 sm:grid-cols-[minmax(15rem,1fr)_13rem]"><label className="relative"><span className="sr-only">Search assessment activity</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student or reference" className="min-h-11 rounded pl-9" /></label><label className="grid gap-1 text-xs font-semibold text-muted-foreground"><span className="sr-only">Filter by assessment status</span><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 rounded border border-input bg-background px-3 text-sm font-semibold text-foreground"><option value="all">All statuses</option><option value="in_progress">In progress</option><option value="preparing_result">Finalizing</option><option value="result_available">Result available</option><option value="result_failed">Needs attention</option></select></label></div></div>
      {attempts.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[58rem] text-left text-sm"><thead className="bg-secondary text-xs uppercase tracking-[0.1em] text-muted-foreground"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Latest attempt</th><th className="px-4 py-3">Current state</th><th className="px-4 py-3">Latest profile</th><th className="px-4 py-3">Last update</th><th className="px-4 py-3"><span className="sr-only">Action</span></th></tr></thead><tbody className="divide-y">{attempts.map((attempt) => <tr key={attempt.studentId} className="align-middle"><td className="px-4 py-4"><strong className="block">{attempt.studentName ?? 'Student record'}</strong><span className="text-xs text-muted-foreground">{attempt.studentEmail ?? 'No email available'}</span></td><td className="px-4 py-4"><strong className="block">Attempt {attempt.attemptNumber}</strong><span className="text-xs text-muted-foreground">{attempt.attemptCount ?? attempt.attemptNumber} total · {attempt.reference}</span></td><td className="px-4 py-4"><StatusBadge status={attempt.status} /></td><td className="px-4 py-4">{attempt.topCode ? <span className="inline-flex min-h-9 items-center rounded bg-primary-fixed px-3 font-display text-lg font-semibold text-on-primary-fixed">{attempt.topCode}</span> : <span className="text-muted-foreground">Pending result</span>}</td><td className="px-4 py-4 text-muted-foreground">{formatDate(attempt.resultAvailableAt ?? attempt.submittedAt ?? attempt.startedAt)}</td><td className="px-4 py-4 text-right"><Button type="button" variant="ghost" className="rounded" onClick={() => onNavigate(`/admin/students/${attempt.studentId}`)}>Open student record <ArrowRight aria-hidden="true" /></Button></td></tr>)}</tbody></table></div> : <div className="mt-5"><EmptyPanel title="No student records match" description="Clear the search or choose another current status." /></div>}
      <p className="mt-4 text-xs text-muted-foreground">Showing {attempts.length} of {data.length} students with assessment activity. This page does not modify assessment data.</p>
    </section>
  </div>
}

function AssessmentMetric({ label, value, note, icon: Icon, tone }: { label: string; value: number; note: string; icon: typeof Activity; tone: 'warning' | 'info' | 'success' | 'danger' }) {
  const tones = { warning: 'bg-warning/12 text-warning', info: 'bg-primary-fixed text-on-primary-fixed', success: 'bg-success/12 text-success', danger: 'bg-destructive/10 text-destructive' }
  return <article className="bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">{label}</p><p className="mt-2 font-display text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div><span className={`flex size-11 items-center justify-center rounded ${tones[tone]}`}><Icon className="size-5" aria-hidden="true" /></span></div></article>
}

function AdminReportsPage({ apiScope = 'admin' }: { apiScope?: StaffApiScope }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [query, setQuery] = useState('')
  const resource = useWorkspaceResource<AdminReport>(apiScope, `/reports${query}`)
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No report data was returned.'} onRetry={resource.retry} />
  const data = resource.data
  const exportQuery = query || (from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString()}` : '')
  const invalidRange = Boolean(from && to && to < from)
  return <div className="mx-auto w-full max-w-[1500px] space-y-5 pb-10" data-report-print><AdminPageHeader eyebrow="Aggregate guidance" title="Guidance reports" description={data.scope === 'counselor' ? 'Review aggregate activity for students and guidance records connected to your counselor account.' : 'Review aggregate student, assessment, guidance-concern, and programme-save activity from real system records.'} action={<div className="flex flex-wrap gap-2"><Button variant="outline" className="rounded" onClick={() => window.print()}><Printer aria-hidden="true" /> Print</Button><Button className="rounded" onClick={() => { window.location.href = `/api/v1/${apiScope}/reports/export${exportQuery}` }}><Download aria-hidden="true" /> Export aggregate CSV</Button></div>} />
    <section className="rounded-xl bg-card p-5 shadow-sm" aria-labelledby="report-filter-heading"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h2 id="report-filter-heading" className="font-display text-lg font-semibold">Report period</h2><p className="mt-1 text-sm text-muted-foreground">Dates filter records by their relevant recorded event date. Leave both blank for all records.</p></div><div className="grid gap-3 sm:grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_auto_auto] sm:items-end"><label className="text-sm font-medium">From<Input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className="mt-2 rounded" /></label><label className="text-sm font-medium">To<Input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className="mt-2 rounded" /></label><Button className="rounded" disabled={invalidRange} onClick={() => setQuery(from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString()}` : '')}>Apply dates</Button><Button variant="ghost" className="rounded" onClick={() => { setFrom(''); setTo(''); setQuery('') }}>Clear</Button></div></div>{invalidRange ? <p className="mt-3 text-sm text-destructive" role="alert">The end date must be on or after the start date.</p> : null}</section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Assessment and programme activity">
      <ReportMetric label="Students in scope" value={data.studentCount} note={data.scope === 'counselor' ? 'Students connected to your guidance records' : 'Registered Student Applicant accounts'} icon={UsersRound} />
      <ReportMetric label="Assessment completion" value={`${data.assessmentCompletionRate}%`} note={`${data.completedAssessments} of ${data.assessmentActivity} students who started in the selected period now have results`} icon={CheckCircle2} />
      <ReportMetric label="Students with recommendations" value={data.recommendationRuns} note="Distinct students with a generated recommendation run" icon={BarChart3} />
      <ReportMetric label="Programme saves" value={data.programmeSaves} note="Save actions recorded during the selected period" icon={BookmarkCheck} />
    </section>

    <section className="rounded-xl bg-card p-5 shadow-sm" aria-labelledby="request-report-heading"><h2 id="request-report-heading" className="font-display text-xl font-semibold">Guidance operations</h2><p className="mt-1 text-sm text-muted-foreground">Current concern and case states; no student identities are included.</p><div className="mt-5 grid grid-cols-3 gap-3"><ReportDatum label="Open follow-ups" value={data.openFollowUps} /><ReportDatum label="Overdue" value={data.overdueFollowUps} /><ReportDatum label="Closed cases" value={data.closedGuidanceCases} /></div><dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{Object.entries(data.guidanceRequestStatuses).map(([status, count]) => <ReportStatus key={status} label={humanize(status)} value={count} />)}</dl></section>

    <section className="rounded-xl bg-card p-5 shadow-sm" aria-labelledby="monthly-completions-heading"><div className="flex items-start justify-between gap-4"><div><h2 id="monthly-completions-heading" className="font-display text-xl font-semibold">Assessment completion by month</h2><p className="mt-1 text-sm text-muted-foreground">Distinct students whose result became available in each month.</p></div><ClipboardList className="size-5 text-muted-foreground" aria-hidden="true" /></div>{data.assessmentCompletionsByMonth.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.assessmentCompletionsByMonth.map((entry) => { const maximum = Math.max(...data.assessmentCompletionsByMonth.map((item) => item.count), 1); return <div key={entry.month}><div className="flex items-center justify-between gap-4 text-sm"><span>{formatReportMonth(entry.month)}</span><strong>{entry.count}</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-secondary-container" style={{ width: `${(entry.count / maximum) * 100}%` }} /></div></div> })}</div> : <div className="mt-5"><EmptyPanel title="No completed assessments in this period" description="Change the report dates or clear the filter to review all recorded completions." /></div>}</section>

    <p className="text-xs leading-5 text-muted-foreground">Generated {formatDate(data.generatedAt)}. This report contains aggregate counts only. Identifiable exports are disabled for the current MVP.</p>
  </div>
}

function AdminActivityPage() {
  const resource = useAdminResource<AdminActivity[]>('/activity')
  if (resource.loading) return <AdminPageSkeleton />
  if (resource.error || !resource.data) return <AdminPageError message={resource.error ?? 'No activity data was returned.'} onRetry={resource.retry} />
  return <div className="space-y-5"><AdminPageHeader eyebrow="Accountability" title="Admin activity" description="Review auditable guidance, configuration, and aggregate-export actions performed through individual counselor accounts." />{resource.data.length ? <section className="bg-card p-5 shadow-sm" aria-label="Admin activity log"><ol className="divide-y">{resource.data.map((event) => <li key={event.id} className="grid gap-2 py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-center"><span className="flex size-9 items-center justify-center rounded bg-secondary text-primary"><History className="size-4" aria-hidden="true" /></span><span><strong className="block">{humanize(event.action)}</strong><span className="text-sm text-muted-foreground">{event.actor} · {humanize(event.subjectType)} {event.subjectReference}</span></span><time className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</time></li>)}</ol></section> : <EmptyPanel title="No recorded activity" description="Guidance notes, configuration publishing, and report exports will appear here." />}</div>
}

function StatusBadge({ status }: { status: AdminAssessment['status'] }) {
  const variants = { in_progress: 'warning', preparing_result: 'info', result_available: 'success', result_failed: 'destructive' } as const
  const labels = { in_progress: 'In progress', preparing_result: 'Finalizing', result_available: 'Result available', result_failed: 'Needs attention' }
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}

function ReportMetric({ label, value, note, icon: Icon }: { label: string; value: number | string; note?: string; icon: typeof Activity }) {
  return <article className="rounded-xl bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">{label}</p><p className="mt-3 font-display text-3xl font-bold">{value}</p></div><span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><Icon className="size-5" aria-hidden="true" /></span></div>{note ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{note}</p> : null}</article>
}

function ReportStatus({ label, value }: { label: string; value: number }) { return <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-display text-xl font-semibold">{value}</dd></div> }
function ReportDatum({ label, value }: { label: string; value: number }) { return <div className="rounded-lg bg-secondary p-3"><dt className="text-xs leading-4 text-muted-foreground">{label}</dt><dd className="mt-2 font-display text-2xl font-semibold">{value}</dd></div> }
function formatReportMonth(month: string) { const [year, monthNumber] = month.split('-').map(Number); return new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' }).format(new Date(year, monthNumber - 1, 1)) }

export {
  AdminAssessmentsPage,
  AdminActivityPage,
  AdminDashboardPage,
  AdminReportsPage,
  AdminCounselorsPage,
  AdminStudentDetailPage,
  CounselorStudentDetailPage,
  AdminStudentsPage,
}
