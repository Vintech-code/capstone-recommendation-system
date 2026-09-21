import { ArrowLeft, ArrowRight, ClipboardCheck, CloudOff, RotateCcw } from "lucide-react";

import { EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type {
  AssessmentConnectionState,
  AssessmentSessionLoadState,
  AssessmentVersionState,
} from "@/features/student/assessment/assessment-session-types";
import { AssessmentProgressPanel } from "@/features/student/assessment/components/assessment-progress-panel";
import { AssessmentQuestionCard } from "@/features/student/assessment/components/assessment-question-card";
import { AssessmentResultLoading } from "@/features/student/assessment/components/assessment-result-loading";
import { CompletedAssessmentState } from "@/features/student/assessment/components/completed-assessment-state";
import { EntranceExaminationGate } from "@/features/student/assessment/components/entrance-examination-gate";
import { useAssessmentSession } from "@/features/student/assessment/hooks/use-assessment-session";
import type { AssessmentSessionContent } from "@/features/student/assessment/assessment-types";
import { getSaveStatus } from "@/features/student/assessment/utils/assessment-session-utils";
import { StudentPageHeader } from "@/features/student/components/student-page-header";

interface StudentAssessmentSessionPageProps {
  onExit: () => void;
  onReturnToIntroduction: () => void;
  onViewResult: () => void;
  onViewMatches?: () => void;
  initialLoadState?: AssessmentSessionLoadState;
  initialConnectionState?: AssessmentConnectionState;
  versionState?: AssessmentVersionState;
  remotePersistence?: boolean;
  initialContent?: AssessmentSessionContent;
}

function StudentAssessmentSessionPage({
  onExit,
  onReturnToIntroduction,
  onViewResult,
  onViewMatches,
  initialLoadState = "ready",
  initialConnectionState = "online",
  versionState = "current",
  remotePersistence = false,
  initialContent,
}: StudentAssessmentSessionPageProps) {
  const session = useAssessmentSession({
    initialConnectionState,
    initialContent,
    initialLoadState,
    onViewMatches,
    remotePersistence,
  });

  if (session.loadState === "loading") {
    return <LoadingState variant="assessment" title="Loading your assessment session" description="Restoring your saved responses and current question." />;
  }
  if (session.loadState === "error") {
    return <ErrorState title="We could not load your session" description={session.loadError} onRetry={session.retrySessionLoad} />;
  }
  if (session.loadState === "empty") {
    return (
      <EmptyState
        title="No assessment session was found"
        description="Return to the introduction to check whether an assessment can be started."
        icon={ClipboardCheck}
        action={<Button type="button" variant="secondary" onClick={onReturnToIntroduction}>Return to introduction</Button>}
      />
    );
  }
  if (remotePersistence && session.entranceExamination?.status === "required") {
    return <EntranceExaminationGate examination={session.entranceExamination} onDeclare={session.declareEntranceResult} />;
  }
  if (session.view === "submitting") return <AssessmentResultLoading />;
  if (session.view === "completed") {
    return (
      <CompletedAssessmentState
        lifecycle={session.completedAssessment}
        retakeError={session.retakeError}
        onExit={onExit}
        onViewResult={onViewResult}
        onViewMatches={onViewMatches}
        onStartRetake={session.beginRetake}
      />
    );
  }
  if (!session.question || session.content.responseOptions.length === 0) {
    return <ErrorState title="The assessment questions are unavailable" description="No assessment question data was returned. Try loading the session again." onRetry={session.retrySessionLoad} />;
  }
  if (versionState === "stale") {
    return (
      <div className="w-full">
        <StudentPageHeader title="Assessment session" description="Review the assessment version before continuing." onBack={onExit} actions={<StatusBadge label="Version changed" tone="warning" />} />
        <ErrorState className="mt-4" title="This session needs to be refreshed" description="The assessment version available to your account changed before submission. Your saved responses remain on this device." retryLabel="Return to introduction" onRetry={onReturnToIntroduction} />
      </div>
    );
  }

  const saveStatus = getSaveStatus(session.saveState);
  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-col bg-background">
      <h1 className="sr-only">Interest assessment</h1>
      <div className="sticky top-0 z-20 border-b border-border/70 bg-background sm:top-[4.5rem]">
        <div className="student-page w-full max-w-4xl px-4 sm:px-6">
          <AssessmentProgressPanel answeredCount={session.answeredCount} currentQuestion={session.currentIndex + 1} totalQuestions={session.content.questions.length} />
        </div>
      </div>

      {session.connectionState === "offline" ? (
        <Alert className="student-page mt-6 border-warning/30 bg-white">
          <CloudOff aria-hidden="true" className="text-warning-ink" />
          <AlertTitle>You are working offline</AlertTitle>
          <AlertDescription>
            <p>Responses remain on this device. Reconnect before final submission.</p>
            <Button type="button" variant="outline" size="sm" className="mt-2 bg-white" onClick={session.retryConnection}>
              <RotateCcw aria-hidden="true" /> Retry connection
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      {session.submitError ? (
        <Alert variant="destructive" className="student-page mt-6 max-w-4xl">
          <AlertTitle>Result unavailable</AlertTitle>
          <AlertDescription>{session.submitError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="student-page flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6">
        <AssessmentQuestionCard
          question={session.question}
          questionNumber={session.currentIndex + 1}
          options={session.content.responseOptions}
          value={session.answers[session.question.id]}
          onChange={session.answerQuestion}
        />
      </div>

      <nav aria-label="Question navigation" className="sticky bottom-0 z-20 mt-auto border-t border-border/70 bg-background">
        <div className="student-page flex w-full max-w-4xl items-center justify-between py-3">
          <Button type="button" variant="clay" disabled={session.currentIndex === 0} onClick={() => session.setCurrentIndex((index) => index - 1)} className="px-5 font-semibold text-foreground">
            <ArrowLeft aria-hidden="true" /> Previous
          </Button>
          <span className="sr-only" role="status">{saveStatus.label}</span>
          {session.currentIndex < session.content.questions.length - 1 && session.answers[session.question.id] ? (
            <Button type="button" variant="clay" onClick={() => session.setCurrentIndex((index) => index + 1)} className="px-6 font-bold text-primary-ink">
              Next <ArrowRight aria-hidden="true" />
            </Button>
          ) : session.currentIndex === session.content.questions.length - 1 ? (
            <Button type="button" variant="clay" disabled={!session.answers[session.question.id]} onClick={() => void session.submitAssessment()} className="px-6 font-bold text-primary-ink">
              Finish assessment <ArrowRight aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </nav>
    </main>
  );
}

export { StudentAssessmentSessionPage };
export type { AssessmentConnectionState, AssessmentSessionLoadState, AssessmentVersionState };
