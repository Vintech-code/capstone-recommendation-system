import { ArrowRight, CalendarDays, ChevronRight, Clock3, FileText, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  retryAssessmentResult,
  type AssessmentLifecycle,
} from "@/features/student/assessment/assessment-api";
import {
  assessmentStatusLabel,
} from "@/features/student/assessment/components/student-assessment-history-helpers";
import {
  formatAssessmentDate,
  mapAssessmentResult,
} from "@/features/student/assessment/assessment-result-mapper";

interface AssessmentHistoryAttemptListProps {
  attempts: AssessmentLifecycle[];
  selectedAttemptId: number | null;
  latestCompletedId?: number;
  onSelectAttempt: (assessmentSessionId: number) => Promise<void>;
  onOpenResultCard: (attempt: AssessmentLifecycle) => void;
  onRetryHistory: () => void;
  onResumeAssessment?: () => void;
  onExploreMatches?: (attemptId?: number) => void;
}

function AssessmentHistoryAttemptList({
  attempts,
  selectedAttemptId,
  latestCompletedId,
  onSelectAttempt,
  onOpenResultCard,
  onRetryHistory,
  onResumeAssessment,
  onExploreMatches,
}: AssessmentHistoryAttemptListProps) {
  return (
    <div className="space-y-3">
      {attempts.map((item) => {
        const result = mapAssessmentResult(item);
        const isSelected = selectedAttemptId === item.id;
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
                    className={`size-4 transition-transform ${isSelected ? "translate-x-0.5 text-primary" : "text-muted-foreground"}`}
                  />
                ) : (
                  <Clock3 aria-hidden="true" className="size-4 text-muted-foreground" />
                )}
              </div>

              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className="font-display text-xl font-black tracking-tight text-foreground">
                  {result?.topCode ?? assessmentStatusLabel(item.status)}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <CalendarDays className="size-3 text-muted-foreground/80" />
                  {formatAssessmentDate(item.result_available_at ?? item.started_at)}
                </span>
              </div>

              {item.retake_reason ? (
                <div className="mt-2.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground">
                  <strong className="font-semibold text-foreground">Reason:</strong>{" "}
                  {item.retake_reason}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {item.is_current && item.status !== "result_available" ? (
                  <StatusPill className="bg-primary/15 text-primary-ink">Current attempt</StatusPill>
                ) : null}
                {isCurrentResult ? (
                  <StatusPill className="bg-primary/15 text-primary-ink">Latest completed</StatusPill>
                ) : null}
                {!isCurrentResult && item.status === "result_available" ? (
                  <StatusPill className="bg-secondary text-muted-foreground">Previous result</StatusPill>
                ) : null}
                {item.status === "preparing_result" ? (
                  <StatusPill className="bg-warning/20 text-warning-ink">Processing</StatusPill>
                ) : null}
                {item.status === "result_failed" ? (
                  <StatusPill className="bg-destructive/20 text-destructive-ink">Result unavailable</StatusPill>
                ) : null}
              </div>
            </button>

            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/15 px-4 py-2.5">
              {item.status === "result_available" ? (
                <>
                  <Button type="button" variant="ghost" size="sm" className="h-7 gap-1.5 px-2.5 text-[11px] font-bold text-primary-ink hover:bg-primary/10" onClick={() => onOpenResultCard(item)}>
                    <FileText className="size-3.5" aria-hidden="true" />
                    View Result Card
                  </Button>
                  {onExploreMatches ? (
                    <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2.5 text-[11px] font-semibold text-muted-foreground hover:bg-secondary" onClick={() => {
                      if (item.id) void onSelectAttempt(item.id);
                      onExploreMatches(item.id);
                    }}>
                      Explore Matches
                    </Button>
                  ) : null}
                </>
              ) : null}
              {item.status === "in_progress" && onResumeAssessment ? (
                <Button type="button" variant="default" size="sm" className="h-7 gap-1 px-3 text-[11px] font-bold" onClick={onResumeAssessment}>
                  Resume Assessment <ArrowRight className="size-3" aria-hidden="true" />
                </Button>
              ) : null}
              {item.status === "result_failed" ? (
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1 border-destructive/40 px-2.5 text-[11px] font-bold text-destructive-ink hover:bg-destructive/10" onClick={async () => {
                  if (item.id) {
                    await retryAssessmentResult(item.id);
                    onRetryHistory();
                  }
                }}>
                  <RotateCcw className="size-3" aria-hidden="true" /> Retry Result
                </Button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ className, children }: { className: string; children: string }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${className}`}>{children}</span>;
}

export { AssessmentHistoryAttemptList };
