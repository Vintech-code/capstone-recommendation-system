import { ArrowRight, BellRing } from "lucide-react";
import { useEffect, useState } from "react";

import type { AdminOverview } from "@/features/admin/data/admin-types";
import { apiDataRequest } from "@/services/api-client";

export function useAdminPendingCorCount(enabled: boolean): number {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    apiDataRequest<AdminOverview>("/api/v1/admin/overview")
      .then((data) => {
        if (active) setPendingCount(data?.pendingCorCount ?? 0);
      })
      .catch(() => {
        // Non-blocking in unit tests
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return pendingCount;
}

interface AdminCorNotificationBannerProps {
  pendingCount: number;
  onReviewStudents: () => void;
}

export function AdminCorNotificationBanner({
  pendingCount,
  onReviewStudents,
}: AdminCorNotificationBannerProps) {
  if (pendingCount <= 0) {
    return null;
  }

  return (
    <div className="border-b border-border/60 bg-background/80 px-4 py-2.5 sm:px-5 lg:px-6">
      <button
        type="button"
        onClick={onReviewStudents}
        className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/15 px-4 py-2.5 text-left text-xs text-warning-ink transition-colors hover:bg-warning/20 sm:text-sm"
      >
        <div className="flex items-center gap-2.5">
          <BellRing aria-hidden="true" className="size-4 shrink-0" />
          <span className="font-semibold">
            {pendingCount} student applicant{pendingCount === 1 ? " has" : "s have"} pending COR verification
            {pendingCount === 1 ? "" : "s"}.
          </span>
        </div>
        <span className="inline-flex items-center gap-1 font-display font-bold underline-offset-4 hover:underline">
          Review Students
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </span>
      </button>
    </div>
  );
}
