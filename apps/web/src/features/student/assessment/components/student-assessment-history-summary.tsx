import { AlertCircle, History, RotateCcw } from "lucide-react";
import { useState } from "react";

import { ErrorState, LoadingState } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  getAssessmentResultCard,
  type AssessmentHistoryResponse,
  type AssessmentLifecycle,
  type ResultCardData,
} from "@/features/student/assessment/assessment-api";
import { AssessmentHistoryAttemptList } from "@/features/student/assessment/components/assessment-history-attempt-list";
import { AssessmentHistoryInspector } from "@/features/student/assessment/components/assessment-history-inspector";
import { RetakeAssessmentDialog } from "@/features/student/assessment/components/retake-assessment-dialog";
import { toResultCardData } from "@/features/student/assessment/components/student-assessment-history-helpers";
import { StudentResultCard } from "@/features/student/assessment/components/student-result-card";
import { formatAssessmentDate } from "@/features/student/assessment/assessment-result-mapper";
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
  const [activeResultCard, setActiveResultCard] = useState<ResultCardData | null>(null);
  const availableDate = formatAssessmentDate(lifecycle.retake_available_at);
  const selectedAttempt = history?.attempts.find((item) => item.id === selectedAttemptId) ?? null;
  const latestCompletedId = history?.attempts.find((item) => item.status === "result_available")?.id;
  const previousCompletedAttempt = selectedAttempt
    ? (history?.attempts
        .filter((item) => item.status === "result_available" && (item.attempt_number ?? 0) < (selectedAttempt.attempt_number ?? 0))
        .sort((left, right) => (right.attempt_number ?? 0) - (left.attempt_number ?? 0))[0] ?? null)
    : null;

  async function handleOpenResultCard(attempt: AssessmentLifecycle) {
    if (attempt.id) {
      try {
        setActiveResultCard(await getAssessmentResultCard(attempt.id));
        return;
      } catch {
        // Fall back to the locally mapped immutable attempt snapshot.
      }
    }
    const local = toResultCardData(attempt);
    if (local) setActiveResultCard(local);
  }

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
    <section data-print-hidden aria-labelledby="assessment-history-title" className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
      <HistoryHeader
        attemptCount={history?.attempts.length ?? 0}
        retakeLabel={getRetakeLabel(lifecycle, availableDate)}
        starting={starting}
        canRetake={Boolean(lifecycle.can_retake)}
        onRetake={() => setConfirmingRetake(true)}
      />

      <div className="p-5 sm:p-6">
        {lifecycle.status === "result_available" && !lifecycle.can_retake && Boolean(lifecycle.retake_available_at) && new Date() < new Date(lifecycle.retake_available_at!) ? (
          <Alert className="mb-5 border-warning/40 bg-warning/10 text-foreground">
            <AlertCircle className="size-4 text-warning-ink" aria-hidden="true" />
            <AlertTitle className="font-bold text-warning-ink">Retake policy waiting period</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Under policy rule {history?.policy?.version ?? "RETAKE-PROPOSED-2026-01"}, retaking requires a waiting period. Next attempt available on {availableDate}.
            </AlertDescription>
          </Alert>
        ) : null}
        {retakeError ? (
          <Alert variant="destructive" className="mb-5">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Retake could not be started</AlertTitle>
            <AlertDescription>Your previous result is unchanged. Check your connection and try again.</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid items-start gap-6 lg:grid-cols-[21rem_minmax(0,1fr)]">
          {historyError ? (
            <ErrorState title="Assessment history could not be loaded" description="Your current result is unchanged. Try loading your attempts again." onRetry={onRetryHistory} />
          ) : history ? (
            <AssessmentHistoryAttemptList
              attempts={history.attempts}
              selectedAttemptId={selectedAttemptId}
              latestCompletedId={latestCompletedId}
              onSelectAttempt={onSelectAttempt}
              onOpenResultCard={(attempt) => void handleOpenResultCard(attempt)}
              onRetryHistory={onRetryHistory}
              onResumeAssessment={onResumeAssessment}
              onExploreMatches={onExploreMatches}
            />
          ) : (
            <LoadingState title="Loading assessment history" description="Restoring your recorded attempts." />
          )}
          <AssessmentHistoryInspector
            historyCount={history?.attempts.length}
            selectedAttempt={selectedAttempt}
            previousCompletedAttempt={previousCompletedAttempt}
            recommendation={selectedRecommendation}
            recommendationState={selectedRecommendationState}
            onViewResultCard={(attempt) => void handleOpenResultCard(attempt)}
            onSelectAttempt={onSelectAttempt}
            onExploreMatches={onExploreMatches}
          />
        </div>
      </div>

      <RetakeAssessmentDialog open={confirmingRetake} onOpenChange={setConfirmingRetake} description="Your completed results will stay available in Assessment history. The new attempt starts with no answers and becomes your current assessment." onConfirm={startRetake} />
      <Dialog open={Boolean(activeResultCard)} onOpenChange={(open) => !open && setActiveResultCard(null)}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-none bg-transparent p-0 shadow-2xl" closeLabel="Close result card">
          <DialogTitle className="sr-only">RIASEC Assessment Result Card</DialogTitle>
          <DialogDescription className="sr-only">Official Holland interest alignment record for Attempt {activeResultCard?.attemptNumber}</DialogDescription>
          {activeResultCard ? <StudentResultCard card={activeResultCard} onClose={() => setActiveResultCard(null)} /> : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function HistoryHeader({ attemptCount, retakeLabel, starting, canRetake, onRetake }: { attemptCount: number; retakeLabel: string; starting: boolean; canRetake: boolean; onRetake: () => void }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/70 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background text-primary-ink shadow-2xs"><History className="size-5" aria-hidden="true" /></span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary-ink">Recorded attempts</span>
            <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">{attemptCount} recorded</span>
          </div>
          <h3 id="assessment-history-title" className="mt-0.5 font-display text-xl font-black text-foreground sm:text-2xl">Your assessment timeline</h3>
          <p className="mt-1 text-xs text-muted-foreground">Choose a completed attempt to open its interest profile and saved programme matches.</p>
        </div>
      </div>
      <Button type="button" variant="outline" className="shrink-0 rounded-full bg-background px-4 text-xs font-bold shadow-2xs hover:bg-muted" disabled={!canRetake || starting} onClick={onRetake}>
        <RotateCcw aria-hidden="true" className="size-3.5" />
        {starting ? "Starting retakeâ€¦" : retakeLabel}
      </Button>
    </div>
  );
}

function getRetakeLabel(lifecycle: AssessmentLifecycle, availableDate: string) {
  if (lifecycle.can_retake) return "Start retake";
  if (lifecycle.status === "in_progress") return "Retake in progress";
  if (lifecycle.status === "preparing_result") return "Finalizing submission";
  if (lifecycle.status === "result_failed") return "Result needs retry";
  return lifecycle.retake_available_at ? `Available ${availableDate}` : "Retake unavailable";
}
