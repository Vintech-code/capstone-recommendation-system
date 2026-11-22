import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  Eye,
  History,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AssessmentLifecycle } from "@/features/student/assessment/assessment-api";
import { HistoricalAttemptDetails } from "@/features/student/assessment/components/student-historical-attempt-details";
import type { StudentRecommendationState } from "@/features/student/recommendations/recommendation-types";

interface AssessmentHistoryInspectorProps {
  historyCount?: number;
  selectedAttempt: AssessmentLifecycle | null;
  previousCompletedAttempt: AssessmentLifecycle | null;
  recommendation: StudentRecommendationState | null;
  recommendationState: "idle" | "loading" | "error";
  latestCompletedId?: number;
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
  latestCompletedId,
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
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/15 p-6 shadow-xs sm:p-7">
          <div className="flex items-center justify-between">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-ink shadow-2xs">
              <History className="size-6" aria-hidden="true" />
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary-ink">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Inspector Ready
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary-ink">
              Interactive inspector
            </p>
            <h4 className="mt-1 font-display text-2xl font-black text-foreground sm:text-[1.65rem]">
              Select a completed attempt
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Click any completed attempt from the list to examine its Holland
              dimensions, entrance exam snapshot, and generated degree
              recommendations.
            </p>
            {historyCount !== undefined ? (
              <p className="mt-3.5 text-xs font-bold text-foreground">
                {historyCount} recorded {historyCount === 1 ? "attempt" : "attempts"} available
              </p>
            ) : null}
          </div>

          {/* Interactive Inspection Capability Preview */}
          <div className="mt-6 space-y-2.5 border-t border-border/60 pt-5">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              What you can inspect in each attempt
            </p>

            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-ink">
                <Compass className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">
                  6 Holland Dimension Scores
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Realistic, Investigative, Artistic, Social, Enterprising, and Conventional score meters and delta progression.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/15 text-info-ink">
                <Award className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Entrance Exam Classification
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Self-declared GPA and qualification for Board Programme vs Non-Board academic pathway.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/25 text-accent-ink">
                <BookOpenCheck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Saved Degree Recommendations
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Historical course compatibility matches computed for that specific session.
                </p>
              </div>
            </div>
          </div>

          {latestCompletedId ? (
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 rounded-xl border-primary/30 bg-primary/10 text-xs font-bold text-primary-ink shadow-2xs hover:bg-primary/20"
                onClick={() => void onSelectAttempt(latestCompletedId)}
              >
                <Eye className="size-3.5" aria-hidden="true" />
                Quick inspect latest completed attempt
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export { AssessmentHistoryInspector };
