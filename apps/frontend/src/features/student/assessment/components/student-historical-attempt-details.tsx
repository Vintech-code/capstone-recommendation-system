import {
  CalendarDays,
  Clock3,
  FileText,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AssessmentLifecycle } from "@/features/student/assessment/assessment-api";
import { assessmentStatusLabel } from "@/features/student/assessment/components/student-assessment-history-helpers";
import {
  formatAssessmentDate,
  mapAssessmentResult,
} from "@/features/student/assessment/assessment-result-mapper";
import type { StudentRecommendationState } from "@/features/student/recommendations/recommendation-types";

interface HistoricalAttemptDetailsProps {
  attempt: AssessmentLifecycle;
  previousAttempt: AssessmentLifecycle | null;
  recommendation: StudentRecommendationState | null;
  recommendationState: "idle" | "loading" | "error";
  onViewResultCard: () => void;
  onExploreMatches?: (attemptId?: number) => void;
}

export function HistoricalAttemptDetails({
  attempt,
  previousAttempt,
  recommendation,
  recommendationState,
  onViewResultCard,
  onExploreMatches,
}: HistoricalAttemptDetailsProps) {
  const result = mapAssessmentResult(attempt);
  const previousResult = previousAttempt
    ? mapAssessmentResult(previousAttempt)
    : null;
  const previousScoresByCode = new Map(
    previousResult?.dimensions.map((d) => [d.code, d.value]) ?? [],
  );
  const courses =
    recommendation?.status === "available"
      ? (recommendation.recommendation?.courses ?? [])
      : [];

  return (
    <div
      data-testid="historical-attempt-details"
      className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6"
    >
      {/* Inspector Hero Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-ink">
              <Clock3 className="size-3" aria-hidden="true" />
              Inspection Details
            </span>
          </div>
          <h4 className="mt-1 font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Attempt {attempt.attempt_number ?? 1} result
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Assessment version:{" "}
            {result?.assessmentVersion ??
              attempt.instrument_code ??
              "tcc-uhcc-riasec-42-v1"}
            {attempt.is_current ? (
              <span className="ml-2 inline-flex items-center font-bold text-success-ink">
                Current result
              </span>
            ) : null}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-primary/30 text-xs font-bold text-primary-ink shadow-2xs hover:bg-primary/10"
          onClick={onViewResultCard}
        >
          <FileText className="size-3.5" aria-hidden="true" />
          View Result Card
        </Button>
      </div>

      {/* Snapshot Metadata Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Clock3 className="size-3.5 text-primary-ink" aria-hidden="true" /> Status
          </p>
          <p className="mt-1 font-bold text-foreground capitalize">
            {assessmentStatusLabel(attempt.status)}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <CalendarDays className="size-3.5 text-primary-ink" aria-hidden="true" /> Submitted
          </p>
          <p className="mt-1 font-bold text-foreground">
            {formatAssessmentDate(attempt.submitted_at ?? attempt.started_at)}
          </p>
        </div>
      </div>

      {/* Entrance Exam Self-Declaration Snapshot */}
      {attempt.entrance_examination ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <UserCheck
                className="size-3.5 text-primary-ink"
                aria-hidden="true"
              />
              Self-declared Entrance Exam
            </span>
            <span className="font-display font-black text-sm text-foreground">
              {Number(attempt.entrance_examination.score).toFixed(2)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Classification:{" "}
            <span className="font-semibold text-foreground">
              {attempt.entrance_examination.eligibility_group === "board"
                ? "Board Programme Eligible (1.0 - 2.5)"
                : "Non-Board Programme Pathway (2.6 - 5.0)"}
            </span>
          </p>
        </div>
      ) : null}

      {/* Comparison against previous attempt */}
      {previousAttempt && (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs">
          <h5 className="font-bold text-foreground">
            Compared with Attempt {previousAttempt.attempt_number ?? 1}
          </h5>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Recorded score change only
          </p>
        </div>
      )}

      {/* All 6 Holland Dimensions Scores */}
      {result?.dimensions && result.dimensions.length > 0 ? (
        <div className="rounded-xl border border-border/60 bg-muted/15 p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Recorded dimension scores
            </h5>
            <span className="font-display text-sm font-black text-primary-ink">
              {result.topCode}
            </span>
          </div>
          <dl className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {result.dimensions.map((dimension) => {
              const prev = previousScoresByCode.get(dimension.code);
              const scoreDiff =
                prev !== undefined ? dimension.value - prev : null;
              return (
                <div
                  key={dimension.code}
                  className="rounded-xl border border-border/60 bg-card p-2.5 text-center shadow-2xs"
                >
                  <dt className="text-[10px] font-bold text-muted-foreground truncate">
                    {dimension.code}
                  </dt>
                  <dd className="mt-0.5 font-display text-base font-black text-foreground">
                    {dimension.value}
                  </dd>
                  <dd
                    className={`mt-0.5 text-[10px] font-black ${
                      scoreDiff === null || scoreDiff === 0
                        ? "text-muted-foreground"
                        : scoreDiff > 0
                          ? "text-success-ink"
                          : "text-destructive-ink"
                    }`}
                  >
                    {scoreDiff === null
                      ? "recorded"
                      : scoreDiff > 0
                        ? `+${scoreDiff}`
                        : String(scoreDiff)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ) : null}

      {/* Recommended Courses Breakdown */}
      <div className="border-t border-border/60 pt-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Programme matches from this attempt
          </h5>
          {onExploreMatches && courses.length > 0 ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs font-bold text-primary-ink hover:underline"
              onClick={() => onExploreMatches(attempt.id)}
            >
              Explore all
            </Button>
          ) : null}
        </div>

        {recommendationState === "loading" ? (
          <p className="mt-3 text-xs text-muted-foreground animate-pulse">
            Loading generated recommendations for this attempt...
          </p>
        ) : null}

        {recommendationState === "error" ? (
          <p className="mt-3 text-xs text-destructive-ink">
            Could not load recommendations for this attempt.
          </p>
        ) : null}

        {recommendationState === "idle" && courses.length > 0 ? (
          <ol className="mt-3 grid gap-2">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs hover:bg-muted/15 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-primary-ink">
                      #{course.rank} · {course.code}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate font-bold text-xs text-foreground">
                    {course.name}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary/80 px-2.5 py-1 text-xs font-black text-foreground">
                  {course.match}%
                </span>
              </li>
            ))}
          </ol>
        ) : null}

        {recommendationState === "idle" && courses.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            No saved programme matches are available for this attempt.
          </p>
        ) : null}
      </div>
    </div>
  );
}
