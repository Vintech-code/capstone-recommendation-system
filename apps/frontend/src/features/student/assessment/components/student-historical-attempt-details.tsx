import {
  BadgeCheck,
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
import { getRiasecProfileCopy } from "@/features/student/assessment/riasec-profile-copy";
import type { StudentRecommendationState } from "@/features/student/recommendations/recommendation-types";

interface HistoricalAttemptDetailsProps {
  attempt: AssessmentLifecycle;
  previousAttempt: AssessmentLifecycle | null;
  recommendation: StudentRecommendationState | null;
  recommendationState: "idle" | "loading" | "error";
  onViewResultCard: () => void;
  onExploreMatches?: (attemptId?: number) => void;
}

const riasecChipColors: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  R: { bg: "bg-primary/20", text: "text-primary-ink", border: "border-primary/40", bar: "bg-primary" },
  I: { bg: "bg-[#9B86D4]/20", text: "text-[#543b8c]", border: "border-[#9B86D4]/40", bar: "bg-[#9B86D4]" },
  A: { bg: "bg-[#E58B91]/20", text: "text-[#852b32]", border: "border-[#E58B91]/40", bar: "bg-[#E58B91]" },
  S: { bg: "bg-[#8AD3A2]/25", text: "text-[#1f5f37]", border: "border-[#8AD3A2]/45", bar: "bg-[#8AD3A2]" },
  E: { bg: "bg-[#F4B740]/25", text: "text-[#73510e]", border: "border-[#F4B740]/45", bar: "bg-[#F4B740]" },
  C: { bg: "bg-secondary text-foreground", text: "text-foreground", border: "border-border", bar: "bg-muted-foreground" },
};

const dimensionLabels: Record<string, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

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

  const profileCopy = result?.topCode
    ? getRiasecProfileCopy(result.topCode)
    : null;
  const topCodeLetters = result?.topCode
    ? result.topCode.split("-").join("").split("")
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

      {/* Profile Archetype Spotlight */}
      {result?.topCode ? (
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] via-card to-muted/20 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {result.topCode}
              </span>
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
            </div>
            {profileCopy?.name ? (
              <span className="flex items-center gap-1.5 rounded-full bg-accent/25 px-3 py-1 text-xs font-extrabold text-foreground">
                <BadgeCheck className="size-3.5 text-accent-ink" aria-hidden="true" />
                {profileCopy.name}
              </span>
            ) : null}
          </div>

          {profileCopy?.description?.[0] ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
              {profileCopy.description[0]}
            </p>
          ) : null}
        </div>
      ) : null}

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
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {result.dimensions.map((dimension) => {
              const prev = previousScoresByCode.get(dimension.code);
              const scoreDiff =
                prev !== undefined ? dimension.value - prev : null;
              const style = riasecChipColors[dimension.code] ?? {
                bg: "bg-muted",
                text: "text-foreground",
                border: "border-border",
                bar: "bg-primary",
              };
              const scorePercentage = Math.min(100, Math.round((dimension.value / 42) * 100));

              return (
                <div
                  key={dimension.code}
                  className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-3 shadow-2xs transition-shadow hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <dt className="text-xs font-black text-foreground">
                        {dimension.code}
                      </dt>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {dimensionLabels[dimension.code] ?? dimension.label}
                      </span>
                    </div>

                    <dd className="mt-1 font-display text-lg font-black text-foreground">
                      {dimension.value}
                    </dd>

                    {/* Score Bar Meter */}
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/70">
                      <div
                        className={`h-full rounded-full ${style.bar}`}
                        style={{ width: `${Math.max(8, scorePercentage)}%` }}
                      />
                    </div>
                  </div>

                  <dd
                    className={`mt-2 text-[10px] font-black ${
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
          <ol className="mt-3 grid gap-2.5">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs transition-all hover:bg-muted/15 hover:shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-black text-primary-ink">
                      #{course.rank}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">
                      {course.code}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs font-bold text-foreground">
                    {course.name}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="hidden w-16 sm:block">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/70">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, course.match)}%` }}
                      />
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary-ink">
                    {course.match}%
                  </span>
                </div>
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
