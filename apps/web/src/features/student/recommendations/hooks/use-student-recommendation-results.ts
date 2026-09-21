import { useEffect, useMemo, useState } from "react";

import {
  getAssessmentResultCard,
  getCurrentAssessment,
  startAssessment,
  type AssessmentLifecycle,
  type ResultCardData,
} from "@/features/student/assessment/assessment-api";
import { mapAssessmentResult } from "@/features/student/assessment/assessment-result-mapper";
import {
  getLatestRecommendation,
  getRecommendationForAttempt,
} from "@/features/student/recommendations/recommendation-api";
import type { StudentRecommendationSnapshot } from "@/features/student/recommendations/recommendation-types";

type RecommendationLoadState =
  | "ready"
  | "loading"
  | "error"
  | "empty"
  | "pending";

interface UseStudentRecommendationResultsOptions {
  initialLoadState: RecommendationLoadState;
  initialSnapshot?: StudentRecommendationSnapshot | null;
  initialAssessment?: AssessmentLifecycle | null;
  assessmentSessionId?: number | null;
  onOpenAssessment?: () => void;
}

function useStudentRecommendationResults({
  initialLoadState,
  initialSnapshot,
  initialAssessment,
  assessmentSessionId,
  onOpenAssessment,
}: UseStudentRecommendationResultsOptions) {
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
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [retakeOpen, setRetakeOpen] = useState(false);
  const [retakeError, setRetakeError] = useState("");
  const [resultCard, setResultCard] = useState<ResultCardData | null>(null);
  const [resultCardLoading, setResultCardLoading] = useState(false);
  const [resultCardError, setResultCardError] = useState("");

  useEffect(() => {
    if (initialSnapshot !== undefined || initialLoadState !== "ready") return;
    let active = true;
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
  }, [assessmentSessionId, initialLoadState, initialSnapshot, retryAttempt]);

  useEffect(() => {
    if (
      initialAssessment !== undefined ||
      initialSnapshot !== undefined ||
      assessmentSessionId
    ) {
      return;
    }
    let active = true;

    getCurrentAssessment()
      .then((state) => active && setAssessment(state))
      .catch(() => active && setAssessment(null));

    return () => {
      active = false;
    };
  }, [assessmentSessionId, initialAssessment, initialSnapshot]);

  const assessmentResult = useMemo(
    () => (assessment ? mapAssessmentResult(assessment) : null),
    [assessment],
  );

  function retry() {
    setLoadState("loading");
    setRetryAttempt((value) => value + 1);
  }

  async function shareResult() {
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

  async function confirmRetake(reason?: string) {
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
  }

  return {
    assessment,
    assessmentResult,
    confirmRetake,
    loadState,
    resultCard,
    resultCardError,
    resultCardLoading,
    retakeError,
    retakeOpen,
    retry,
    setResultCard,
    setRetakeOpen,
    shareResult,
    snapshot,
  };
}

export { useStudentRecommendationResults };
export type { RecommendationLoadState };
