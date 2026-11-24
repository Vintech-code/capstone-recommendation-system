import { TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { StudentRecommendedCourse } from "@/features/student/recommendations/recommendation-types";
import { cn } from "@/lib/utils";

interface ProgrammeEntranceGroupGuidanceProps {
  course: StudentRecommendedCourse;
  className?: string;
}

function ProgrammeEntranceGroupGuidance({
  course,
  className,
}: ProgrammeEntranceGroupGuidanceProps) {
  if (course.eligibleForDeclaredGroup !== false) return null;

  const programmeGroupLabel =
    course.eligibilityGroup === "board"
      ? "Board programme"
      : course.eligibilityGroup === "non_board"
        ? "Non-board programme"
        : "Programme";

  return (
    <div className={cn("border-l-2 border-warning pl-3", className)}>
      <Badge
        variant="warning"
        className="whitespace-normal text-left text-foreground"
      >
        <TriangleAlert aria-hidden="true" />
        {programmeGroupLabel} · admission review needed
      </Badge>
      <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-foreground">
        Your entrance-exam result is assigned to a different programme group.
        This course is still shown because it matches your interests. Check TCC
        admission requirements before choosing it.
      </p>
    </div>
  );
}

export { ProgrammeEntranceGroupGuidance };
