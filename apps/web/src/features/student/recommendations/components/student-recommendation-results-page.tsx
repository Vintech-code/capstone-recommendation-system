import { BookOpenCheck, History, Share2 } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AssessmentLifecycle } from "@/features/student/assessment/assessment-api";
import { RetakeAssessmentDialog } from "@/features/student/assessment/components/retake-assessment-dialog";
import { StudentResultCard } from "@/features/student/assessment/components/student-result-card";
import { formatAssessmentDate } from "@/features/student/assessment/assessment-result-mapper";
import { RecommendationCareerPaths } from "@/features/student/recommendations/components/recommendation-career-paths";
import { RecommendationProfilePanel } from "@/features/student/recommendations/components/recommendation-profile-panel";
import { RecommendationRankedList } from "@/features/student/recommendations/components/recommendation-ranked-list";
import { RecommendationResultsSummary } from "@/features/student/recommendations/components/recommendation-results-summary";
import { StudentRecommendationDetailPage } from "@/features/student/recommendations/components/student-recommendation-detail-page";
import {
  useStudentRecommendationResults,
  type RecommendationLoadState,
} from "@/features/student/recommendations/hooks/use-student-recommendation-results";
import type {
  StudentRecommendedCourse,
  StudentRecommendationSnapshot,
} from "@/features/student/recommendations/recommendation-types";
import { getTopCareerPaths } from "@/features/student/recommendations/utils/recommendation-result-utils";

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
  const [selectedCourse, setSelectedCourse] =
    useState<StudentRecommendedCourse | null>(null);
  const results = useStudentRecommendationResults({
    assessmentSessionId,
    initialAssessment,
    initialLoadState,
    initialSnapshot,
    onOpenAssessment,
  });
  const profile = results.snapshot?.profile ?? results.assessmentResult ?? null;
  const topCareerPaths = useMemo(
    () => getTopCareerPaths(results.snapshot?.courses ?? []),
    [results.snapshot],
  );

  if (results.loadState === "loading") {
    return (
      <LoadingState
        variant="recommendations"
        title="Loading your academic matches"
        description="Connecting your completed assessment to its programme ranking."
      />
    );
  }
  if (results.loadState === "error") {
    return (
      <ErrorState
        title="We could not load your academic matches"
        description="Check your connection and try again."
        onRetry={results.retry}
      />
    );
  }
  if (results.loadState === "pending") {
    return (
      <RecommendationState
        onBack={onBack}
        title="Your matches are being prepared"
        description="Your assessment is complete. The programme ranking will appear here when processing finishes."
      />
    );
  }
  if (results.loadState === "empty" || !results.snapshot) {
    return (
      <RecommendationState
        onBack={onBack}
        title="No academic matches yet"
        description="Complete your interest assessment to generate your matched TCC programmes."
      />
    );
  }

  const snapshot = results.snapshot;
  const exploreProgrammes = () =>
    (onExploreProgrammes ?? (() => onBack()))(snapshot.courses);

  if (selectedCourse) {
    return (
      <StudentRecommendationDetailPage
        course={selectedCourse}
        generatedAt={formatAssessmentDate(snapshot.generatedAt)}
        onBack={() => setSelectedCourse(null)}
        onExploreProgrammes={exploreProgrammes}
      />
    );
  }

  return (
    <div className="student-grid-page student-dashboard-canvas animate-matches-enter">
      <div
        data-report-print
        className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10 md:px-8 lg:px-10"
      >
        {assessmentSessionId ? (
          <HistoricalAttemptBanner
            assessmentSessionId={assessmentSessionId}
            snapshot={snapshot}
            onBack={onBack}
            onViewLatest={onViewLatest}
          />
        ) : null}

        <div
          style={{ alignItems: "start" }}
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(28rem,34rem)] lg:gap-12 xl:gap-14"
        >
          <RecommendationResultsSummary
            profile={profile}
            snapshot={snapshot}
            canRetake={Boolean(onOpenAssessment)}
            canShare={Boolean(results.assessment?.id ?? assessmentSessionId)}
            resultCardLoading={results.resultCardLoading}
            resultCardError={results.resultCardError}
            onRetake={() => results.setRetakeOpen(true)}
            onExploreProgrammes={exploreProgrammes}
            onShareResult={results.shareResult}
          />
          {profile ? <RecommendationProfilePanel result={profile} /> : null}
          {profile ? (
            <RecommendationCareerPaths
              profileCode={profile.topCode}
              careerPaths={topCareerPaths}
            />
          ) : null}
        </div>

        <RecommendationRankedList
          snapshot={snapshot}
          onSelectCourse={setSelectedCourse}
        />

        <div className="mt-8 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={results.shareResult}
            disabled={
              results.resultCardLoading ||
              !(results.assessment?.id ?? assessmentSessionId)
            }
            className="gap-2"
          >
            <Share2 aria-hidden="true" className="size-4" />
            {results.resultCardLoading ? "Loading result" : "Share result"}
          </Button>
        </div>

        {results.resultCardError ? (
          <p
            role="alert"
            className="mt-3 text-sm font-medium text-destructive-ink"
          >
            {results.resultCardError}
          </p>
        ) : null}

        {results.retakeError ? (
          <p
            role="alert"
            className="mt-4 rounded bg-destructive/10 p-4 text-sm font-medium text-destructive-ink"
          >
            {results.retakeError}
          </p>
        ) : null}

        <RetakeAssessmentDialog
          open={results.retakeOpen}
          onOpenChange={results.setRetakeOpen}
          description="Your latest completed result and recommendations will remain available while the new attempt is in progress."
          onConfirm={results.confirmRetake}
        />

        <Dialog
          open={Boolean(results.resultCard)}
          onOpenChange={(open) => !open && results.setResultCard(null)}
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
            {results.resultCard ? (
              <StudentResultCard
                card={results.resultCard}
                onClose={() => results.setResultCard(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

interface HistoricalAttemptBannerProps {
  assessmentSessionId: number;
  snapshot: StudentRecommendationSnapshot;
  onBack: () => void;
  onViewLatest?: () => void;
}

function HistoricalAttemptBanner({
  assessmentSessionId,
  snapshot,
  onBack,
  onViewLatest,
}: HistoricalAttemptBannerProps) {
  return (
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
