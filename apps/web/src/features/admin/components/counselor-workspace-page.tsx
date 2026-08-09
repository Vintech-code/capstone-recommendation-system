import { ArrowRight, BarChart3, CalendarCheck2, CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock3, MessageCircleMore, UsersRound } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import tccBanner from '@/assets/tccbanner.jpg'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminPageError, AdminPageHeader, AdminPageSkeleton, EmptyPanel } from '@/features/admin/components/admin-shared'
import { formatDate, humanize } from '@/features/admin/data/admin-formatters'
import { useAuth } from '@/features/auth/auth-context'
import {
  mutateWorkspace,
  useWorkspaceResource,
  type AdminStaff,
  type AdminGuidanceRequest,
  type AdminStudent,
  type GuidanceAppointment,
  type StaffApiScope,
} from '@/features/admin/data/admin-api'

interface CounselorWorkspacePageProps { onNavigate: (path: string) => void; apiScope?: StaffApiScope; activeSection?: string }
interface AppointmentDraft { studentId: string; counselorId: string; scheduledAt: string; endsAt: string; topic: string; programmeCode: string; notes: string; guidanceRequestId: string }

const emptyDraft: AppointmentDraft = { studentId: '', counselorId: '', scheduledAt: '', endsAt: '', topic: '', programmeCode: '', notes: '', guidanceRequestId: '' }

function CounselorWorkspacePage({ onNavigate, apiScope = 'admin', activeSection = 'overview' }: CounselorWorkspacePageProps) {
  const { user } = useAuth()
  const counselors = useWorkspaceResource<AdminStaff[]>(apiScope, '/counselors')
  const students = useWorkspaceResource<AdminStudent[]>(apiScope, '/students')
  const appointments = useWorkspaceResource<GuidanceAppointment[]>(apiScope, '/appointments')
  const guidanceRequests = useWorkspaceResource<AdminGuidanceRequest[]>(apiScope, '/guidance-requests')
  const [draft, setDraft] = useState(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scheduled = useMemo(() => [...(appointments.data?.filter((item) => item.status === 'scheduled') ?? [])].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)), [appointments.data])
  const pendingRequests = useMemo(() => guidanceRequests.data?.filter((item) => item.status === 'pending') ?? [], [guidanceRequests.data])
  const activeCases = counselors.data?.reduce((sum, item) => sum + item.activeCaseCount, 0) ?? 0
  const followUps = counselors.data?.reduce((sum, item) => sum + item.followUpCount, 0) ?? 0

  if (counselors.loading || students.loading || appointments.loading || guidanceRequests.loading) return <AdminPageSkeleton />
  const loadingError = counselors.error ?? students.error ?? appointments.error ?? guidanceRequests.error
  if (loadingError || !counselors.data || !students.data || !appointments.data || !guidanceRequests.data) {
    return <AdminPageError message={loadingError ?? 'The counselor workspace returned incomplete data.'} onRetry={() => { counselors.retry(); students.retry(); appointments.retry(); guidanceRequests.retry() }} />
  }
  const defaultCounselorId = String(counselors.data.find((item) => item.accountStatus === 'active')?.id ?? '')
  const selectedCounselorId = draft.counselorId || defaultCounselorId

  const saveAppointment = async () => {
    setMessage(null); setError(null)
    if (!draft.studentId || !selectedCounselorId || !draft.scheduledAt || !draft.endsAt || draft.topic.trim().length < 3) {
      setError('Select a student, then enter the appointment start, end, and topic.')
      return
    }
    if (draft.endsAt <= draft.scheduledAt) {
      setError('The appointment end must be later than its start.')
      return
    }
    setSaving(true)
    try {
      await mutateWorkspace<GuidanceAppointment>(apiScope, '/appointments', 'POST', {
        studentId: Number(draft.studentId), counselorId: Number(selectedCounselorId),
        scheduledAt: manilaLocalToIso(draft.scheduledAt), endsAt: manilaLocalToIso(draft.endsAt), topic: draft.topic.trim(),
        programmeCode: draft.programmeCode.trim() || null, notes: draft.notes.trim() || null,
        guidanceRequestId: draft.guidanceRequestId ? Number(draft.guidanceRequestId) : null,
      })
      setDraft({ ...emptyDraft, counselorId: selectedCounselorId })
      setMessage('Appointment scheduled successfully.')
      appointments.retry()
      guidanceRequests.retry()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The appointment could not be scheduled.')
    } finally { setSaving(false) }
  }

  const updateStatus = async (appointment: GuidanceAppointment, status: GuidanceAppointment['status'], cancellationReason?: string) => {
    setMessage(null); setError(null)
    try {
      await mutateWorkspace<GuidanceAppointment>(apiScope, `/appointments/${appointment.id}`, 'PUT', {
        studentId: appointment.studentId, counselorId: appointment.counselorId,
        scheduledAt: appointment.scheduledAt, endsAt: appointment.endsAt, topic: appointment.topic,
        programmeCode: appointment.programmeCode, notes: appointment.notes, status, cancellationReason,
      })
      setMessage(`Appointment marked ${humanize(status).toLowerCase()}.`)
      appointments.retry()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The appointment could not be updated.')
    }
  }

  const isOverview = activeSection === 'overview'
  const prepareRequest = (request: AdminGuidanceRequest) => {
    setDraft({
      ...emptyDraft,
      studentId: String(request.studentId),
      counselorId: selectedCounselorId,
      topic: request.programmeCode ? `Review ${request.programmeCode} programme match` : 'Review programme matches',
      programmeCode: request.programmeCode ?? '',
      notes: request.message,
      guidanceRequestId: String(request.id),
    })
    if (isOverview) onNavigate('/admin/appointments')
    window.setTimeout(() => document.getElementById('new-appointment-heading')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0)
  }

  const declineRequest = async (request: AdminGuidanceRequest, reason: string) => {
    setMessage(null); setError(null)
    try {
      await mutateWorkspace(apiScope, `/guidance-requests/${request.id}/decline`, 'POST', { reason })
      setMessage('Guidance request declined with a recorded reason.')
      guidanceRequests.retry()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The guidance request could not be declined.')
    }
  }

  if (isOverview) {
    return <CounselorDashboard
      counselorName={user?.name ?? 'Counselor'}
      students={students.data}
      counselors={counselors.data}
      appointments={appointments.data}
      guidanceRequests={guidanceRequests.data}
      pendingRequests={pendingRequests}
      scheduled={scheduled}
      activeCases={activeCases}
      followUps={followUps}
      onNavigate={onNavigate}
      onPrepare={prepareRequest}
      onDecline={declineRequest}
    />
  }

  return <div className="space-y-5">
    <AdminPageHeader eyebrow="Student course guidance" title={sectionTitle(activeSection)} description="Review student records, respond to guidance requests, and manage appointments. Assessment, programme, and account data remain read-only." />

    {activeSection === 'requests' ? <GuidanceRequestQueue requests={pendingRequests} onPrepare={prepareRequest} onDecline={declineRequest} /> : null}

    {message ? <p role="status" className="bg-success/10 px-4 py-3 text-sm font-medium text-success">{message}</p> : null}
    {error ? <p role="alert" className="bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p> : null}

    {activeSection === 'appointments' ? <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
      <section className="min-w-0 bg-card p-5 shadow-sm" aria-labelledby="appointment-list-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Schedule</p>
        <h2 id="appointment-list-heading" className="mt-1 font-display text-xl font-semibold">Course-guidance appointments</h2>
        <p className="mt-1 text-sm text-muted-foreground">Upcoming conversations appear first. Completed, cancelled, and no-show records remain in the history.</p>
        {appointments.data.length ? <AppointmentTable appointments={appointments.data} onNavigate={onNavigate} onStatus={updateStatus} /> : <div className="mt-5"><EmptyPanel title="No appointments scheduled" description="Use the form to schedule the first student course-guidance appointment." /></div>}
      </section>

      <section className="min-w-0 bg-secondary p-5 shadow-sm" aria-labelledby="new-appointment-heading">
        <span className="flex size-10 items-center justify-center rounded bg-primary text-primary-foreground"><CalendarPlus className="size-5" aria-hidden="true" /></span>
        <h2 id="new-appointment-heading" className="mt-4 font-display text-xl font-semibold">Schedule appointment</h2>
        {draft.guidanceRequestId ? <p className="mt-3 rounded-lg bg-primary-fixed px-3 py-2 text-sm font-medium text-on-primary-fixed">Preparing student request #{draft.guidanceRequestId}. Scheduling will close it automatically.</p> : null}
        <div className="mt-5 space-y-4">
          <Field label="Student" id="appointment-student"><select id="appointment-student" value={draft.studentId} onChange={(event) => setDraft({ ...draft, studentId: event.target.value })} className="mt-2 h-10 w-full rounded border border-input bg-background px-3 text-sm"><option value="">Select student</option>{students.data.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.email}</option>)}</select></Field>
          <Field label="Date and time" id="appointment-time"><Input id="appointment-time" type="datetime-local" value={draft.scheduledAt} onChange={(event) => setDraft({ ...draft, scheduledAt: event.target.value })} className="mt-2 rounded bg-background" /></Field>
          <Field label="End date and time" id="appointment-end"><Input id="appointment-end" type="datetime-local" value={draft.endsAt} min={draft.scheduledAt || undefined} onChange={(event) => setDraft({ ...draft, endsAt: event.target.value })} className="mt-2 rounded bg-background" /></Field>
          <Field label="Guidance topic" id="appointment-topic"><Input id="appointment-topic" value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value })} placeholder="Example: Review programme matches" className="mt-2 rounded bg-background" /></Field>
          <Field label="Programme code (optional)" id="appointment-programme"><Input id="appointment-programme" value={draft.programmeCode} onChange={(event) => setDraft({ ...draft, programmeCode: event.target.value })} placeholder="Example: BSIT" className="mt-2 rounded bg-background" /></Field>
          <Field label="Internal notes (optional)" id="appointment-notes"><textarea id="appointment-notes" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={3} className="mt-2 w-full rounded border border-input bg-background px-3 py-2 text-sm" /></Field>
          <Button type="button" disabled={saving} onClick={() => void saveAppointment()} className="w-full rounded">{saving ? 'Scheduling…' : 'Schedule appointment'} <ArrowRight aria-hidden="true" /></Button>
        </div>
      </section>
    </div> : null}

    {activeSection === 'students' ? <div className="min-w-0 overflow-hidden">
      <StudentMonitoring students={students.data} onNavigate={onNavigate} />
    </div> : null}
    {activeSection === 'calendar' ? <AppointmentCalendar appointments={appointments.data} /> : null}
    {activeSection === 'follow-ups' ? <FollowUpWork counselors={counselors.data} onNavigate={onNavigate} /> : null}
  </div>
}

function CounselorDashboard({ counselorName, students, counselors, appointments, guidanceRequests, pendingRequests, scheduled, activeCases, followUps, onNavigate, onPrepare, onDecline }: {
  counselorName: string
  students: AdminStudent[]
  counselors: AdminStaff[]
  appointments: GuidanceAppointment[]
  guidanceRequests: AdminGuidanceRequest[]
  pendingRequests: AdminGuidanceRequest[]
  scheduled: GuidanceAppointment[]
  activeCases: number
  followUps: number
  onNavigate: (path: string) => void
  onPrepare: (request: AdminGuidanceRequest) => void
  onDecline: (request: AdminGuidanceRequest, reason: string) => Promise<void>
}) {
  const [now] = useState(() => new Date())
  const firstName = counselorName.trim().split(/\s+/)[0] || 'Counselor'
  const todayKey = manilaDateKey(now)
  const scheduledToday = scheduled.filter((item) => manilaDateKey(new Date(item.scheduledAt)) === todayKey)
  const nextAppointment = scheduled.find((item) => new Date(item.scheduledAt).getTime() >= now.getTime()) ?? scheduled[0]
  const scheduledRequests = guidanceRequests.filter((item) => item.status === 'scheduled').length
  const totalRequests = pendingRequests.length + scheduledRequests
  const pendingShare = totalRequests ? Math.round((pendingRequests.length / totalRequests) * 100) : 0

  return <div className="mx-auto w-full max-w-[1500px] space-y-4">
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        <header className="relative min-h-48 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 px-5 py-7 shadow-sm dark:border-white/6 dark:from-slate-950 dark:via-blue-950/80 dark:to-indigo-950/70 sm:px-7">
          <img src={tccBanner} alt="" className="absolute inset-y-0 right-0 h-full w-[54%] object-cover opacity-35 dark:opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/25 dark:from-slate-950 dark:via-slate-950/90 dark:to-slate-950/10" />
          <div className="relative max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-300">Student course guidance</p><h1 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">{manilaGreeting(now)}, {firstName}! <span aria-hidden="true">👋</span></h1><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground dark:text-slate-300">Review student records, respond to guidance requests, and manage appointments. Assessment, programme, and account data remain read-only.</p></div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Counselor work summary">
          <CounselorMetric label="Student records" value={students.length} note="Students visible to your account" icon={UsersRound} tone="blue" />
          <CounselorMetric label="Active cases" value={activeCases} note="Students needing attention" icon={MessageCircleMore} tone="green" />
          <CounselorMetric label="Scheduled today" value={scheduledToday.length} note="Appointments in Asia/Manila" icon={CalendarCheck2} tone="violet" />
          <CounselorMetric label="Follow-ups" value={followUps} note="Pending counselor follow-ups" icon={Clock3} tone="orange" />
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card/95 p-5 shadow-sm dark:border-white/6 dark:bg-card/80" aria-labelledby="next-schedule-heading"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-foreground"><span className="size-2 rounded-full bg-blue-500" />Next on your schedule</p>{nextAppointment ? <div className="mt-7 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5"><div><p className="font-display text-3xl font-bold text-blue-600 dark:text-cyan-300">{formatTime(nextAppointment.scheduledAt)}</p><p className="mt-1 text-[11px] font-semibold uppercase text-muted-foreground">{formatDate(nextAppointment.scheduledAt)}</p></div><div><h2 id="next-schedule-heading" className="font-semibold">{nextAppointment.studentName}</h2><p className="mt-1 text-xs text-muted-foreground">{nextAppointment.topic}</p><Badge className="mt-3" variant="secondary">Appointment</Badge></div><Button size="icon" className="rounded-full" aria-label={`Open ${nextAppointment.studentName} record`} onClick={() => onNavigate(`/admin/students/${nextAppointment.studentId}`)}><ArrowRight aria-hidden="true" /></Button></div> : <div className="flex min-h-36 flex-col items-center justify-center text-center"><CalendarCheck2 className="size-8 text-blue-500" aria-hidden="true" /><h2 id="next-schedule-heading" className="mt-3 font-semibold">Schedule is clear</h2><p className="mt-1 text-sm text-muted-foreground">Accepted appointments will appear here.</p></div>}</section>

          <section className="rounded-xl border border-border bg-card/95 p-5 shadow-sm dark:border-white/6 dark:bg-card/80" aria-labelledby="request-overview-heading"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-foreground"><span className="size-2 rounded-full bg-emerald-500" />Request overview</p><div className="mt-6 flex items-center justify-center gap-8"><div className="flex size-32 items-center justify-center rounded-full" style={{ background: totalRequests ? `conic-gradient(#2563eb ${pendingShare * 3.6}deg, #34d399 0deg)` : 'conic-gradient(#cbd5e1 0deg, #cbd5e1 360deg)' }}><div className="flex size-24 flex-col items-center justify-center rounded-full bg-card"><strong className="text-2xl">{totalRequests}</strong><span className="text-xs text-muted-foreground">Total</span></div></div><dl className="min-w-40 space-y-4"><RequestLegend label="Pending" value={pendingRequests.length} total={totalRequests} color="bg-blue-600" /><RequestLegend label="Scheduled" value={scheduledRequests} total={totalRequests} color="bg-emerald-400" /></dl></div><h2 id="request-overview-heading" className="sr-only">Request overview</h2></section>
        </div>

        <section className="grid overflow-hidden rounded-xl border border-border bg-card/95 shadow-sm dark:border-white/6 dark:bg-card/80 sm:grid-cols-[1fr_1fr_auto]" aria-label="Counselor queue totals"><DashboardQueueDatum icon={MessageCircleMore} label="Pending student requests" value={pendingRequests.length} /><DashboardQueueDatum icon={CalendarDays} label="Upcoming appointments" value={scheduled.length} /><div className="flex flex-wrap items-center gap-2 p-3"><Button variant="outline" className="rounded-lg bg-background" onClick={() => onNavigate('/admin/requests')}>Open requests</Button><Button className="rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => onNavigate('/admin/calendar')}>View calendar <ArrowRight aria-hidden="true" /></Button></div></section>

        <GuidanceRequestQueue requests={pendingRequests} onPrepare={onPrepare} onDecline={onDecline} compact />
      </div>

      <aside className="space-y-4">
        <MiniCalendar appointments={appointments} onNavigate={onNavigate} />
        <CounselorQuickActions onNavigate={onNavigate} />
        <CounselorRecentRecords requests={guidanceRequests} appointments={appointments} onNavigate={onNavigate} />
      </aside>
    </div>
    <span className="sr-only">{counselors.length} counselor accounts available</span>
  </div>
}

function CounselorMetric({ label, value, note, icon: Icon, tone }: { label: string; value: number; note: string; icon: typeof UsersRound; tone: 'blue' | 'green' | 'violet' | 'orange' }) {
  const colors = {
    blue: ['bg-blue-100 text-blue-600 dark:bg-blue-500/18 dark:text-blue-300', 'text-blue-500'],
    green: ['bg-emerald-100 text-emerald-600 dark:bg-emerald-500/18 dark:text-emerald-300', 'text-emerald-500'],
    violet: ['bg-violet-100 text-violet-600 dark:bg-violet-500/18 dark:text-violet-300', 'text-violet-500'],
    orange: ['bg-orange-100 text-orange-600 dark:bg-orange-500/18 dark:text-orange-300', 'text-orange-500'],
  }[tone]
  return <article className="flex min-h-44 flex-col rounded-xl border border-border bg-card/95 p-5 shadow-sm dark:border-white/6 dark:bg-card/80"><div className="flex items-center gap-3"><span className={`flex size-10 items-center justify-center rounded-xl ${colors[0]}`}><Icon className="size-5" aria-hidden="true" /></span><p className="text-[11px] font-bold uppercase tracking-[0.1em]">{label}</p></div><p className="mt-5 font-display text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p><span className={`mt-auto h-0.5 w-12 rounded-full bg-current ${colors[1]}`} aria-hidden="true" /></article>
}

function DashboardQueueDatum({ icon: Icon, label, value }: { icon: typeof UsersRound; label: string; value: number }) {
  return <div className="flex items-center gap-4 px-5 py-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/18 dark:text-blue-300"><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-display text-xl font-bold">{value}</p></div></div>
}

function RequestLegend({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total ? Math.round((value / total) * 100) : 0
  return <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs"><span className={`size-2 rounded-full ${color}`} /><dt className="text-muted-foreground">{label}</dt><dd>{value} ({percentage}%)</dd></div>
}

function MiniCalendar({ appointments, onNavigate }: { appointments: GuidanceAppointment[]; onNavigate: (path: string) => void }) {
  const [now] = useState(() => new Date())
  const today = manilaDateParts(now)
  const [month, setMonth] = useState({ year: today.year, month: today.month })
  const firstWeekday = new Date(Date.UTC(month.year, month.month - 1, 1)).getUTCDay()
  const dayCount = new Date(Date.UTC(month.year, month.month, 0)).getUTCDate()
  const monthName = new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(month.year, month.month - 1, 1)))
  const monthAppointments = appointments.filter((item) => item.status === 'scheduled' && manilaDateParts(new Date(item.scheduledAt)).year === month.year && manilaDateParts(new Date(item.scheduledAt)).month === month.month)
  const todayAppointments = monthAppointments.filter((item) => manilaDateParts(new Date(item.scheduledAt)).day === today.day && month.year === today.year && month.month === today.month)
  const changeMonth = (offset: number) => {
    const date = new Date(Date.UTC(month.year, month.month - 1 + offset, 1))
    setMonth({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 })
  }

  return <section className="rounded-xl border border-border bg-card/95 p-5 shadow-sm dark:border-white/6 dark:bg-card/80" aria-labelledby="today-calendar-heading"><div className="flex items-center justify-between"><h2 id="today-calendar-heading" className="text-xs font-bold uppercase tracking-[0.14em]">Today's calendar</h2><div className="flex"><Button variant="ghost" size="icon-sm" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft aria-hidden="true" /></Button><Button variant="ghost" size="icon-sm" aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight aria-hidden="true" /></Button></div></div><p className="mt-3 text-xs text-muted-foreground">{monthName}</p><div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-xs"><span className="text-muted-foreground">S</span><span className="text-muted-foreground">M</span><span className="text-muted-foreground">T</span><span className="text-muted-foreground">W</span><span className="text-muted-foreground">T</span><span className="text-muted-foreground">F</span><span className="text-muted-foreground">S</span>{Array.from({ length: firstWeekday }).map((_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: dayCount }).map((_, index) => { const day = index + 1; const selected = day === today.day && month.month === today.month && month.year === today.year; const hasAppointment = monthAppointments.some((item) => manilaDateParts(new Date(item.scheduledAt)).day === day); return <span key={day} className={`relative mx-auto flex size-7 items-center justify-center rounded-full ${selected ? 'bg-blue-600 font-bold text-white' : ''}`}>{day}{hasAppointment && !selected ? <span className="absolute bottom-0 size-1 rounded-full bg-emerald-500" /> : null}</span> })}</div>{todayAppointments.length ? <div className="mt-5 rounded-lg bg-blue-50 p-3 dark:bg-blue-500/10"><p className="text-xs font-semibold text-blue-600 dark:text-blue-300">{formatTime(todayAppointments[0].scheduledAt)}</p><strong className="mt-2 block text-sm">{todayAppointments[0].studentName}</strong><p className="mt-1 text-xs text-muted-foreground">{todayAppointments[0].topic}</p></div> : <p className="mt-5 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">No appointments scheduled for today.</p>}<Button variant="ghost" className="mt-3 w-full rounded-lg text-blue-600 dark:text-blue-300" onClick={() => onNavigate('/admin/calendar')}>View full calendar <CalendarDays aria-hidden="true" /></Button></section>
}

function CounselorQuickActions({ onNavigate }: { onNavigate: (path: string) => void }) {
  const actions = [
    ['Open guidance requests', 'View and respond to student requests', MessageCircleMore, '/admin/requests'],
    ['Schedule appointment', 'Create a new appointment', CalendarPlus, '/admin/appointments'],
    ['Add follow-up', 'Open due counselor follow-ups', Clock3, '/admin/follow-ups'],
    ['Generate report', 'Export student guidance reports', BarChart3, '/admin/reports'],
  ] as const
  return <section className="rounded-xl border border-border bg-card/95 p-5 shadow-sm dark:border-white/6 dark:bg-card/80" aria-labelledby="counselor-actions-heading"><h2 id="counselor-actions-heading" className="text-xs font-bold uppercase tracking-[0.14em]">Quick actions</h2><div className="mt-3 divide-y divide-border dark:divide-white/8">{actions.map(([title, description, Icon, path]) => <button key={title} type="button" onClick={() => onNavigate(path)} className="group flex min-h-16 w-full items-center gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/50"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/18 dark:text-blue-300"><Icon className="size-4" aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block text-xs">{title}</strong><span className="mt-1 block truncate text-[11px] text-muted-foreground">{description}</span></span><ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" /></button>)}</div></section>
}

function CounselorRecentRecords({ requests, appointments, onNavigate }: { requests: AdminGuidanceRequest[]; appointments: GuidanceAppointment[]; onNavigate: (path: string) => void }) {
  const items = [
    ...requests.map((item) => ({ id: `request-${item.id}`, title: `${item.studentName} submitted a guidance request`, detail: item.programmeName ?? 'General course guidance', date: item.createdAt, path: '/admin/requests', icon: MessageCircleMore })),
    ...appointments.filter((item) => item.status === 'scheduled').map((item) => ({ id: `appointment-${item.id}`, title: 'Upcoming appointment', detail: item.studentName, date: item.scheduledAt, path: '/admin/calendar', icon: CalendarCheck2 })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  return <section className="rounded-xl border border-border bg-card/95 p-5 shadow-sm dark:border-white/6 dark:bg-card/80" aria-labelledby="recent-records-heading"><div className="flex items-center justify-between"><h2 id="recent-records-heading" className="text-xs font-bold uppercase tracking-[0.14em]">Recent records</h2><button type="button" onClick={() => onNavigate('/admin/requests')} className="text-xs text-blue-600 dark:text-blue-300">View all</button></div>{items.length ? <ol className="mt-3 divide-y divide-border dark:divide-white/8">{items.map((item) => <li key={item.id}><button type="button" onClick={() => onNavigate(item.path)} className="flex min-h-16 w-full gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/50"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/18 dark:text-blue-300"><item.icon className="size-4" aria-hidden="true" /></span><span className="min-w-0"><strong className="block truncate text-xs">{item.title}</strong><span className="mt-1 block truncate text-[11px] text-muted-foreground">{item.detail}</span><span className="mt-2 block text-[10px] text-muted-foreground">{formatDate(item.date)}</span></span></button></li>)}</ol> : <p className="mt-4 rounded-lg bg-secondary p-4 text-sm text-muted-foreground">No guidance records are available.</p>}</section>
}

function AppointmentTable({ appointments, onNavigate, onStatus }: { appointments: GuidanceAppointment[]; onNavigate: (path: string) => void; onStatus: (appointment: GuidanceAppointment, status: GuidanceAppointment['status'], cancellationReason?: string) => Promise<void> }) {
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[58rem] text-left text-sm"><thead className="bg-secondary text-xs uppercase tracking-[0.1em] text-muted-foreground"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Schedule</th><th className="px-4 py-3">Topic</th><th className="px-4 py-3">Counselor</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y">{appointments.map((appointment) => <tr key={appointment.id}><td className="px-4 py-4"><strong className="block">{appointment.studentName}</strong><button type="button" onClick={() => onNavigate(`/admin/students/${appointment.studentId}`)} className="mt-1 text-xs text-primary underline-offset-4 hover:underline">Open student record</button></td><td className="px-4 py-4"><span className="block">{formatDateTime(appointment.scheduledAt)}</span>{appointment.endsAt ? <span className="mt-1 block text-xs text-muted-foreground">to {formatDateTime(appointment.endsAt)}</span> : <span className="mt-1 block text-xs text-warning">Legacy record: end time unavailable</span>}</td><td className="px-4 py-4"><strong className="block">{appointment.topic}</strong>{appointment.programmeCode ? <span className="mt-1 block text-xs text-muted-foreground">Programme: {appointment.programmeCode}</span> : null}{appointment.studentConfirmedAt ? <span className="mt-2 block text-xs font-semibold text-success">Confirmed by student</span> : null}</td><td className="px-4 py-4">{appointment.counselorName}</td><td className="px-4 py-4"><Badge variant={appointment.status === 'scheduled' ? 'secondary' : appointment.status === 'completed' ? 'success' : 'outline'}>{humanize(appointment.status)}</Badge>{appointment.cancellationReason ? <span className="mt-2 block max-w-52 text-xs text-muted-foreground">{appointment.cancellationReason}</span> : null}</td><td className="px-4 py-4">{appointment.status === 'scheduled' ? cancellingId === appointment.id ? <div className="min-w-56 space-y-2"><Label htmlFor={`cancel-reason-${appointment.id}`}>Cancellation reason</Label><textarea id={`cancel-reason-${appointment.id}`} value={reason} onChange={(event) => setReason(event.target.value)} rows={2} className="w-full rounded border border-input bg-background px-3 py-2 text-xs" /><div className="flex gap-2"><Button size="sm" variant="destructive" disabled={reason.trim().length < 3} onClick={() => { void onStatus(appointment, 'cancelled', reason.trim()); setCancellingId(null); setReason('') }}>Confirm cancellation</Button><Button size="sm" variant="ghost" onClick={() => { setCancellingId(null); setReason('') }}>Keep</Button></div></div> : <div className="flex flex-wrap gap-2"><Button size="sm" className="rounded" onClick={() => void onStatus(appointment, 'completed')}>Complete</Button><Button size="sm" variant="outline" className="rounded" onClick={() => void onStatus(appointment, 'no_show')}>No-show</Button><Button size="sm" variant="outline" className="rounded" onClick={() => setCancellingId(appointment.id)}>Cancel</Button></div> : null}</td></tr>)}</tbody></table></div>
}

function StudentMonitoring({ students, onNavigate }: { students: AdminStudent[]; onNavigate: (path: string) => void }) {
  return <section className="min-w-0 bg-card p-5 shadow-sm" aria-labelledby="monitored-students-heading"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Student monitoring</p><h2 id="monitored-students-heading" className="mt-1 font-display text-xl font-semibold">Students and latest assessment activity</h2></div><Button variant="outline" className="rounded" onClick={() => onNavigate('/admin/students')}>Open full directory <ArrowRight aria-hidden="true" /></Button></div>{students.length ? <div className="mt-5 max-w-full overflow-x-auto"><table className="w-full min-w-[42rem] text-left text-sm"><thead className="bg-secondary text-xs uppercase tracking-[0.1em] text-muted-foreground"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Attempts</th><th className="px-4 py-3">Latest profile</th><th className="px-4 py-3">Latest result</th><th className="px-4 py-3"><span className="sr-only">Open</span></th></tr></thead><tbody className="divide-y">{students.map((student) => <tr key={student.id}><td className="px-4 py-4"><strong>{student.name}</strong><span className="block text-xs text-muted-foreground">{student.email}</span></td><td className="px-4 py-4">{student.attemptCount}</td><td className="px-4 py-4 font-semibold">{student.latestTopCode ?? '—'}</td><td className="px-4 py-4">{formatDate(student.latestResultAt)}</td><td className="px-4 py-4 text-right"><Button variant="ghost" className="rounded" onClick={() => onNavigate(`/admin/students/${student.id}`)}>Open <ArrowRight aria-hidden="true" /></Button></td></tr>)}</tbody></table></div> : <div className="mt-5"><EmptyPanel title="No students available" description="Student accounts will appear after registration." /></div>}</section>
}

function GuidanceRequestQueue({ requests, onPrepare, onDecline, compact = false }: { requests: AdminGuidanceRequest[]; onPrepare: (request: AdminGuidanceRequest) => void; onDecline: (request: AdminGuidanceRequest, reason: string) => Promise<void>; compact?: boolean }) {
  return <section className="rounded-xl border border-border bg-card/95 p-5 shadow-sm dark:border-white/6 dark:bg-card/80" aria-labelledby="guidance-requests-heading">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Student requests</p><h2 id="guidance-requests-heading" className="mt-1 font-display text-xl font-semibold">Guidance request queue</h2><p className="mt-1 text-sm text-muted-foreground">Requests submitted from the student guidance dashboard, newest first.</p></div><Badge variant={requests.length ? 'secondary' : 'outline'}>{requests.length} pending</Badge></div>
    {requests.length ? <ol className={`mt-5 grid gap-3 ${compact ? '' : 'lg:grid-cols-2'}`}>{requests.map((request) => <GuidanceRequestCard key={request.id} request={request} onPrepare={onPrepare} onDecline={onDecline} />)}</ol> : <div className="mt-5"><EmptyPanel title="No pending guidance requests" description="New student requests will appear here automatically." /></div>}
  </section>
}

function GuidanceRequestCard({ request, onPrepare, onDecline }: { request: AdminGuidanceRequest; onPrepare: (request: AdminGuidanceRequest) => void; onDecline: (request: AdminGuidanceRequest, reason: string) => Promise<void> }) {
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  return <li className="rounded-lg bg-blue-50/80 p-4 dark:bg-blue-500/8"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{initials(request.studentName)}</span><div className="min-w-0"><strong className="block truncate">{request.studentName}</strong><span className="block truncate text-xs text-muted-foreground">{request.studentEmail}</span></div></div><span className="shrink-0 text-xs text-muted-foreground">{formatDate(request.createdAt)}</span></div>{request.programmeName ? <p className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-300">{request.programmeCode} · {request.programmeName}</p> : null}<dl className="mt-3 grid gap-2 rounded-lg bg-background/70 p-3 text-xs sm:grid-cols-3"><div><dt className="text-muted-foreground">Concern</dt><dd className="mt-1 font-semibold">{humanize(request.concernCategory)}</dd></div><div><dt className="text-muted-foreground">Format</dt><dd className="mt-1 font-semibold">{humanize(request.preferredFormat)}</dd></div><div><dt className="text-muted-foreground">Preferred date</dt><dd className="mt-1 font-semibold">{request.preferredDate ? formatDate(request.preferredDate) : 'Flexible'}</dd></div></dl><p className="mt-3 text-sm leading-6 text-muted-foreground">{request.message}</p>{declining ? <div className="mt-4"><Label htmlFor={`decline-request-${request.id}`}>Reason for declining</Label><textarea id={`decline-request-${request.id}`} value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-2 w-full rounded border border-input bg-background px-3 py-2 text-sm" /><div className="mt-2 flex gap-2"><Button type="button" size="sm" variant="destructive" disabled={busy || reason.trim().length < 3} onClick={async () => { setBusy(true); await onDecline(request, reason.trim()); setBusy(false) }}>Confirm decline</Button><Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => { setDeclining(false); setReason('') }}>Keep pending</Button></div></div> : <div className="mt-4 flex flex-wrap gap-2"><Button type="button" size="sm" className="rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => onPrepare(request)}><CalendarPlus aria-hidden="true" />Accept &amp; schedule</Button><Button type="button" size="sm" variant="outline" onClick={() => setDeclining(true)}>Decline</Button></div>}</li>
}

function AppointmentCalendar({ appointments }: { appointments: GuidanceAppointment[] }) {
  const scheduled = appointments.filter((appointment) => appointment.status === 'scheduled').sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const groups = Object.entries(scheduled.reduce<Record<string, GuidanceAppointment[]>>((dates, appointment) => {
    const date = appointment.scheduledAt.slice(0, 10)
    dates[date] = [...(dates[date] ?? []), appointment]
    return dates
  }, {}))
  return <section className="bg-card p-5 shadow-sm" aria-labelledby="calendar-heading"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Schedule</p><h2 id="calendar-heading" className="mt-1 font-display text-2xl font-semibold">Appointment calendar</h2><p className="mt-1 text-sm text-muted-foreground">Your accepted and scheduled student appointments, grouped by date.</p>{groups.length ? <div className="mt-6 space-y-5">{groups.map(([date, items]) => <section key={date} className="grid gap-3 md:grid-cols-[10rem_minmax(0,1fr)]"><div><p className="font-semibold text-primary">{formatDate(date)}</p><p className="text-xs text-muted-foreground">{items?.length ?? 0} appointment{items?.length === 1 ? '' : 's'}</p></div><ol className="space-y-2">{items?.map((item) => <li key={item.id} className="flex flex-col gap-2 bg-secondary p-4 sm:flex-row sm:items-center sm:justify-between"><div><strong>{new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' }).format(new Date(item.scheduledAt))} · {item.studentName}</strong><p className="mt-1 text-sm text-muted-foreground">{item.topic}{item.programmeCode ? ` · ${item.programmeCode}` : ''}</p></div><Badge variant="secondary">Scheduled</Badge></li>)}</ol></section>)}</div> : <div className="mt-5"><EmptyPanel title="No scheduled appointments" description="Accepted student requests and counselor-booked appointments will appear here." /></div>}</section>
}

function FollowUpWork({ counselors, onNavigate }: { counselors: AdminStaff[]; onNavigate: (path: string) => void }) {
  const followUps = counselors.flatMap((counselor) => counselor.assignments.filter((item) => item.status === 'follow_up').map((item) => ({ ...item, counselor: counselor.name })))
  return <section className="bg-card p-5 shadow-sm" aria-labelledby="follow-up-heading"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Counselor-owned work</p><h2 id="follow-up-heading" className="mt-1 font-display text-2xl font-semibold">Student follow-ups</h2><p className="mt-1 text-sm text-muted-foreground">Follow-ups created from your own counseling records. No Administrator assignment is required.</p>{followUps.length ? <ol className="mt-5 divide-y">{followUps.map((item) => <li key={item.caseId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><strong>{item.studentName}</strong><p className="mt-1 text-sm text-muted-foreground">Due {item.followUpOn ? formatDate(item.followUpOn) : 'without a date'} · {item.counselor}</p></div><Button variant="outline" className="rounded" onClick={() => onNavigate(`/admin/students/${item.studentId}`)}>Open record <ArrowRight aria-hidden="true" /></Button></li>)}</ol> : <div className="mt-5"><EmptyPanel title="No follow-ups due" description="Follow-ups appear after you save a next date in a student guidance record." /></div>}</section>
}

function sectionTitle(section: string) { return ({ students: 'Student records', requests: 'Guidance requests', appointments: 'Appointments', calendar: 'Schedule calendar', 'follow-ups': 'Follow-ups' } as Record<string, string>)[section] ?? 'Counselor workspace' }

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) { return <div><Label htmlFor={id}>{label}</Label>{children}</div> }
function formatDateTime(value: string) { return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(value)) }
function manilaLocalToIso(value: string) { return `${value.length === 16 ? `${value}:00` : value}+08:00` }
function formatTime(value: string) { return new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' }).format(new Date(value)) }
function manilaDateParts(value: Date) { const entries = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value).map((part) => [part.type, part.value])); return { year: Number(entries.year), month: Number(entries.month), day: Number(entries.day) } }
function manilaDateKey(value: Date) { const parts = manilaDateParts(value); return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}` }
function manilaGreeting(value: Date) { const hour = Number(new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', hourCycle: 'h23' }).format(value)); return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening' }
function initials(value: string) { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ST' }

export { CounselorWorkspacePage }
