import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportCohortBubbleCardProps {
  board: number;
  nonBoard: number;
  retakes: number;
  totalAttempts: number;
  saveToRunRatio: number;
}

export function ReportCohortBubbleCard({
  board,
  nonBoard,
  retakes,
  totalAttempts,
  saveToRunRatio,
}: ReportCohortBubbleCardProps) {
  const [viewMode, setViewMode] = useState<"summary" | "percentage">("summary");

  const totalDeclared = Math.max(1, board + nonBoard);
  const boardPct = Math.round((board / totalDeclared) * 100);
  const nonBoardPct = Math.round((nonBoard / totalDeclared) * 100);
  const retakePct = Math.min(
    100,
    Math.round((retakes / Math.max(1, totalAttempts)) * 100),
  );

  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs sm:p-7">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h2 className="font-display text-lg font-extrabold text-foreground sm:text-xl">
            Cohort & Entrance Guidance
          </h2>
          <p className="text-xs text-muted-foreground">
            Track declared eligibility & retakes
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1 rounded-full border border-border/80 bg-secondary/70 px-3 py-1 text-xs font-bold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <span>{viewMode === "summary" ? "Summary" : "Percentage"}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => setViewMode("summary")}
              className="cursor-pointer text-xs font-bold"
            >
              Summary
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setViewMode("percentage")}
              className="cursor-pointer text-xs font-bold"
            >
              Percentage
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bubble Cluster + Stats Side-by-Side using System Palette */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
        {/* Left: Overlapping Circle Bubble Cluster (3 breakdown categories) */}
        <div className="flex items-center justify-center sm:col-span-5">
          <div className="relative flex h-36 w-36 items-center justify-center">
            {/* Bubble 1: Main primary green bubble (Board-eligible) */}
            <div className="absolute top-2 left-2 flex size-18 items-center justify-center rounded-full bg-primary font-display text-lg font-black text-primary-foreground shadow-md shadow-primary/25">
              {viewMode === "summary" ? board : `${boardPct}%`}
            </div>

            {/* Bubble 2: Warm warning bubble (Non-board) */}
            <div className="absolute bottom-2 right-2 flex size-16 items-center justify-center rounded-full bg-warning font-display text-base font-black text-warning-foreground shadow-md shadow-warning/25">
              {viewMode === "summary" ? nonBoard : `${nonBoardPct}%`}
            </div>

            {/* Bubble 3: Soft mauve/info bubble (Retakes) */}
            <div className="absolute top-1 right-2 flex size-13 items-center justify-center rounded-full bg-info font-display text-xs font-black text-info-foreground shadow-sm shadow-info/25">
              {viewMode === "summary" ? retakes : `${retakePct}%`}
            </div>
          </div>
        </div>

        {/* Right: Breakdown List with System Supporting Colors */}
        <div className="space-y-3 sm:col-span-7">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" />
                Board-eligible group
              </span>
              <span className="text-foreground tabular-nums">
                {viewMode === "summary" ? board : `${boardPct}% (${board})`}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${boardPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-warning" />
                Non-board group
              </span>
              <span className="text-foreground tabular-nums">
                {viewMode === "summary" ? nonBoard : `${nonBoardPct}% (${nonBoard})`}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-warning"
                style={{ width: `${nonBoardPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-info" />
                Retake sessions
              </span>
              <span className="text-foreground tabular-nums">
                {viewMode === "summary" ? retakes : `${retakePct}% (${retakes})`}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-info"
                style={{ width: `${retakePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test & Accessibility Compliance Tag */}
      <div
        role="img"
        aria-label={`Board eligible: ${board}, non-board eligible: ${nonBoard}`}
        className="sr-only"
      />

      {/* Engagement Metric Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="text-xs font-semibold text-muted-foreground">
          Saves per 100 recommendation runs
        </span>
        <strong className="font-display text-lg font-black text-foreground">
          {saveToRunRatio}
        </strong>
      </div>
    </div>
  );
}
