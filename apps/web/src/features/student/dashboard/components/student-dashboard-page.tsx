import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  History,
  Printer,
  RotateCcw,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import { ConfirmActionDialog, EmptyState, ErrorState, LoadingState, StatusBadge } from '@/components/shared'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getAssessmentHistory, getCurrentAssessment, retryAssessmentResult, startAssessment, type AssessmentHistoryResponse, type AssessmentLifecycle } from '@/features/student/assessment/assessment-api'
import { formatAssessmentDate, mapAssessmentResult } from '@/features/student/assessment/assessment-result-mapper'
import { getLatestRecommendation, getRecommendationForAttempt } from '@/features/student/recommendations/recommendation-api'
import type { StudentRecommendationState } from '@/features/student/recommendations/recommendation-types'

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
  const [recommendations, setRecommendations] = useState<StudentRecommendationState | null>(initialRecommendations ?? null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(initialLifecycle ? 'ready' : 'loading')
  const [attempt, setAttempt] = useState(0)
  const [history, setHistory] = useState<AssessmentHistoryResponse | null>(null)
  const [historyError, setHistoryError] = useState(false)
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState<StudentRecommendationState | null>(null)
  const [selectedRecommendationState, setSelectedRecommendationState] = useState<'idle' | 'loading' | 'error'>('idle')
  const lifecycleId = lifecycle?.id
  const lifecycleStatus = lifecycle?.status

  useEffect(() => {
    if (initialLifecycle) return
    let active = true
    Promise.all([getCurrentAssessment(), getLatestRecommendation()])
      .then(([assessment, recommendation]) => {
        if (!active) return
        setLifecycle(assessment)
        setRecommendations(recommendation)
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
            const [recommendation, attempts] = await Promise.all([
              getLatestRecommendation(),
              getAssessmentHistory(),
            ])
            setRecommendations(recommendation)
            setHistory(attempts)
            setHistoryError(false)
          }
        })
        .catch(() => undefined)
    }, 5_000)
    return () => window.clearInterval(timer)
  }, [initialLifecycle, lifecycle?.status])

  useEffect(() => {
    if (!lifecycleStatus) return
    getAssessmentHistory()
      .then((attempts) => {
        setHistory(attempts)
        setHistoryError(false)
      })
      .catch(() => setHistoryError(true))
  }, [lifecycleId, lifecycleStatus])

  async function selectAttempt(assessmentSessionId: number) {
    setSelectedAttemptId(assessmentSessionId)
    setSelectedRecommendation(null)
    setSelectedRecommendationState('loading')
    try {
      setSelectedRecommendation(await getRecommendationForAttempt(assessmentSessionId))
      setSelectedRecommendationState('idle')
    } catch {
      setSelectedRecommendationState('error')
    }
  }

  if (loadState === 'error') {
    return <DashboardFrame><ErrorState title="We could not load your dashboard" description="Your saved assessment was not changed. Check your connection and try again." onRetry={() => { setLoadState('loading'); setAttempt((value) => value + 1) }} /></DashboardFrame>
  }
  if (loadState === 'loading' || !lifecycle) {
    return <DashboardFrame><LoadingState variant="dashboard" title="Loading your dashboard" description="Restoring your latest assessment and recommendation status." /></DashboardFrame>
  }
  if (lifecycle.status !== 'result_available') {
    return (
      <DashboardFrame status={lifecycle.status}>
        <div className="space-y-5">
          <AssessmentLifecycleCard lifecycle={lifecycle} onOpenAssessment={() => onSelectModule('assessment')} onRetryResult={async () => {
            if (!lifecycle.id) return
            setLifecycle(await retryAssessmentResult(lifecycle.id))
          }} />
          <AssessmentHistorySummary
            history={history}
            historyError={historyError}
            lifecycle={lifecycle}
            selectedAttemptId={selectedAttemptId}
            selectedRecommendation={selectedRecommendation}
            selectedRecommendationState={selectedRecommendationState}
            onSelectAttempt={selectAttempt}
            onRetryHistory={() => {
              setHistoryError(false)
              getAssessmentHistory().then(setHistory).catch(() => setHistoryError(true))
            }}
            onStartRetake={async () => {
              const next = await startAssessment()
              setLifecycle(next)
              setHistory(await getAssessmentHistory())
              onSelectModule('assessment')
            }}
          />
        </div>
      </DashboardFrame>
    )
  }

  const result = mapAssessmentResult(lifecycle)
  if (!result) {
    return <DashboardFrame><EmptyState className="mt-5" title="The result could not be displayed" description="The server returned an incomplete assessment result. No fallback scores were inserted." icon={ClipboardList} /></DashboardFrame>
  }

  return (
    <DashboardFrame onPrint={() => window.print()}>
      <article
        data-report-print
        data-testid="student-guidance-summary"
        className="mt-5 w-full space-y-5"
      >
        <header className="relative overflow-hidden rounded-3xl bg-brand-dark p-6 text-white shadow-sm sm:p-8 lg:p-10">
          <div aria-hidden="true" className="absolute -right-24 -top-28 size-80 rounded-full bg-primary/35 blur-3xl" />
          <div aria-hidden="true" className="absolute bottom-0 right-1/4 size-44 rounded-full bg-brand-magenta/15 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/10 text-brand-soft">
                <BookOpenCheck aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-soft">Your interest profile</p>
              <h2 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Your strongest interests are {result.topLabels.join(' and ')}.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                Explore the TCC programmes that align most closely with your assessment scores.
              </p>
            </div>
            <div className="flex min-w-44 items-center gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur-sm lg:flex-col lg:items-start">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand-soft">Top code</p>
                <p className="mt-1 text-4xl font-extrabold sm:text-5xl">{result.topCode}</p>
              </div>
              <div className="h-12 w-px bg-white/15 lg:h-px lg:w-full" />
              <div className="text-xs leading-5 text-white/70">
                <p className="font-bold text-white">Assessment complete</p>
                <p>{result.availableAt}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]">
          <section aria-labelledby="interest-scores-title" className="rounded-3xl bg-background p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Assessment overview</p>
                <h3 id="interest-scores-title" className="mt-1 text-xl font-extrabold">Your six interest scores</h3>
              </div>
              <span className="hidden rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-muted-foreground sm:block">RIASEC</span>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {result.dimensions.map((dimension, index) => (
                <div key={dimension.code} className="group rounded-2xl bg-secondary/65 p-4 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none sm:p-5">
                  <div className={`flex size-9 items-center justify-center rounded-xl text-sm font-extrabold ${dimensionStyles[index]}`}>
                    {dimension.code}
                  </div>
                  <dt className="mt-4 text-xs font-bold text-muted-foreground">{dimension.label}</dt>
                  <dd className="mt-1 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">{dimension.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm text-muted-foreground">Assessment completed {result.availableAt}</p>
          </section>

          <RecommendationSummary state={recommendations} onOpen={() => onSelectModule('recommendations')} />
        </div>

        <AssessmentHistorySummary
          history={history}
          historyError={historyError}
          lifecycle={lifecycle}
          selectedAttemptId={selectedAttemptId}
          selectedRecommendation={selectedRecommendation}
          selectedRecommendationState={selectedRecommendationState}
          onSelectAttempt={selectAttempt}
          onRetryHistory={() => {
            setHistoryError(false)
            getAssessmentHistory().then(setHistory).catch(() => setHistoryError(true))
          }}
          onStartRetake={async () => {
            const next = await startAssessment()
            setLifecycle(next)
            setHistory(await getAssessmentHistory())
            onSelectModule('assessment')
          }}
        />

        <footer className="flex flex-col gap-3 rounded-2xl bg-background px-5 py-4 text-sm leading-6 text-muted-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p>This guidance does not guarantee admission or enrolment.</p>
          <p>Interest data source: <a href="https://services.onetcenter.org/" target="_blank" rel="noreferrer" className="font-bold text-primary underline underline-offset-4">O*NET® Web Services</a></p>
        </footer>
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
        ? 'Result processing'
        : lifecycle.status === 'result_failed'
          ? 'Result needs retry'
          : lifecycle.retake_available_at
            ? `Available ${availableDate}`
            : 'Retake unavailable'
  const latestCompletedId = history?.attempts.find((item) => item.status === 'result_available')?.id
  const selectedAttempt = history?.attempts.find((item) => item.id === selectedAttemptId) ?? null

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
    <section data-print-hidden aria-labelledby="assessment-history-title" className="overflow-hidden rounded-3xl bg-background shadow-sm">
      <div className="relative flex flex-col gap-5 overflow-hidden bg-brand-dark p-5 text-white sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div aria-hidden="true" className="absolute -right-16 -top-20 size-48 rounded-full bg-primary/30 blur-3xl" />
        <div className="flex items-start gap-3">
          <span className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-soft"><History className="size-5" aria-hidden="true" /></span>
          <div className="relative"><p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-soft">Your journey</p><h3 id="assessment-history-title" className="mt-1 text-2xl font-extrabold">Assessment history</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Open a completed attempt to review its interest profile and saved programme matches.</p></div>
        </div>
        <Button className="relative" type="button" variant="secondary" disabled={!lifecycle.can_retake || starting} onClick={() => setConfirmingRetake(true)}>
          <RotateCcw aria-hidden="true" />{starting ? 'Starting retake…' : retakeLabel}
        </Button>
      </div>
      <div className="p-5 sm:p-7">
        {retakeError ? <Alert variant="destructive" className="mb-5"><AlertCircle aria-hidden="true" /><AlertTitle>Retake could not be started</AlertTitle><AlertDescription>Your previous result is unchanged. Check your connection and try again.</AlertDescription></Alert> : null}
        {historyError ? (
          <ErrorState title="Assessment history could not be loaded" description="Your current result is unchanged. Try loading your attempts again." onRetry={onRetryHistory} />
        ) : history ? (
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {history.attempts.map((item) => {
              const result = mapAssessmentResult(item)
              const isSelected = selectedAttemptId === item.id
              const isCurrent = item.is_current
              const isLatestResult = item.id === latestCompletedId
              return (
                <li key={item.id}>
                  <button type="button" disabled={item.status !== 'result_available'} aria-pressed={isSelected} onClick={() => item.id && void onSelectAttempt(item.id)} className={`group min-h-40 w-full rounded-2xl p-5 text-left shadow-sm transition-transform duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 motion-reduce:transform-none motion-reduce:transition-none ${isSelected ? 'bg-brand-dark text-white' : 'bg-secondary/60 hover:-translate-y-0.5 disabled:cursor-default disabled:hover:translate-y-0'}`}>
                    <span className="flex items-start justify-between gap-3"><span><span className={`text-xs font-extrabold uppercase tracking-[0.12em] ${isSelected ? 'text-white/70' : 'text-primary'}`}>Attempt {item.attempt_number}</span><span className="mt-2 block text-xl font-extrabold">{result?.topCode ?? assessmentStatusLabel(item.status)}</span></span>{item.status === 'result_available' ? <ChevronRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-0.5" /> : <Clock3 aria-hidden="true" className="size-5 text-muted-foreground" />}</span>
                    <span className={`mt-5 flex items-center gap-2 text-xs ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}><CalendarDays aria-hidden="true" className="size-4" />{formatAssessmentDate(item.result_available_at ?? item.started_at)}</span>
                    <span className="mt-3 flex flex-wrap gap-2">{isCurrent ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${isSelected ? 'bg-white/15' : 'bg-primary/10 text-primary'}`}>Current attempt</span> : null}{isLatestResult ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${isSelected ? 'bg-white/15' : 'bg-success/15 text-foreground'}`}>Latest result</span> : null}{!isCurrent && !isLatestResult ? <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Completed</span> : null}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        ) : <LoadingState title="Loading assessment history" description="Restoring your recorded attempts." />}

        {selectedAttempt ? <HistoricalAttemptDetails attempt={selectedAttempt} recommendation={selectedRecommendation} recommendationState={selectedRecommendationState} /> : null}
      </div>

      <ConfirmActionDialog open={confirmingRetake} onOpenChange={setConfirmingRetake} title="Start a new assessment?" description="Your completed results will stay available in Assessment history. The new attempt starts with no answers and becomes your current assessment." confirmLabel="Start retake" onConfirm={startRetake} />
    </section>
  )
}

function HistoricalAttemptDetails({ attempt, recommendation, recommendationState }: { attempt: AssessmentLifecycle; recommendation: StudentRecommendationState | null; recommendationState: 'idle' | 'loading' | 'error' }) {
  const result = mapAssessmentResult(attempt)
  if (!result) return null
  const courses = recommendation?.status === 'available' ? recommendation.recommendation?.courses ?? [] : []

  return (
    <div className="mt-6 rounded-3xl bg-secondary/55 p-5 sm:p-7" aria-live="polite">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">Attempt {attempt.attempt_number} result</p><h4 className="mt-2 text-2xl font-extrabold">{result.topLabels.join(' and ')}</h4><p className="mt-2 text-sm text-muted-foreground">Completed {result.availableAt}</p></div><div className="rounded-2xl bg-brand-dark px-5 py-4 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-soft">Top code</p><p className="mt-1 text-3xl font-extrabold">{result.topCode}</p></div></div>
      <dl className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">{result.dimensions.map((dimension) => <div key={dimension.code} className="rounded-xl bg-background p-3 text-center shadow-sm"><dt className="text-xs font-bold text-muted-foreground">{dimension.code}</dt><dd className="mt-1 text-xl font-extrabold">{dimension.value}</dd></div>)}</dl>
      <div className="mt-6"><h5 className="font-extrabold">Programme matches from this attempt</h5>{recommendationState === 'loading' ? <LoadingState className="mt-3" title="Loading saved matches" description="Connecting this attempt to its recommendation record." /> : null}{recommendationState === 'error' ? <p role="alert" className="mt-3 rounded-xl bg-destructive/10 p-4 text-sm font-bold text-destructive">The saved programme matches could not be loaded.</p> : null}{recommendationState === 'idle' && courses.length > 0 ? <ol className="mt-3 grid gap-3 md:grid-cols-3">{courses.map((course) => <li key={course.id} className="rounded-2xl bg-background p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><span className="text-xs font-extrabold text-primary">#{course.rank} · {course.code}</span><span className="text-lg font-extrabold text-primary">{course.match}%</span></div><p className="mt-2 font-extrabold">{course.name}</p></li>)}</ol> : null}{recommendationState === 'idle' && courses.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No saved programme matches are available for this attempt.</p> : null}</div>
    </div>
  )
}

function assessmentStatusLabel(status: AssessmentLifecycle['status']) {
  return ({ not_started: 'Not started', in_progress: 'In progress', preparing_result: 'Preparing result', result_failed: 'Result unavailable', result_available: 'Result available' })[status]
}

function RecommendationSummary({ state, onOpen }: { state: StudentRecommendationState | null; onOpen: () => void }) {
  const snapshot = state?.recommendation
  const hasRecommendations = state?.status === 'available' && snapshot

  return (
    <section aria-labelledby="dashboard-courses-title" className="rounded-3xl bg-background p-5 shadow-sm sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpenCheck aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Best matches</p>
            <h3 id="dashboard-courses-title" className="mt-1 text-xl font-extrabold">Recommended TCC programmes</h3>
          </div>
        </div>
        {hasRecommendations ? <span className="text-xs font-bold text-muted-foreground">Top {snapshot.courses.length}</span> : null}
      </div>

      {hasRecommendations ? (
        <>
          <p className="mt-5 text-sm text-muted-foreground">Updated {formatAssessmentDate(snapshot.generatedAt)}</p>
          <ol className="mt-4 space-y-3">
            {snapshot.courses.map((course, index) => (
              <li
                key={course.id}
                className={index === 0
                  ? 'relative overflow-hidden rounded-2xl bg-brand-dark p-5 text-white shadow-sm'
                  : 'rounded-2xl bg-secondary/65 p-5'}
              >
                {index === 0 ? <div aria-hidden="true" className="absolute -right-12 -top-16 size-36 rounded-full bg-white/10" /> : null}
                <div className="relative flex items-center gap-4">
                  <span className={index === 0
                    ? 'flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm font-extrabold'
                    : 'flex size-11 shrink-0 items-center justify-center rounded-xl bg-background text-sm font-extrabold text-primary shadow-sm'}>
                    {course.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={index === 0 ? 'text-xs font-bold text-white/70' : 'text-xs font-bold text-primary'}>{course.code}</p>
                    <p className="mt-1 truncate font-extrabold sm:text-lg">{course.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={index === 0 ? 'text-2xl font-extrabold' : 'text-xl font-extrabold text-primary'}>{course.match}%</p>
                    <p className={index === 0 ? 'text-[10px] font-bold text-white/65' : 'text-[10px] font-bold text-muted-foreground'}>interest match</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <div className="mt-5 rounded-2xl bg-secondary/55 p-5">
          <p className="font-extrabold">No recommendations yet</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Complete your assessment to generate your TCC programme matches.</p>
        </div>
      )}

      <Button data-print-hidden type="button" onClick={onOpen} className="mt-5 min-h-11 w-full">
        Explore all recommendations
        <ArrowRight aria-hidden="true" />
      </Button>
    </section>
  )
}

function DashboardFrame({ children, status, onPrint }: { children: ReactNode; status?: AssessmentLifecycle['status']; onPrint?: () => void }) {
  return (
    <div className="w-full pb-8">
      <div data-print-hidden className="flex items-center justify-between gap-4 px-1">
        <h1 className="text-2xl font-extrabold sm:text-[1.75rem]">Dashboard</h1>
        <div className="flex items-center gap-2">
          {status ? <DashboardStatus status={status} /> : null}
          {onPrint ? <Button type="button" variant="outline" onClick={onPrint}><Printer aria-hidden="true" />Print summary</Button> : null}
        </div>
      </div>
      {children}
    </div>
  )
}

function DashboardStatus({ status }: { status: AssessmentLifecycle['status'] }) {
  const states = { not_started: ['Start assessment', 'neutral'], in_progress: ['In progress', 'warning'], preparing_result: ['Preparing result', 'info'], result_failed: ['Result unavailable', 'danger'], result_available: ['Result available', 'success'] } as const
  const [label, tone] = states[status]
  return <StatusBadge label={label} tone={tone} />
}

function AssessmentLifecycleCard({ lifecycle, onOpenAssessment, onRetryResult }: { lifecycle: AssessmentLifecycle; onOpenAssessment: () => void; onRetryResult: () => Promise<void> }) {
  const progress = Math.round(((lifecycle.answer_count ?? 0) / Math.max(1, lifecycle.question_count)) * 100)
  const isProgress = lifecycle.status === 'in_progress'
  const isPreparing = lifecycle.status === 'preparing_result'
  const isFailed = lifecycle.status === 'result_failed'
  return (
    <section className="relative mt-5 w-full overflow-hidden rounded-3xl bg-brand-dark p-6 text-white shadow-sm sm:p-9 lg:p-12">
      <div aria-hidden="true" className="absolute -right-24 -top-28 size-80 rounded-full bg-primary/35 blur-3xl" />
      <div className="relative">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-brand-soft">{isPreparing ? <Clock3 className="size-6" /> : <ClipboardList className="size-6" />}</span>
        <h2 className="mt-6 text-2xl font-extrabold sm:text-3xl">{isProgress ? 'Continue your assessment' : isPreparing ? 'Your result is being prepared' : isFailed ? 'Your result needs another try' : 'Discover your strongest interests'}</h2>
        <p className="mt-3 max-w-2xl text-white/70">{isProgress ? `${lifecycle.answer_count ?? 0} of ${lifecycle.question_count} questions answered. Your saved session will resume automatically.` : isPreparing ? 'Your submitted responses are locked while the result is processed.' : isFailed ? 'Your answers are safe. The result service could not finish processing them.' : 'Complete the interest assessment to see your profile and matched TCC programmes.'}</p>
        {isProgress ? <div className="mt-6 max-w-2xl"><div className="flex justify-between text-sm font-bold"><span>Assessment progress</span><span>{progress}%</span></div><div role="progressbar" aria-label="Saved assessment progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div></div> : null}
        {isFailed ? <Button type="button" onClick={() => void onRetryResult()} className="mt-7 min-h-12">Try processing again<ArrowRight /></Button> : !isPreparing ? <Button type="button" onClick={onOpenAssessment} className="mt-7 min-h-12">{isProgress ? 'Resume assessment' : 'Start assessment'}<ArrowRight /></Button> : null}
      </div>
    </section>
  )
}

export { StudentDashboardPage }
