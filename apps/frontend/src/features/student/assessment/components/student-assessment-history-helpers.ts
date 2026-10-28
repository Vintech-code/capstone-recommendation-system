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
  const topCodes = sorted.slice(0, 3).map((dimension) => dimension.code);

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
    topDimensions: sorted.slice(0, 3),
    dimensions,
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
