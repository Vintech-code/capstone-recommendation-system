import type {
  AssessmentLifecycle,
  ResultCardData,
} from "@/features/student/assessment/assessment-api";
import { mapAssessmentResult } from "@/features/student/assessment/assessment-result-mapper";

export function toResultCardData(
  attempt: AssessmentLifecycle,
  studentName = "Student Applicant",
): ResultCardData | null {
  const result = mapAssessmentResult(attempt);
  if (!result || !attempt.id) return null;

  const dimensions = result.dimensions.map((dimension) => ({
    code: dimension.code,
    label: dimension.label,
    value: dimension.value,
  }));
  const sorted = [...dimensions].sort((a, b) => b.value - a.value);
  let previousValue: number | null = null;
  let rank = 0;
  const ranked = sorted.map((dimension, index) => {
    if (previousValue === null || dimension.value !== previousValue) rank = index + 1;
    previousValue = dimension.value;
    return { ...dimension, rank };
  });
  const rankCounts = new Map<number, number>();
  ranked.forEach((dimension) => rankCounts.set(dimension.rank, (rankCounts.get(dimension.rank) ?? 0) + 1));
  const rankedWithTies = ranked.map((dimension) => ({ ...dimension, isTied: (rankCounts.get(dimension.rank) ?? 0) > 1 }));
  const profileVariantCodes = new Set(result.profileVariants?.flatMap((variant) => variant.codes) ?? []);
  const topDimensions = profileVariantCodes.size > 0
    ? rankedWithTies.filter((dimension) => profileVariantCodes.has(dimension.code))
    : rankedWithTies.filter((dimension) => dimension.rank <= 3);
  const topCodes = result.topCode.split("-");

  return {
    id: attempt.id,
    reference: attempt.reference ?? `ASMT-${String(attempt.id).padStart(6, "0")}`,
    studentName,
    attemptNumber: attempt.attempt_number ?? 1,
    isCurrent: Boolean(attempt.is_current),
    instrumentCode: attempt.instrument_code ?? "tcc-uhcc-riasec-42-v1",
    status: attempt.status,
    startedAt: attempt.started_at,
    submittedAt: attempt.submitted_at,
    resultAvailableAt: attempt.result_available_at,
    topCode: topCodes.join(""),
    formattedTopCode: topCodes.join("-"),
    topDimensions,
    profileVariantVersion: result.profileVariantVersion,
    profileVariants: result.profileVariants,
    dimensions: dimensions.map((dimension) => rankedWithTies.find((rankedDimension) => rankedDimension.code === dimension.code) ?? dimension),
    scoringVersion:
      attempt.result?.scoring_source ??
      attempt.result?.instrument_code ??
      "RIASEC-OQ42-2026-01",
    guidanceVersion:
      attempt.result?.guidance?.version ?? "METHODOLOGY-PROPOSED-2026-01",
    disclaimer:
      "This assessment result reflects your self-reported vocational interest profile.",
    shareToken: attempt.share_token,
    sharedAt: attempt.shared_at,
  };
}

export function assessmentStatusLabel(status: AssessmentLifecycle["status"]) {
  return {
    not_started: "Not started",
    in_progress: "In progress",
    preparing_result: "Finalizing submission",
    result_failed: "Result unavailable",
    result_available: "Result available",
  }[status];
}
