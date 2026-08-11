import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  History,
  MessageCircleMore,
  RotateCcw,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import { ConfirmActionDialog, ErrorState, LoadingState, StatusBadge } from '@/components/shared'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getAssessmentHistory, getCurrentAssessment, retryAssessmentResult, type AssessmentHistoryResponse, type AssessmentLifecycle } from '@/features/student/assessment/assessment-api'
import { formatAssessmentDate, mapAssessmentResult } from '@/features/student/assessment/assessment-result-mapper'
import { cancelStudentGuidanceAppointment, cancelStudentGuidanceRequest, confirmStudentGuidanceAppointment, createStudentGuidanceRequest, getStudentGuidanceAppointments, getStudentGuidanceRequests, getStudentGuidanceSummaries, type StudentGuidanceAppointment, type StudentGuidanceRequest, type StudentGuidanceSummary } from '@/features/student/guidance/guidance-api'
import { getProgrammeImages } from '@/features/student/programmes/programme-images'
import { getLatestRecommendation, getRecommendationForAttempt } from '@/features/student/recommendations/recommendation-api'
import type { StudentRecommendedCourse, StudentRecommendationState } from '@/features/student/recommendations/recommendation-types'

interface StudentDashboardPageProps {
  onSelectModule: (moduleId: string) => void
  initialLifecycle?: AssessmentLifecycle
  initialRecommendations?: StudentRecommendationState
}

const dimensionStyles = [
  'bg-primary/12 text-primary',
  'bg-chart-blue/15 text-chart-blue',
  'bg-chart-teal/15 text-chart-teal',
  'bg-brand-magenta/12 text-brand-magenta',
  'bg-warning/12 text-warning',
  'bg-brand-soft/20 text-foreground',
]

function StudentDashboardPage({ onSelectModule, initialLifecycle, initialRecommendations }: StudentDashboardPageProps) {
  const [lifecycle, setLifecycle] = useState<AssessmentLifecycle | null>(initialLifecycle ?? null)
  const [latestResultLifecycle, setLatestResultLifecycle] = useState<AssessmentLifecycle | null>(initialLifecycle?.status === 'result_available' ? initialLifecycle : null)
  const [recommendations, setRecommendations] = useState<StudentRecommendationState | null>(initialRecommendations ?? null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(initialLifecycle ? 'ready' : 'loading')
  const [attempt, setAttempt] = useState(0)
  const [appointments, setAppointments] = useState<StudentGuidanceAppointment[]>([])
  const [guidanceRequests, setGuidanceRequests] = useState<StudentGuidanceRequest[]>([])
  const [guidanceSummaries, setGuidanceSummaries] = useState<StudentGuidanceSummary[]>([])

  useEffect(() => {
    if (initialLifecycle) return
    let active = true
    Promise.all([
      getCurrentAssessment(),
      getLatestRecommendation().catch(() => null),
      getAssessmentHistory().catch(() => null),
      getStudentGuidanceAppointments().catch(() => []),
      getStudentGuidanceRequests().catch(() => []),
      getStudentGuidanceSummaries().catch(() => []),
    ])
      .then(async ([assessment, currentRecommendation, history, guidanceAppointments, studentGuidanceRequests, studentGuidanceSummaries]) => {
        if (!active) return
        const latestCompleted = assessment.status === 'result_available'
          ? assessment
          : history?.attempts.find((item) => item.status === 'result_available') ?? null
        let recommendation = currentRecommendation
        if (latestCompleted?.id && assessment.status !== 'result_available') {
          recommendation = await getRecommendationForAttempt(latestCompleted.id).catch(() => currentRecommendation)
        }
        if (!active) return
        setLifecycle(assessment)
        setLatestResultLifecycle(latestCompleted)
        setRecommendations(recommendation)
        setAppointments(guidanceAppointments)
        setGuidanceRequests(studentGuidanceRequests)
        setGuidanceSummaries(studentGuidanceSummaries)
        setLoadState('ready')
      })
      .catch(() => active && setLoadState('error'))
    return () => { active = false }
  }, [attempt, initialLifecycle])

  useEffect(() => {
    if (initialLifecycle || lifecycle?.status !== 'preparing_result') return
    const timer = window.setInterval(() => {
      getCurrentAssessment()
        .then(async (current) => {
          setLifecycle(current)
          if (current.status === 'result_available') {
            const recommendation = await getLatestRecommendation()
            setLatestResultLifecycle(current)
            setRecommendations(recommendation)
          }
        })
        .catch(() => undefined)
    }, 5_000)
    return () => window.clearInterval(timer)
  }, [initialLifecycle, lifecycle?.status])

  if (loadState === 'error') {
    return <DashboardFrame><ErrorState title="We could not load your dashboard" description="Your saved assessment was not changed. Check your connection and try again." onRetry={() => { setLoadState('loading'); setAttempt((value) => value + 1) }} /></DashboardFrame>
  }
  if (loadState === 'loading' || !lifecycle) {
    return <DashboardFrame><LoadingState variant="dashboard" title="Loading your dashboard" description="Restoring your latest assessment and recommendation status." /></DashboardFrame>
  }
  const resultSource = lifecycle.status === 'result_available' ? lifecycle : latestResultLifecycle
  const result = resultSource ? mapAssessmentResult(resultSource) : null
  const snapshot = recommendations?.status === 'available' ? recommendations.recommendation : null
  const topCourse = snapshot?.courses[0] ?? null
  const latestGuidanceRequest = guidanceRequests[0] ?? null

  return (
    <DashboardFrame>
      <article
        data-report-print={result ? true : undefined}
        data-testid="student-guidance-summary"
        className="w-full space-y-6"
      >
        {result ? (
          <header data-print-only className="hidden">
            <p>TAGOLOAN COMMUNITY COLLEGE</p>
            <h2>Pathways Student Guidance Summary</h2>
            <div>
              <span>Interest profile: {result.topCode}</span>
              <span>Assessment completed: {result.availableAt}</span>
            </div>
          </header>
        ) : null}
        <section className="pb-6 pt-0 sm:pb-8" aria-labelledby="dashboard-guidance-title">
          <div className="max-w-4xl">
            <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your academic journey</p>
            <h1 id="dashboard-guidance-title" className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] sm:text-5xl">
              {result ? 'Turn your assessment into a confident course choice.' : 'Start with what genuinely interests you.'}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {result
                ? `Your strongest recorded interests are ${result.topLabels.join(' and ')}. Review your matches, compare programmes, and seek guidance when you need another perspective.`
                : 'Complete the interest assessment to unlock your RIASEC profile and matched TCC programmes.'}
            </p>
          </div>
        </section>

        <div data-print-summary-grid data-testid="student-journey-grid" className="grid items-start gap-6 lg:grid-cols-12">
          <div className="contents">
            <CourseDirectionPanel course={topCourse} generatedAt={snapshot?.generatedAt} onOpen={() => onSelectModule('recommendations')} />

            {result ? (
              <section data-print-profile aria-labelledby="interest-scores-title" className="rounded-xl bg-card p-6 shadow-sm lg:col-span-7 lg:row-start-2 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary">Your interest pattern</p>
                    <h3 id="interest-scores-title" className="mt-2 font-display text-2xl font-semibold">{result.topLabels.join(' and ')}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Top code {result.topCode} · completed {result.availableAt}</p>
                  </div>
                  <span className="font-display text-4xl font-bold text-primary">{result.topCode}</span>
                </div>
                <dl className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {result.dimensions.map((dimension, index) => (
                    <div key={dimension.code} className="rounded-lg bg-secondary p-3 text-center">
                      <dt className={`mx-auto flex size-8 items-center justify-center rounded text-xs font-bold ${dimensionStyles[index]}`}>{dimension.code}</dt>
                      <dd className="mt-2 text-xl font-bold">{dimension.value}</dd>
                      <span className="mt-1 block truncate text-[10px] text-muted-foreground">{dimension.label}</span>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>

          <div className="contents">
            <GuidanceAppointmentPanel
              appointments={appointments}
              request={latestGuidanceRequest}
              summary={guidanceSummaries[0] ?? null}
              topCourse={topCourse}
              onRequested={(request) => setGuidanceRequests((current) => [request, ...current.filter((item) => item.id !== request.id)])}
              onRequestChanged={(request) => setGuidanceRequests((current) => [request, ...current.filter((item) => item.id !== request.id)])}
              onAppointmentChanged={(appointment) => setAppointments((current) => [appointment, ...current.filter((item) => item.id !== appointment.id)])}
            />
            <AssessmentLifecycleCard lifecycle={lifecycle} onOpenAssessment={() => onSelectModule('assessment')} onOpenHistory={() => onSelectModule('history')} onRetryResult={async () => {
              if (!lifecycle.id) return
              setLifecycle(await retryAssessmentResult(lifecycle.id))
            }} />
          </div>
        </div>

      </article>
    </DashboardFrame>
  )
}

interface AssessmentHistorySummaryProps {
  history: AssessmentHistoryResponse | null
  historyError: boolean
  lifecycle: AssessmentLifecycle
  selectedAttemptId: number | null
  selectedRecommendation: StudentRecommendationState | null
  selectedRecommendationState: 'idle' | 'loading' | 'error'
  onSelectAttempt: (assessmentSessionId: number) => Promise<void>
  onRetryHistory: () => void
  onStartRetake: () => Promise<void>
}

function AssessmentHistorySummary({ history, historyError, lifecycle, selectedAttemptId, selectedRecommendation, selectedRecommendationState, onSelectAttempt, onRetryHistory, onStartRetake }: AssessmentHistorySummaryProps) {
  const [starting, setStarting] = useState(false)
  const [confirmingRetake, setConfirmingRetake] = useState(false)
  const [retakeError, setRetakeError] = useState(false)
  const availableDate = formatAssessmentDate(lifecycle.retake_available_at)
  const retakeLabel = lifecycle.can_retake
    ? 'Start retake'
    : lifecycle.status === 'in_progress'
      ? 'Retake in progress'
      : lifecycle.status === 'preparing_result'
        ? 'Finalizing submission'
        : lifecycle.status === 'result_failed'
          ? 'Result needs retry'
          : lifecycle.retake_available_at
            ? `Available ${availableDate}`
            : 'Retake unavailable'
  const latestCompletedId = history?.attempts.find((item) => item.status === 'result_available')?.id
  const selectedAttempt = history?.attempts.find((item) => item.id === selectedAttemptId) ?? null
  const previousCompletedAttempt = selectedAttempt
    ? history?.attempts
      .filter((item) => item.status === 'result_available' && (item.attempt_number ?? 0) < (selectedAttempt.attempt_number ?? 0))
      .sort((left, right) => (right.attempt_number ?? 0) - (left.attempt_number ?? 0))[0] ?? null
    : null

  async function startRetake() {
    setRetakeError(false)
    setStarting(true)
    try {
      await onStartRetake()
    } catch {
      setRetakeError(true)
    } finally {
      setStarting(false)
    }
  }
  return (
    <section data-print-hidden aria-labelledby="assessment-history-title" className="overflow-hidden rounded-xl bg-card shadow-sm">
      <div className="flex flex-col gap-5 bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded bg-background text-primary shadow-sm"><History className="size-5" aria-hidden="true" /></span>
          <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Recorded attempts</p><h3 id="assessment-history-title" className="mt-1 font-display text-2xl font-semibold">Your assessment timeline</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Choose a completed attempt to open its interest profile and saved programme matches.</p></div>
        </div>
        <Button type="button" variant="outline" className="shrink-0 bg-background" disabled={!lifecycle.can_retake || starting} onClick={() => setConfirmingRetake(true)}>
          <RotateCcw aria-hidden="true" />{starting ? 'Starting retake…' : retakeLabel}
        </Button>
      </div>
      <div className="p-5 pt-0 sm:p-7 sm:pt-0">
        {retakeError ? <Alert variant="destructive" className="mb-5"><AlertCircle aria-hidden="true" /><AlertTitle>Retake could not be started</AlertTitle><AlertDescription>Your previous result is unchanged. Check your connection and try again.</AlertDescription></Alert> : null}
        <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {historyError ? (
          <ErrorState title="Assessment history could not be loaded" description="Your current result is unchanged. Try loading your attempts again." onRetry={onRetryHistory} />
        ) : history ? (
          <ol className="relative space-y-2 border-l border-outline-variant pl-5">
            {history.attempts.map((item) => {
              const result = mapAssessmentResult(item)
              const isSelected = selectedAttemptId === item.id
              const isCurrent = item.is_current
              const isCurrentResult = item.id === latestCompletedId
              return (
                <li key={item.id} className="relative before:absolute before:-left-[1.55rem] before:top-6 before:size-2 before:rounded-full before:bg-primary">
                  <button type="button" disabled={item.status !== 'result_available'} aria-pressed={isSelected} onClick={() => item.id && void onSelectAttempt(item.id)} className={`group min-h-32 w-full rounded-xl p-4 text-left shadow-sm transition duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 motion-reduce:transform-none motion-reduce:transition-none ${isSelected ? 'bg-brand-dark text-white' : 'bg-secondary/55 hover:bg-primary-fixed/55 disabled:cursor-default disabled:hover:bg-secondary/55'}`}>
                    <span className="flex items-start justify-between gap-3"><span><span className={`text-xs font-extrabold uppercase tracking-[0.12em] ${isSelected ? 'text-white/70' : 'text-primary'}`}>Attempt {item.attempt_number}</span><span className="mt-2 block text-xl font-extrabold">{result?.topCode ?? assessmentStatusLabel(item.status)}</span></span>{item.status === 'result_available' ? <ChevronRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-0.5" /> : <Clock3 aria-hidden="true" className="size-5 text-muted-foreground" />}</span>
                    <span className={`mt-5 flex items-center gap-2 text-xs ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}><CalendarDays aria-hidden="true" className="size-4" />{formatAssessmentDate(item.result_available_at ?? item.started_at)}</span>
                    <span className="mt-3 flex flex-wrap gap-2">{isCurrent && item.status !== 'result_available' ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${isSelected ? 'bg-white/15' : 'bg-primary/10 text-primary'}`}>Current attempt</span> : null}{isCurrentResult ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${isSelected ? 'bg-white/15' : 'bg-success/15 text-foreground'}`}>Current result</span> : null}{!isCurrentResult && item.status === 'result_available' ? <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Previous result</span> : null}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        ) : <LoadingState title="Loading assessment history" description="Restoring your recorded attempts." />}

        <div className="min-w-0 lg:sticky lg:top-24">
          {selectedAttempt ? <HistoricalAttemptDetails attempt={selectedAttempt} previousAttempt={previousCompletedAttempt} recommendation={selectedRecommendation} recommendationState={selectedRecommendationState} /> : <div className="flex min-h-72 flex-col justify-between rounded-2xl bg-primary-fixed/45 p-6 sm:p-8"><span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><History className="size-5" aria-hidden="true" /></span><div className="mt-12"><p className="text-xs font-bold uppercase tracking-[0.13em] text-primary">Recorded evidence</p><h4 className="mt-2 font-display text-2xl font-bold">Select a completed attempt</h4><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Open an attempt from the timeline to review its recorded interest profile and programme matches here.</p>{history ? <p className="mt-5 text-sm font-semibold text-primary">{history.attempts.length} recorded {history.attempts.length === 1 ? 'attempt' : 'attempts'}</p> : null}</div></div>}
        </div>
        </div>
      </div>

      <ConfirmActionDialog open={confirmingRetake} onOpenChange={setConfirmingRetake} title="Start a new assessment?" description="Your completed results will stay available in Assessment history. The new attempt starts with no answers and becomes your current assessment." confirmLabel="Start retake" onConfirm={startRetake} />
    </section>
  )
}

function HistoricalAttemptDetails({ attempt, previousAttempt, recommendation, recommendationState }: { attempt: AssessmentLifecycle; previousAttempt: AssessmentLifecycle | null; recommendation: StudentRecommendationState | null; recommendationState: 'idle' | 'loading' | 'error' }) {
  const result = mapAssessmentResult(attempt)
  if (!result) return null
  const previousResult = previousAttempt ? mapAssessmentResult(previousAttempt) : null
  const previousValues = new Map(previousResult?.dimensions.map((dimension) => [dimension.code, dimension.value]) ?? [])
  const courses = recommendation?.status === 'available' ? recommendation.recommendation?.courses ?? [] : []

  return (
    <div className="rounded-2xl bg-secondary/55 p-5 sm:p-7" aria-live="polite">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">Attempt {attempt.attempt_number} result</p><h4 className="mt-2 text-2xl font-extrabold">{result.topLabels.join(' and ')}</h4><p className="mt-2 text-sm text-muted-foreground">Completed {result.availableAt}</p><p className="mt-1 text-xs text-muted-foreground">Assessment version: {result.assessmentVersion}</p></div><div className="rounded-2xl bg-brand-dark px-5 py-4 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-soft">Top code</p><p className="mt-1 text-3xl font-extrabold">{result.topCode}</p></div></div>
      <dl className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">{result.dimensions.map((dimension) => <div key={dimension.code} className="rounded-xl bg-background p-3 text-center shadow-sm"><dt className="text-xs font-bold text-muted-foreground">{dimension.code}</dt><dd className="mt-1 text-xl font-extrabold">{dimension.value}</dd></div>)}</dl>
      {previousResult ? (
        <section aria-labelledby={`attempt-${attempt.id}-comparison`} className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h5 id={`attempt-${attempt.id}-comparison`} className="font-extrabold">Compared with Attempt {previousAttempt?.attempt_number}</h5>
            <p className="text-xs text-muted-foreground">Recorded score change only</p>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {result.dimensions.map((dimension) => {
              const previousValue = previousValues.get(dimension.code)
              const change = previousValue === undefined ? null : dimension.value - previousValue
              return (
                <div key={dimension.code} className="rounded-xl bg-background p-3 text-center shadow-sm">
                  <dt className="text-xs font-bold text-muted-foreground">{dimension.code}</dt>
                  <dd className="mt-1 text-sm font-extrabold">{change === null ? 'N/A' : change > 0 ? `+${change}` : String(change)}</dd>
                </div>
              )
            })}
          </dl>
        </section>
      ) : null}
      <div className="mt-6"><h5 className="font-extrabold">Programme matches from this attempt</h5>{recommendationState === 'loading' ? <LoadingState className="mt-3" title="Loading saved matches" description="Connecting this attempt to its recommendation record." /> : null}{recommendationState === 'error' ? <p role="alert" className="mt-3 rounded-xl bg-destructive/10 p-4 text-sm font-bold text-destructive">The saved programme matches could not be loaded.</p> : null}{recommendationState === 'idle' && courses.length > 0 ? <ol className="mt-3 grid gap-3 md:grid-cols-3">{courses.map((course) => <li key={course.id} className="rounded-2xl bg-background p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><span className="text-xs font-extrabold text-primary">#{course.rank} · {course.code}</span><span className="text-lg font-extrabold text-primary">{course.match}%</span></div><p className="mt-2 font-extrabold">{course.name}</p></li>)}</ol> : null}{recommendationState === 'idle' && courses.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No saved programme matches are available for this attempt.</p> : null}</div>
    </div>
  )
}

function assessmentStatusLabel(status: AssessmentLifecycle['status']) {
  return ({ not_started: 'Not started', in_progress: 'In progress', preparing_result: 'Finalizing submission', result_failed: 'Result unavailable', result_available: 'Result available' })[status]
}

function CourseDirectionPanel({ course, generatedAt, onOpen }: { course: StudentRecommendedCourse | null; generatedAt?: string; onOpen: () => void }) {
  const { cover } = getProgrammeImages(course?.id ?? '')
  return (
    <section data-print-recommendations aria-labelledby="course-direction-title" className="overflow-hidden rounded-xl bg-card shadow-sm lg:col-span-7 lg:row-start-1">
      {course ? (
        <div className="grid min-h-72 sm:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="flex flex-col p-6 sm:p-8">
            <p className="font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary">Your strongest course direction</p>
            <h3 id="course-direction-title" className="mt-3 font-display text-3xl font-bold tracking-[-0.03em]">{course.name}</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{course.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-primary-fixed px-3 py-1.5 text-xs font-semibold text-on-primary-fixed">#{course.rank} · {course.code}</span>
              <strong className="text-2xl text-primary">{course.match}% match</strong>
            </div>
            {generatedAt ? <p className="mt-3 text-xs text-muted-foreground">Updated {formatAssessmentDate(generatedAt)}</p> : null}
            <Button data-print-hidden type="button" onClick={onOpen} className="mt-6 w-fit bg-accent text-accent-foreground hover:bg-secondary-container">
              Review all course matches <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          <div className="relative min-h-56 bg-secondary" aria-hidden="true">
            {cover ? <img src={cover} alt="" className="absolute inset-0 size-full object-cover" /> : <BookOpenCheck className="absolute inset-0 m-auto size-20 text-primary/25" />}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent sm:bg-gradient-to-r" />
          </div>
        </div>
      ) : (
        <div className="p-7 sm:p-9">
          <p className="font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary">Course direction</p>
          <h3 id="course-direction-title" className="mt-2 font-display text-2xl font-semibold">Your strongest match will appear here</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Complete the interest assessment to generate course matches from the current TCC catalogue.</p>
        </div>
      )}
    </section>
  )
}

function GuidanceAppointmentPanel({ appointments, request, summary, topCourse, onRequested, onRequestChanged, onAppointmentChanged }: { appointments: StudentGuidanceAppointment[]; request: StudentGuidanceRequest | null; summary: StudentGuidanceSummary | null; topCourse: StudentRecommendedCourse | null; onRequested: (request: StudentGuidanceRequest) => void; onRequestChanged: (request: StudentGuidanceRequest) => void; onAppointmentChanged: (appointment: StudentGuidanceAppointment) => void }) {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [message, setMessage] = useState('I would like guidance comparing my matched programmes before I decide.')
  const [concernCategory, setConcernCategory] = useState<StudentGuidanceRequest['concernCategory']>('programme_comparison')
  const [preferredFormat, setPreferredFormat] = useState<StudentGuidanceRequest['preferredFormat']>('in_person')
  const [preferredDate, setPreferredDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [appointmentBusy, setAppointmentBusy] = useState(false)
  const [appointmentError, setAppointmentError] = useState('')
  const [showCancellation, setShowCancellation] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [requestCancellationReason, setRequestCancellationReason] = useState('')
  const [now] = useState(() => Date.now())
  const todayIso = new Date(now).toISOString().slice(0, 10)
  const upcoming = appointments.filter((item) => item.status === 'scheduled' && new Date(item.scheduledAt).getTime() >= now).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const history = appointments.filter((item) => !upcoming.some((upcomingItem) => upcomingItem.id === item.id)).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
  const appointment = upcoming[0] ?? null

  const confirmAppointment = async () => {
    if (!appointment) return
    setAppointmentBusy(true); setAppointmentError('')
    try { onAppointmentChanged(await confirmStudentGuidanceAppointment(appointment.id)) }
    catch (reason) { setAppointmentError(reason instanceof Error ? reason.message : 'The appointment could not be confirmed.') }
    finally { setAppointmentBusy(false) }
  }

  const cancelAppointment = async () => {
    if (!appointment || cancellationReason.trim().length < 3) return
    setAppointmentBusy(true); setAppointmentError('')
    try {
      onAppointmentChanged(await cancelStudentGuidanceAppointment(appointment.id, cancellationReason.trim()))
      setShowCancellation(false); setCancellationReason('')
    } catch (reason) { setAppointmentError(reason instanceof Error ? reason.message : 'The appointment could not be cancelled.') }
    finally { setAppointmentBusy(false) }
  }

  const submitRequest = async () => {
    setRequestError('')
    if (message.trim().length < 10) {
      setRequestError('Tell the counselor what advice you need using at least 10 characters.')
      return
    }
    setSubmitting(true)
    try {
      onRequested(await createStudentGuidanceRequest({ programmeId: topCourse?.id ?? null, concernCategory, message: message.trim(), preferredFormat, preferredDate: preferredDate || null }))
      setShowRequestForm(false)
    } catch (reason) {
      setRequestError(reason instanceof Error ? reason.message : 'Your guidance request could not be sent.')
    } finally {
      setSubmitting(false)
    }
  }

  const cancelRequest = async () => {
    if (!request || requestCancellationReason.trim().length < 3) return
    setSubmitting(true); setRequestError('')
    try { onRequestChanged(await cancelStudentGuidanceRequest(request.id, requestCancellationReason.trim())); setRequestCancellationReason('') }
    catch (reason) { setRequestError(reason instanceof Error ? reason.message : 'The guidance request could not be cancelled.') }
    finally { setSubmitting(false) }
  }

  return (
    <section aria-labelledby="counselor-guidance-title" className="overflow-hidden rounded-xl bg-primary-fixed text-on-primary-fixed shadow-sm lg:col-span-5 lg:row-start-2">
      <div className="p-6">
        <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"><MessageCircleMore aria-hidden="true" className="size-5" /></span>
        <p className="mt-5 font-label text-xs font-semibold uppercase tracking-[0.14em] text-on-primary-fixed">Course advice</p>
        <h2 id="counselor-guidance-title" className="mt-2 font-display text-2xl font-semibold">Talk with a counselor</h2>
        {summary ? <div className="mt-5 rounded-lg bg-card p-4 text-card-foreground shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Latest counselor summary</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{summary.body}</p><p className="mt-3 text-xs text-muted-foreground">Published {formatAppointmentDate(summary.publishedAt)}{summary.counselor ? ` by ${summary.counselor}` : ''}</p></div> : null}
        {appointment ? (
          <div className="mt-5 rounded-lg bg-card p-4 text-card-foreground shadow-sm">
            <div className="flex items-start gap-3">
              <CalendarCheck2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Upcoming guidance appointment</p>
                <p className="mt-2 text-sm text-muted-foreground">{formatAppointmentDate(appointment.scheduledAt)}</p>
                {appointment.endsAt ? <p className="mt-1 text-sm text-muted-foreground">Ends {formatAppointmentTime(appointment.endsAt)} · Asia/Manila</p> : null}
                <p className="mt-1 text-sm text-muted-foreground">Counselor: {appointment.counselorName || 'Assigned guidance staff'}</p>
                <p className="mt-1 text-sm text-muted-foreground">Topic: {appointment.topic}</p>
                {appointment.programmeCode ? <p className="mt-1 text-sm text-muted-foreground">Programme: {appointment.programmeCode}</p> : null}
                {appointment.studentConfirmedAt ? <p className="mt-3 text-sm font-semibold text-success">You confirmed this schedule.</p> : <Button type="button" size="sm" className="mt-4" disabled={appointmentBusy} onClick={() => void confirmAppointment()}>Confirm schedule</Button>}
                {!showCancellation ? <Button type="button" size="sm" variant="ghost" className="mt-4" disabled={appointmentBusy} onClick={() => setShowCancellation(true)}>Request cancellation</Button> : <div className="mt-4"><label htmlFor="student-cancellation-reason" className="text-sm font-semibold">Reason for cancellation</label><textarea id="student-cancellation-reason" value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /><div className="mt-2 flex flex-wrap gap-2"><Button type="button" size="sm" variant="destructive" disabled={appointmentBusy || cancellationReason.trim().length < 3} onClick={() => void cancelAppointment()}>Cancel appointment</Button><Button type="button" size="sm" variant="ghost" disabled={appointmentBusy} onClick={() => setShowCancellation(false)}>Keep appointment</Button></div></div>}
                {appointmentError ? <p role="alert" className="mt-3 text-sm font-medium text-destructive">{appointmentError}</p> : null}
              </div>
            </div>
          </div>
        ) : request && !showRequestForm ? (
          <div className="mt-5 rounded-lg bg-card p-4 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between gap-3"><p className="font-semibold">Guidance request</p><StatusBadge label={humanizeGuidanceStatus(request.status)} tone={guidanceStatusTone(request.status)} /></div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{guidanceStatusMessage(request)}</p>
            {request.programmeName ? <p className="mt-3 text-sm font-semibold text-primary">Programme focus: {request.programmeName}</p> : null}
            <dl className="mt-3 grid gap-2 text-xs text-muted-foreground"><div><dt className="font-semibold text-foreground">Concern</dt><dd>{humanizeGuidanceStatus(request.concernCategory)}</dd></div><div><dt className="font-semibold text-foreground">Preferred format</dt><dd>{humanizeGuidanceStatus(request.preferredFormat)}</dd></div>{request.preferredDate ? <div><dt className="font-semibold text-foreground">Preferred date</dt><dd>{request.preferredDate}</dd></div> : null}{request.acceptedBy ? <div><dt className="font-semibold text-foreground">Accepted by</dt><dd>{request.acceptedBy}</dd></div> : null}</dl>
            {request.resolutionReason ? <p className="mt-3 text-sm text-muted-foreground">Update: {request.resolutionReason}</p> : null}
            {request.status === 'pending' ? <div className="mt-4"><label htmlFor="request-cancellation-reason" className="text-sm font-semibold">Cancel this request</label><textarea id="request-cancellation-reason" value={requestCancellationReason} onChange={(event) => setRequestCancellationReason(event.target.value)} rows={2} className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /><Button type="button" size="sm" variant="outline" className="mt-2" disabled={submitting || requestCancellationReason.trim().length < 3} onClick={() => void cancelRequest()}>Cancel request</Button></div> : null}
            {['declined', 'closed', 'expired', 'cancelled'].includes(request.status) ? <Button type="button" className="mt-4" disabled={!topCourse} onClick={() => setShowRequestForm(true)}>Start a new request</Button> : null}
            {requestError ? <p role="alert" className="mt-3 text-sm font-medium text-destructive">{requestError}</p> : null}
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-card p-4 text-card-foreground shadow-sm">
            <p className="font-semibold">Request course guidance</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{topCourse ? 'Ask an authorized guidance staff member to review your matched programmes with you.' : 'Complete your assessment first so your request can include your matched programmes.'}</p>
            {showRequestForm && topCourse ? <div className="mt-4">
              <label htmlFor="guidance-concern" className="text-sm font-semibold">What is your main concern?</label><select id="guidance-concern" value={concernCategory} onChange={(event) => setConcernCategory(event.target.value as StudentGuidanceRequest['concernCategory'])} className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="programme_comparison">Compare programmes</option><option value="programme_fit">Programme fit</option><option value="course_requirements">Course requirements</option><option value="career_direction">Career direction</option><option value="general_guidance">General guidance</option></select>
              <label htmlFor="guidance-request-message" className="text-sm font-semibold">What advice do you need?</label>
              <textarea id="guidance-request-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={4} maxLength={1000} className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><label htmlFor="guidance-format" className="text-sm font-semibold">Preferred format</label><select id="guidance-format" value={preferredFormat} onChange={(event) => setPreferredFormat(event.target.value as StudentGuidanceRequest['preferredFormat'])} className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="in_person">In person</option><option value="video_call">Video call</option><option value="phone">Phone</option></select></div><div><label htmlFor="guidance-date" className="text-sm font-semibold">Preferred date (optional)</label><input id="guidance-date" type="date" value={preferredDate} min={todayIso} onChange={(event) => setPreferredDate(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></div></div>
              {requestError ? <p role="alert" className="mt-2 text-sm font-medium text-destructive">{requestError}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2"><Button type="button" disabled={submitting} onClick={() => void submitRequest()}>{submitting ? 'Sending…' : 'Send request'}</Button><Button type="button" variant="outline" disabled={submitting} onClick={() => setShowRequestForm(false)}>Cancel</Button></div>
            </div> : <Button type="button" className="mt-4" disabled={!topCourse} onClick={() => setShowRequestForm(true)}>Request guidance</Button>}
          </div>
        )}
        {history.length ? <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-[0.12em]">Past appointment records</p><ul className="mt-2 space-y-2">{history.slice(0, 3).map((item) => <li key={item.id} className="rounded-lg bg-card/75 p-3 text-card-foreground"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">{formatAppointmentDate(item.scheduledAt)}</span><StatusBadge tone={item.status === 'no_show' ? 'warning' : item.status === 'cancelled' ? 'danger' : 'success'} label={item.status === 'no_show' ? 'No-show' : item.status} /></div><p className="mt-1 text-xs text-muted-foreground">{item.topic}</p>{item.cancellationReason ? <p className="mt-2 text-xs text-muted-foreground">Reason: {item.cancellationReason}</p> : null}</li>)}</ul></div> : null}
      </div>
    </section>
  )
}

function formatAppointmentDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Schedule unavailable'
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(date)
}

function formatAppointmentTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'time unavailable'
  return new Intl.DateTimeFormat('en-PH', { timeStyle: 'short', timeZone: 'Asia/Manila' }).format(date)
}

function humanizeGuidanceStatus(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function guidanceStatusTone(status: StudentGuidanceRequest['status']) {
  if (status === 'pending' || status === 'accepted') return 'warning' as const
  if (status === 'scheduled') return 'info' as const
  if (status === 'closed') return 'success' as const
  return 'danger' as const
}

function guidanceStatusMessage(request: StudentGuidanceRequest) {
  const messages: Record<StudentGuidanceRequest['status'], string> = {
    pending: 'Your request is waiting for a counselor. You may cancel it before a counselor accepts it.',
    accepted: 'A counselor accepted your concern and is preparing the appointment schedule.',
    scheduled: 'Your request was accepted and linked to a scheduled appointment.',
    declined: 'A counselor could not proceed with this request. You may submit a new request if you still need guidance.',
    closed: 'The counseling concern and linked appointment are complete.',
    expired: 'This request expired before it was accepted. You may submit a new request.',
    cancelled: 'This request was cancelled and remains in your history.',
  }
  return messages[request.status]
}

function DashboardFrame({ children }: { children: ReactNode }) {
  return (
    <div className="student-grid-page">
    <div className="student-page pb-12 pt-4 sm:pt-6">
      {children}
    </div>
    </div>
  )
}

function AssessmentLifecycleCard({ lifecycle, onOpenAssessment, onOpenHistory, onRetryResult }: { lifecycle: AssessmentLifecycle; onOpenAssessment: () => void; onOpenHistory: () => void; onRetryResult: () => Promise<void> }) {
  const progress = Math.round(((lifecycle.answer_count ?? 0) / Math.max(1, lifecycle.question_count)) * 100)
  const isProgress = lifecycle.status === 'in_progress'
  const isPreparing = lifecycle.status === 'preparing_result'
  const isFailed = lifecycle.status === 'result_failed'
  const isAvailable = lifecycle.status === 'result_available'
  return (
    <section data-print-hidden aria-labelledby="current-assessment-title" className="flex h-full flex-col overflow-hidden rounded-lg bg-card shadow-sm lg:col-span-5 lg:row-start-1">
      <div className="bg-primary-fixed/70 p-5 dark:bg-brand-dark dark:text-white sm:p-6">
        <span className="flex size-11 items-center justify-center rounded bg-background text-primary shadow-sm dark:bg-white/10 dark:text-brand-soft">{isPreparing ? <Clock3 className="size-5" /> : <ClipboardList className="size-5" />}</span>
        <p className="mt-5 font-label text-xs font-semibold uppercase tracking-[0.12em] text-primary dark:text-brand-soft">Current assessment</p>
        <h2 id="current-assessment-title" className="mt-2 font-display text-2xl font-semibold">{isProgress ? 'Continue your assessment' : isPreparing ? 'Finalizing your submission' : isFailed ? 'Result processing needs attention' : isAvailable ? 'Your result is available' : 'Start your interest assessment'}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground dark:text-white/75">{isProgress ? `${lifecycle.answer_count ?? 0} of ${lifecycle.question_count} questions answered. Your saved session will resume automatically.` : isPreparing ? 'Your submitted answers are being processed. Your latest completed result remains visible beside this status.' : isFailed ? 'Your answers are safe, but the result service could not finish processing them.' : isAvailable ? 'Review your profile and programme matches, or open your earlier attempts.' : 'Answer 30 interest questions to build your RIASEC profile.'}</p>
          {isProgress ? <div className="mt-5 max-w-xl"><div className="flex justify-between text-sm font-bold"><span>Assessment progress</span><span>{progress}%</span></div><div role="progressbar" aria-label="Saved assessment progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div></div> : null}
      </div>
      <div className="mt-auto grid gap-3 p-5 sm:p-6">
        {isFailed ? <Button type="button" onClick={() => void onRetryResult()}>Try processing again<ArrowRight /></Button> : !isPreparing ? <Button type="button" onClick={onOpenAssessment}>{isProgress ? 'Resume assessment' : isAvailable ? 'View assessment result' : 'Start assessment'}<ArrowRight /></Button> : null}
        <Button type="button" variant="outline" onClick={onOpenHistory}><History aria-hidden="true" />Assessment history</Button>
      </div>
    </section>
  )
}

export { AssessmentHistorySummary, StudentDashboardPage }
