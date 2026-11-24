import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const activityChartConfig = {
  started: {
    label: "Started assessments",
    color: "var(--chart-slate)",
  },
  completed: {
    label: "Completed assessments",
    color: "var(--primary)",
  },
  saved: {
    label: "Saved programmes",
    color: "var(--chart-yellow)",
  },
} satisfies ChartConfig;

interface ReportActivityCardProps {
  items: Array<{
    month: string;
    count: number;
    volume?: number;
    started?: number;
    saved?: number;
    completed?: number;
  }>;
  recommendationsTotal?: number;
  className?: string;
}

export function ReportActivityCard({
  items,
  className,
}: ReportActivityCardProps) {
  const [periodFilter, setPeriodFilter] = useState<"all" | "6m" | "3m">("all");

  const chartData = buildTimeline(items, periodFilter);

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border border-border/80 bg-card p-6 shadow-xs sm:p-7 ${
        className ?? ""
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <h3 className="font-label text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
              Assessment and recommendation activity
            </h3>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Completed results over time
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Monthly trends of started sessions, completed results, and saved programmes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/80 bg-secondary/70 px-3.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <span>
                    {periodFilter === "all"
                      ? "All months"
                      : periodFilter === "6m"
                        ? "Last 6 months"
                        : "Last 3 months"}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => setPeriodFilter("all")}
                  className="cursor-pointer text-xs font-bold"
                >
                  All months
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPeriodFilter("6m")}
                  className="cursor-pointer text-xs font-bold"
                >
                  Last 6 months
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPeriodFilter("3m")}
                  className="cursor-pointer text-xs font-bold"
                >
                  Last 3 months
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-5 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-chart-slate" />
            Started assessments
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            Completed assessments
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-chart-yellow" />
            Saved programmes
          </span>
        </div>
      </div>

      {/* Area Chart or Empty State */}
      <div className="mt-6 flex min-h-[250px] flex-1 flex-col justify-end w-full">
        {chartData.length > 0 ? (
          <ChartContainer
            config={activityChartConfig}
            className="aspect-auto h-full min-h-[240px] w-full"
          >
            <AreaChart
              data={chartData}
              margin={{ left: -16, right: 12, top: 12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillStarted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-started, var(--chart-slate))"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-started, var(--chart-slate))"
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-completed, var(--primary))"
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-completed, var(--primary))"
                    stopOpacity={0.08}
                  />
                </linearGradient>
                <linearGradient id="fillSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-saved, var(--chart-yellow))"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-saved, var(--chart-yellow))"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                opacity={0.4}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                className="font-label text-xs font-bold"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={32}
                className="font-label text-xs font-bold"
              />
              <ChartTooltip
                cursor={{
                  stroke: "var(--border)",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="rounded-xl border border-border bg-popover p-2.5 shadow-xl"
                  />
                }
              />
              <Area
                dataKey="started"
                type="monotone"
                fill="url(#fillStarted)"
                fillOpacity={0.3}
                stroke="var(--color-started, var(--chart-slate))"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                activeDot={{ r: 6 }}
              />
              <Area
                dataKey="completed"
                type="monotone"
                fill="url(#fillCompleted)"
                fillOpacity={0.4}
                stroke="var(--color-completed, var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                activeDot={{ r: 6 }}
              />
              <Area
                dataKey="saved"
                type="monotone"
                fill="url(#fillSaved)"
                fillOpacity={0.3}
                stroke="var(--color-saved, var(--chart-yellow))"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center">
            <p className="font-display text-sm font-bold text-foreground">
              No activity recorded for this period
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Completed assessments, started attempts, and saved programmes will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function buildTimeline(
  items: ReportActivityCardProps["items"],
  filter: "all" | "6m" | "3m",
) {
  if (!items || items.length === 0) return [];

  const itemMap = new Map(items.map((it) => [it.month, it]));
  const latestItem = items[items.length - 1];
  const parts = latestItem.month.split("-");

  let baseDate = new Date();
  if (parts.length === 2) {
    const yr = parseInt(parts[0], 10);
    const mo = parseInt(parts[1], 10) - 1;
    if (!Number.isNaN(yr) && !Number.isNaN(mo)) {
      baseDate = new Date(yr, mo, 1);
    }
  }

  const spanCount = filter === "3m" ? 3 : filter === "6m" ? 6 : Math.max(6, items.length);
  const result: Array<{
    month: string;
    started: number;
    completed: number;
    saved: number;
  }> = [];

  for (let offset = spanCount - 1; offset >= 0; offset--) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - offset, 1);
    const yStr = d.getFullYear().toString();
    const mStr = String(d.getMonth() + 1).padStart(2, "0");
    const key = `${yStr}-${mStr}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    const matched = itemMap.get(key);

    result.push({
      month: label,
      started: matched?.started ?? (matched?.count ?? 0),
      completed: matched?.completed ?? (matched?.count ?? 0),
      saved: matched?.saved ?? 0,
    });
  }

  return result;
}
