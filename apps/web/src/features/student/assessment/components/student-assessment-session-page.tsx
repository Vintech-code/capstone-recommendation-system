import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  CloudOff,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  Save,
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
import { AssessmentProgressPanel } from '@/features/student/assessment/components/assessment-progress-panel'
import { AssessmentQuestionCard } from '@/features/student/assessment/components/assessment-question-card'
import {
  mockAssessmentSession,
  type AssessmentResponseValue,
} from '@/features/student/assessment/data/mock-assessment-session'
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
}: StudentAssessmentSessionPageProps) {
  const [loadState, setLoadState] = useState(initialLoadState)
  const [connectionState, setConnectionState] = useState(
    initialConnectionState,
  )
  const [answers, setAnswers] = useState(readStoredAnswers)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [saveState, setSaveState] = useState<AssessmentSaveState>(
    initialConnectionState === 'offline' ? 'saved-locally' : 'saved',
  )
  const [view, setView] = useState<AssessmentView>('questions')
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const saveTimer = useRef<number | undefined>(undefined)
  const content = mockAssessmentSession
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

  function persistAnswers(
    nextAnswers: Record<string, AssessmentResponseValue>,
    locally = connectionState === 'offline',
  ) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextAnswers))
      setSaveState(locally ? 'saved-locally' : 'saved')
    } catch {
      setSaveState('unsaved')
    }
  }

  function answerQuestion(value: AssessmentResponseValue) {
    const nextAnswers = { ...answers, [question.id]: value }
    setAnswers(nextAnswers)
    setSaveState(connectionState === 'offline' ? 'saved-locally' : 'saving')
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(
      () => persistAnswers(nextAnswers),
      250,
    )
  }

  function saveAndExit() {
    window.clearTimeout(saveTimer.current)
    persistAnswers(answers)
    onExit()
  }

  async function submitAssessment() {
    setView('submitting')
    await new Promise((resolve) => window.setTimeout(resolve, 300))
    window.localStorage.removeItem(storageKey)
    setView('completed')
  }

  function retryConnection() {
    setConnectionState('online')
    persistAnswers(answers, false)
  }

  if (loadState === 'loading') {
    return (
      <LoadingState
        title="Loading your assessment session"
        description="Restoring your saved responses and current question."
      />
    )
  }

  if (loadState === 'error') {
    return (
      <ErrorState
        title="We could not load your session"
        description="Your saved responses were not changed. Try loading the session again."
        onRetry={() => setLoadState('ready')}
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

  return (
    <div className="w-full pb-24 sm:pb-8">
      <StudentPageHeader
        title={view === 'review' ? 'Review responses' : 'Assessment session'}
        description={
          view === 'review'
            ? 'Check every response before submitting your assessment.'
            : 'Answer each question at your own pace. Your progress is saved locally.'
        }
        onBack={onExit}
        actions={
          <StatusBadge label={saveStatus.label} tone={saveStatus.tone} />
        }
      />

      {connectionState === 'offline' ? (
        <Alert className="mt-4 border-warning/30 bg-warning/8">
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
        <AssessmentReview
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
      ) : (
        <div className="mt-4 grid items-start gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <AssessmentProgressPanel
            questionIds={content.questions.map((item) => item.id)}
            answers={answers}
            currentIndex={currentIndex}
            onSelectQuestion={setCurrentIndex}
          />

          <div className="min-w-0">
            <AssessmentQuestionCard
              question={question}
              questionNumber={currentIndex + 1}
              totalQuestions={content.questions.length}
              options={content.responseOptions}
              value={answers[question.id]}
              onChange={answerQuestion}
            />

            <div className="mt-4 flex flex-col-reverse gap-3 rounded-2xl bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((index) => index - 1)}
                className="min-h-12 sm:min-h-10"
              >
                <ArrowLeft aria-hidden="true" />
                Previous
              </Button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={saveAndExit}
                  className="min-h-12 sm:min-h-10"
                >
                  <Save aria-hidden="true" />
                  Save and exit
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (currentIndex === content.questions.length - 1) {
                      setView('review')
                      return
                    }
                    setCurrentIndex((index) => index + 1)
                  }}
                  className="min-h-12 sm:min-h-10"
                >
                  {currentIndex === content.questions.length - 1
                    ? 'Review responses'
                    : 'Next question'}
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
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
  answers,
  unansweredCount,
  isSubmitting,
  onEdit,
  onBack,
  onSubmit,
}: {
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
        mockAssessmentSession.responseOptions.map((option) => [
          option.value,
          option.label,
        ]),
      ),
    [],
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
        {mockAssessmentSession.questions.map((question, index) => {
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
          {isSubmitting ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <LockKeyhole aria-hidden="true" />
          )}
          {isSubmitting ? 'Submitting...' : 'Submit assessment'}
        </Button>
      </div>
    </section>
  )
}

function CompletedAssessmentState({
  versionReference,
  onExit,
  onViewResult,
}: {
  versionReference: string
  onExit: () => void
  onViewResult: () => void
}) {
  return (
    <div className="w-full">
      <StudentPageHeader
        title="Assessment submitted"
        description="Your completed assessment is locked."
        onBack={onExit}
        actions={<StatusBadge label="Submitted" tone="success" />}
      />
      <section
        aria-labelledby="assessment-complete-title"
        className="mt-4 rounded-2xl bg-background p-6 text-center shadow-sm sm:p-10"
      >
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success/10 text-success">
          <Check aria-hidden="true" className="size-6" />
        </span>
        <h2
          id="assessment-complete-title"
          className="mt-6 text-2xl font-extrabold tracking-[-0.04em]"
        >
          Responses submitted successfully
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Your responses are now read-only. Course guidance and assessment
          results will appear only when they are available to your account.
        </p>
        <dl className="mx-auto mt-6 grid max-w-xl gap-3 text-left sm:grid-cols-2">
          <div className="rounded-xl bg-secondary/55 p-4">
            <dt className="text-xs text-muted-foreground">Version reference</dt>
            <dd className="mt-1 text-sm font-extrabold">{versionReference}</dd>
          </div>
          <div className="rounded-xl bg-secondary/55 p-4">
            <dt className="text-xs text-muted-foreground">Response access</dt>
            <dd className="mt-1 text-sm font-extrabold">Locked</dd>
          </div>
        </dl>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={onExit}>
            Return to dashboard
          </Button>
          <Button type="button" onClick={onViewResult}>
            View assessment result
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </section>
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

export { StudentAssessmentSessionPage }
export type {
  AssessmentConnectionState,
  AssessmentSessionLoadState,
  AssessmentVersionState,
}
