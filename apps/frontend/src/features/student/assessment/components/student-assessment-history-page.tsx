import {
  Compass,
  History,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ErrorState, LoadingState } from "@/components/shared";
import {
  getAssessmentHistory,
  getCurrentAssessment,
  startAssessment,
  type AssessmentHistoryResponse,
  type AssessmentLifecycle,
} from "@/features/student/assessment/assessment-api";
import {
  formatAssessmentDate,
  mapAssessmentResult,
} from "@/features/student/assessment/assessment-result-mapper";
import { getRiasecProfileCopy } from "@/features/student/assessment/riasec-profile-copy";
import { StudentPageHeader } from "@/features/student/components/student-page-header";
import { AssessmentHistorySummary } from "@/features/student/assessment/components/student-assessment-history-summary";
import { getRecommendationForAttempt } from "@/features/student/recommendations/recommendation-api";
import type { StudentRecommendationState } from "@/features/student/recommendations/recommendation-types";

interface StudentAssessmentHistoryPageProps {
  onBack: () => void;
  onOpenAssessment: () => void;
  onExploreMatches?: (assessmentSessionId?: number) => void;
}

function StudentAssessmentHistoryPage({
  onBack,
  onOpenAssessment,
  onExploreMatches,
}: StudentAssessmentHistoryPageProps) {
  const [lifecycle, setLifecycle] = useState<AssessmentLifecycle | null>(null);
  const [history, setHistory] = useState<AssessmentHistoryResponse | null>(
    null,
  );
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [historyError, setHistoryError] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(
    null,
  );
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<StudentRecommendationState | null>(null);
  const [selectedRecommendationState, setSelectedRecommendationState] =
    useState<"idle" | "loading" | "error">("idle");

  async function loadHistory() {
    setHistoryError(false);
    const attempts = await getAssessmentHistory();
    setHistory(attempts);
    return attempts;
  }

  useEffect(() => {
    let active = true;
    Promise.all([getCurrentAssessment(), getAssessmentHistory()])
      .then(([current, attempts]) => {
        if (!active) return;
        setLifecycle(current);
        setHistory(attempts);
        setLoadState("ready");
      })
      .catch(() => active && setLoadState("error"));
    return () => {
      active = false;
    };
  }, []);

  async function selectAttempt(assessmentSessionId: number) {
    setSelectedAttemptId(assessmentSessionId);
    setSelectedRecommendation(null);
    setSelectedRecommendationState("loading");
    try {
      setSelectedRecommendation(
        await getRecommendationForAttempt(assessmentSessionId),
      );
      setSelectedRecommendationState("idle");
    } catch {
      setSelectedRecommendationState("error");
    }
  }

  if (loadState === "loading") {
    return (
      <div className="student-page py-8">
        <LoadingState
          variant="dashboard"
          title="Loading assessment history"
          description="Restoring your recorded attempts."
        />
      </div>
    );
  }

  if (loadState === "error" || !lifecycle) {
    return (
      <div className="student-page py-8">
        <ErrorState
          title="Assessment history could not be loaded"
          description="Your assessment records were not changed. Check your connection and try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const latestCompleted =
    history?.attempts.find((item) => item.status === "result_available") ?? null;
  const latestResult = latestCompleted ? mapAssessmentResult(latestCompleted) : null;
  const profileCopy = latestResult?.topCode
    ? getRiasecProfileCopy(latestResult.topCode)
    : null;
  const entranceExam =
    latestCompleted?.entrance_examination ?? lifecycle.entrance_examination;
  const totalAttempts = history?.attempts.length ?? 0;
  const availableDate = formatAssessmentDate(lifecycle.retake_available_at);

  return (
    <div className="student-grid-page min-h-[calc(100vh-5rem)] py-4 sm:py-6">
      <div className="student-page">
        <StudentPageHeader
          title="Assessment history"
          description="Review your completed assessment attempts and track vocational growth over time."
          onBack={onBack}
        />

        {/* Overview Metric Banner */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Metric 1: Total Recorded Attempts */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-ink">
              <History className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Recorded attempts
              </p>
              <p className="font-display text-lg font-black text-foreground">
                {totalAttempts} {totalAttempts === 1 ? "Attempt" : "Attempts"}
              </p>
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                Immutable audit history
              </p>
            </div>
          </div>

          {/* Metric 2: Active Profile Archetype */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-foreground">
              <Compass className="size-5 text-accent-ink" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Active Holland code
              </p>
              <p className="truncate font-display text-lg font-black text-foreground">
                {latestResult?.topCode ? latestResult.topCode : "Pending"}
              </p>
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                {profileCopy?.name ?? "Vocational interest profile"}
              </p>
            </div>
          </div>

          {/* Metric 3: Declared Entrance Exam */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info/15 text-foreground">
              <UserCheck className="size-5 text-info-ink" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Entrance examination
              </p>
              <p className="font-display text-lg font-black text-foreground">
                {entranceExam?.score ? Number(entranceExam.score).toFixed(2) : "Declared"}
              </p>
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                {entranceExam?.eligibility_group === "board"
                  ? "Board programme eligible"
                  : "Non-board pathway"}
              </p>
            </div>
          </div>

          {/* Metric 4: Retake Readiness */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/15 text-primary-ink">
              <RotateCcw className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Retake status
              </p>
              <p className="truncate font-display text-lg font-black text-foreground">
                {lifecycle.can_retake
                  ? "Eligible to retake"
                  : lifecycle.status === "in_progress"
                    ? "In progress"
                    : "Policy waiting"}
              </p>
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                {lifecycle.can_retake
                  ? "New attempt allowed"
                  : lifecycle.retake_available_at
                    ? `Available ${availableDate}`
                    : "Recorded attempt locked"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-6">
          <AssessmentHistorySummary
            history={history}
            historyError={historyError}
            lifecycle={lifecycle}
            selectedAttemptId={selectedAttemptId}
            selectedRecommendation={selectedRecommendation}
            selectedRecommendationState={selectedRecommendationState}
            onSelectAttempt={selectAttempt}
            onResumeAssessment={onOpenAssessment}
            onExploreMatches={onExploreMatches}
            onRetryHistory={() => {
              void loadHistory().catch(() => setHistoryError(true));
            }}
            onStartRetake={async (reason) => {
              const next = await startAssessment(reason);
              setLifecycle(next);
              await loadHistory();
              onOpenAssessment();
            }}
          />
        </div>
      </div>
    </div>
  );
}

export { StudentAssessmentHistoryPage };
