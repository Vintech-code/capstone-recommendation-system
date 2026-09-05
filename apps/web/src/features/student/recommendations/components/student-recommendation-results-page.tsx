import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Compass,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import resultIllustration from "@/assets/student-interest-result-v1.webp";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  getCurrentAssessment,
  startAssessment,
  type AssessmentLifecycle,
} from "@/features/student/assessment/assessment-api";
import { RetakeAssessmentDialog } from "@/features/student/assessment/components/retake-assessment-dialog";
import {
  formatAssessmentDate,
  mapAssessmentResult,
} from "@/features/student/assessment/assessment-result-mapper";
import { RecommendationMatchCard } from "@/features/student/recommendations/components/recommendation-match-card";
import { RecommendationProfilePanel } from "@/features/student/recommendations/components/recommendation-profile-panel";
import { StudentRecommendationDetailPage } from "@/features/student/recommendations/components/student-recommendation-detail-page";
import { getLatestRecommendation } from "@/features/student/recommendations/recommendation-api";
import type {
  StudentRecommendedCourse,
  StudentRecommendationSnapshot,
} from "@/features/student/recommendations/recommendation-types";

type RecommendationLoadState =
  | "ready"
  | "loading"
  | "error"
  | "empty"
  | "pending";

interface StudentRecommendationResultsPageProps {
  onBack: () => void;
  onOpenAssessment?: () => void;
  onExploreProgrammes?: (courses: StudentRecommendedCourse[]) => void;
  initialLoadState?: RecommendationLoadState;
  initialSnapshot?: StudentRecommendationSnapshot | null;
  initialAssessment?: AssessmentLifecycle | null;
}

function StudentRecommendationResultsPage({
  onBack,
  onOpenAssessment,
  onExploreProgrammes,
  initialLoadState = "ready",
  initialSnapshot,
  initialAssessment,
}: StudentRecommendationResultsPageProps) {
  const [loadState, setLoadState] = useState<RecommendationLoadState>(
    initialLoadState === "ready" && initialSnapshot === undefined
      ? "loading"
      : initialLoadState,
  );
  const [snapshot, setSnapshot] =
    useState<StudentRecommendationSnapshot | null>(initialSnapshot ?? null);
  const [assessment, setAssessment] = useState<AssessmentLifecycle | null>(
    initialAssessment ?? null,
  );
  const [loadingAll, setLoadingAll] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [retakeOpen, setRetakeOpen] = useState(false);
  const [retakeError, setRetakeError] = useState("");
  const [selectedCourse, setSelectedCourse] =
    useState<StudentRecommendedCourse | null>(null);

  useEffect(() => {
    if (initialSnapshot !== undefined || initialLoadState !== "ready") return;
    let active = true;

    getLatestRecommendation()
      .then((state) => {
        if (!active) return;
        setSnapshot(state.recommendation);
        setLoadState(
          state.status === "available" && state.recommendation
            ? "ready"
            : state.status === "preparing"
              ? "pending"
              : "empty",
        );
      })
      .catch(() => active && setLoadState("error"));

    return () => {
      active = false;
    };
  }, [attempt, initialLoadState, initialSnapshot]);

  useEffect(() => {
    if (initialAssessment !== undefined || initialSnapshot !== undefined)
      return;
    let active = true;

    getCurrentAssessment()
      .then((state) => active && setAssessment(state))
      .catch(() => active && setAssessment(null));

    return () => {
      active = false;
    };
  }, [initialAssessment, initialSnapshot]);

  const assessmentResult = useMemo(
    () => (assessment ? mapAssessmentResult(assessment) : null),
    [assessment],
  );

  if (loadState === "loading") {
    return (
      <LoadingState
        variant="recommendations"
        title="Loading your academic matches"
        description="Connecting your completed assessment to its programme ranking."
      />
    );
  }

  if (loadState === "error") {
    return (
      <ErrorState
        title="We could not load your academic matches"
        description="Check your connection and try again."
        onRetry={() => {
          setLoadState("loading");
          setAttempt((value) => value + 1);
        }}
      />
    );
  }

  if (loadState === "pending") {
    return (
      <RecommendationState
        onBack={onBack}
        title="Your matches are being prepared"
        description="Your assessment is complete. The programme ranking will appear here when processing finishes."
      />
    );
  }

  if (loadState === "empty" || !snapshot) {
    return (
      <RecommendationState
        onBack={onBack}
        title="No academic matches yet"
        description="Complete your interest assessment to generate your matched TCC programmes."
      />
    );
  }

  if (selectedCourse) {
    return (
      <StudentRecommendationDetailPage
        course={selectedCourse}
        generatedAt={formatAssessmentDate(snapshot.generatedAt)}
        onBack={() => setSelectedCourse(null)}
        onExploreProgrammes={() =>
          (onExploreProgrammes ?? (() => onBack()))(snapshot.courses)
        }
      />
    );
  }

  const profile = snapshot.profile ?? assessmentResult ?? null;
  const leadingDimensions = profile
    ? profile.topCode
        .split("-")
        .map((code) =>
          profile.dimensions.find((dimension) => dimension.code === code),
        )
        .filter((dimension) => dimension !== undefined)
    : [];

  const topCareerPaths = snapshot
    ? Array.from(
        new Set(
          snapshot.courses.flatMap((course) => course.careerDirections ?? []),
        ),
      ).slice(0, 4)
    : [];

  return (
    <div className="student-grid-page student-dashboard-canvas">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 pb-12 pt-6 sm:pt-10">
        <div
          style={{ alignItems: "start" }}
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(28rem,34rem)] lg:gap-12 xl:gap-14"
        >
          <section
            className="min-w-0"
            aria-labelledby="recommendation-result-title"
          >
            <div className="relative mx-auto aspect-square w-52 overflow-hidden rounded-[2rem] border-2 border-primary/20 bg-primary-fixed/30 p-3 shadow-xs sm:w-60">
              <div
                aria-hidden="true"
                className="absolute inset-x-4 bottom-2 h-10 rounded-full bg-primary-fixed/60 blur-lg"
              />
              <img
                src={resultIllustration}
                alt=""
                className="relative size-full object-contain"
              />
            </div>

            {profile ? (
              <>
                <h1
                  id="recommendation-result-title"
                  className="mt-5 max-w-2xl font-display text-3xl font-black leading-[0.98] tracking-[-0.045em] text-primary sm:text-4xl lg:text-5xl"
                >
                  {profile.topLabels.join(" and ")}
                </h1>
                <p className="mt-3 font-label text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm">
                  {leadingDimensions
                    .map((d) => d.label.toUpperCase())
                    .join(" AND ")}{" "}
                  · {profile.topCode}
                </p>

                <p className="mt-5 max-w-xl text-base font-medium leading-7 text-foreground/90 sm:text-lg sm:leading-8">
                  {leadingDimensions.length === 2
                    ? `You care about ${leadingDimensions[0].label.toLowerCase()} and ${leadingDimensions[1].label.toLowerCase()} pursuits. Programmes that match these interest areas often align with how you learn best.`
                    : "These are the interest areas with the highest recorded counts in your completed assessment."}
                </p>

                {leadingDimensions.length > 0 ? (
                  <div className="mt-6">
                    <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm">
                      Your leading areas
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {leadingDimensions.map((dimension) => (
                        <span
                          key={dimension.code}
                          className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary-fixed px-4 py-1.5 font-label text-sm font-semibold text-on-primary-fixed sm:text-base"
                        >
                          {dimension.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-7 max-w-xl rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-primary">
                    <Compass aria-hidden="true" className="size-6 shrink-0" />
                    <h2 className="font-display text-xl font-extrabold sm:text-2xl">
                      Recommended career paths
                    </h2>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground sm:text-base">
                    Possible directions collected from your currently displayed recommended programmes.
                  </p>

                  {topCareerPaths.length > 0 ? (
                    <div className="mt-4">
                      <p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-sm">
                        Career opportunities
                      </p>
                      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                        {topCareerPaths.map((path) => (
                          <li key={path} className="rounded-2xl bg-primary-fixed px-3.5 py-2.5 text-sm font-semibold leading-5 text-on-primary-fixed">
                            {path}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="mt-4 border-t border-border/70 pt-3.5">
                    <p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-sm">
                      Why it fits you
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-foreground/80 sm:text-base sm:leading-7">
                      These directions come from the catalogue entries attached to your recommended programmes. They do not predict employment or guarantee that a career will suit you.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1
                  id="recommendation-result-title"
                  className="mt-5 font-display text-3xl font-black leading-[0.98] tracking-[-0.045em] text-primary sm:text-4xl lg:text-5xl"
                >
                  Your academic matches
                </h1>
                <p className="mt-4 max-w-xl text-base font-medium leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  Compare the programmes generated from your completed
                  assessment.
                </p>
              </>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground sm:text-base">
              <span className="flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4" />
                Generated {formatAssessmentDate(snapshot.generatedAt)}
              </span>
              {snapshot.entranceExamination ? (
                <span>
                  Programme group:{" "}
                  <strong className="font-semibold text-foreground">
                    {snapshot.entranceExamination.eligibilityGroup === "board"
                      ? "Board programmes"
                      : "Non-board programmes"}
                  </strong>
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {onOpenAssessment ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRetakeOpen(true)}
                  className="gap-2"
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                  Retake assessment
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  (onExploreProgrammes ?? (() => onBack()))(snapshot.courses)
                }
                className="gap-2"
              >
                Explore all programmes
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </section>

          {profile ? <RecommendationProfilePanel result={profile} /> : null}
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                All ranked matches
              </h2>
              <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground sm:text-base">
                Ranked with the current provisional programme-matching rule.
              </p>
            </div>
            <span className="inline-flex min-h-9 items-center rounded-full bg-primary px-3.5 font-label text-sm font-bold text-primary-foreground">
              {snapshot.showingAll
                ? `${snapshot.courses.length} programmes`
                : `Top ${snapshot.courses.length}`}
            </span>
          </div>

          <ol className="divide-y divide-border border-y border-border">
            {snapshot.courses.map((course) => (
              <li key={course.id}>
                <RecommendationMatchCard
                  course={course}
                  onViewDetails={() => setSelectedCourse(course)}
                />
              </li>
            ))}
          </ol>

          {snapshot.canViewAll && !snapshot.showingAll ? (
            <Button
              type="button"
              variant="outline"
              disabled={loadingAll}
              className="mt-5 min-h-11 w-full bg-card"
              onClick={() => {
                setLoadingAll(true);
                getLatestRecommendation(true)
                  .then(
                    (state) =>
                      state.recommendation && setSnapshot(state.recommendation),
                  )
                  .catch(() => setLoadState("error"))
                  .finally(() => setLoadingAll(false));
              }}
            >
              {loadingAll
                ? "Loading…"
                : `View all ${snapshot.totalEligible} ranked programmes`}
              {!loadingAll ? <ArrowRight aria-hidden="true" /> : null}
            </Button>
          ) : null}
        </div>

        {retakeError ? (
          <p
            role="alert"
            className="mt-4 rounded bg-destructive/10 p-4 text-sm font-medium text-destructive"
          >
            {retakeError}
          </p>
        ) : null}

        <RetakeAssessmentDialog
          open={retakeOpen}
          onOpenChange={setRetakeOpen}
          description="Your latest completed result and recommendations will remain available while the new attempt is in progress."
          onConfirm={async (reason) => {
            try {
              setRetakeError("");
              await startAssessment(reason);
              setRetakeOpen(false);
              onOpenAssessment?.();
            } catch (error) {
              setRetakeOpen(false);
              setRetakeError(
                error instanceof Error
                  ? error.message
                  : "The retake could not be started.",
              );
            }
          }}
        />
      </div>
    </div>
  );
}

function RecommendationState({
  onBack,
  title,
  description,
}: {
  onBack: () => void;
  title: string;
  description: string;
}) {
  return (
    <div className="student-page py-12">
      <EmptyState
        title={title}
        description={description}
        icon={BookOpenCheck}
        action={
          <Button type="button" variant="secondary" onClick={onBack}>
            Explore programmes
          </Button>
        }
      />
    </div>
  );
}

export { StudentRecommendationResultsPage };
export type { RecommendationLoadState };
