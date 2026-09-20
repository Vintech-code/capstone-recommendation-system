import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  History,
  RotateCcw,
} from "lucide-react";

import { ErrorState, LoadingState } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAssessmentResultCard,
  retryAssessmentResult,
  type AssessmentHistoryResponse,
  type AssessmentLifecycle,
  type ResultCardData,
} from "@/features/student/assessment/assessment-api";
import { StudentResultCard } from "@/features/student/assessment/components/student-result-card";
import { RetakeAssessmentDialog } from "@/features/student/assessment/components/retake-assessment-dialog";
import { HistoricalAttemptDetails } from "@/features/student/assessment/components/student-historical-attempt-details";
import {
  assessmentStatusLabel,
  toResultCardData,
} from "@/features/student/assessment/components/student-assessment-history-helpers";
import {
  formatAssessmentDate,
  mapAssessmentResult,
} from "@/features/student/assessment/assessment-result-mapper";
import type { StudentRecommendationState } from "@/features/student/recommendations/recommendation-types";

export interface AssessmentHistorySummaryProps {
  history: AssessmentHistoryResponse | null;
  historyError: boolean;
  lifecycle: AssessmentLifecycle;
  selectedAttemptId: number | null;
  selectedRecommendation: StudentRecommendationState | null;
  selectedRecommendationState: "idle" | "loading" | "error";
  onSelectAttempt: (assessmentSessionId: number) => Promise<void>;
  onRetryHistory: () => void;
  onStartRetake: (reason?: string) => Promise<void>;
  onResumeAssessment?: () => void;
  onExploreMatches?: (attemptId?: number) => void;
}

export function AssessmentHistorySummary({
  history,
  historyError,
  lifecycle,
  selectedAttemptId,
  selectedRecommendation,
  selectedRecommendationState,
  onSelectAttempt,
  onRetryHistory,
  onStartRetake,
  onResumeAssessment,
  onExploreMatches,
}: AssessmentHistorySummaryProps) {
  const [starting, setStarting] = useState(false);
  const [confirmingRetake, setConfirmingRetake] = useState(false);
  const [retakeError, setRetakeError] = useState(false);
  const [activeResultCard, setActiveResultCard] =
    useState<ResultCardData | null>(null);

  async function handleOpenResultCard(attempt: AssessmentLifecycle) {
    if (attempt.id) {
      try {
        const card = await getAssessmentResultCard(attempt.id);
        setActiveResultCard(card);
        return;
      } catch {
        // fallback to local mapped card
      }
    }
    const local = toResultCardData(attempt);
    if (local) setActiveResultCard(local);
  }

  const availableDate = formatAssessmentDate(lifecycle.retake_available_at);
  const retakeLabel = lifecycle.can_retake
    ? "Start retake"
    : lifecycle.status === "in_progress"
      ? "Retake in progress"
      : lifecycle.status === "preparing_result"
        ? "Finalizing submission"
        : lifecycle.status === "result_failed"
          ? "Result needs retry"
          : lifecycle.retake_available_at
            ? `Available ${availableDate}`
            : "Retake unavailable";

  const latestCompletedId = history?.attempts.find(
    (item) => item.status === "result_available",
  )?.id;

  const selectedAttempt =
    history?.attempts.find((item) => item.id === selectedAttemptId) ?? null;

  const previousCompletedAttempt = selectedAttempt
    ? (history?.attempts
        .filter(
          (item) =>
            item.status === "result_available" &&
            (item.attempt_number ?? 0) < (selectedAttempt.attempt_number ?? 0),
        )
        .sort(
          (left, right) =>
            (right.attempt_number ?? 0) - (left.attempt_number ?? 0),
        )[0] ?? null)
    : null;

  async function startRetake(reason?: string) {
    setRetakeError(false);
    setStarting(true);
    try {
      await onStartRetake(reason);
    } catch {
      setRetakeError(true);
    } finally {
      setStarting(false);
    }
  }

  return (
    <section
      data-print-hidden
      aria-labelledby="assessment-history-title"
      className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs"
    >
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b border-border/70 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border/70 text-primary-ink shadow-2xs">
            <History className="size-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary-ink">
                Recorded attempts
              </span>
              <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                {history?.attempts.length || 0} recorded
              </span>
            </div>
            <h3
              id="assessment-history-title"
              className="mt-0.5 font-display text-xl sm:text-2xl font-black text-foreground"
            >
              Your assessment timeline
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose a completed attempt to open its interest profile and saved
              programme matches.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="shrink-0 rounded-full bg-background px-4 text-xs font-bold shadow-2xs hover:bg-muted"
          disabled={!lifecycle.can_retake || starting}
          onClick={() => setConfirmingRetake(true)}
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          {starting ? "Starting retake…" : retakeLabel}
        </Button>
      </div>

      <div className="p-5 sm:p-6">
        {lifecycle.status === "result_available" &&
        !lifecycle.can_retake &&
        Boolean(lifecycle.retake_available_at) &&
        new Date() < new Date(lifecycle.retake_available_at!) ? (
          <Alert className="mb-5 border-warning/40 bg-warning/10 text-foreground">
            <AlertCircle
              className="size-4 text-warning-ink"
              aria-hidden="true"
            />
            <AlertTitle className="font-bold text-warning-ink">
              Retake policy waiting period
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Under policy rule{" "}
              {history?.policy?.version ?? "RETAKE-PROPOSED-2026-01"}, retaking
              requires a waiting period. Next attempt available on{" "}
              {availableDate}.
            </AlertDescription>
          </Alert>
        ) : null}

        {retakeError ? (
          <Alert variant="destructive" className="mb-5">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Retake could not be started</AlertTitle>
            <AlertDescription>
              Your previous result is unchanged. Check your connection and try
              again.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* 2-Column Workspace: Left Attempt Feed / Right Inspector */}
        <div className="grid items-start gap-6 lg:grid-cols-[21rem_minmax(0,1fr)]">
          {historyError ? (
            <ErrorState
              title="Assessment history could not be loaded"
              description="Your current result is unchanged. Try loading your attempts again."
              onRetry={onRetryHistory}
            />
          ) : history ? (
            <div className="space-y-3">
              {history.attempts.map((item) => {
                const result = mapAssessmentResult(item);
                const isSelected = selectedAttemptId === item.id;
                const isCurrent = item.is_current;
                const isCurrentResult = item.id === latestCompletedId;
                const itemReference =
                  item.reference ??
                  (item.id ? `ASMT-${String(item.id).padStart(6, "0")}` : null);

                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/[0.04] shadow-xs ring-2 ring-primary/25"
                        : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/15"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={item.status !== "result_available"}
                      aria-pressed={isSelected}
                      onClick={() => item.id && void onSelectAttempt(item.id)}
                      className="w-full p-4 text-left focus-visible:outline-none"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-foreground">
                            Attempt {item.attempt_number}
                          </span>
                          {itemReference ? (
                            <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                              {itemReference}
                            </span>
                          ) : null}
                        </div>

                        {item.status === "result_available" ? (
                          <ChevronRight
                            aria-hidden="true"
                            className={`size-4 transition-transform ${isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground"}`}
                          />
                        ) : (
                          <Clock3
                            aria-hidden="true"
                            className="size-4 text-muted-foreground"
                          />
                        )}
                      </div>

                      <div className="mt-2.5 flex items-baseline justify-between gap-2">
                        <span className="font-display text-xl font-black tracking-tight text-foreground">
                          {result?.topCode ??
                            assessmentStatusLabel(item.status)}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                          <CalendarDays className="size-3 text-muted-foreground/80" />
                          {formatAssessmentDate(
                            item.result_available_at ?? item.started_at,
                          )}
                        </span>
                      </div>

                      {item.retake_reason ? (
                        <div className="mt-2.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground">
                          <strong className="font-semibold text-foreground">Reason:</strong> {item.retake_reason}
                        </div>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {isCurrent && item.status !== "result_available" ? (
                          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary-ink">
                            Current attempt
                          </span>
                        ) : null}
                        {isCurrentResult ? (
                          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary-ink">
                            Latest completed
                          </span>
                        ) : null}
                        {!isCurrentResult &&
                        item.status === "result_available" ? (
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            Previous result
                          </span>
                        ) : null}
                        {item.status === "preparing_result" ? (
                          <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-[10px] font-bold text-warning-ink">
                            Processing
                          </span>
                        ) : null}
                        {item.status === "result_failed" ? (
                          <span className="rounded-full bg-destructive/20 px-2.5 py-0.5 text-[10px] font-bold text-destructive-ink">
                            Result unavailable
                          </span>
                        ) : null}
                      </div>
                    </button>

                    {/* Interactive Item Action Bar */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/15 px-4 py-2.5">
                      {item.status === "result_available" ? (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 px-2.5 text-[11px] font-bold text-primary-ink hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleOpenResultCard(item);
                            }}
                          >
                            <FileText className="size-3.5" aria-hidden="true" />
                            View Result Card
                          </Button>
                          {onExploreMatches ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 px-2.5 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.id) void onSelectAttempt(item.id);
                                onExploreMatches(item.id);
                              }}
                            >
                              Explore Matches
                            </Button>
                          ) : null}
                        </>
                      ) : null}

                      {item.status === "in_progress" && onResumeAssessment ? (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="h-7 gap-1 px-3 text-[11px] font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResumeAssessment();
                          }}
                        >
                          Resume Assessment
                          <ArrowRight className="size-3" aria-hidden="true" />
                        </Button>
                      ) : null}

                      {item.status === "result_failed" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 border-destructive/40 px-2.5 text-[11px] font-bold text-destructive-ink hover:bg-destructive/10"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (item.id) {
                              await retryAssessmentResult(item.id);
                              onRetryHistory();
                            }
                          }}
                        >
                          <RotateCcw className="size-3" aria-hidden="true" />
                          Retry Result
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <LoadingState
              title="Loading assessment history"
              description="Restoring your recorded attempts."
            />
          )}

          {/* Right Inspector Panel */}
          <div className="min-w-0 lg:sticky lg:top-24">
            {selectedAttempt ? (
              <HistoricalAttemptDetails
                attempt={selectedAttempt}
                previousAttempt={previousCompletedAttempt}
                recommendation={selectedRecommendation}
                recommendationState={selectedRecommendationState}
                onViewResultCard={() =>
                  void handleOpenResultCard(selectedAttempt)
                }
                onExploreMatches={
                  onExploreMatches
                    ? (attemptId) => {
                        const targetId = attemptId ?? selectedAttempt.id;
                        if (targetId) void onSelectAttempt(targetId);
                        onExploreMatches(targetId);
                      }
                    : undefined
                }
              />
            ) : (
              <div className="flex min-h-80 flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary-ink">
                  <History className="size-6" aria-hidden="true" />
                </span>
                <div className="mt-8">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary-ink">
                    Interactive inspector
                  </p>
                  <h4 className="mt-1 font-display text-2xl font-black text-foreground">
                    Select a completed attempt
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Click any completed attempt from the list to examine its
                    Holland dimensions, entrance exam snapshot, and generated
                    degree recommendations.
                  </p>
                  {history ? (
                    <p className="mt-4 text-xs font-bold text-foreground">
                      {history.attempts.length} recorded{" "}
                      {history.attempts.length === 1 ? "attempt" : "attempts"}{" "}
                      available
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <RetakeAssessmentDialog
        open={confirmingRetake}
        onOpenChange={setConfirmingRetake}
        description="Your completed results will stay available in Assessment history. The new attempt starts with no answers and becomes your current assessment."
        onConfirm={startRetake}
      />

      {/* Result Card Modal */}
      <Dialog
        open={Boolean(activeResultCard)}
        onOpenChange={(open) => {
          if (!open) setActiveResultCard(null);
        }}
      >
        <DialogContent
          className="max-h-[92vh] max-w-3xl overflow-y-auto border-none bg-transparent p-0 shadow-2xl"
          closeLabel="Close result card"
        >
          <DialogTitle className="sr-only">
            RIASEC Assessment Result Card
          </DialogTitle>
          <DialogDescription className="sr-only">
            Official Holland interest alignment record for Attempt{" "}
            {activeResultCard?.attemptNumber}
          </DialogDescription>
          {activeResultCard ? (
            <StudentResultCard
              card={activeResultCard}
              onClose={() => setActiveResultCard(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
