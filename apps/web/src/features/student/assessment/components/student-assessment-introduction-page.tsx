import {
  ClipboardList,
  FileClock,
  Info,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import {
  ConfirmActionDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { StudentAssessmentResultPage } from '@/features/student/assessment/components/student-assessment-result-page'
import { StudentAssessmentSessionPage } from '@/features/student/assessment/components/student-assessment-session-page'
import { StudentPageHeader } from '@/features/student/components/student-page-header'
import { mockAssessmentIntroduction } from '@/features/student/assessment/data/mock-assessment-introduction'

type AssessmentIntroductionLoadState =
  | 'ready'
  | 'loading'
  | 'error'
  | 'empty'
type AssessmentAvailability = 'active' | 'inactive'

interface StudentAssessmentIntroductionPageProps {
  onBack: () => void
  onOpenRecommendations?: () => void
  initialLoadState?: AssessmentIntroductionLoadState
  availability?: AssessmentAvailability
}

function StudentAssessmentIntroductionPage({
  onBack,
  onOpenRecommendations,
  initialLoadState = 'ready',
  availability = 'active',
}: StudentAssessmentIntroductionPageProps) {
  const [loadState, setLoadState] = useState(initialLoadState)
  const [noticeAccepted, setNoticeAccepted] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [sessionState, setSessionState] = useState<
    'introduction' | 'opening' | 'session' | 'result'
  >('introduction')
  const content = mockAssessmentIntroduction

  async function beginAssessment() {
    setSessionState('opening')
    await new Promise((resolve) => window.setTimeout(resolve, 300))
    setSessionState('session')
  }

  if (loadState === 'loading') {
    return (
      <LoadingState
        title="Loading assessment information"
        description="Preparing the introduction and availability for your account."
      />
    )
  }

  if (loadState === 'error') {
    return (
      <ErrorState
        title="We could not load the assessment"
        description="Check your connection, then try loading the introduction again."
        onRetry={() => setLoadState('ready')}
      />
    )
  }

  if (loadState === 'empty') {
    return (
      <EmptyState
        title="No assessment is assigned"
        description="An assessment introduction will appear here when one is available to your account."
        icon={ClipboardList}
        action={
          <Button type="button" variant="secondary" onClick={onBack}>
            Return to dashboard
          </Button>
        }
      />
    )
  }

  if (availability === 'inactive') {
    return (
      <div className="w-full">
        <StudentPageHeader
          title="Interest assessment"
          description="Review assessment availability and instructions."
          onBack={onBack}
          actions={<StatusBadge label="Unavailable" tone="neutral" />}
        />
        <EmptyState
          title="Assessment is not available"
          description="There is no active assessment version available to begin from this account."
          icon={LockKeyhole}
          className="mt-4"
          action={
            <Button type="button" variant="secondary" onClick={onBack}>
              Return to dashboard
            </Button>
          }
        />
      </div>
    )
  }

  if (sessionState === 'session') {
    return (
      <StudentAssessmentSessionPage
        onExit={onBack}
        onViewResult={() => setSessionState('result')}
        onReturnToIntroduction={() => {
          setNoticeAccepted(false)
          setSessionState('introduction')
        }}
      />
    )
  }

  if (sessionState === 'result') {
    return (
      <StudentAssessmentResultPage
        onBack={onBack}
        onOpenRecommendations={onOpenRecommendations}
      />
    )
  }

  return (
    <div className="w-full pb-24 sm:pb-8">
      <StudentPageHeader
        title="Interest assessment"
        description="Review what to expect and confirm that you are ready before opening a session."
        onBack={onBack}
        actions={<StatusBadge label={content.availability} tone="success" />}
      />

      <section
        aria-labelledby="assessment-introduction-title"
        className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-primary/10 p-5 shadow-sm sm:p-7"
      >
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-2xl"
        />
        <div className="relative max-w-3xl">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-primary">
            Before you begin
          </p>
          <h2
            id="assessment-introduction-title"
            className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl"
          >
            Take a quiet moment and answer based on your interests.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            There are no right or wrong interests. Read each prompt carefully
            and select the response that feels most accurate for you.
          </p>
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)]">
        <section
          aria-labelledby="assessment-expectations-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <ClipboardList aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2
                id="assessment-expectations-title"
                className="text-lg font-extrabold"
              >
                What to expect
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                A simple overview of the assessment experience.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {content.expectations.map((item) => (
              <div key={item.id} className="rounded-xl bg-secondary/60 p-4">
                <item.icon aria-hidden="true" className="size-5 text-primary" />
                <h3 className="mt-4 text-sm font-extrabold">{item.label}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-canvas-cream p-4">
            <Info
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-warning"
            />
            <div>
              <p className="text-sm font-extrabold">Take your time</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Use a stable connection and a comfortable device. On mobile,
                keep the screen in a readable orientation and avoid closing
                the page while a response is saving.
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section
            aria-labelledby="assessment-readiness-title"
            className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Version reference
                </p>
                <h2
                  id="assessment-readiness-title"
                  className="mt-1 text-lg font-extrabold"
                >
                  Ready to begin
                </h2>
              </div>
              <span className="rounded-lg bg-primary/8 px-2.5 py-1 text-xs font-extrabold text-primary">
                {content.versionReference}
              </span>
            </div>

            <ul className="mt-5 space-y-3">
              {content.readiness.map((item) => (
                <li key={item.id} className="rounded-xl bg-secondary/55 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <StatusBadge
                      label={item.status}
                      tone={item.tone}
                      className="shrink-0"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="assessment-notice-title"
            className="rounded-2xl bg-brand-dark p-5 text-white shadow-sm sm:p-6"
          >
            <ShieldCheck
              aria-hidden="true"
              className="size-5 text-brand-soft"
            />
            <h2 id="assessment-notice-title" className="mt-5 font-extrabold">
              Assessment notice
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/70">
              This interest assessment supports course guidance. It is not a
              diagnosis, admission decision, enrolment action, or guarantee.
            </p>

            <label className="mt-5 flex min-h-12 cursor-pointer items-start gap-3 rounded-xl bg-white/10 p-3 text-sm leading-6">
              <input
                type="checkbox"
                checked={noticeAccepted}
                onChange={(event) => setNoticeAccepted(event.target.checked)}
                className="mt-1 size-5 shrink-0 accent-primary"
              />
              <span>I have read and understood the assessment notice.</span>
            </label>

            <Button
              type="button"
              disabled={!noticeAccepted || sessionState === 'opening'}
              aria-busy={sessionState === 'opening'}
              onClick={() => setConfirmationOpen(true)}
              className="mt-4 min-h-12 w-full bg-white text-brand-dark shadow-none hover:bg-white/90"
            >
              {sessionState === 'opening' ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : (
                <FileClock aria-hidden="true" />
              )}
              {sessionState === 'opening'
                ? 'Opening session...'
                : 'Begin assessment'}
            </Button>
          </section>
        </aside>
      </div>

      <ConfirmActionDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        title="Begin the assessment?"
        description="A new assessment session will open using the version shown on this page. Review the notice before continuing."
        confirmLabel="Begin assessment"
        onConfirm={beginAssessment}
      />
    </div>
  )
}

export { StudentAssessmentIntroductionPage }
export type {
  AssessmentAvailability,
  AssessmentIntroductionLoadState,
}
