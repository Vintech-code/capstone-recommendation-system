import { ArrowRight, BarChart3, CalendarCheck2, CalendarDays, CalendarPlus, Clock3, MessageCircleMore, Pencil, Plus, Settings2, Trash2, UsersRound } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import tccBanner from '@/assets/tccbanner.jpg'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminPageError, AdminPageHeader, AdminPageSkeleton, EmptyPanel } from '@/features/admin/components/admin-shared'
import { formatDate, humanize } from '@/features/admin/data/admin-formatters'
import { useAuth } from '@/features/auth/auth-context'
import {
  mutateWorkspace,
  requestCounselorAvailabilitySlots,
  useWorkspaceResource,
  type AdminStaff,
  type AdminGuidanceRequest,
  type AdminStudent,
  type CounselorAvailability,
  type CounselorAvailabilitySlots,
  type GuidanceAppointment,
  type StaffApiScope,
} from '@/features/admin/data/admin-api'

interface CounselorWorkspacePageProps { onNavigate: (path: string) => void; apiScope?: StaffApiScope; activeSection?: string }
interface AppointmentDraft { studentId: string; counselorId: string; scheduledAt: string; endsAt: string; topic: string; programmeCode: string; notes: string; guidanceRequestId: string }
interface AvailabilityDraftWindow { key: string; weekday: string; startsAt: string; endsAt: string }

const emptyDraft: AppointmentDraft = { studentId: '', counselorId: '', scheduledAt: '', endsAt: '', topic: '', programmeCode: '', notes: '', guidanceRequestId: '' }
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false)

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
      setAppointmentDialogOpen(false)
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

  const rescheduleAppointment = async (appointment: GuidanceAppointment, scheduledAt: string, endsAt: string) => {
    setMessage(null); setError(null)
    try {
      await mutateWorkspace<GuidanceAppointment>(apiScope, `/appointments/${appointment.id}`, 'PUT', {
        studentId: appointment.studentId, counselorId: appointment.counselorId,
        scheduledAt: manilaLocalToIso(scheduledAt), endsAt: manilaLocalToIso(endsAt), topic: appointment.topic,
        programmeCode: appointment.programmeCode, notes: appointment.notes, status: 'scheduled', cancellationReason: null,
      })
      setMessage('Appointment rescheduled. The student can review and confirm the new schedule.')
      appointments.retry()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The appointment could not be rescheduled.')
      throw reason
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
    setAppointmentDialogOpen(true)
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

    {activeSection === 'appointments' ? <div className="space-y-5">
      <section className="min-w-0" aria-labelledby="appointment-list-heading">
        <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Appointment records</p><h2 id="appointment-list-heading" className="mt-1 font-display text-2xl font-semibold">Course-guidance appointments</h2><p className="mt-1 text-sm text-muted-foreground">Review upcoming and closed records without keeping scheduling forms open on the page.</p></div><div className="flex flex-wrap gap-2">{apiScope === 'counselor' ? <Button type="button" variant="outline" className="rounded-lg bg-background" onClick={() => setAvailabilityDialogOpen(true)}><Settings2 aria-hidden="true" />Recurring availability</Button> : null}<Button type="button" className="rounded-lg" onClick={() => setAppointmentDialogOpen(true)}><CalendarPlus aria-hidden="true" />Schedule appointment</Button></div></div>
        <div>
        {appointments.data.length ? <AppointmentTable appointments={appointments.data} onNavigate={onNavigate} onStatus={updateStatus} onReschedule={rescheduleAppointment} canSelectAvailability={apiScope === 'counselor'} /> : <EmptyPanel title="No appointments scheduled" description="Create an appointment when a Student needs a course-guidance conversation." />}
        </div>
      </section>

      <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}><DialogContent className="max-w-3xl" closeLabel="Close schedule appointment"><div className="bg-primary-fixed/55 p-6 pr-16"><DialogHeader><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Counselor schedule</p><DialogTitle id="new-appointment-heading">Schedule appointment</DialogTitle><DialogDescription>Select a Student and one available time. The Student must confirm the recorded schedule.</DialogDescription></DialogHeader></div><section className="min-w-0 p-6" aria-labelledby="new-appointment-heading">
        {draft.guidanceRequestId ? <p className="mt-3 rounded-lg bg-primary-fixed px-3 py-2 text-sm font-medium text-on-primary-fixed">Preparing student request #{draft.guidanceRequestId}. Scheduling will close it automatically.</p> : null}
        <div className="mt-5 space-y-4">
          <Field label="Student" id="appointment-student"><select id="appointment-student" value={draft.studentId} onChange={(event) => setDraft({ ...draft, studentId: event.target.value })} className="mt-2 h-10 w-full rounded border border-input bg-background px-3 text-sm"><option value="">Select student</option>{students.data.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.email}</option>)}</select></Field>
          {apiScope === 'counselor' ? <><AvailabilitySlotPicker selectedStart={draft.scheduledAt} selectedEnd={draft.endsAt} onSelect={(startsAt, endsAt) => setDraft((current) => ({ ...current, scheduledAt: startsAt, endsAt }))} /><SelectedSchedule startsAt={draft.scheduledAt} endsAt={draft.endsAt} emptyMessage="Choose an available time before scheduling." /></> : <><Field label="Date and time" id="appointment-time"><Input id="appointment-time" type="datetime-local" value={draft.scheduledAt} onChange={(event) => setDraft({ ...draft, scheduledAt: event.target.value })} className="mt-2 rounded bg-background" /></Field><Field label="End date and time" id="appointment-end"><Input id="appointment-end" type="datetime-local" value={draft.endsAt} min={draft.scheduledAt || undefined} onChange={(event) => setDraft({ ...draft, endsAt: event.target.value })} className="mt-2 rounded bg-background" /></Field></>}
          <Field label="Guidance topic" id="appointment-topic"><Input id="appointment-topic" value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value })} placeholder="Example: Review programme matches" className="mt-2 rounded bg-background" /></Field>
          <Field label="Programme code (optional)" id="appointment-programme"><Input id="appointment-programme" value={draft.programmeCode} onChange={(event) => setDraft({ ...draft, programmeCode: event.target.value })} placeholder="Example: BSIT" className="mt-2 rounded bg-background" /></Field>
          <Field label="Internal notes (optional)" id="appointment-notes"><textarea id="appointment-notes" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={3} className="mt-2 w-full rounded border border-input bg-background px-3 py-2 text-sm" /></Field>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setAppointmentDialogOpen(false)}>Cancel</Button><Button type="button" disabled={saving || !draft.scheduledAt || !draft.endsAt} onClick={() => void saveAppointment()}>{saving ? 'Scheduling…' : 'Schedule appointment'} <ArrowRight aria-hidden="true" /></Button></div>
        </div>
      </section></DialogContent></Dialog>
      {apiScope === 'counselor' ? <Dialog open={availabilityDialogOpen} onOpenChange={setAvailabilityDialogOpen}><DialogContent className="max-w-3xl" closeLabel="Close recurring availability"><div className="bg-primary-fixed/55 p-6 pr-16"><DialogHeader><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Schedule settings</p><DialogTitle>Recurring availability</DialogTitle><DialogDescription>Define when the system may offer appointment slots.</DialogDescription></DialogHeader></div><div className="p-6"><CounselorAvailabilityEditor /></div></DialogContent></Dialog> : null}
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

  return <div className="mx-auto w-full max-w-375 space-y-4">
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        <header className="relative min-h-48 overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 via-white to-sky-50 px-5 py-7 shadow-sm dark:border-white/6 dark:from-slate-950 dark:via-blue-950/80 dark:to-indigo-950/70 sm:px-7">
          <img src={tccBanner} alt="" className="absolute inset-y-0 right-0 h-full w-[54%] object-cover opacity-35 dark:opacity-25" />
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/95 to-white/25 dark:from-slate-950 dark:via-slate-950/90 dark:to-slate-950/10" />
          <div className="relative max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-300">Student course guidance</p><h1 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">{manilaGreeting(now)}, {firstName}! <span aria-hidden="true">👋</span></h1><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground dark:text-slate-300">Review student records, respond to guidance requests, and manage appointments. Assessment, programme, and account data remain read-only.</p></div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Counselor work summary">
          <CounselorMetric label="Student records" value={students.length} note="Students visible to your account" icon={UsersRound} tone="blue" />
          <CounselorMetric label="Active cases" value={activeCases} note="Students needing attention" icon={MessageCircleMore} tone="green" />
          <CounselorMetric label="Scheduled today" value={scheduledToday.length} note="Appointments scheduled today" icon={CalendarCheck2} tone="violet" />
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
  return <article className="flex min-h-44 flex-col rounded-xl border border-border bg-card/95 p-5 shadow-sm dark:border-white/6 dark:bg-card/80"><div className="flex items-center gap-3"><span className={`flex size-10 items-center justify-center rounded-xl ${colors[0]}`}><Icon className="size-5" aria-hidden="true" /></span><p className="text-[11px] font-bold uppercase tracking-widest">{label}</p></div><p className="mt-5 font-display text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p><span className={`mt-auto h-0.5 w-12 rounded-full bg-current ${colors[1]}`} aria-hidden="true" /></article>
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
  const displayDate = new Date(Date.UTC(today.year, today.month - 1, today.day, 4))
  const monthName = new Intl.DateTimeFormat('en-PH', { month: 'long', timeZone: 'Asia/Manila' }).format(displayDate)
  const fullDate = new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' }).format(displayDate)
  const week = Array.from({ length: 7 }, (_, index) => {
    const offset = index - 3
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day + offset, 4))
    return {
      key: manilaDateKey(date),
      day: new Intl.DateTimeFormat('en-PH', { day: 'numeric', timeZone: 'Asia/Manila' }).format(date),
      weekday: new Intl.DateTimeFormat('en-PH', { weekday: 'short', timeZone: 'Asia/Manila' }).format(date),
      current: offset === 0,
      offset,
    }
  })
  const todayKey = manilaDateKey(now)
  const todayAppointments = appointments
    .filter((item) => item.status === 'scheduled' && manilaDateKey(new Date(item.scheduledAt)) === todayKey)
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt))

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-card p-5 text-card-foreground shadow-sm dark:bg-card/80" aria-labelledby="today-calendar-heading">
      <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary-fixed/70 blur-2xl dark:bg-primary/15" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 size-52 rounded-full bg-secondary-fixed/55 blur-3xl dark:bg-secondary-container/10" aria-hidden="true" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary-fixed px-4 text-xs font-bold uppercase tracking-[0.13em] text-on-primary-fixed"><CalendarDays className="size-4" aria-hidden="true" /><h2 id="today-calendar-heading">Today's calendar</h2></span>
          <span className="rounded-full bg-secondary-fixed px-3 py-2 text-xs font-semibold text-on-secondary-fixed">{todayAppointments.length} today</span>
        </div>

        <div className="mt-7 flex items-end justify-between" aria-label={fullDate}>
          <p className="min-w-0 whitespace-nowrap font-display text-3xl font-medium leading-none tracking-[-0.03em] text-primary sm:text-[clamp(2.7rem,4vw,4.5rem)] sm:tracking-[-0.06em]">{monthName}</p>
          <p className="ml-6 shrink-0 font-display text-5xl font-light leading-[0.82] tracking-[-0.04em] text-foreground sm:ml-4 sm:text-[clamp(4rem,6vw,6.5rem)] sm:tracking-[-0.07em]">{today.day}</p>
        </div>

        <div className="relative mt-8 pt-2">
          <div className="pointer-events-none absolute left-1/2 top-10 h-28 w-[145%] -translate-x-1/2 rounded-[50%] border-t border-primary/15 bg-primary-fixed/20 dark:bg-primary/5" aria-hidden="true" />
          <ol className="relative grid grid-cols-7 items-start gap-1 text-center" aria-label="Seven-day date strip">
            {week.map((date) => {
              const arcOffset = Math.abs(date.offset) * 3
              const hasAppointment = appointments.some((item) => item.status === 'scheduled' && manilaDateKey(new Date(item.scheduledAt)) === date.key)
              return <li key={date.key} style={{ transform: `translateY(${arcOffset}px)` }}><span className={`mx-auto flex min-h-16 w-full max-w-12 flex-col items-center justify-center rounded-full transition-colors ${date.current ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`} aria-current={date.current ? 'date' : undefined}><span className="text-[10px] font-bold uppercase tracking-wide">{date.weekday}</span><strong className="mt-1 text-lg leading-none">{date.day}</strong>{hasAppointment ? <span className={`mt-1 size-1.5 rounded-full ${date.current ? 'bg-secondary-container' : 'bg-success'}`}><span className="sr-only">Appointment scheduled</span></span> : null}</span></li>
            })}
          </ol>
        </div>

        <div className="mt-7 rounded-2xl bg-secondary/75 p-3 dark:bg-background/35">
          {todayAppointments.length ? <ol className="space-y-2">{todayAppointments.slice(0, 2).map((appointment) => <li key={appointment.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl bg-card p-3 shadow-sm dark:bg-card/70"><p className="text-sm font-bold text-primary">{formatTime(appointment.scheduledAt)}</p><div className="min-w-0"><strong className="block truncate text-sm">{appointment.studentName}</strong><p className="mt-1 truncate text-xs text-muted-foreground">{appointment.topic}</p></div></li>)}</ol> : <div className="flex items-center gap-3 px-2 py-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed"><CalendarCheck2 className="size-4" aria-hidden="true" /></span><div><p className="text-sm font-semibold">No appointments today</p><p className="mt-0.5 text-xs text-muted-foreground">Your recorded schedule is clear.</p></div></div>}
          <Button className="mt-2 w-full justify-between rounded-xl" onClick={() => onNavigate('/admin/calendar')}>View full calendar <ArrowRight aria-hidden="true" /></Button>
        </div>
      </div>
    </section>
  )
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

function AppointmentTable({ appointments, onNavigate, onStatus, onReschedule, canSelectAvailability }: { appointments: GuidanceAppointment[]; onNavigate: (path: string) => void; onStatus: (appointment: GuidanceAppointment, status: GuidanceAppointment['status'], cancellationReason?: string) => Promise<void>; onReschedule: (appointment: GuidanceAppointment, scheduledAt: string, endsAt: string) => Promise<void>; canSelectAvailability: boolean }) {
  const [now] = useState(() => Date.now())
  const [page, setPage] = useState(1)
  const pageSize = 8
  const upcoming = appointments.filter((item) => item.status === 'scheduled' && new Date(item.scheduledAt).getTime() >= now).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const history = appointments.filter((item) => !upcoming.includes(item)).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
  const ordered = [...upcoming, ...history]
  const totalPages = Math.max(1, Math.ceil(ordered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const firstIndex = (currentPage - 1) * pageSize
  const visible = ordered.slice(firstIndex, firstIndex + pageSize)

  return (
    <div>
      <AppointmentGroup title="All appointment records" empty="No appointment records." appointments={visible} rowOffset={firstIndex} onNavigate={onNavigate} onStatus={onStatus} onReschedule={onReschedule} canSelectAvailability={canSelectAvailability} />
      <nav className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Appointment pagination"><p className="text-sm text-muted-foreground">Showing {firstIndex + 1}–{Math.min(firstIndex + pageSize, ordered.length)} of {ordered.length} appointments</p><div className="flex flex-wrap items-center gap-1"><Button type="button" size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>{paginationPages(currentPage, totalPages).map((pageNumber) => <Button key={pageNumber} type="button" size="sm" variant={pageNumber === currentPage ? 'default' : 'ghost'} aria-label={`Page ${pageNumber}`} aria-current={pageNumber === currentPage ? 'page' : undefined} onClick={() => setPage(pageNumber)}>{pageNumber}</Button>)}<Button type="button" size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button></div></nav>
    </div>
  )
}

function AppointmentGroup({ title, empty, appointments, rowOffset, onNavigate, onStatus, onReschedule, canSelectAvailability }: { title: string; empty: string; appointments: GuidanceAppointment[]; rowOffset: number; onNavigate: (path: string) => void; onStatus: (appointment: GuidanceAppointment, status: GuidanceAppointment['status'], cancellationReason?: string) => Promise<void>; onReschedule: (appointment: GuidanceAppointment, scheduledAt: string, endsAt: string) => Promise<void>; canSelectAvailability: boolean }) {
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [reschedulingId, setReschedulingId] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [schedule, setSchedule] = useState({ startsAt: '', endsAt: '' })
  const [busy, setBusy] = useState(false)
  const cancellingAppointment = appointments.find((appointment) => appointment.id === cancellingId) ?? null
  const reschedulingAppointment = appointments.find((appointment) => appointment.id === reschedulingId) ?? null

  if (appointments.length === 0) return <section aria-label={title}><h3 className="text-sm font-bold">{title}</h3><p className="mt-2 rounded bg-secondary px-4 py-3 text-sm text-muted-foreground">{empty}</p></section>

  return (
    <section aria-label={title}>
      <div className="overflow-x-auto rounded-lg border border-border/70">
        <table className="w-full min-w-272 text-left text-sm">
          <thead className="bg-secondary/80 text-[11px] uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="w-14 px-4 py-3.5 text-center">No.</th><th className="px-5 py-3.5">Student</th><th className="px-5 py-3.5">Date and time</th><th className="px-5 py-3.5">Guidance context</th><th className="px-5 py-3.5">Confirmation</th><th className="px-5 py-3.5">Lifecycle</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead>
          <tbody className="divide-y">{appointments.map((appointment, appointmentIndex) => (
            <tr key={appointment.id} className="align-top transition-colors hover:bg-secondary/25">
              <td className="px-4 py-5 text-center font-semibold text-muted-foreground">{rowOffset + appointmentIndex + 1}</td>
              <td className="px-5 py-5"><div className="flex min-w-44 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-bold text-on-primary-fixed">{initials(appointment.studentName)}</span><span><strong className="block leading-5">{appointment.studentName}</strong><span className="mt-1 block text-[11px] text-muted-foreground">Appointment #{String(appointment.id).padStart(4, '0')}</span><button type="button" onClick={() => onNavigate(`/admin/students/${appointment.studentId}`)} className="mt-1 text-xs font-semibold text-primary underline-offset-4 hover:underline">Open student record</button></span></div></td>
              <td className="px-5 py-5"><div className="min-w-44"><strong className="block">{formatAppointmentDate(appointment.scheduledAt)}</strong><span className="mt-1 block text-sm text-foreground">{formatAppointmentTime(appointment.scheduledAt)}{appointment.endsAt ? ` – ${formatAppointmentTime(appointment.endsAt)}` : ''}</span>{!appointment.endsAt ? <span className="mt-1 block text-xs text-warning">End time unavailable</span> : null}</div></td>
              <td className="px-5 py-5"><div className="min-w-52"><strong className="block leading-5">{appointment.topic}</strong>{appointment.programmeCode ? <Badge variant="outline" className="mt-2">{appointment.programmeCode}</Badge> : <span className="mt-2 block text-xs text-muted-foreground">General guidance</span>}</div></td>
              <td className="px-5 py-5">{appointment.studentConfirmedAt ? <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">Student confirmed</span> : appointment.status === 'scheduled' ? <span className="inline-flex rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">Awaiting confirmation</span> : <span className="text-xs text-muted-foreground">Not applicable</span>}{appointment.studentConfirmedAt ? <span className="mt-2 block text-[11px] text-muted-foreground">{formatDateTime(appointment.studentConfirmedAt)}</span> : null}</td>
              <td className="px-5 py-5"><Badge variant={appointment.status === 'scheduled' ? 'secondary' : appointment.status === 'completed' ? 'success' : 'outline'}>{humanize(appointment.status)}</Badge></td>
              <td className="px-5 py-5 text-right">{appointment.status === 'scheduled' ? <div className="ml-auto flex max-w-56 flex-wrap justify-end gap-2"><Button size="sm" variant="outline" onClick={() => { setReschedulingId(appointment.id); setSchedule({ startsAt: toManilaLocalInput(appointment.scheduledAt), endsAt: appointment.endsAt ? toManilaLocalInput(appointment.endsAt) : '' }) }}><Pencil aria-hidden="true" />Reschedule</Button><Button size="sm" onClick={() => void onStatus(appointment, 'completed')}>Complete</Button><Button size="sm" variant="outline" onClick={() => void onStatus(appointment, 'no_show')}>No-show</Button><Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setCancellingId(appointment.id)}>Cancel</Button></div> : <span className="text-xs text-muted-foreground">No actions available</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Dialog open={reschedulingAppointment !== null} onOpenChange={(open) => { if (!open) setReschedulingId(null) }}><DialogContent className="max-w-2xl" closeLabel="Close reschedule appointment">{reschedulingAppointment ? <><div className="bg-primary-fixed/55 p-6 pr-16"><DialogHeader><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Appointment #{String(reschedulingAppointment.id).padStart(4, '0')}</p><DialogTitle>Reschedule appointment</DialogTitle><DialogDescription>Choose a replacement time for {reschedulingAppointment.studentName}. The Student must confirm the changed schedule again.</DialogDescription></DialogHeader></div><div className="space-y-4 p-6"><div className="rounded-lg bg-secondary px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Current schedule</p><p className="mt-1 text-sm font-semibold">{formatDateTime(reschedulingAppointment.scheduledAt)}{reschedulingAppointment.endsAt ? ` – ${formatDateTime(reschedulingAppointment.endsAt)}` : ''}</p></div>{canSelectAvailability ? <><AvailabilitySlotPicker selectedStart={schedule.startsAt} selectedEnd={schedule.endsAt} excludeAppointmentId={reschedulingAppointment.id} onSelect={(startsAt, endsAt) => setSchedule({ startsAt, endsAt })} /><SelectedSchedule startsAt={schedule.startsAt} endsAt={schedule.endsAt} emptyMessage="Choose a new available time." /></> : <><Field label="New start" id={`reschedule-start-${reschedulingAppointment.id}`}><Input id={`reschedule-start-${reschedulingAppointment.id}`} type="datetime-local" value={schedule.startsAt} onChange={(event) => setSchedule({ ...schedule, startsAt: event.target.value })} /></Field><Field label="New end" id={`reschedule-end-${reschedulingAppointment.id}`}><Input id={`reschedule-end-${reschedulingAppointment.id}`} type="datetime-local" min={schedule.startsAt || undefined} value={schedule.endsAt} onChange={(event) => setSchedule({ ...schedule, endsAt: event.target.value })} /></Field></>}<div className="flex justify-end gap-2"><Button variant="ghost" disabled={busy} onClick={() => setReschedulingId(null)}>Keep current</Button><Button disabled={busy || !schedule.startsAt || !schedule.endsAt || schedule.endsAt <= schedule.startsAt || (schedule.startsAt === toManilaLocalInput(reschedulingAppointment.scheduledAt) && schedule.endsAt === (reschedulingAppointment.endsAt ? toManilaLocalInput(reschedulingAppointment.endsAt) : ''))} onClick={async () => { setBusy(true); try { await onReschedule(reschedulingAppointment, schedule.startsAt, schedule.endsAt); setReschedulingId(null) } finally { setBusy(false) } }}>Confirm reschedule</Button></div></div></> : null}</DialogContent></Dialog>
      <Dialog open={cancellingAppointment !== null} onOpenChange={(open) => { if (!open) { setCancellingId(null); setReason('') } }}><DialogContent className="max-w-lg" closeLabel="Close cancellation dialog">{cancellingAppointment ? <><div className="bg-destructive/8 p-6 pr-16"><DialogHeader><p className="text-xs font-semibold uppercase tracking-[0.16em] text-destructive">Appointment #{String(cancellingAppointment.id).padStart(4, '0')}</p><DialogTitle>Cancel appointment</DialogTitle><DialogDescription>Record why the appointment with {cancellingAppointment.studentName} is being cancelled. This remains in the lifecycle history.</DialogDescription></DialogHeader></div><div className="space-y-4 p-6"><Label htmlFor={`cancel-reason-${cancellingAppointment.id}`}>Cancellation reason</Label><textarea id={`cancel-reason-${cancellingAppointment.id}`} value={reason} onChange={(event) => setReason(event.target.value)} rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => { setCancellingId(null); setReason('') }}>Keep appointment</Button><Button variant="destructive" disabled={reason.trim().length < 3} onClick={() => { void onStatus(cancellingAppointment, 'cancelled', reason.trim()); setCancellingId(null); setReason('') }}>Confirm cancellation</Button></div></div></> : null}</DialogContent></Dialog>
    </section>
  )
}

function AvailabilitySlotPicker({ selectedStart, selectedEnd, excludeAppointmentId, onSelect, compact = false }: {
  selectedStart: string
  selectedEnd: string
  excludeAppointmentId?: number
  onSelect: (startsAt: string, endsAt: string) => void
  compact?: boolean
}) {
  const [date, setDate] = useState(() => selectedStart.slice(0, 10))
  const [today] = useState(() => manilaDateKey(new Date()))
  const [durationMinutes, setDurationMinutes] = useState(() => durationBetweenLocalValues(selectedStart, selectedEnd))
  const [result, setResult] = useState<CounselorAvailabilitySlots | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadSlots = async () => {
    setError('')
    setResult(null)
    const duration = Number(durationMinutes)
    if (!date || !Number.isInteger(duration) || duration < 1 || duration > 1440) {
      setError('Choose a date and enter the appointment length in minutes.')
      return
    }
    setLoading(true)
    try {
      setResult(await requestCounselorAvailabilitySlots(date, duration, excludeAppointmentId))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Available times could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={`rounded-lg bg-primary-fixed/55 ${compact ? 'p-3' : 'p-4'}`} aria-label="Available appointment times">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-primary"><Clock3 className="size-4" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Choose from your available times</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Enter the length for this conversation. Times come from your recurring schedule after existing bookings are removed.</p>
        </div>
      </div>
      <div className={`mt-3 grid gap-3 ${compact ? '' : 'sm:grid-cols-[1fr_1fr_auto] sm:items-end'}`}>
        <Field label="Appointment date" id={`slot-date-${excludeAppointmentId ?? 'new'}`}><Input id={`slot-date-${excludeAppointmentId ?? 'new'}`} type="date" min={today} value={date} onChange={(event) => { setDate(event.target.value); setResult(null) }} className="mt-2 bg-background" /></Field>
        <Field label="Length in minutes" id={`slot-duration-${excludeAppointmentId ?? 'new'}`}><Input id={`slot-duration-${excludeAppointmentId ?? 'new'}`} type="number" min={1} max={1440} inputMode="numeric" value={durationMinutes} onChange={(event) => { setDurationMinutes(event.target.value); setResult(null) }} placeholder="Enter minutes" className="mt-2 bg-background" /></Field>
        <Button type="button" variant="outline" disabled={loading || !date || !durationMinutes} onClick={() => void loadSlots()}>{loading ? 'Checking…' : 'Show available times'}</Button>
      </div>
      {error ? <p role="alert" className="mt-3 text-sm font-medium text-destructive">{error}</p> : null}
      {result && !result.configured ? <p className="mt-3 rounded bg-background px-3 py-2 text-sm text-muted-foreground">Your recurring availability is not configured yet.</p> : null}
      {result?.configured && result.slots.length === 0 ? <p className="mt-3 rounded bg-background px-3 py-2 text-sm text-muted-foreground">No free time fits this date and length. Choose another date or appointment length.</p> : null}
      {result && result.slots.length > 0 ? <div className="mt-3"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Available times</p><div className="mt-2 flex flex-wrap gap-2">{result.slots.map((slot) => {
        const localStart = toManilaLocalInput(slot.startsAt)
        const localEnd = toManilaLocalInput(slot.endsAt)
        const selected = selectedStart === localStart && selectedEnd === localEnd
        return <Button key={`${slot.startsAt}-${slot.endsAt}`} type="button" size="sm" variant={selected ? 'default' : 'outline'} aria-pressed={selected} onClick={() => onSelect(localStart, localEnd)}>{formatTime(slot.startsAt)}–{formatTime(slot.endsAt)}</Button>
      })}</div></div> : null}
    </section>
  )
}

function SelectedSchedule({ startsAt, endsAt, emptyMessage }: { startsAt: string; endsAt: string; emptyMessage: string }) {
  return <div className="rounded-lg bg-background px-4 py-3 shadow-sm" aria-live="polite"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Selected schedule</p>{startsAt && endsAt ? <p className="mt-1 text-sm font-bold text-foreground">{formatLocalSchedule(startsAt)} <span className="font-medium text-muted-foreground">to</span> {formatLocalSchedule(endsAt)}</p> : <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>}</div>
}

function CounselorAvailabilityEditor() {
  const availability = useWorkspaceResource<CounselorAvailability>('counselor', '/availability')

  if (availability.loading) return <section className="bg-card p-5 shadow-sm" aria-label="Counselor availability"><p className="text-sm text-muted-foreground">Loading your recorded availability…</p></section>
  if (availability.error || !availability.data) return <section className="bg-card p-5 shadow-sm" aria-label="Counselor availability"><p role="alert" className="text-sm text-destructive">{availability.error ?? 'Availability could not be loaded.'}</p><Button type="button" variant="outline" className="mt-3" onClick={availability.retry}>Try again</Button></section>

  return <CounselorAvailabilityForm key={availability.data.windows.map((window) => window.id).join('-')} availability={availability.data} />
}

function CounselorAvailabilityForm({ availability }: { availability: CounselorAvailability }) {
  const [windows, setWindows] = useState<AvailabilityDraftWindow[]>(() => availability.windows.map((window) => ({ key: String(window.id), weekday: String(window.weekday), startsAt: window.startsAt, endsAt: window.endsAt })))
  const [configured, setConfigured] = useState(availability.configured)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const save = async () => {
    setMessage(''); setError('')
    if (windows.some((window) => window.weekday === '' || !window.startsAt || !window.endsAt || window.endsAt <= window.startsAt)) {
      setError('Choose a day and enter a valid start and end time for every window.')
      return
    }
    setSaving(true)
    try {
      await mutateWorkspace<CounselorAvailability>('counselor', '/availability', 'PUT', {
        timezone: 'Asia/Manila',
        windows: windows.map((window) => ({ weekday: Number(window.weekday), startsAt: window.startsAt, endsAt: window.endsAt })),
      })
      setMessage(windows.length > 0 ? 'Availability saved.' : 'Availability cleared. Scheduling is now unconfigured.')
      setConfigured(windows.length > 0)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Availability could not be saved.')
    } finally { setSaving(false) }
  }

  return (
    <section className="bg-card p-5 shadow-sm" aria-labelledby="availability-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Weekly schedule</p><h2 id="availability-heading" className="mt-1 font-display text-xl font-semibold">Your recurring availability</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Appointments must fit completely inside one recorded window. No hours are assumed when this is unconfigured.</p></div>
        <Badge variant={configured ? 'success' : 'outline'}>{configured ? 'Configured' : 'Not configured'}</Badge>
      </div>
      <div className="mt-5 space-y-3">
        {windows.map((window, index) => <div key={window.key} className="grid gap-3 rounded bg-secondary p-4 sm:grid-cols-[minmax(10rem,1fr)_1fr_1fr_auto] sm:items-end"><Field label="Day" id={`availability-day-${window.key}`}><select id={`availability-day-${window.key}`} className="mt-2 h-10 w-full rounded border border-input bg-background px-3 text-sm" value={window.weekday} onChange={(event) => setWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, weekday: event.target.value } : item))}><option value="">Select day</option>{weekdays.map((day, dayIndex) => <option key={day} value={dayIndex}>{day}</option>)}</select></Field><Field label="Start" id={`availability-start-${window.key}`}><Input id={`availability-start-${window.key}`} type="time" value={window.startsAt} onChange={(event) => setWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, startsAt: event.target.value } : item))} /></Field><Field label="End" id={`availability-end-${window.key}`}><Input id={`availability-end-${window.key}`} type="time" value={window.endsAt} onChange={(event) => setWindows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, endsAt: event.target.value } : item))} /></Field><Button type="button" variant="ghost" size="icon" aria-label={`Remove availability window ${index + 1}`} onClick={() => setWindows((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 aria-hidden="true" /></Button></div>)}
        {windows.length === 0 ? <p className="rounded bg-secondary px-4 py-3 text-sm text-muted-foreground">Availability is not configured. Add your actual counseling hours before scheduling students.</p> : null}
      </div>
      {message ? <p role="status" className="mt-4 text-sm font-medium text-success">{message}</p> : null}
      {error ? <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setWindows((current) => [...current, { key: `new-${Date.now()}-${current.length}`, weekday: '', startsAt: '', endsAt: '' }])}><Plus aria-hidden="true" />Add time window</Button><Button type="button" disabled={saving} onClick={() => void save()}>{saving ? 'Saving…' : 'Save availability'}</Button></div>
    </section>
  )
}

function StudentMonitoring({ students, onNavigate }: { students: AdminStudent[]; onNavigate: (path: string) => void }) {
  return <section className="min-w-0 bg-card p-5 shadow-sm" aria-labelledby="monitored-students-heading"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Student monitoring</p><h2 id="monitored-students-heading" className="mt-1 font-display text-xl font-semibold">Students and latest assessment activity</h2></div><Button variant="outline" className="rounded" onClick={() => onNavigate('/admin/students')}>Open full directory <ArrowRight aria-hidden="true" /></Button></div>{students.length ? <div className="mt-5 max-w-full overflow-x-auto"><table className="w-full min-w-2xl text-left text-sm"><thead className="bg-secondary text-xs uppercase tracking-widest text-muted-foreground"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Attempts</th><th className="px-4 py-3">Latest profile</th><th className="px-4 py-3">Latest result</th><th className="px-4 py-3"><span className="sr-only">Open</span></th></tr></thead><tbody className="divide-y">{students.map((student) => <tr key={student.id}><td className="px-4 py-4"><strong>{student.name}</strong><span className="block text-xs text-muted-foreground">{student.email}</span></td><td className="px-4 py-4">{student.attemptCount}</td><td className="px-4 py-4 font-semibold">{student.latestTopCode ?? '—'}</td><td className="px-4 py-4">{formatDate(student.latestResultAt)}</td><td className="px-4 py-4 text-right"><Button variant="ghost" className="rounded" onClick={() => onNavigate(`/admin/students/${student.id}`)}>Open <ArrowRight aria-hidden="true" /></Button></td></tr>)}</tbody></table></div> : <div className="mt-5"><EmptyPanel title="No students available" description="Student accounts will appear after registration." /></div>}</section>
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
function formatAppointmentDate(value: string) { return new Intl.DateTimeFormat('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' }).format(new Date(value)) }
function formatAppointmentTime(value: string) { return new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' }).format(new Date(value)) }
function formatLocalSchedule(value: string) { return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(`${value}:00+08:00`)) }
function manilaLocalToIso(value: string) { return `${value.length === 16 ? `${value}:00` : value}+08:00` }
function toManilaLocalInput(value: string) { const entries = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value)).map((part) => [part.type, part.value])); return `${entries.year}-${entries.month}-${entries.day}T${entries.hour}:${entries.minute}` }
function durationBetweenLocalValues(startsAt: string, endsAt: string) { if (!startsAt || !endsAt) return ''; const difference = (new Date(`${endsAt}:00+08:00`).getTime() - new Date(`${startsAt}:00+08:00`).getTime()) / 60000; return Number.isInteger(difference) && difference > 0 ? String(difference) : '' }
function formatTime(value: string) { return new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' }).format(new Date(value)) }
function manilaDateParts(value: Date) { const entries = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value).map((part) => [part.type, part.value])); return { year: Number(entries.year), month: Number(entries.month), day: Number(entries.day) } }
function manilaDateKey(value: Date) { const parts = manilaDateParts(value); return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}` }
function manilaGreeting(value: Date) { const hour = Number(new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', hourCycle: 'h23' }).format(value)); return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening' }
function initials(value: string) { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ST' }
function paginationPages(currentPage: number, totalPages: number) { const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4)); return Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index) }

export { CounselorWorkspacePage }
