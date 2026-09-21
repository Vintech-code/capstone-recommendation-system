import { getCurrentAssessment, type AssessmentLifecycle } from "@/features/student/assessment/assessment-api";
import type { AssessmentResponseValue } from "@/features/student/assessment/assessment-types";
import type { AssessmentSaveState } from "@/features/student/assessment/assessment-session-types";

const assessmentSessionStorageKey = "tcc-guidance:student-assessment-session";

function readStoredAnswers(): Record<string, AssessmentResponseValue> {
  try {
    const stored = window.localStorage.getItem(assessmentSessionStorageKey);
    return stored ? (JSON.parse(stored) as Record<string, AssessmentResponseValue>) : {};
  } catch {
    return {};
  }
}

async function waitForAssessmentResult(): Promise<AssessmentLifecycle> {
  let lifecycle = await getCurrentAssessment(true);
  for (let attempt = 0; attempt < 20 && lifecycle.status === "preparing_result"; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 750));
    lifecycle = await getCurrentAssessment(true);
  }
  return lifecycle;
}

function formatEntranceScoreInput(value: string, decimalPlaces: number) {
  const digits = value.replace(/\D/g, "").slice(0, 1 + decimalPlaces);
  if (digits.length <= 1) return digits;
  return `${digits.slice(0, 1)}.${digits.slice(1)}`;
}

function getSaveStatus(saveState: AssessmentSaveState) {
  if (saveState === "saving") return { label: "Saving...", tone: "info" as const };
  if (saveState === "saved-locally") return { label: "Saved on device", tone: "warning" as const };
  if (saveState === "unsaved") return { label: "Not saved", tone: "danger" as const };
  return { label: "Saved", tone: "success" as const };
}

function getResponseOptionDescription(label: string) {
  const normalized = label.toLowerCase();
  if (normalized === "strongly like") return "I would really enjoy doing this activity.";
  if (normalized === "like") return "I would enjoy doing this activity.";
  if (normalized === "unsure") return "I am not sure how I feel about this activity.";
  if (normalized === "dislike") return "I would not enjoy doing this activity.";
  if (normalized === "strongly dislike") return "I would strongly dislike doing this activity.";
  return "";
}

export {
  assessmentSessionStorageKey,
  formatEntranceScoreInput,
  getResponseOptionDescription,
  getSaveStatus,
  readStoredAnswers,
  waitForAssessmentResult,
};
