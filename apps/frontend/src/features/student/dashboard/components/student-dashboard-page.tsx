import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Compass,
  Eye,
  History,
  Paintbrush,
  Route,
  Search,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { ErrorState, LoadingState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  getAssessmentHistory,
  getCurrentAssessment,
  retryAssessmentResult,
  type AssessmentLifecycle,
} from "@/features/student/assessment/assessment-api";
import {
  formatAssessmentDate,
  mapAssessmentResult,
} from "@/features/student/assessment/assessment-result-mapper";
import { getRiasecProfileCopy } from "@/features/student/assessment/riasec-profile-copy";
import { getProgrammeImages } from "@/features/student/programmes/programme-images";
import {
  getLatestRecommendation,
  getRecommendationForAttempt,
} from "@/features/student/recommendations/recommendation-api";
import type {
  StudentRecommendedCourse,
  StudentRecommendationState,
} from "@/features/student/recommendations/recommendation-types";
import { formatAreaList } from "@/features/student/utils/format-area-list";

interface StudentDashboardPageProps {
  onSelectModule: (moduleId: string) => void;
  initialLifecycle?: AssessmentLifecycle;
  initialRecommendations?: StudentRecommendationState;
}

const dimensionPresentation: Record<
  string,
  { icon: LucideIcon; tile: string; badge: string; accent: string }
> = {
  R: {
    icon: Eye,
    tile: "bg-primary-fixed/45",
    badge: "bg-primary/65 text-primary-foreground",
    accent: "bg-primary/65",
  },
  I: {
    icon: Search,
    tile: "bg-chart-pink/8",
    badge: "bg-chart-pink text-foreground",
    accent: "bg-chart-pink",
  },
  A: {
    icon: Paintbrush,
    tile: "bg-success/8",
    badge: "bg-success text-success-foreground",
    accent: "bg-success",
  },
  S: {
    icon: UsersRound,
    tile: "bg-secondary-container/12",
    badge: "bg-secondary-container text-on-secondary-container",
    accent: "bg-secondary-container",
  },
  E: {
    icon: ChartNoAxesColumnIncreasing,
    tile: "bg-warning/10",
    badge: "bg-warning text-warning-foreground",
    accent: "bg-warning",
  },
  C: {
    icon: ClipboardCheck,
    tile: "bg-secondary/75",
    badge: "bg-muted-foreground text-background",
    accent: "bg-muted-foreground",
  },
};

let cachedDashboardState: {
  lifecycle: AssessmentLifecycle | null;
  latestResultLifecycle: AssessmentLifecycle | null;
  recommendations: StudentRecommendationState | null;
} | null = null;

function StudentDashboardPage({
  onSelectModule,
  initialLifecycle,
  initialRecommendations,
}: StudentDashboardPageProps) {
  const initialCached = initialLifecycle
    ? {
        lifecycle: initialLifecycle,
        latestResultLifecycle:
          initialLifecycle.status === "result_available"
            ? initialLifecycle
            : null,
        recommendations: initialRecommendations ?? null,
      }
    : cachedDashboardState;

  const [lifecycle, setLifecycle] = useState<AssessmentLifecycle | null>(
    initialCached?.lifecycle ?? null,
  );
  const [latestResultLifecycle, setLatestResultLifecycle] =
    useState<AssessmentLifecycle | null>(
      initialCached?.latestResultLifecycle ?? null,
    );
  const [recommendations, setRecommendations] =
    useState<StudentRecommendationState | null>(
      initialCached?.recommendations ?? null,
    );
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    initialCached ? "ready" : "loading",
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (initialLifecycle) return;
    let active = true;
    Promise.all([
      getCurrentAssessment(),
      getLatestRecommendation().catch(() => null),
      getAssessmentHistory().catch(() => null),
    ])
      .then(async ([assessment, currentRecommendation, history]) => {
        if (!active) return;
        const latestCompleted =
          assessment.status === "result_available"
            ? assessment
            : (history?.attempts.find(
                (item: AssessmentLifecycle) => item.status === "result_available",
              ) ?? null);
        let recommendation = currentRecommendation;
        if (latestCompleted?.id && assessment.status !== "result_available") {
          recommendation = await getRecommendationForAttempt(
            latestCompleted.id,
          ).catch(() => currentRecommendation);
        }
        if (!active) return;
        cachedDashboardState = {
          lifecycle: assessment,
          latestResultLifecycle: latestCompleted,
          recommendations: recommendation,
        };
        setLifecycle(assessment);
        setLatestResultLifecycle(latestCompleted);
        setRecommendations(recommendation);
        setLoadState("ready");
      })
      .catch(() => active && setLoadState("error"));
    return () => {
      active = false;
    };
  }, [attempt, initialLifecycle]);

  useEffect(() => {
    if (initialLifecycle || lifecycle?.status !== "preparing_result") return;
    const timer = window.setInterval(() => {
      getCurrentAssessment(true)
        .then(async (current) => {
          setLifecycle(current);
          if (current.status === "result_available") {
            const recommendation = await getLatestRecommendation();
            setLatestResultLifecycle(current);
            setRecommendations(recommendation);
          }
        })
        .catch(() => undefined);
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [initialLifecycle, lifecycle?.status]);

  if (loadState === "error") {
    return (
      <DashboardFrame>
        <ErrorState
          title="We could not load your dashboard"
          description="Your saved assessment was not changed. Check your connection and try again."
          onRetry={() => {
            setLoadState("loading");
            setAttempt((value) => value + 1);
          }}
        />
      </DashboardFrame>
    );
  }
  if (loadState === "loading" || !lifecycle) {
    return (
      <DashboardFrame>
        <LoadingState
          variant="dashboard"
          title="Loading your dashboard"
          description="Restoring your latest assessment and recommendation status."
        />
      </DashboardFrame>
    );
  }
  const resultSource =
    lifecycle.status === "result_available" ? lifecycle : latestResultLifecycle;
  const result = resultSource ? mapAssessmentResult(resultSource) : null;
  const profileCopy = result ? getRiasecProfileCopy(result.topCode) : null;
  const snapshot =
    recommendations?.status === "available"
      ? recommendations.recommendation
      : null;
  const topCourse = snapshot?.courses[0] ?? null;
  const journeySteps = [
    {
      label: "Assessment completed",
      complete: Boolean(result),
      detail: result?.availableAt,
    },
    {
      label: "Review your result",
      complete: Boolean(result),
      detail: result ? "Available" : undefined,
    },
    {
      label: "Explore course matches",
      complete: Boolean(topCourse),
      detail: topCourse ? "Available" : undefined,
    },
  ];
  const journeyProgress = Math.round(
    (journeySteps.filter((step) => step.complete).length /
      journeySteps.length) *
      100,
  );
  const highestRecordedScore = result
    ? Math.max(...result.dimensions.map((dimension) => dimension.value), 1)
    : 1;
  const heroAction = result
    ? {
        label: topCourse ? "Explore your matches" : "Review your result",
        module: topCourse ? "recommendations" : "assessment",
      }
    : {
        label:
          lifecycle.status === "in_progress"
            ? "Continue your assessment"
            : "Start your journey",
        module: "assessment",
      };
  const hasActiveAssessmentWork =
    lifecycle.status === "preparing_result" ||
    lifecycle.status === "result_failed" ||
    (lifecycle.status === "in_progress" && (lifecycle.answer_count ?? 0) > 0);
  const showAssessmentLifecycleCard = !result || hasActiveAssessmentWork;

  return (
    <DashboardFrame>
      <article
        data-report-print={result ? true : undefined}
        data-testid="student-dashboard-summary"
        className="w-full space-y-5"
      >
        {result ? (
          <header data-print-only className="hidden">
            <p>TAGOLOAN COMMUNITY COLLEGE</p>
            <h2>Student Summary</h2>
            <div>
              <span>
                Interest profile:{" "}
                {profileCopy?.name ?? formatAreaList(result.topLabels)} ({result.topCode})
              </span>
              <span>Assessment completed: {result.availableAt}</span>
            </div>
          </header>
        ) : null}
        <section
          className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]"
          aria-labelledby="dashboard-journey-title"
        >
          <div className="relative min-h-[18rem] overflow-hidden px-2 py-6 sm:px-0 sm:py-7">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 52%, var(--background) 100%)",
              }}
            />
            <div className="relative z-10 flex h-full max-w-xl flex-col justify-center">
              <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-primary-ink">
                Your academic journey
              </p>
              <h1
                id="dashboard-journey-title"
                aria-label="Your journey. Your future."
                className="mt-2 font-display text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl"
              >
                Your journey.
                <br />
                <span className="bg-gradient-to-r from-primary via-brand-green to-chart-pink bg-clip-text text-transparent">
                  Your future.
                </span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                {result
                  ? `Explore programmes connected to ${formatAreaList(result.topLabels)} interests, then compare your strongest matches.`
                  : "Explore programmes connected to your interests. Start with the interest assessment."}
              </p>
              <Button
                type="button"
                className="mt-5 w-fit px-6"
                onClick={() => onSelectModule(heroAction.module)}
              >
                {heroAction.label}
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>

          <section
            aria-labelledby="journey-progress-title"
            className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0 pt-1">
                <div className="flex items-center gap-2 text-primary-ink">
                  <Route className="size-4" aria-hidden="true" />
                  <p className="font-label text-xs font-semibold uppercase tracking-[0.12em]">
                    Your progress
                  </p>
                </div>
                <h2
                  id="journey-progress-title"
                  className="mt-3 max-w-44 font-display text-xl font-bold leading-tight"
                >
                  Keep moving forward
                </h2>
              </div>
              <div
                role="progressbar"
                aria-label="Academic journey progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={journeyProgress}
                className="relative flex size-24 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(var(--primary) ${journeyProgress}%, var(--secondary) 0)`,
                }}
              >
                <span className="flex size-[4.5rem] flex-col items-center justify-center rounded-full bg-card">
                  <strong className="font-display text-2xl font-bold leading-none text-primary-ink">
                    {journeyProgress}%
                  </strong>
                  <span className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Complete
                  </span>
                </span>
              </div>
            </div>
            <ol className="mt-8 divide-y divide-outline-variant/55">
              {journeySteps.map((step) => (
                <li
                  key={step.label}
                  className="flex min-h-11 items-center gap-3 py-3 text-sm"
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full ${step.complete ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {step.complete ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 font-medium leading-snug">
                    {step.label}
                  </span>
                  <span className="max-w-28 shrink-0 truncate text-right text-xs text-muted-foreground">
                    {step.detail ?? "Pending"}
                  </span>
                </li>
              ))}
            </ol>
            {result ? (
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-outline-variant/55 pt-4">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => onSelectModule("assessment")}
                >
                  View assessment result <ArrowRight aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm text-muted-foreground"
                  onClick={() => onSelectModule("history")}
                >
                  <History aria-hidden="true" /> Assessment history
                </Button>
              </div>
            ) : null}
          </section>
        </section>

        <div
          data-print-summary-grid
          data-testid="student-journey-grid"
          className="grid items-stretch gap-4 xl:grid-cols-12"
        >
          <div className="contents">
            <CourseDirectionPanel
              course={topCourse}
              generatedAt={snapshot?.generatedAt}
              wide={!showAssessmentLifecycleCard}
              onOpen={() => onSelectModule("recommendations")}
            />
            {showAssessmentLifecycleCard ? (
              <AssessmentLifecycleCard
                lifecycle={lifecycle}
                hasCompletedResult={Boolean(result)}
                onOpenAssessment={() => onSelectModule("assessment")}
                onOpenResult={() => onSelectModule("assessment")}
                onOpenHistory={() => onSelectModule("history")}
                onRetryResult={async () => {
                  if (!lifecycle.id) return;
                  setLifecycle(await retryAssessmentResult(lifecycle.id));
                }}
              />
            ) : null}

            {result ? (
              <section
                data-print-profile
                aria-labelledby="interest-scores-title"
                className="relative h-full overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm xl:col-span-12 xl:row-start-2 sm:p-6"
              >
                <div
                  aria-hidden="true"
                  className="absolute right-6 top-6 grid grid-cols-4 gap-2 opacity-30"
                >
                  {Array.from({ length: 12 }, (_, index) => (
                    <span
                      key={index}
                      className="size-1 rounded-full bg-primary-fixed-dim"
                    />
                  ))}
                </div>
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                      <span className="flex size-7 items-center justify-center rounded bg-secondary">
                        <Compass
                          aria-hidden="true"
                          className="size-4 text-primary-ink"
                        />
                      </span>
                      Your interest pattern
                    </p>
                    <h3
                      id="interest-scores-title"
                      aria-label={profileCopy?.name ?? formatAreaList(result.topLabels)}
                      className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl"
                    >
                      {profileCopy?.name ?? formatAreaList(result.topLabels)}
                    </h3>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">
                      Top code {result.topCode} · completed {result.availableAt}
                    </p>
                  </div>
                  <span className="mr-2 bg-gradient-to-r from-primary via-chart-pink to-secondary-container bg-clip-text font-display text-5xl font-bold tracking-[-0.06em] text-transparent">
                    {result.topCode}
                  </span>
                </div>
                <dl className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {result.dimensions.map((dimension) => {
                    const presentation = dimensionPresentation[
                      dimension.code
                    ] ?? {
                      icon: Compass,
                      tile: "bg-secondary",
                      badge: "bg-primary text-primary-foreground",
                      accent: "bg-primary",
                    };
                    const Icon = presentation.icon;
                    const isPrimary =
                      dimension.code === result.topCode.split("-")[0];
                    return (
                      <div
                        key={dimension.code}
                        className={`relative min-w-0 rounded-2xl p-3 text-center ${presentation.tile} ${isPrimary ? "ring-1 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                      >
                        {isPrimary ? (
                          <BadgeCheck
                            aria-label="Primary recorded interest"
                            className="absolute -right-1.5 -top-1.5 size-5 fill-success text-success-foreground"
                          />
                        ) : null}
                        <dt>
                          <span
                            className={`mx-auto flex size-8 items-center justify-center rounded-full text-xs font-bold ${presentation.badge}`}
                          >
                            {dimension.code}
                          </span>
                          <Icon
                            aria-hidden="true"
                            className={`mx-auto mt-3 size-6 ${isPrimary ? "text-success-ink" : "text-primary-ink"}`}
                          />
                          <span className="sr-only">{dimension.label}</span>
                        </dt>
                        <dd className="mt-3 font-display text-2xl font-bold">
                          {dimension.value}
                        </dd>
                        <span className="mt-1 block truncate text-[10px] font-semibold text-foreground">
                          {dimension.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-3 block h-1 overflow-hidden rounded-full bg-card/80"
                        >
                          <span
                            className={`block h-full rounded-full ${presentation.accent}`}
                            style={{
                              width: `${Math.round((dimension.value / highestRecordedScore) * 100)}%`,
                            }}
                          />
                        </span>
                      </div>
                    );
                  })}
                </dl>
                <div className="relative mt-5 flex items-start gap-3 rounded-lg bg-secondary p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
                    <BadgeCheck aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Your highest recorded areas are{" "}
                      {formatAreaList(result.topLabels)}.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Use this pattern alongside your programme matches when
                      deciding what to explore.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </article>
    </DashboardFrame>
  );
}

function CourseDirectionPanel({
  course,
  generatedAt,
  wide = false,
  onOpen,
}: {
  course: StudentRecommendedCourse | null;
  generatedAt?: string;
  wide?: boolean;
  onOpen: () => void;
}) {
  const { cover } = getProgrammeImages(course?.id ?? "");
  return (
    <section
      data-print-recommendations
      aria-labelledby="course-direction-title"
      className={`h-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm xl:row-start-1 ${wide ? "xl:col-span-12" : "xl:col-span-7"}`}
    >
      {course ? (
        <div className="grid min-h-[17rem] sm:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="flex min-w-0 flex-col p-5 sm:p-6">
            <p className="flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary-ink">
              <Target className="size-4" aria-hidden="true" />
              Your top course match
            </p>
            <h3
              id="course-direction-title"
              className="mt-3 max-w-xl font-display text-2xl font-bold leading-tight tracking-[-0.03em] text-primary-ink sm:text-[1.75rem]"
            >
              {course.name}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              {course.summary}
            </p>

            <div className="mt-5 bg-secondary/55 p-3.5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Recommended programme
                  </p>
                  <p className="mt-1 text-sm font-bold text-primary-ink">
                    #{course.rank} <span aria-hidden="true">·</span>{" "}
                    {course.code}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-2xl font-bold leading-none text-primary-ink">
                    {course.match}%
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                    Course match
                  </p>
                </div>
              </div>
              <div
                role="progressbar"
                aria-label={`${course.name} course match`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={course.match}
                className="mt-3 h-1.5 overflow-hidden bg-background"
              >
                <div
                  className="h-full bg-success"
                  style={{ width: `${course.match}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
              {generatedAt ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Updated {formatAssessmentDate(generatedAt)}
                </p>
              ) : (
                <span />
              )}
              <Button
                data-print-hidden
                type="button"
                variant="link"
                onClick={onOpen}
                className="h-auto w-fit p-0 text-primary-ink"
              >
                View all matches <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div
            className="relative min-h-48 overflow-hidden bg-secondary sm:m-4 sm:ml-0"
            aria-hidden="true"
          >
            {cover ? (
              <img
                src={cover}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <BookOpenCheck className="absolute inset-0 m-auto size-20 text-primary-ink/25" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent" />
          </div>
        </div>
      ) : (
        <div className="min-h-[15rem] p-5 sm:p-6">
          <p className="flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary-ink">
            <Compass className="size-4" aria-hidden="true" />
            Course direction
          </p>
          <h3
            id="course-direction-title"
            className="mt-2 font-display text-2xl font-semibold"
          >
            Your strongest match will appear here
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Complete the interest assessment to generate course matches from the
            current TCC catalogue.
          </p>
        </div>
      )}
    </section>
  );
}

function DashboardFrame({ children }: { children: ReactNode }) {
  return (
    <div className="student-grid-page student-dashboard-canvas">
      <div className="student-page pb-12 pt-4 sm:pt-6">{children}</div>
    </div>
  );
}

function AssessmentLifecycleCard({
  lifecycle,
  hasCompletedResult,
  onOpenAssessment,
  onOpenResult,
  onOpenHistory,
  onRetryResult,
}: {
  lifecycle: AssessmentLifecycle;
  hasCompletedResult: boolean;
  onOpenAssessment: () => void;
  onOpenResult: () => void;
  onOpenHistory: () => void;
  onRetryResult: () => Promise<void>;
}) {
  const progress = Math.round(
    ((lifecycle.answer_count ?? 0) / Math.max(1, lifecycle.question_count)) *
      100,
  );
  const isProgress = lifecycle.status === "in_progress";
  const isPreparing = lifecycle.status === "preparing_result";
  const isFailed = lifecycle.status === "result_failed";
  const isAvailable = lifecycle.status === "result_available";
  const isEmptyRetake =
    isProgress && hasCompletedResult && (lifecycle.answer_count ?? 0) === 0;
  const heading = isEmptyRetake
    ? "Your result is available"
    : isProgress && hasCompletedResult
      ? "Retake in progress"
      : isProgress
        ? "Continue your assessment"
        : isPreparing
          ? "Finalizing your submission"
          : isFailed
            ? "Result processing needs attention"
            : isAvailable
              ? "Your result is available"
              : "Start your interest assessment";
  const description = isEmptyRetake
    ? "Your completed result remains available. A new retake has no saved answers, so it is not counted as assessment progress."
    : isProgress
      ? `${lifecycle.answer_count ?? 0} of ${lifecycle.question_count} questions answered. Your saved session will resume automatically.`
      : isPreparing
        ? "Your submitted answers are being processed. Your latest completed result remains visible beside this status."
        : isFailed
          ? "Your answers are safe, but result processing could not finish."
          : isAvailable
            ? "Review your profile and programme matches, or open your earlier attempts."
            : `Answer ${lifecycle.question_count} interest questions to build your RIASEC profile.`;
  return (
    <section
      data-print-hidden
      aria-labelledby="current-assessment-title"
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm xl:col-span-5 xl:row-start-1"
    >
      <div className="p-5 sm:p-6">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary-ink">
          {isPreparing ? (
            <Clock3 className="size-5" />
          ) : (
            <ClipboardList className="size-5" />
          )}
        </span>
        <p className="mt-3 font-label text-xs font-semibold uppercase tracking-[0.12em] text-primary-ink">
          Your current assessment
        </p>
        <h2
          id="current-assessment-title"
          className="mt-2 font-display text-2xl font-semibold"
        >
          {heading}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {isProgress && !isEmptyRetake ? (
          <div className="mt-5 max-w-xl">
            <div className="flex justify-between text-sm font-bold">
              <span>
                {hasCompletedResult ? "Retake progress" : "Assessment progress"}
              </span>
              <span>{progress}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Saved assessment progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-auto grid gap-2 p-5 pt-2 sm:p-6 sm:pt-2">
        {isFailed ? (
          <Button type="button" onClick={() => void onRetryResult()}>
            Try processing again
            <ArrowRight />
          </Button>
        ) : !isPreparing ? (
          <Button
            type="button"
            onClick={
              isAvailable || isEmptyRetake ? onOpenResult : onOpenAssessment
            }
          >
            {isEmptyRetake
              ? "View latest result"
              : isProgress
                ? "Resume assessment"
                : isAvailable
                  ? "View assessment result"
                  : "Start assessment"}
            <ArrowRight />
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={onOpenHistory}>
          <History aria-hidden="true" />
          Assessment history
        </Button>
      </div>
    </section>
  );
}

export { AssessmentHistorySummary } from '@/features/student/assessment/components/student-assessment-history-summary';
export { StudentDashboardPage };
