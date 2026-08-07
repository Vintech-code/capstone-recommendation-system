import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  ClipboardCheck,
  CloudOff,
  LockKeyhole,
  RotateCcw,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  ConfirmActionDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@/components/shared'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import assessmentLearningVisual from '@/assets/assessment-learning-visual.jpg'
import { AssessmentProgressPanel } from '@/features/student/assessment/components/assessment-progress-panel'
import { AssessmentQuestionCard } from '@/features/student/assessment/components/assessment-question-card'
import type {
  AssessmentResponseValue,
  AssessmentSessionContent,
} from '@/features/student/assessment/assessment-types'
import {
  AssessmentApiError,
  getAssessmentQuestions,
  getCurrentAssessment,
  saveAssessment,
  startAssessment,
  submitAssessmentSession,
} from '@/features/student/assessment/assessment-api'
import { StudentPageHeader } from '@/features/student/components/student-page-header'

type AssessmentSessionLoadState = 'ready' | 'loading' | 'error' | 'empty'
type AssessmentVersionState = 'current' | 'stale'
type AssessmentConnectionState = 'online' | 'offline'
type AssessmentSaveState = 'saved' | 'saving' | 'saved-locally' | 'unsaved'
type AssessmentView = 'questions' | 'review' | 'submitting' | 'completed'

interface StudentAssessmentSessionPageProps {
  onExit: () => void
  onReturnToIntroduction: () => void
  onViewResult: () => void
  initialLoadState?: AssessmentSessionLoadState
  initialConnectionState?: AssessmentConnectionState
  versionState?: AssessmentVersionState
  remotePersistence?: boolean
  initialContent?: AssessmentSessionContent
}

const storageKey = 'tcc-guidance:student-assessment-session'

function readStoredAnswers(): Record<string, AssessmentResponseValue> {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored
      ? (JSON.parse(stored) as Record<string, AssessmentResponseValue>)
      : {}
  } catch {
    return {}
  }
}

function StudentAssessmentSessionPage({
  onExit,
  onReturnToIntroduction,
  onViewResult,
  initialLoadState = 'ready',
  initialConnectionState = 'online',
  versionState = 'current',
  remotePersistence = false,
  initialContent,
}: StudentAssessmentSessionPageProps) {
  const [loadState, setLoadState] = useState<AssessmentSessionLoadState>(
    remotePersistence ? 'loading' : initialContent ? initialLoadState : 'empty',
  )
  const [connectionState, setConnectionState] = useState(
    initialConnectionState,
  )
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [loadError, setLoadError] = useState(
    'Your saved responses were not changed. Try loading the session again.',
  )
  const [answers, setAnswers] = useState(readStoredAnswers)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [saveState, setSaveState] = useState<AssessmentSaveState>(
    initialConnectionState === 'offline' ? 'saved-locally' : 'saved',
  )
  const [view, setView] = useState<AssessmentView>('questions')
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [content, setContent] = useState<AssessmentSessionContent>(
    initialContent ?? { id: '', versionReference: '', questions: [], responseOptions: [] },
  )
  const saveTimer = useRef<number | undefined>(undefined)
  const question = content.questions[currentIndex]
  const answeredCount = content.questions.filter(
    (item) => answers[item.id],
  ).length
  const unansweredCount = content.questions.length - answeredCount

  useEffect(
    () => () => {
      window.clearTimeout(saveTimer.current)
    },
    [],
  )

  useEffect(() => {
    if (!remotePersistence) return
    let active = true

    Promise.all([getAssessmentQuestions(), getCurrentAssessment()])
      .then(async ([questions, current]) => {
        const session =
          current.status === 'not_started' || current.status === 'result_available'
            ? await startAssessment()
            : current
        if (!active) return
        if (
          !session.id ||
          questions.questions.length === 0 ||
          questions.answer_options.length === 0
        ) {
          setLoadState('empty')
          return
        }

        setSessionId(session.id)
        setContent({
          id: session.reference ?? String(session.id),
          versionReference: questions.instrument.code,
          questions: questions.questions.map((question) => ({
            id: `item-${String(question.index).padStart(2, '0')}`,
            prompt: question.text,
          })),
          responseOptions: questions.answer_options.map((option) => ({
            value: option.value as AssessmentResponseValue,
            label: option.name,
            description: getResponseOptionDescription(option.name),
          })),
        })
        setAnswers(
          Object.fromEntries(
            Object.entries(session.answers ?? {}).map(([index, value]) => [
              `item-${String(index).padStart(2, '0')}`,
              value as AssessmentResponseValue,
            ]),
          ),
        )
        setCurrentIndex(Math.max(0, (session.current_question ?? 1) - 1))
        setLoadState('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        setLoadError(
          error instanceof AssessmentApiError
            ? error.message
            : 'Your saved responses were not changed. Try loading the session again.',
        )
        setLoadState('error')
      })

    return () => {
      active = false
    }
  }, [loadAttempt, remotePersistence])

  async function persistAnswers(
    nextAnswers: Record<string, AssessmentResponseValue>,
    locally = connectionState === 'offline',
    currentQuestion = currentIndex + 1,
  ) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextAnswers))
      if (locally || !remotePersistence || !sessionId) {
        setSaveState(locally ? 'saved-locally' : 'saved')
        return
      }

      const serverAnswers = Object.fromEntries(
        Object.entries(nextAnswers).map(([id, value]) => [
          String(Number(id.replace('item-', ''))),
          value,
        ]),
      )
      await saveAssessment(sessionId, serverAnswers, currentQuestion)
      setSaveState('saved')
    } catch {
      setSaveState(remotePersistence ? 'saved-locally' : 'unsaved')
    }
  }

  function answerQuestion(value: AssessmentResponseValue) {
    const nextAnswers = { ...answers, [question.id]: value }
    const isLastQuestion = currentIndex === content.questions.length - 1
    const nextIndex = Math.min(currentIndex + 1, content.questions.length - 1)
    setAnswers(nextAnswers)
    setSaveState(connectionState === 'offline' ? 'saved-locally' : 'saving')
    if (isLastQuestion) {
      setView('review')
    } else {
      setCurrentIndex(nextIndex)
    }
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(
      () => void persistAnswers(nextAnswers, undefined, nextIndex + 1),
      250,
    )
  }

  async function submitAssessment() {
    setView('submitting')
    if (remotePersistence && sessionId) {
      await persistAnswers(answers)
      await submitAssessmentSession(sessionId)
    } else {
      await new Promise((resolve) => window.setTimeout(resolve, 300))
    }
    window.localStorage.removeItem(storageKey)
    setView('completed')
  }

  function retryConnection() {
    setConnectionState('online')
    void persistAnswers(answers, false)
  }

  function retrySessionLoad() {
    if (!remotePersistence && initialContent) {
      setLoadState('ready')
      return
    }
    setLoadState('loading')
    setLoadAttempt((value) => value + 1)
  }

  if (loadState === 'loading') {
    return (
      <LoadingState
        variant="assessment"
        title="Loading your assessment session"
        description="Restoring your saved responses and current question."
      />
    )
  }

  if (loadState === 'error') {
    return (
      <ErrorState
        title="We could not load your session"
        description={loadError}
        onRetry={retrySessionLoad}
      />
    )
  }

  if (loadState === 'empty') {
    return (
      <EmptyState
        title="No assessment session was found"
        description="Return to the introduction to check whether an assessment can be started."
        icon={ClipboardCheck}
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={onReturnToIntroduction}
          >
            Return to introduction
          </Button>
        }
      />
    )
  }

  if (!question || content.responseOptions.length === 0) {
    return (
      <ErrorState
        title="The assessment questions are unavailable"
        description="No assessment question data was returned. Try loading the session again."
        onRetry={retrySessionLoad}
      />
    )
  }

  if (versionState === 'stale') {
    return (
      <div className="w-full">
        <StudentPageHeader
          title="Assessment session"
          description="Review the assessment version before continuing."
          onBack={onExit}
          actions={<StatusBadge label="Version changed" tone="warning" />}
        />
        <ErrorState
          className="mt-4"
          title="This session needs to be refreshed"
          description="The assessment version available to your account changed before submission. Your saved responses remain on this device."
          retryLabel="Return to introduction"
          onRetry={onReturnToIntroduction}
        />
      </div>
    )
  }

  if (view === 'completed') {
    return (
      <CompletedAssessmentState
        versionReference={content.versionReference}
        onExit={onExit}
        onViewResult={onViewResult}
      />
    )
  }

  const saveStatus = getSaveStatus(saveState)
  const completionPercent = content.questions.length
    ? Math.round((answeredCount / content.questions.length) * 100)
    : 0

  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden pb-24 pt-8 sm:pb-12 sm:pt-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-52 -top-64 -z-10 size-[42rem] rounded-full bg-primary-fixed/55 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-52 top-[42rem] -z-10 size-[32rem] rounded-full bg-secondary-container/15 blur-3xl" />
      <header className="student-page grid gap-7 md:grid-cols-[minmax(0,1fr)_13rem] md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded bg-primary-fixed px-3 py-1.5 font-label text-xs font-medium uppercase tracking-[0.14em] text-primary">
            <span aria-hidden="true" className="size-2 rounded-full bg-secondary-container" />
            Career compass module
          </p>
          <h1
            aria-label={view === 'review' ? 'Review responses' : 'Assessment session'}
            className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl"
          >
            {view === 'review' ? 'Review your responses' : 'Discover your path'}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            {view === 'review'
              ? 'Check every response before submitting your assessment.'
              : "Let's find the TCC programme that aligns with your interests and future goals."}
          </p>
        </div>

        <div className="rounded-lg bg-card p-5 shadow-sm" aria-label={`${completionPercent}% assessment completion`}>
          <div className="flex items-center justify-between gap-3">
            <strong className="font-display text-3xl font-semibold text-primary">{completionPercent}%</strong>
            <span className="flex size-11 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <Compass aria-hidden="true" className="size-5" />
            </span>
          </div>
          <p className="mt-3 font-label text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Question {currentIndex + 1} of {content.questions.length}
          </p>
          <span className="sr-only" role="status">{saveStatus.label}</span>
        </div>
      </header>

      {view === 'questions' ? (
        <div className="student-page mt-8">
          <AssessmentProgressPanel
            questionIds={content.questions.map((item) => item.id)}
            answers={answers}
          />
        </div>
      ) : null}

      {connectionState === 'offline' ? (
        <Alert className="student-page mt-6 border-warning/30 bg-warning/8">
          <CloudOff aria-hidden="true" className="text-warning" />
          <AlertTitle>You are working offline</AlertTitle>
          <AlertDescription>
            <p>
              Responses remain on this device. Reconnect before final
              submission.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 bg-background"
              onClick={retryConnection}
            >
              <RotateCcw aria-hidden="true" />
              Retry connection
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {view === 'review' || view === 'submitting' ? (
        <div className="student-page">
          <AssessmentReview
            content={content}
            answers={answers}
            unansweredCount={unansweredCount}
            isSubmitting={view === 'submitting'}
            onEdit={(index) => {
              setCurrentIndex(index)
              setView('questions')
            }}
            onBack={() => setView('questions')}
            onSubmit={() => setSubmitDialogOpen(true)}
          />
        </div>
      ) : (
        <div className="student-page mt-8">
          <div className="grid min-w-0 gap-6 lg:grid-cols-12 lg:items-stretch">
            <aside className="relative hidden min-h-[39rem] overflow-hidden rounded-lg bg-primary text-white shadow-[0_12px_36px_var(--shadow-primary)] lg:col-span-5 lg:block">
              <img
                src={assessmentLearningVisual}
                alt="Student studying with a tablet in a library"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary via-primary/5 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 rounded-lg bg-primary/75 p-6 backdrop-blur-md">
                <h2 className="font-display text-xl font-semibold">Answer naturally</h2>
                <p className="mt-3 text-sm leading-6 text-white/85">
                  Think about the activities you genuinely enjoy. There are no right or wrong answers.
                </p>
              </div>
            </aside>
            <div className="flex min-w-0 flex-col lg:col-span-7">
              <AssessmentQuestionCard
                question={question}
                questionNumber={currentIndex + 1}
                totalQuestions={content.questions.length}
                options={content.responseOptions}
                value={answers[question.id]}
                onChange={answerQuestion}
              />

              <div className="flex flex-row items-center justify-between gap-2 rounded-b-lg bg-muted p-3 sm:gap-3 sm:px-6 sm:py-4">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((index) => index - 1)}
                  className="min-h-11 min-w-0 px-2 text-sm sm:min-h-10 sm:px-4"
                >
                  <ArrowLeft aria-hidden="true" />
                  Previous
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (currentIndex === content.questions.length - 1) {
                      setView('review')
                      return
                    }
                    setCurrentIndex((index) => index + 1)
                  }}
                  className="min-h-11 min-w-0 px-2 text-sm sm:min-h-10 sm:px-4"
                >
                  {currentIndex === content.questions.length - 1
                    ? 'Review responses'
                    : 'Skip question'}
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
              <aside aria-label="Response guidance">
                <p className="mt-5 text-center text-sm leading-6 text-muted-foreground">
                  Choose the response that best reflects how you feel about this activity.
                </p>
              </aside>
            </div>
          </div>
        </div>
      )}

      <ConfirmActionDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        title="Submit this assessment?"
        description="After submission, responses are locked and cannot be changed from this screen."
        confirmLabel="Submit assessment"
        onConfirm={submitAssessment}
      />
    </div>
  )
}

function AssessmentReview({
  content,
  answers,
  unansweredCount,
  isSubmitting,
  onEdit,
  onBack,
  onSubmit,
}: {
  content: AssessmentSessionContent
  answers: Record<string, AssessmentResponseValue>
  unansweredCount: number
  isSubmitting: boolean
  onEdit: (index: number) => void
  onBack: () => void
  onSubmit: () => void
}) {
  const responseLabels = useMemo(
    () =>
      Object.fromEntries(
        content.responseOptions.map((option) => [
          option.value,
          option.label,
        ]),
      ),
    [content.responseOptions],
  )

  return (
    <section
      aria-labelledby="review-responses-title"
      className="mt-4 rounded-2xl bg-background p-5 shadow-sm sm:p-7"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
            Final review
          </p>
          <h2
            id="review-responses-title"
            className="mt-2 text-xl font-extrabold tracking-[-0.03em]"
          >
            {unansweredCount === 0
              ? 'All questions are answered'
              : `${unansweredCount} ${
                  unansweredCount === 1 ? 'question needs' : 'questions need'
                } a response`}
          </h2>
        </div>
        <StatusBadge
          label={unansweredCount === 0 ? 'Ready to submit' : 'Incomplete'}
          tone={unansweredCount === 0 ? 'success' : 'warning'}
        />
      </div>

      <ol className="mt-6 space-y-3">
        {content.questions.map((question, index) => {
          const answer = answers[question.id]

          return (
            <li
              key={question.id}
              className="rounded-xl bg-secondary/45 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-muted-foreground">
                  Question {index + 1}
                </p>
                <p className="mt-1 text-sm font-bold leading-6">
                  {question.prompt}
                </p>
                <p
                  className={`mt-2 text-xs font-extrabold ${
                    answer ? 'text-success' : 'text-warning'
                  }`}
                >
                  {answer ? responseLabels[answer] : 'No response'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(index)}
                className="mt-3 min-h-11 w-full sm:mt-0 sm:w-auto"
              >
                Edit response
              </Button>
            </li>
          )
        })}
      </ol>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isSubmitting}
          className="min-h-12 sm:min-h-10"
        >
          <ArrowLeft aria-hidden="true" />
          Back to questions
        </Button>
        <Button
          type="button"
          disabled={unansweredCount > 0 || isSubmitting}
          aria-busy={isSubmitting}
          onClick={onSubmit}
          className="min-h-12 sm:min-h-10"
        >
          {!isSubmitting ? (
            <LockKeyhole aria-hidden="true" />
          ) : null}
          {isSubmitting ? 'Submitting...' : 'Submit assessment'}
        </Button>
      </div>
    </section>
  )
}

function CompletedAssessmentState({
  onExit,
  onViewResult,
}: {
  versionReference: string
  onExit: () => void
  onViewResult: () => void
}) {
  return (
    <div className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-secondary/35 pb-14 pt-6 sm:pb-20 sm:pt-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-48 -z-10 size-[34rem] rounded-full bg-primary-fixed/55 blur-3xl" />
      <div className="student-page">
        <StudentPageHeader
          title="Assessment complete"
          description="Your responses have been submitted."
          onBack={onExit}
          actions={<StatusBadge label="Submitted" tone="success" />}
        />

        <section
          aria-labelledby="assessment-complete-title"
          className="mt-6 grid overflow-hidden rounded-lg bg-card shadow-sm lg:grid-cols-[1.08fr_0.92fr]"
        >
          <div className="relative overflow-hidden bg-brand-dark p-7 text-white sm:p-10 lg:p-12">
            <div aria-hidden="true" className="absolute -right-20 -top-24 size-56 rounded-full bg-primary/25 blur-3xl" />
            <div className="relative max-w-xl">
              <span className="flex size-12 items-center justify-center rounded bg-success text-success-foreground">
                <Check aria-hidden="true" className="size-6" />
              </span>
              <p className="mt-7 font-label text-xs font-semibold uppercase tracking-[0.14em] text-brand-soft">
                Submission received
              </p>
              <h2
                id="assessment-complete-title"
                className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
              >
                Responses submitted successfully
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                Your answers are safely recorded and cannot be edited. Your
                interest profile will appear as soon as processing is complete.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
            <div>
              <p className="font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                What happens next
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold">
                Review your guidance
              </h3>
              <ul className="mt-6 space-y-3" aria-label="Assessment next steps">
                <li className="flex items-center gap-3 rounded bg-secondary/65 p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded bg-success/15 text-success">
                    <Check aria-hidden="true" className="size-4" />
                  </span>
                  <span>
                    <strong className="block text-sm">Responses recorded</strong>
                    <span className="mt-0.5 block text-xs text-muted-foreground">Your assessment is complete.</span>
                  </span>
                </li>
                <li className="flex items-center gap-3 rounded bg-secondary/65 p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded bg-primary-fixed text-primary">
                    <ClipboardCheck aria-hidden="true" className="size-4" />
                  </span>
                  <span>
                    <strong className="block text-sm">Result processing</strong>
                    <span className="mt-0.5 block text-xs text-muted-foreground">Open your result when it becomes available.</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Button type="button" variant="outline" onClick={onExit}>
                Return to dashboard
              </Button>
              <Button type="button" onClick={onViewResult}>
                View assessment result
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function getSaveStatus(saveState: AssessmentSaveState) {
  if (saveState === 'saving') {
    return { label: 'Saving...', tone: 'info' as const }
  }
  if (saveState === 'saved-locally') {
    return { label: 'Saved on device', tone: 'warning' as const }
  }
  if (saveState === 'unsaved') {
    return { label: 'Not saved', tone: 'danger' as const }
  }
  return { label: 'Saved', tone: 'success' as const }
}

function getResponseOptionDescription(label: string) {
  const normalized = label.toLowerCase()
  if (normalized === 'strongly like') return 'I would really enjoy doing this activity.'
  if (normalized === 'like') return 'I would enjoy doing this activity.'
  if (normalized === 'unsure') return 'I am not sure how I feel about this activity.'
  if (normalized === 'dislike') return 'I would not enjoy doing this activity.'
  if (normalized === 'strongly dislike') return 'I would strongly dislike doing this activity.'
  return ''
}

export { StudentAssessmentSessionPage }
export type {
  AssessmentConnectionState,
  AssessmentSessionLoadState,
  AssessmentVersionState,
}
