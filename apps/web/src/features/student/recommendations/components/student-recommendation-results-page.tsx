import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Compass,
  History,
  RefreshCw,
  Share2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import resultIllustration from "@/assets/student-interest-result-v1.webp";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAssessmentResultCard,
  getCurrentAssessment,
  startAssessment,
  type AssessmentLifecycle,
  type ResultCardData,
} from "@/features/student/assessment/assessment-api";
import { RetakeAssessmentDialog } from "@/features/student/assessment/components/retake-assessment-dialog";
import { StudentResultCard } from "@/features/student/assessment/components/student-result-card";
import {
  formatAssessmentDate,
  mapAssessmentResult,
} from "@/features/student/assessment/assessment-result-mapper";
import { RecommendationMatchCard } from "@/features/student/recommendations/components/recommendation-match-card";
import { RecommendationProfilePanel } from "@/features/student/recommendations/components/recommendation-profile-panel";
import { StudentRecommendationDetailPage } from "@/features/student/recommendations/components/student-recommendation-detail-page";
import {
  getLatestRecommendation,
  getRecommendationForAttempt,
} from "@/features/student/recommendations/recommendation-api";
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

function formatAreaList(labels: string[]) {
  if (labels.length < 2) return labels[0] ?? "";
  if (labels.length === 2) return labels.join(" and ");
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

interface StudentRecommendationResultsPageProps {
  onBack: () => void;
  onOpenAssessment?: () => void;
  onExploreProgrammes?: (courses: StudentRecommendedCourse[]) => void;
  initialLoadState?: RecommendationLoadState;
  initialSnapshot?: StudentRecommendationSnapshot | null;
  initialAssessment?: AssessmentLifecycle | null;
  assessmentSessionId?: number | null;
  onViewLatest?: () => void;
}

function StudentRecommendationResultsPage({
  onBack,
  onOpenAssessment,
  onExploreProgrammes,
  initialLoadState = "ready",
  initialSnapshot,
  initialAssessment,
  assessmentSessionId,
  onViewLatest,
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
  const [attempt, setAttempt] = useState(0);
  const [retakeOpen, setRetakeOpen] = useState(false);
  const [retakeError, setRetakeError] = useState("");
  const [selectedCourse, setSelectedCourse] =
    useState<StudentRecommendedCourse | null>(null);
  const [resultCard, setResultCard] = useState<ResultCardData | null>(null);
  const [resultCardLoading, setResultCardLoading] = useState(false);
  const [resultCardError, setResultCardError] = useState("");

  useEffect(() => {
    if (initialSnapshot !== undefined || initialLoadState !== "ready") return;
    let active = true;
    setLoadState("loading");

    const fetcher = assessmentSessionId
      ? getRecommendationForAttempt(assessmentSessionId)
      : getLatestRecommendation();

    fetcher
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
  }, [attempt, initialLoadState, initialSnapshot, assessmentSessionId]);

  useEffect(() => {
    if (initialAssessment !== undefined || initialSnapshot !== undefined)
      return;
    if (assessmentSessionId) {
      setAssessment(null);
      return;
    }
    let active = true;

    getCurrentAssessment()
      .then((state) => active && setAssessment(state))
      .catch(() => active && setAssessment(null));

    return () => {
      active = false;
    };
  }, [initialAssessment, initialSnapshot, assessmentSessionId]);

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

  async function handleShareResult() {
    const sessionId = assessment?.id ?? assessmentSessionId;
    if (!sessionId) return;

    setResultCardError("");
    setResultCardLoading(true);
    try {
      setResultCard(await getAssessmentResultCard(sessionId));
    } catch {
      setResultCardError("The assessment result card could not be loaded.");
    } finally {
      setResultCardLoading(false);
    }
  }

  return (
    <div className="student-grid-page student-dashboard-canvas animate-matches-enter">
      <div
        data-report-print
        className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10 md:px-8 lg:px-10"
      >
        {assessmentSessionId && snapshot ? (
          <aside
            aria-label="Historical attempt notification"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:px-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-background text-primary-ink shadow-2xs">
                <History className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Viewing recorded matches for{" "}
                  {snapshot.assessmentResultReference ??
                    `Attempt ${assessmentSessionId}`}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Generated {formatAssessmentDate(snapshot.generatedAt)}. These
                  programme matches reflect this past attempt.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Back to timeline
              </Button>
              {onViewLatest ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onViewLatest}
                  className="h-8 rounded-full border-primary/30 text-xs font-bold text-primary-ink hover:bg-primary/10"
                >
                  View latest result
                </Button>
              ) : null}
            </div>
          </aside>
        ) : null}

        <div
          style={{ alignItems: "start" }}
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(28rem,34rem)] lg:gap-12 xl:gap-14"
        >
          <section
            className="min-w-0"
            aria-labelledby="recommendation-result-title"
          >
            <div className="relative mx-auto aspect-square w-52 overflow-hidden rounded-[2rem] border-2 border-primary/20 bg-primary-fixed/30 p-3 shadow-sm sm:w-60">
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
                  className="mt-5 max-w-2xl font-display text-3xl font-black leading-[0.98] tracking-[-0.045em] text-primary-ink sm:text-4xl lg:text-5xl"
                >
                  {formatAreaList(profile.topLabels)}
                </h1>
                <p className="mt-3 font-label text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm">
                  {leadingDimensions
                    .map((d) => d.label.toUpperCase())
                    .join(" AND ")}{" "}
                  · {profile.topCode}
                </p>

                <p className="mt-5 max-w-xl text-base font-medium leading-7 text-foreground/90 sm:text-lg sm:leading-8">
                  {leadingDimensions.length === 3
                    ? `Your three leading recorded areas are ${leadingDimensions[0].label.toLowerCase()}, ${leadingDimensions[1].label.toLowerCase()}, and ${leadingDimensions[2].label.toLowerCase()}. Programme matches compare all six recorded scores with each programme's three-area profile.`
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
              </>
            ) : (
              <>
                <h1
                  id="recommendation-result-title"
                  className="mt-5 font-display text-3xl font-black leading-[0.98] tracking-[-0.045em] text-primary-ink sm:text-4xl lg:text-5xl"
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
                  <RefreshCw aria-hidden="true" className="size-4" /> Retake
                  assessment
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
                Explore all programmes{" "}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleShareResult}
                disabled={
                  resultCardLoading || !(assessment?.id ?? assessmentSessionId)
                }
                className="gap-2"
              >
                <Share2 aria-hidden="true" className="size-4" />
                {resultCardLoading ? "Loading result" : "Share result"}
              </Button>
            </div>
            {resultCardError ? (
              <p
                role="alert"
                className="mt-3 text-sm font-medium text-destructive-ink"
              >
                {resultCardError}
              </p>
            ) : null}
          </section>

          {profile ? <RecommendationProfilePanel result={profile} /> : null}

          {profile ? (
            <section
              aria-labelledby="recommended-career-paths-title"
              className="rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-7 sm:py-7 lg:col-span-2"
            >
              <div className="flex items-start gap-3 text-primary-ink">
                <Compass aria-hidden="true" className="mt-1 size-6 shrink-0" />
                <div>
                  <h2
                    id="recommended-career-paths-title"
                    className="font-display text-2xl font-extrabold leading-tight sm:text-3xl sm:leading-tight"
                  >
                    Recommended career paths
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground sm:text-base">
                    Built from your recorded pattern: {profile.topCode}
                  </p>
                </div>
              </div>

              {topCareerPaths.length > 0 ? (
                <div className="mt-7">
                  <p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-primary-ink sm:text-sm">
                    Career directions
                  </p>
                  <p className="mt-2 max-w-6xl font-display text-lg font-extrabold leading-7 text-primary-ink sm:text-xl sm:leading-8">
                    {topCareerPaths.join(", ")}
                  </p>

                  <div className="mt-6 border-t border-border pt-5">
                    <p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-primary-ink sm:text-sm">
                      Why it fits you
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground sm:text-base sm:leading-7">
                      These directions come from the catalogue entries attached
                      to your recommended programmes. They do not predict
                      employment or guarantee that a career will suit you.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-7 text-sm font-medium leading-6 text-muted-foreground sm:text-base">
                  No catalogue career directions are available for the displayed
                  programmes.
                </p>
              )}
            </section>
          ) : null}
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

          <ol className="space-y-4 sm:space-y-5">
            {snapshot.courses.map((course, index) => (
              <li key={course.id}>
                <RecommendationMatchCard
                  course={course}
                  position={index + 1}
                  onViewDetails={() => setSelectedCourse(course)}
                />
              </li>
            ))}
          </ol>
        </div>

        {retakeError ? (
          <p
            role="alert"
            className="mt-4 rounded bg-destructive/10 p-4 text-sm font-medium text-destructive-ink"
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

        <Dialog
          open={Boolean(resultCard)}
          onOpenChange={(open) => {
            if (!open) setResultCard(null);
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
              Your assessment result card
            </DialogDescription>
            {resultCard ? (
              <StudentResultCard
                card={resultCard}
                onClose={() => setResultCard(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>
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
