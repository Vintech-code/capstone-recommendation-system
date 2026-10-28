import type { AdminAssessment } from "@/features/admin/data/admin-api";

export function studentName(item: AdminAssessment) {
  return item.studentName ?? "Student record";
}

export function entranceGroupLabel(item: AdminAssessment) {
  if (!item.entranceExamination) return "Not declared";
  return item.entranceExamination.eligibilityGroup === "board"
    ? "Board programme group"
    : "Non-board programme group";
}
