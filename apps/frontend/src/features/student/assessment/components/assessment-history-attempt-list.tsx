import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Compass,
  FileText,
  RotateCcw,
} from "lucide-react";

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
import { getRiasecProfileCopy } from "@/features/student/assessment/riasec-profile-copy";

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

const riasecChipColors: Record<string, { bg: string; text: string; border: string }> = {
  R: { bg: "bg-primary/20", text: "text-primary-ink", border: "border-primary/40" },
  I: { bg: "bg-[#9B86D4]/20", text: "text-[#543b8c]", border: "border-[#9B86D4]/40" },
  A: { bg: "bg-[#E58B91]/20", text: "text-[#852b32]", border: "border-[#E58B91]/40" },
  S: { bg: "bg-[#8AD3A2]/25", text: "text-[#1f5f37]", border: "border-[#8AD3A2]/45" },
  E: { bg: "bg-[#F4B740]/25", text: "text-[#73510e]", border: "border-[#F4B740]/45" },
  C: { bg: "bg-secondary text-foreground", text: "text-foreground", border: "border-border" },
};

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
    <div className="relative space-y-3.5 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-0.5 before:bg-border/60">
      {attempts.map((item, index) => {
        const result = mapAssessmentResult(item);
        const isSelected = selectedAttemptId === item.id;
        const isCurrentResult = item.id === latestCompletedId;
        const itemReference =
          item.reference ??
          (item.id ? `ASMT-${String(item.id).padStart(6, "0")}` : null);
        const topCodeLetters = result?.topCode
          ? result.topCode.split("-").join("").split("")
          : [];
        const profileCopy = result?.topCode
          ? getRiasecProfileCopy(result.topCode)
          : null;

        return (
          <div
            key={item.id}
            className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${
              isSelected
                ? "border-primary/80 bg-gradient-to-br from-primary/[0.08] via-card to-card shadow-sm ring-2 ring-primary/25"
                : "border-border/80 bg-card hover:border-primary/45 hover:bg-muted/15 hover:shadow-xs"
            }`}
          >
            <button
              type="button"
              disabled={item.status !== "result_available"}
              aria-pressed={isSelected}
              onClick={() => item.id && void onSelectAttempt(item.id)}
              className="w-full p-4 sm:p-5 text-left focus-visible:outline-none"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-black text-primary-ink">
                    {item.attempt_number ?? index + 1}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-foreground">
                    Attempt {item.attempt_number}
                  </span>
                  {itemReference ? (
                    <span className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                      {itemReference}
                    </span>
                  ) : null}
                </div>
                {item.status === "result_available" ? (
                  <div className="flex items-center gap-1">
                    {isSelected ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary-ink">
                        Inspecting
                      </span>
                    ) : null}
                    <ChevronRight
                      aria-hidden="true"
                      className={`size-4 transition-transform ${isSelected ? "translate-x-0.5 text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                ) : (
                  <Clock3 aria-hidden="true" className="size-4 text-muted-foreground" />
                )}
              </div>

              {/* Holland Top Code Display */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-black tracking-tight text-foreground">
                    {result?.topCode ?? assessmentStatusLabel(item.status)}
                  </span>
                  {topCodeLetters.length > 0 ? (
                    <div className="flex items-center gap-1">
                      {topCodeLetters.map((letter, i) => {
                        const style = riasecChipColors[letter] ?? {
                          bg: "bg-muted",
                          text: "text-foreground",
                          border: "border-border",
                        };
                        return (
                          <span
                            key={i}
                            className={`flex size-6 items-center justify-center rounded-lg border text-xs font-black ${style.bg} ${style.text} ${style.border}`}
                          >
                            {letter}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <CalendarDays className="size-3 text-muted-foreground/80" />
                  {formatAssessmentDate(item.result_available_at ?? item.started_at)}
                </span>
              </div>

              {profileCopy?.name ? (
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {profileCopy.name}
                </p>
              ) : null}

              {item.entrance_examination ? (
                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  <span>Exam GPA:</span>
                  <span className="font-bold text-foreground">
                    {Number(item.entrance_examination.score).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-semibold text-primary-ink">
                    ({item.entrance_examination.eligibility_group === "board" ? "Board" : "Non-Board"})
                  </span>
                </div>
              ) : null}

              {item.retake_reason ? (
                <div className="mt-2.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground">
                  <strong className="font-semibold text-foreground">Reason:</strong>{" "}
                  {item.retake_reason}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {item.is_current && item.status !== "result_available" ? (
                  <StatusPill className="border border-primary/30 bg-primary/15 text-primary-ink">Current attempt</StatusPill>
                ) : null}
                {isCurrentResult ? (
                  <StatusPill className="border border-primary/30 bg-primary/15 text-primary-ink">
                    Latest completed
                  </StatusPill>
                ) : null}
                {!isCurrentResult && item.status === "result_available" ? (
                  <StatusPill className="bg-secondary text-muted-foreground">Previous result</StatusPill>
                ) : null}
                {item.status === "preparing_result" ? (
                  <StatusPill className="border border-warning/30 bg-warning/20 text-warning-ink">Processing</StatusPill>
                ) : null}
                {item.status === "result_failed" ? (
                  <StatusPill className="border border-destructive/30 bg-destructive/20 text-destructive-ink">Result unavailable</StatusPill>
                ) : null}
              </div>
            </button>

            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/20 px-4 py-2.5 sm:px-5">
              {item.status === "result_available" ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 rounded-lg px-2.5 text-[11px] font-bold text-primary-ink hover:bg-primary/10"
                    onClick={() => onOpenResultCard(item)}
                  >
                    <FileText className="size-3.5" aria-hidden="true" />
                    View Result Card
                  </Button>
                  {onExploreMatches ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                      onClick={() => {
                        if (item.id) void onSelectAttempt(item.id);
                        onExploreMatches(item.id);
                      }}
                    >
                      <Compass className="size-3.5" aria-hidden="true" />
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
