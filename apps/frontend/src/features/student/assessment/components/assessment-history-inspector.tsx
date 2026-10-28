import { History } from "lucide-react";

import type { AssessmentLifecycle } from "@/features/student/assessment/assessment-api";
import { HistoricalAttemptDetails } from "@/features/student/assessment/components/student-historical-attempt-details";
import type { StudentRecommendationState } from "@/features/student/recommendations/recommendation-types";

interface AssessmentHistoryInspectorProps {
  historyCount?: number;
  selectedAttempt: AssessmentLifecycle | null;
  previousCompletedAttempt: AssessmentLifecycle | null;
  recommendation: StudentRecommendationState | null;
  recommendationState: "idle" | "loading" | "error";
  onViewResultCard: (attempt: AssessmentLifecycle) => void;
  onSelectAttempt: (assessmentSessionId: number) => Promise<void>;
  onExploreMatches?: (attemptId?: number) => void;
}

function AssessmentHistoryInspector({
  historyCount,
  selectedAttempt,
  previousCompletedAttempt,
  recommendation,
  recommendationState,
  onViewResultCard,
  onSelectAttempt,
  onExploreMatches,
}: AssessmentHistoryInspectorProps) {
  return (
    <div className="min-w-0 lg:sticky lg:top-24">
      {selectedAttempt ? (
        <HistoricalAttemptDetails
          attempt={selectedAttempt}
          previousAttempt={previousCompletedAttempt}
          recommendation={recommendation}
          recommendationState={recommendationState}
          onViewResultCard={() => onViewResultCard(selectedAttempt)}
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
        <div className="flex min-h-80 flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8">
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
              Click any completed attempt from the list to examine its Holland
              dimensions, entrance exam snapshot, and generated degree
              recommendations.
            </p>
            {historyCount !== undefined ? (
              <p className="mt-4 text-xs font-bold text-foreground">
                {historyCount} recorded {historyCount === 1 ? "attempt" : "attempts"} available
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export { AssessmentHistoryInspector };
