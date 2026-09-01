import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Compass,
  ClipboardCheck,
  CloudOff,
  GraduationCap,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssessmentProgressPanel } from "@/features/student/assessment/components/assessment-progress-panel";
import { AssessmentQuestionCard } from "@/features/student/assessment/components/assessment-question-card";
import { AssessmentResultLoading } from "@/features/student/assessment/components/assessment-result-loading";
import { RetakeAssessmentDialog } from "@/features/student/assessment/components/retake-assessment-dialog";
import { formatAssessmentDate } from "@/features/student/assessment/assessment-result-mapper";
import type {
  AssessmentResponseValue,
  AssessmentSessionContent,
} from "@/features/student/assessment/assessment-types";
import {
  AssessmentApiError,
  declareEntranceExaminationResult,
  getAssessmentQuestions,
  getCurrentAssessment,
  getEntranceExaminationResult,
  retryAssessmentResult,
  saveAssessment,
  startAssessment,
  submitAssessmentSession,
  type AssessmentLifecycle,
  type EntranceExaminationState,
} from "@/features/student/assessment/assessment-api";
import { StudentPageHeader } from "@/features/student/components/student-page-header";

type AssessmentSessionLoadState = "ready" | "loading" | "error" | "empty";
type AssessmentVersionState = "current" | "stale";
type AssessmentConnectionState = "online" | "offline";
type AssessmentSaveState = "saved" | "saving" | "saved-locally" | "unsaved";
type AssessmentView = "questions" | "submitting" | "completed";

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

const storageKey = "tcc-guidance:student-assessment-session";

function readStoredAnswers(): Record<string, AssessmentResponseValue> {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored
      ? (JSON.parse(stored) as Record<string, AssessmentResponseValue>)
      : {};
  } catch {
    return {};
  }
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
  const [loadState, setLoadState] = useState<AssessmentSessionLoadState>(
    remotePersistence ? "loading" : initialContent ? initialLoadState : "empty",
  );
  const [connectionState, setConnectionState] = useState(
    initialConnectionState,
  );
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState(
    "Your saved responses were not changed. Try loading the session again.",
  );
  const [answers, setAnswers] = useState(readStoredAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saveState, setSaveState] = useState<AssessmentSaveState>(
    initialConnectionState === "offline" ? "saved-locally" : "saved",
  );
  const [view, setView] = useState<AssessmentView>("questions");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [completedAssessment, setCompletedAssessment] =
    useState<AssessmentLifecycle | null>(null);
  const [retakeError, setRetakeError] = useState<string | null>(null);
  const [entranceExamination, setEntranceExamination] =
    useState<EntranceExaminationState | null>(null);
  const [content, setContent] = useState<AssessmentSessionContent>(
    initialContent ?? {
      id: "",
      versionReference: "",
      questions: [],
      responseOptions: [],
    },
  );
  const saveTimer = useRef<number | undefined>(undefined);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const onViewMatchesRef = useRef(onViewMatches);
  const question = content.questions[currentIndex];
  const answeredCount = content.questions.filter(
    (item) => answers[item.id],
  ).length;

  useEffect(
    () => () => {
      window.clearTimeout(saveTimer.current);
    },
    [],
  );

  useEffect(() => {
    onViewMatchesRef.current = onViewMatches;
  }, [onViewMatches]);

  useEffect(() => {
    if (!remotePersistence) return;
    let active = true;

    async function loadSession() {
      try {
        const examination = await getEntranceExaminationResult();
        if (!active) return;
        setEntranceExamination(examination);
        if (examination.status === "required") {
          setLoadState("ready");
          return;
        }

        const [questions, current] = await Promise.all([
          getAssessmentQuestions(),
          getCurrentAssessment(),
        ]);
        if (current.status === "result_available") {
          if (active) {
            setCompletedAssessment(current);
            setLoadState("ready");
            if (onViewMatchesRef.current) {
              onViewMatchesRef.current();
            } else {
              setView("completed");
            }
          }
          return;
        }
        const session =
          current.status === "not_started" ? await startAssessment() : current;
        if (!active) return;
        if (
          !session.id ||
          questions.questions.length === 0 ||
          questions.answer_options.length === 0
        ) {
          setLoadState("empty");
          return;
        }

        setSessionId(session.id);
        setContent({
          id: session.reference ?? String(session.id),
          versionReference: questions.instrument.code,
          questions: questions.questions.map((question) => ({
            id: `item-${String(question.index).padStart(2, "0")}`,
            prompt: question.text,
          })),
          responseOptions: questions.answer_options.map((option) => ({
            value: option.value as AssessmentResponseValue,
            label: option.name,
            description: getResponseOptionDescription(option.name),
          })),
        });
        setAnswers(
          Object.fromEntries(
            Object.entries(session.answers ?? {}).map(([index, value]) => [
              `item-${String(index).padStart(2, "0")}`,
              value as AssessmentResponseValue,
            ]),
          ),
        );
        setCurrentIndex(Math.max(0, (session.current_question ?? 1) - 1));
        setLoadState("ready");
      } catch (error: unknown) {
        if (!active) return;
        setLoadError(
          error instanceof AssessmentApiError
            ? error.message
            : "Your saved responses were not changed. Try loading the session again.",
        );
        setLoadState("error");
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, [loadAttempt, remotePersistence]);

  async function persistAnswers(
    nextAnswers: Record<string, AssessmentResponseValue>,
    locally = connectionState === "offline",
    currentQuestion = currentIndex + 1,
  ) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextAnswers));
      if (locally || !remotePersistence || !sessionId) {
        setSaveState(locally ? "saved-locally" : "saved");
        return;
      }

      const serverAnswers = Object.fromEntries(
        Object.entries(nextAnswers).map(([id, value]) => [
          String(Number(id.replace("item-", ""))),
          value,
        ]),
      );
      const saveRequest = saveQueue.current
        .catch(() => undefined)
        .then(async () => {
          await saveAssessment(sessionId, serverAnswers, currentQuestion);
        });
      saveQueue.current = saveRequest.catch(() => undefined);
      await saveRequest;
      setSaveState("saved");
    } catch {
      setSaveState(remotePersistence ? "saved-locally" : "unsaved");
    }
  }

  function answerQuestion(value: AssessmentResponseValue) {
    const nextAnswers = { ...answers, [question.id]: value };
    setAnswers(nextAnswers);
    setSaveState(connectionState === "offline" ? "saved-locally" : "saving");
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(
      () => void persistAnswers(nextAnswers, undefined, currentIndex + 1),
      250,
    );
  }

  async function submitAssessment() {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = undefined;
    setSubmitError(null);
    setView("submitting");
    try {
      if (remotePersistence && sessionId) {
        await persistAnswers(answers);
        let submitted = await submitAssessmentSession(sessionId);
        if (submitted.status === "result_failed") {
          submitted = await retryAssessmentResult(sessionId);
        }
        if (submitted.status === "preparing_result") {
          submitted = await waitForAssessmentResult();
        }
        if (submitted.status !== "result_available") {
          setSubmitError(
            "Your answers were saved, but result processing is still unavailable. Try again shortly.",
          );
          setView("questions");
          return;
        }
        window.localStorage.removeItem(storageKey);
        setCompletedAssessment(submitted);
        if (onViewMatches) {
          onViewMatches();
        } else {
          setView("completed");
        }
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 300));
      window.localStorage.removeItem(storageKey);
      if (onViewMatches) {
        onViewMatches();
      } else {
        setView("completed");
      }
    } catch {
      setSubmitError(
        "Your assessment could not be submitted. Check your connection and try again.",
      );
      setView("questions");
    }
  }

  function retryConnection() {
    setConnectionState("online");
    void persistAnswers(answers, false);
  }

  function retrySessionLoad() {
    if (!remotePersistence && initialContent) {
      setLoadState("ready");
      return;
    }
    setLoadState("loading");
    setLoadAttempt((value) => value + 1);
  }

  async function beginRetake(reason?: string) {
    setRetakeError(null);
    try {
      await startAssessment(reason);
      setCompletedAssessment(null);
      setView("questions");
      setLoadState("loading");
      setLoadAttempt((value) => value + 1);
    } catch (error) {
      setRetakeError(
        error instanceof AssessmentApiError
          ? error.message
          : "The retake could not be started. Try again.",
      );
    }
  }

  async function declareEntranceResult(score: number) {
    const examination = await declareEntranceExaminationResult(score);
    setEntranceExamination(examination);
    setLoadState("loading");
    setLoadAttempt((value) => value + 1);
  }

  if (loadState === "loading") {
    return (
      <LoadingState
        variant="assessment"
        title="Loading your assessment session"
        description="Restoring your saved responses and current question."
      />
    );
  }

  if (loadState === "error") {
    return (
      <ErrorState
        title="We could not load your session"
        description={loadError}
        onRetry={retrySessionLoad}
      />
    );
  }

  if (loadState === "empty") {
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
    );
  }

  if (remotePersistence && entranceExamination?.status === "required") {
    return (
      <EntranceExaminationGate
        examination={entranceExamination}
        onBack={onExit}
        onDeclare={declareEntranceResult}
      />
    );
  }

  if (view === "submitting") {
    return <AssessmentResultLoading />;
  }

  if (view === "completed") {
    return (
      <CompletedAssessmentState
        lifecycle={completedAssessment}
        retakeError={retakeError}
        onExit={onExit}
        onViewResult={onViewResult}
        onViewMatches={onViewMatches}
        onStartRetake={beginRetake}
      />
    );
  }

  if (!question || content.responseOptions.length === 0) {
    return (
      <ErrorState
        title="The assessment questions are unavailable"
        description="No assessment question data was returned. Try loading the session again."
        onRetry={retrySessionLoad}
      />
    );
  }

  if (versionState === "stale") {
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
    );
  }

  const saveStatus = getSaveStatus(saveState);

  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-col">
      <h1 className="sr-only">Interest assessment</h1>

      {view === "questions" ? (
        <div className="student-page w-full max-w-4xl pt-6 sm:pt-8">
          <AssessmentProgressPanel
            answeredCount={answeredCount}
            currentQuestion={currentIndex + 1}
            totalQuestions={content.questions.length}
          />
        </div>
      ) : null}

      {connectionState === "offline" ? (
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

      {submitError ? (
        <Alert variant="destructive" className="student-page mt-6 max-w-4xl">
          <AlertTitle>Result unavailable</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="student-page flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6">
        <AssessmentQuestionCard
          question={question}
          questionNumber={currentIndex + 1}
          options={content.responseOptions}
          value={answers[question.id]}
          onChange={answerQuestion}
        />
      </div>

      {view === "questions" ? (
        <nav
          aria-label="Question navigation"
          className="mt-auto bg-secondary/80"
        >
          <div className="student-page flex w-full max-w-4xl items-center justify-between py-4">
            <Button
              type="button"
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => index - 1)}
              className="bg-card"
            >
              <ArrowLeft aria-hidden="true" />
              Previous
            </Button>

            <span className="sr-only" role="status">
              {saveStatus.label}
            </span>

            <Button
              type="button"
              disabled={!answers[question.id]}
              onClick={() => {
                if (currentIndex === content.questions.length - 1) {
                  void submitAssessment();
                  return;
                }
                setCurrentIndex((index) => index + 1);
              }}
            >
              {currentIndex === content.questions.length - 1
                ? "Finish assessment"
                : "Next"}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </nav>
      ) : null}
    </main>
  );
}

async function waitForAssessmentResult(): Promise<AssessmentLifecycle> {
  let lifecycle = await getCurrentAssessment(true);

  for (
    let attempt = 0;
    attempt < 20 && lifecycle.status === "preparing_result";
    attempt += 1
  ) {
    await new Promise((resolve) => window.setTimeout(resolve, 750));
    lifecycle = await getCurrentAssessment(true);
  }

  return lifecycle;
}

function EntranceExaminationGate({
  examination,
  onDeclare,
}: {
  examination: EntranceExaminationState;
  onBack: () => void;
  onDeclare: (score: number) => Promise<void>;
}) {
  const [score, setScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const numericScore = Number(score);
  const hasValidScore =
    score !== "" &&
    Number.isFinite(numericScore) &&
    numericScore >= examination.policy.minimum &&
    numericScore <= examination.policy.maximum &&
    Math.abs(numericScore - Math.round(numericScore * 10) / 10) < 0.00001;
  const group = hasValidScore
    ? numericScore <= examination.policy.boardRange.maximum
      ? "Board programmes"
      : "Non-board programmes"
    : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasValidScore) {
      setError("Enter a valid exam score from 1.0 to 5.0.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onDeclare(numericScore);
    } catch (caught) {
      setError(
        caught instanceof AssessmentApiError
          ? caught.message
          : "Your result could not be saved. Try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-4.5rem)] flex-col justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
      {/* CENTER CARD CONTAINER */}
      <div className="mx-auto my-auto flex w-full max-w-md flex-col items-center">
        {/* CENTER MAIN CARD */}
        <div className="w-full rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)] sm:p-8">
          {/* Top Circle Icon */}
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GraduationCap aria-hidden="true" className="size-6" />
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Entrance Exam Result
          </h1>

          {/* STEP 1 OF 2 · ONBOARDING Badge */}
          <p className="mt-1.5 font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Step 1 of 2 · Self-Declaration
          </p>

          {/* Instructions */}
          <p
            id="entrance-result-help"
            className="mt-3 text-sm leading-6 text-muted-foreground"
          >
            Enter your entrance examination grade (1.0 to 5.0). This determines
            your admission eligibility for board and non-board programmes.
          </p>

          {error ? (
            <Alert variant="destructive" className="mt-4 text-left">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {/* Form */}
          <form className="mt-6 text-left" onSubmit={submit} noValidate>
            <Label
              htmlFor="entrance-examination-score"
              className="text-xs font-bold text-foreground"
            >
              Entrance Exam Score
            </Label>
            <div className="relative mt-2">
              <BarChart3
                aria-hidden="true"
                className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary"
              />
              <Input
                id="entrance-examination-score"
                type="number"
                inputMode="decimal"
                min={examination.policy.minimum}
                max={examination.policy.maximum}
                step="0.1"
                value={score}
                onChange={(event) => {
                  setScore(event.target.value);
                  setError(null);
                }}
                aria-describedby="entrance-result-help entrance-result-preview"
                className="h-14 w-full rounded-2xl border border-input bg-background pl-12 pr-4 text-base font-medium text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10"
                placeholder="e.g. 2.5"
                required
              />
            </div>

            <div
              id="entrance-result-preview"
              className="mt-2.5 flex items-center justify-between text-xs text-slate-400"
              aria-live="polite"
            >
              <span>Allowed range: 1.0 – 5.0</span>
              {group ? (
                <span className="inline-flex items-center rounded-full bg-primary-fixed px-3 py-1 font-label text-xs font-semibold text-primary">
                  {group}
                </span>
              ) : null}
            </div>

            <Button
              type="submit"
              className="mt-6 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-brand-dark"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? "Saving score..." : "Continue to Assessment"}
              {!submitting ? (
                <ArrowRight aria-hidden="true" className="size-5" />
              ) : null}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CompletedAssessmentState({
  lifecycle,
  retakeError,
  onExit,
  onViewResult,
  onViewMatches,
  onStartRetake,
}: {
  lifecycle: AssessmentLifecycle | null;
  retakeError: string | null;
  onExit: () => void;
  onViewResult: () => void;
  onViewMatches?: () => void;
  onStartRetake: (reason?: string) => Promise<void>;
}) {
  const [retakeDialogOpen, setRetakeDialogOpen] = useState(false);
  const completedDate =
    lifecycle?.result_available_at ?? lifecycle?.submitted_at;

  return (
    <div className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-secondary/35 pb-14 pt-6 sm:pb-20 sm:pt-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-48 -z-10 size-[34rem] rounded-full bg-primary-fixed/55 blur-3xl"
      />
      <div className="student-page">
        <StudentPageHeader
          title="Assessment complete"
          description={
            completedDate
              ? `Completed ${formatAssessmentDate(completedDate)}. Your recorded answers are read-only.`
              : "Your responses have been submitted."
          }
          onBack={onExit}
          actions={<StatusBadge label="Completed" tone="success" />}
        />

        <section
          aria-labelledby="assessment-complete-title"
          className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]"
        >
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <span className="flex size-11 items-center justify-center rounded bg-success/15 text-success">
              <Check aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-5 font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Assessment complete
            </p>
            <h2
              id="assessment-complete-title"
              className="mt-2 max-w-2xl font-display text-3xl font-bold tracking-[-0.04em] text-primary sm:text-4xl"
            >
              Responses submitted successfully
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {completedDate
                ? `Completed ${formatAssessmentDate(completedDate)}. Your recorded answers are read-only.`
                : "Your recorded answers are read-only."}
            </p>

            {retakeError ? (
              <Alert variant="destructive" className="mt-5">
                <AlertTitle>Retake could not be started</AlertTitle>
                <AlertDescription>{retakeError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-2">
              <Button type="button" onClick={onViewResult}>
                View assessment result <ArrowRight aria-hidden="true" />
              </Button>
              {onViewMatches ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onViewMatches}
                >
                  View course matches <Compass aria-hidden="true" />
                </Button>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Button
                type="button"
                variant="link"
                onClick={onExit}
                className="h-auto p-0"
              >
                Return to dashboard
              </Button>
              {lifecycle?.can_retake ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setRetakeDialogOpen(true)}
                  className="h-auto p-0"
                >
                  <RotateCcw aria-hidden="true" /> Retake assessment
                </Button>
              ) : lifecycle?.retake_available_at ? (
                <p className="text-xs text-muted-foreground">
                  Retake available{" "}
                  {formatAssessmentDate(lifecycle.retake_available_at)}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
      <RetakeAssessmentDialog
        open={retakeDialogOpen}
        onOpenChange={setRetakeDialogOpen}
        description="Your completed result will remain available in Assessment history. The new attempt starts with no answers and becomes your current assessment."
        onConfirm={onStartRetake}
      />
    </div>
  );
}

function getSaveStatus(saveState: AssessmentSaveState) {
  if (saveState === "saving") {
    return { label: "Saving...", tone: "info" as const };
  }
  if (saveState === "saved-locally") {
    return { label: "Saved on device", tone: "warning" as const };
  }
  if (saveState === "unsaved") {
    return { label: "Not saved", tone: "danger" as const };
  }
  return { label: "Saved", tone: "success" as const };
}

function getResponseOptionDescription(label: string) {
  const normalized = label.toLowerCase();
  if (normalized === "strongly like")
    return "I would really enjoy doing this activity.";
  if (normalized === "like") return "I would enjoy doing this activity.";
  if (normalized === "unsure")
    return "I am not sure how I feel about this activity.";
  if (normalized === "dislike") return "I would not enjoy doing this activity.";
  if (normalized === "strongly dislike")
    return "I would strongly dislike doing this activity.";
  return "";
}

export { StudentAssessmentSessionPage };
export type {
  AssessmentConnectionState,
  AssessmentSessionLoadState,
  AssessmentVersionState,
};
