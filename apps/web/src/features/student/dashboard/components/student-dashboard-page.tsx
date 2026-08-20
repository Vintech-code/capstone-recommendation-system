import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Compass,
  Eye,
  History,
  MapPin,
  MessageCircleMore,
  Paintbrush,
  RotateCcw,
  Route,
  Search,
  Target,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import guidanceOfficeImage from '@/assets/student-guidance-office.webp'
import journeyHeroImage from '@/assets/student-journey-hero.png'
import { ErrorState, LoadingState } from '@/components/shared'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getAssessmentHistory, getCurrentAssessment, retryAssessmentResult, type AssessmentHistoryResponse, type AssessmentLifecycle } from '@/features/student/assessment/assessment-api'
import { RetakeAssessmentDialog } from '@/features/student/assessment/components/retake-assessment-dialog'
import { formatAssessmentDate, mapAssessmentResult } from '@/features/student/assessment/assessment-result-mapper'
import { getProgrammeImages } from '@/features/student/programmes/programme-images'
import { getLatestRecommendation, getRecommendationForAttempt } from '@/features/student/recommendations/recommendation-api'
import type { StudentRecommendedCourse, StudentRecommendationState } from '@/features/student/recommendations/recommendation-types'

interface StudentDashboardPageProps {
  onSelectModule: (moduleId: string) => void
  initialLifecycle?: AssessmentLifecycle
  initialRecommendations?: StudentRecommendationState
}

const dimensionPresentation: Record<string, { icon: LucideIcon; tile: string; badge: string; accent: string }> = {
  R: { icon: Eye, tile: 'bg-primary-fixed/45', badge: 'bg-primary/65 text-primary-foreground', accent: 'bg-primary/65' },
  I: { icon: Search, tile: 'bg-chart-blue/8', badge: 'bg-chart-blue text-white', accent: 'bg-chart-blue' },
  A: { icon: Paintbrush, tile: 'bg-success/8', badge: 'bg-success text-white', accent: 'bg-success' },
  S: { icon: UsersRound, tile: 'bg-secondary-container/12', badge: 'bg-secondary-container text-on-secondary-container', accent: 'bg-secondary-container' },
  E: { icon: ChartNoAxesColumnIncreasing, tile: 'bg-warning/10', badge: 'bg-warning text-white', accent: 'bg-warning' },
  C: { icon: ClipboardCheck, tile: 'bg-secondary/75', badge: 'bg-muted-foreground text-background', accent: 'bg-muted-foreground' },
}

function StudentDashboardPage({ onSelectModule, initialLifecycle, initialRecommendations }: StudentDashboardPageProps) {
  const [lifecycle, setLifecycle] = useState<AssessmentLifecycle | null>(initialLifecycle ?? null)
  const [latestResultLifecycle, setLatestResultLifecycle] = useState<AssessmentLifecycle | null>(initialLifecycle?.status === 'result_available' ? initialLifecycle : null)
  const [recommendations, setRecommendations] = useState<StudentRecommendationState | null>(initialRecommendations ?? null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(initialLifecycle ? 'ready' : 'loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (initialLifecycle) return
    let active = true
    Promise.all([
      getCurrentAssessment(),
      getLatestRecommendation().catch(() => null),
      getAssessmentHistory().catch(() => null),
    ])
      .then(async ([assessment, currentRecommendation, history]) => {
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
        setLoadState('ready')
      })
      .catch(() => active && setLoadState('error'))
    return () => { active = false }
  }, [attempt, initialLifecycle])

  useEffect(() => {
    if (initialLifecycle || lifecycle?.status !== 'preparing_result') return
    const timer = window.setInterval(() => {
      getCurrentAssessment(true)
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
  const journeySteps = [
    { label: 'Assessment completed', complete: Boolean(result), detail: result?.availableAt },
    { label: 'Review your result', complete: Boolean(result), detail: result ? 'Available' : undefined },
    { label: 'Explore course matches', complete: Boolean(topCourse), detail: topCourse ? 'Available' : undefined },
  ]
  const journeyProgress = Math.round((journeySteps.filter((step) => step.complete).length / journeySteps.length) * 100)
  const highestRecordedScore = result ? Math.max(...result.dimensions.map((dimension) => dimension.value), 1) : 1
  const heroAction = result
    ? { label: topCourse ? 'Explore your matches' : 'Review your result', module: topCourse ? 'recommendations' : 'assessment' }
    : { label: lifecycle.status === 'in_progress' ? 'Continue your assessment' : 'Start your journey', module: 'assessment' }
  const hasActiveAssessmentWork = lifecycle.status === 'preparing_result'
    || lifecycle.status === 'result_failed'
    || (lifecycle.status === 'in_progress' && (lifecycle.answer_count ?? 0) > 0)
  const showAssessmentLifecycleCard = !result || hasActiveAssessmentWork

  return (
    <DashboardFrame>
      <article
        data-report-print={result ? true : undefined}
        data-testid="student-guidance-summary"
        className="w-full space-y-5"
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
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]" aria-labelledby="dashboard-guidance-title">
          <div className="relative min-h-[18rem] overflow-hidden px-2 py-6 sm:px-0 sm:py-7">
            <img src={journeyHeroImage} alt="" className="pointer-events-none absolute inset-0 size-full object-cover object-center opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 52%, var(--background) 100%)' }} />
            <div className="relative z-10 flex h-full max-w-xl flex-col justify-center">
              <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your academic journey</p>
              <h1 id="dashboard-guidance-title" aria-label="Your journey. Your future." className="mt-2 font-display text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl">
                Your journey.<br /><span className="bg-gradient-to-r from-primary via-brand-magenta to-chart-blue bg-clip-text text-transparent">Your future.</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                {result
                  ? `Explore programmes connected to ${result.topLabels.join(' and ')} interests, then compare your strongest matches.`
                  : 'Explore programmes connected to your interests. Start with the interest assessment.'}
              </p>
              <Button type="button" className="mt-5 w-fit px-6" onClick={() => onSelectModule(heroAction.module)}>
                {heroAction.label}<ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>

          <section aria-labelledby="journey-progress-title" className="rounded-xl bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0 pt-1">
                <div className="flex items-center gap-2 text-primary">
                  <Route className="size-4" aria-hidden="true" />
                  <p className="font-label text-xs font-semibold uppercase tracking-[0.12em]">Your progress</p>
                </div>
                <h2 id="journey-progress-title" className="mt-3 max-w-44 font-display text-xl font-bold leading-tight">Keep moving forward</h2>
              </div>
              <div role="progressbar" aria-label="Academic journey progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={journeyProgress} className="relative flex size-24 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${journeyProgress}%, var(--secondary) 0)` }}>
                <span className="flex size-[4.5rem] flex-col items-center justify-center rounded-full bg-card">
                  <strong className="font-display text-2xl font-bold leading-none text-primary">{journeyProgress}%</strong>
                  <span className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Complete</span>
                </span>
              </div>
            </div>
            <ol className="mt-8 divide-y divide-outline-variant/55">
              {journeySteps.map((step) => (
                <li key={step.label} className="flex min-h-11 items-center gap-3 py-3 text-sm">
                  <span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${step.complete ? 'bg-success text-white' : 'bg-secondary text-muted-foreground'}`}>{step.complete ? <Check className="size-3.5" aria-hidden="true" /> : <span className="size-1.5 rounded-full bg-current" />}</span>
                  <span className="min-w-0 flex-1 font-medium leading-snug">{step.label}</span>
                  <span className="max-w-28 shrink-0 truncate text-right text-xs text-muted-foreground">{step.detail ?? 'Pending'}</span>
                </li>
              ))}
            </ol>
            {result ? (
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-outline-variant/55 pt-4">
                <Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={() => onSelectModule('assessment')}>
                  View assessment result <ArrowRight aria-hidden="true" />
                </Button>
                <Button type="button" variant="link" className="h-auto p-0 text-sm text-muted-foreground" onClick={() => onSelectModule('history')}>
                  <History aria-hidden="true" /> Assessment history
                </Button>
              </div>
            ) : null}
          </section>
        </section>

        <div data-print-summary-grid data-testid="student-journey-grid" className="grid items-stretch gap-4 xl:grid-cols-12">
          <div className="contents">
            <CourseDirectionPanel course={topCourse} generatedAt={snapshot?.generatedAt} wide={!showAssessmentLifecycleCard} onOpen={() => onSelectModule('recommendations')} />
            {showAssessmentLifecycleCard ? (
              <AssessmentLifecycleCard lifecycle={lifecycle} hasCompletedResult={Boolean(result)} onOpenAssessment={() => onSelectModule('assessment')} onOpenResult={() => onSelectModule('assessment')} onOpenHistory={() => onSelectModule('history')} onRetryResult={async () => {
                if (!lifecycle.id) return
                setLifecycle(await retryAssessmentResult(lifecycle.id))
              }} />
            ) : null}

            {result ? (
              <section data-print-profile aria-labelledby="interest-scores-title" className="relative h-full overflow-hidden rounded-xl bg-card p-5 shadow-sm xl:col-span-7 xl:row-start-2 sm:p-6">
                <div aria-hidden="true" className="absolute right-6 top-6 grid grid-cols-4 gap-2 opacity-30">{Array.from({ length: 12 }, (_, index) => <span key={index} className="size-1 rounded-full bg-primary-fixed-dim" />)}</div>
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.14em] text-foreground"><span className="flex size-7 items-center justify-center rounded bg-secondary"><Compass aria-hidden="true" className="size-4 text-primary" /></span>Your interest pattern</p>
                    <h3 id="interest-scores-title" aria-label={result.topLabels.join(' and ')} className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                      {result.topLabels.map((label, index) => <span key={label}>{index ? <span className="text-foreground"> and </span> : null}<span className={index === 0 ? 'text-primary' : 'text-secondary-container'}>{label}</span></span>)}
                    </h3>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">Top code {result.topCode} · completed {result.availableAt}</p>
                  </div>
                  <span className="mr-2 bg-gradient-to-r from-primary via-chart-blue to-secondary-container bg-clip-text font-display text-5xl font-bold tracking-[-0.06em] text-transparent">{result.topCode}</span>
                </div>
                <dl className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {result.dimensions.map((dimension) => {
                    const presentation = dimensionPresentation[dimension.code] ?? { icon: Compass, tile: 'bg-secondary', badge: 'bg-primary text-primary-foreground', accent: 'bg-primary' }
                    const Icon = presentation.icon
                    const isPrimary = dimension.code === result.topCode.split('-')[0]
                    return (
                      <div key={dimension.code} className={`relative min-w-0 rounded-lg p-3 text-center ${presentation.tile} ${isPrimary ? 'ring-1 ring-success ring-offset-2 ring-offset-card' : ''}`}>
                        {isPrimary ? <BadgeCheck aria-label="Primary recorded interest" className="absolute -right-1.5 -top-1.5 size-5 fill-success text-white" /> : null}
                        <dt><span className={`mx-auto flex size-8 items-center justify-center rounded-full text-xs font-bold ${presentation.badge}`}>{dimension.code}</span><Icon aria-hidden="true" className={`mx-auto mt-3 size-6 ${isPrimary ? 'text-success' : 'text-primary'}`} /><span className="sr-only">{dimension.label}</span></dt>
                        <dd className="mt-3 font-display text-2xl font-bold">{dimension.value}</dd>
                        <span className="mt-1 block truncate text-[10px] font-medium text-muted-foreground">{dimension.label}</span>
                        <span aria-hidden="true" className="mt-3 block h-1 overflow-hidden rounded-full bg-card/80"><span className={`block h-full rounded-full ${presentation.accent}`} style={{ width: `${Math.round((dimension.value / highestRecordedScore) * 100)}%` }} /></span>
                      </div>
                    )
                  })}
                </dl>
                <div className="relative mt-5 flex items-start gap-3 rounded-lg bg-primary-fixed/35 p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground"><BadgeCheck aria-hidden="true" className="size-5" /></span>
                  <div><p className="text-sm font-bold text-on-primary-fixed">Your highest recorded areas are {result.topLabels.join(' and ')}.</p><p className="mt-1 text-xs leading-5 text-on-primary-fixed-variant">Use this pattern alongside your programme matches when deciding what to explore or discuss with guidance staff.</p></div>
                </div>
              </section>
            ) : null}
          </div>

          <div className="contents">
            <GuidanceSupportPanel />
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
  onStartRetake: (reason?: string) => Promise<void>
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

  async function startRetake(reason?: string) {
    setRetakeError(false)
    setStarting(true)
    try {
      await onStartRetake(reason)
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
                    {item.retake_reason ? <span className={`mt-3 line-clamp-2 block text-xs leading-5 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}><strong>Reason:</strong> {item.retake_reason}</span> : null}
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

      <RetakeAssessmentDialog open={confirmingRetake} onOpenChange={setConfirmingRetake} description="Your completed results will stay available in Assessment history. The new attempt starts with no answers and becomes your current assessment." onConfirm={startRetake} />
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

function CourseDirectionPanel({ course, generatedAt, wide = false, onOpen }: { course: StudentRecommendedCourse | null; generatedAt?: string; wide?: boolean; onOpen: () => void }) {
  const { cover } = getProgrammeImages(course?.id ?? '')
  return (
    <section data-print-recommendations aria-labelledby="course-direction-title" className={`h-full overflow-hidden rounded-xl bg-card shadow-sm xl:row-start-1 ${wide ? 'xl:col-span-12' : 'xl:col-span-7'}`}>
      {course ? (
        <div className="grid min-h-[17rem] sm:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="flex min-w-0 flex-col p-5 sm:p-6">
            <p className="flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary"><Target className="size-4" aria-hidden="true" />Your top course match</p>
            <h3 id="course-direction-title" className="mt-3 max-w-xl font-display text-2xl font-bold leading-tight tracking-[-0.03em] text-primary sm:text-[1.75rem]">{course.name}</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{course.summary}</p>

            <div className="mt-5 bg-secondary/55 p-3.5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recommended programme</p>
                  <p className="mt-1 text-sm font-bold text-primary">#{course.rank} <span aria-hidden="true">·</span> {course.code}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-2xl font-bold leading-none text-primary">{course.match}%</p>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground">Course match</p>
                </div>
              </div>
              <div
                role="progressbar"
                aria-label={`${course.name} course match`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={course.match}
                className="mt-3 h-1.5 overflow-hidden bg-background"
              >
                <div className="h-full bg-success" style={{ width: `${course.match}%` }} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
              {generatedAt ? <p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-3.5" aria-hidden="true" />Updated {formatAssessmentDate(generatedAt)}</p> : <span />}
              <Button data-print-hidden type="button" variant="link" onClick={onOpen} className="h-auto w-fit p-0 text-primary">
                View all matches <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="relative min-h-48 overflow-hidden bg-secondary sm:m-4 sm:ml-0" aria-hidden="true">
            {cover ? <img src={cover} alt="" className="absolute inset-0 size-full object-cover" /> : <BookOpenCheck className="absolute inset-0 m-auto size-20 text-primary/25" />}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent" />
          </div>
        </div>
      ) : (
        <div className="min-h-[15rem] p-5 sm:p-6">
          <p className="flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary"><Compass className="size-4" aria-hidden="true" />Course direction</p>
          <h3 id="course-direction-title" className="mt-2 font-display text-2xl font-semibold">Your strongest match will appear here</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Complete the interest assessment to generate course matches from the current TCC catalogue.</p>
        </div>
      )}
    </section>
  )
}

function GuidanceSupportPanel() {
  const discussionTopics = [
    'Your assessment result',
    'Programmes you are comparing',
    'Questions about your next step',
  ]

  return (
    <section data-guidance-support aria-labelledby="counselor-guidance-title" className="grid h-full overflow-hidden rounded-xl bg-card shadow-sm sm:grid-cols-[minmax(0,1.15fr)_minmax(9rem,0.85fr)] xl:col-span-5 xl:row-start-2">
      <div className="relative overflow-hidden p-5 sm:p-6">
        <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-28 w-[120%] rounded-[50%] bg-primary/15" />
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground"><MessageCircleMore aria-hidden="true" className="size-4" /></span>
          <p className="font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary">Need guidance?</p>
        </div>
        <h2 id="counselor-guidance-title" className="mt-5 max-w-52 font-display text-2xl font-bold leading-tight text-primary">Visit the Guidance Office</h2>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">Speak with the guidance staff at the school about your course choices or assessment result.</p>
        <div className="my-5 h-px bg-outline-variant/70" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Topics you can discuss</p>
          <ul className="mt-4 grid gap-3 text-xs text-muted-foreground">
            {discussionTopics.map((topic) => (
              <li key={topic} className="flex items-center gap-2"><span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15"><Check aria-hidden="true" className="size-3 text-primary" /></span><span>{topic}</span></li>
            ))}
          </ul>
        </div>
        <p className="relative mt-7 max-w-44 text-[10px] font-medium leading-4 text-foreground">No online appointment or request is needed.</p>
      </div>
      <div className="relative min-h-72 overflow-hidden bg-primary-fixed sm:min-h-full">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-white via-white/90 to-transparent px-4 pb-12 pt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
          <MapPin aria-hidden="true" className="size-4" />In-person support
        </div>
        <img src={guidanceOfficeImage} alt="" className="pointer-events-none absolute inset-0 size-full object-cover object-center" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/35 to-transparent" />
      </div>
    </section>
  )
}

function DashboardFrame({ children }: { children: ReactNode }) {
  return (
    <div className="student-grid-page student-dashboard-canvas">
    <div className="student-page pb-12 pt-4 sm:pt-6">
      {children}
    </div>
    </div>
  )
}

function AssessmentLifecycleCard({ lifecycle, hasCompletedResult, onOpenAssessment, onOpenResult, onOpenHistory, onRetryResult }: { lifecycle: AssessmentLifecycle; hasCompletedResult: boolean; onOpenAssessment: () => void; onOpenResult: () => void; onOpenHistory: () => void; onRetryResult: () => Promise<void> }) {
  const progress = Math.round(((lifecycle.answer_count ?? 0) / Math.max(1, lifecycle.question_count)) * 100)
  const isProgress = lifecycle.status === 'in_progress'
  const isPreparing = lifecycle.status === 'preparing_result'
  const isFailed = lifecycle.status === 'result_failed'
  const isAvailable = lifecycle.status === 'result_available'
  const isEmptyRetake = isProgress && hasCompletedResult && (lifecycle.answer_count ?? 0) === 0
  const heading = isEmptyRetake
    ? 'Your result is available'
    : isProgress && hasCompletedResult
      ? 'Retake in progress'
      : isProgress
        ? 'Continue your assessment'
        : isPreparing
          ? 'Finalizing your submission'
          : isFailed
            ? 'Result processing needs attention'
            : isAvailable
              ? 'Your result is available'
              : 'Start your interest assessment'
  const description = isEmptyRetake
    ? 'Your completed result remains available. A new retake has no saved answers, so it is not counted as assessment progress.'
    : isProgress
      ? `${lifecycle.answer_count ?? 0} of ${lifecycle.question_count} questions answered. Your saved session will resume automatically.`
      : isPreparing
        ? 'Your submitted answers are being processed. Your latest completed result remains visible beside this status.'
        : isFailed
          ? 'Your answers are safe, but result processing could not finish.'
          : isAvailable
            ? 'Review your profile and programme matches, or open your earlier attempts.'
            : `Answer ${lifecycle.question_count} interest questions to build your RIASEC profile.`
  return (
    <section data-print-hidden aria-labelledby="current-assessment-title" className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm xl:col-span-5 xl:row-start-1">
      <div className="p-5 sm:p-6">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{isPreparing ? <Clock3 className="size-5" /> : <ClipboardList className="size-5" />}</span>
        <p className="mt-3 font-label text-xs font-semibold uppercase tracking-[0.12em] text-primary">Your current assessment</p>
        <h2 id="current-assessment-title" className="mt-2 font-display text-2xl font-semibold">{heading}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        {isProgress && !isEmptyRetake ? <div className="mt-5 max-w-xl"><div className="flex justify-between text-sm font-bold"><span>{hasCompletedResult ? 'Retake progress' : 'Assessment progress'}</span><span>{progress}%</span></div><div role="progressbar" aria-label="Saved assessment progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div></div> : null}
      </div>
      <div className="mt-auto grid gap-2 p-5 pt-2 sm:p-6 sm:pt-2">
        {isFailed ? <Button type="button" onClick={() => void onRetryResult()}>Try processing again<ArrowRight /></Button> : !isPreparing ? <Button type="button" onClick={isAvailable || isEmptyRetake ? onOpenResult : onOpenAssessment}>{isEmptyRetake ? 'View latest result' : isProgress ? 'Resume assessment' : isAvailable ? 'View assessment result' : 'Start assessment'}<ArrowRight /></Button> : null}
        <Button type="button" variant="outline" onClick={onOpenHistory}><History aria-hidden="true" />Assessment history</Button>
      </div>
    </section>
  )
}

export { AssessmentHistorySummary, StudentDashboardPage }
