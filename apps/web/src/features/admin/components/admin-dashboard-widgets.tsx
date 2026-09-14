import { ArrowRight, CheckCircle2, CircleAlert, History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/features/admin/data/admin-formatters";
import type { AdminAssessment } from "@/features/admin/data/admin-api";

export function RecentStudentRow({
  item,
  color,
  onOpen,
}: {
  item: AdminAssessment;
  color: string;
  onOpen: () => void;
}) {
  const name = studentName(item);

  return (
    <tr className="transition-colors hover:bg-secondary/40">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <StudentMarker name={name} color={color} />
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground text-xs sm:text-sm">
              {name}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {item.studentEmail ?? "Email unavailable"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 font-medium text-muted-foreground">
        {entranceGroupLabel(item)}
      </td>
      <td className="px-4 py-3.5">
        {item.topCode ? (
          <span className="inline-flex items-center rounded-md border border-border/70 bg-muted/60 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
            {item.topCode}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Pending</span>
        )}
      </td>
      <td className="px-4 py-3.5 text-center">
        <StatusBadge status={item.status} />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-right text-[11px] text-muted-foreground">
        {formatDate(item.resultAvailableAt ?? item.submittedAt)}
      </td>
      <td className="px-5 py-3.5 text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg px-2.5 text-xs font-semibold hover:bg-muted"
          onClick={onOpen}
          aria-label={`Open ${name}'s Student record`}
        >
          Open <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Button>
      </td>
    </tr>
  );
}

export function StudentMarker({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black text-foreground shadow-2xs"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 20%, var(--background))`,
      }}
    >
      {initials || "ST"}
    </span>
  );
}

export function studentName(item: AdminAssessment) {
  return item.studentName ?? "Student record";
}

export function entranceGroupLabel(item: AdminAssessment) {
  if (!item.entranceExamination) return "Not declared";
  return item.entranceExamination.eligibilityGroup === "board"
    ? "Board programme group"
    : "Non-board programme group";
}

export function StatusBadge({ status }: { status: AdminAssessment["status"] }) {
  const variants = {
    in_progress: "secondary",
    preparing_result: "outline",
    result_available: "success",
    result_failed: "destructive",
  } as const;
  const labels = {
    in_progress: "In progress",
    preparing_result: "Processing",
    result_available: "Result available",
    result_failed: "Needs attention",
  };
  const Icon =
    status === "result_failed"
      ? CircleAlert
      : status === "result_available"
        ? CheckCircle2
        : History;

  return (
    <Badge
      variant={variants[status]}
      className="gap-1 whitespace-nowrap py-0.5 text-[10px] font-bold"
    >
      <Icon className="size-3" />
      {labels[status]}
    </Badge>
  );
}

