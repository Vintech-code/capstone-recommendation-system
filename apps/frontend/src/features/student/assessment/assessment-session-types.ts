type AssessmentSessionLoadState = "ready" | "loading" | "error" | "empty";
type AssessmentVersionState = "current" | "stale";
type AssessmentConnectionState = "online" | "offline";
type AssessmentSaveState = "saved" | "saving" | "saved-locally" | "unsaved";
type AssessmentView = "questions" | "submitting" | "completed";

export type {
  AssessmentConnectionState,
  AssessmentSaveState,
  AssessmentSessionLoadState,
  AssessmentVersionState,
  AssessmentView,
};
