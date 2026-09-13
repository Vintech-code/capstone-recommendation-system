import { Grid, html } from "gridjs";
import { useEffect, useMemo, useRef } from "react";

import { formatDate, humanize } from "@/features/admin/data/admin-formatters";
import type { AdminStudent } from "@/features/admin/data/admin-api";

interface AdminStudentGridProps {
  students: AdminStudent[];
  onOpenStudent: (studentId: number) => void;
}

function AdminStudentGrid({ students, onOpenStudent }: AdminStudentGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const openStudentRef = useRef(onOpenStudent);
  const rows = useMemo(() => students.map(toGridRow), [students]);

  useEffect(() => {
    openStudentRef.current = onOpenStudent;
  }, [onOpenStudent]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const grid = new Grid({
      columns: [
        { name: "Student", width: "24%" },
        { name: "Journey state", width: "18%" },
        { name: "Assessment evidence", width: "21%" },
        { name: "Recommendation", width: "16%" },
        { name: "Last activity", width: "13%" },
        { name: "Action", width: "8%" },
      ],
      data: rows,
      search: false,
      sort: false,
      pagination: false,
      language: { noRecordsFound: "No student records match" },
    });

    function handleOpen(event: MouseEvent) {
      const trigger = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-open-student]",
      );
      if (!trigger) return;
      const studentId = Number(trigger.dataset.openStudent);
      if (Number.isInteger(studentId)) openStudentRef.current(studentId);
    }

    container.addEventListener("click", handleOpen);
    grid.render(container);

    return () => {
      container.removeEventListener("click", handleOpen);
      grid.destroy();
    };
  }, [rows]);

  return (
    <div
      ref={containerRef}
      className="admin-grid"
      data-testid="admin-student-grid"
    />
  );
}

function toGridRow(student: AdminStudent) {
  return [
    html(renderStudentIdentity(student)),
    html(renderJourneyState(student)),
    html(renderAssessmentEvidence(student)),
    html(renderRecommendationEvidence(student)),
    formatDate(student.lastActivityAt),
    html(
      `<button type="button" class="admin-grid-open" data-open-student="${student.id}">Open<span aria-hidden="true">→</span></button>`,
    ),
  ];
}

function renderStudentIdentity(student: AdminStudent) {
  const name = escapeHtml(student.name);
  const avatar = student.photoUrl
    ? `<img src="${escapeHtml(student.photoUrl)}" alt="${name}" class="admin-grid-avatar" />`
    : `<span class="admin-grid-initials">${escapeHtml(getInitials(student.name))}</span>`;
  return `<div class="admin-grid-student">${avatar}<span class="admin-grid-student-copy"><strong>${name}</strong><span>${escapeHtml(student.email)}</span></span></div>`;
}

function renderJourneyState(student: AdminStudent) {
  const label = getStatusLabel(student.currentAssessmentStatus);
  const tone = getStatusTone(student.currentAssessmentStatus);
  const detail =
    student.declarationStatus === "declared"
      ? `${student.selfDeclaredScore} · ${humanize(student.eligibilityGroup ?? "")}`
      : "Entrance result not declared";
  return `<div><span class="admin-grid-badge admin-grid-badge-${tone}">${escapeHtml(label)}</span><span class="admin-grid-detail">${escapeHtml(detail)}</span></div>`;
}

function renderAssessmentEvidence(student: AdminStudent) {
  const retakeCount =
    student.retakeCount ??
    Math.max(0, (student.completedAssessmentCount ?? 0) - 1);
  const retakeLabel =
    retakeCount > 0
      ? ` · ${retakeCount} retake${retakeCount === 1 ? "" : "s"}`
      : "";
  return `<div class="admin-grid-evidence"><span><strong>${student.attemptCount}</strong> attempt${student.attemptCount === 1 ? "" : "s"}${escapeHtml(retakeLabel)}</span><span>RIASEC ${escapeHtml(student.latestTopCode ?? "pending")}</span></div>`;
}

function renderRecommendationEvidence(student: AdminStudent) {
  const label = student.recommendationAvailable ? "Available" : "Pending";
  const tone = student.recommendationAvailable ? "success" : "neutral";
  return `<div><span class="admin-grid-badge admin-grid-badge-${tone}">${label}</span><span class="admin-grid-detail">${student.savedProgrammeCount} saved</span></div>`;
}

function getStatusLabel(status: AdminStudent["currentAssessmentStatus"]) {
  const labels = {
    not_started: "Not started",
    in_progress: "In progress",
    preparing_result: "Processing",
    result_available: "Result available",
    result_failed: "Needs attention",
  };
  return labels[status];
}

function getStatusTone(status: AdminStudent["currentAssessmentStatus"]) {
  if (status === "result_available") return "success";
  if (status === "result_failed") return "danger";
  if (status === "in_progress" || status === "preparing_result")
    return "warning";
  return "neutral";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  };
  return value.replace(/[&<>'"]/g, (character) => entities[character]);
}

export { AdminStudentGrid };
