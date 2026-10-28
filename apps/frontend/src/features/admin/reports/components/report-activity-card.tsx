import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const activityChartConfig = {
  count: {
    label: "Completed assessments",
    color: "var(--primary)",
  },
  volume: {
    label: "Recommendation volume",
    color: "var(--input)",
  },
} satisfies ChartConfig;

interface ReportActivityCardProps {
  items: Array<{ month: string; count: number; volume?: number }>;
  recommendationsTotal?: number;
  className?: string;
}

export function ReportActivityCard({
  items,
  className,
}: ReportActivityCardProps) {
  const [periodFilter, setPeriodFilter] = useState<"all" | "6m" | "3m">("all");

  const filteredItems = items.slice(
    periodFilter === "3m" ? -3 : periodFilter === "6m" ? -6 : 0,
  );

  const chartData = filteredItems.map((item) => {
    const parts = item.month.split("-");
    const monthLabel =
      parts.length === 2
        ? new Date(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10) - 1,
            1,
          ).toLocaleString("en-US", { month: "short" })
        : item.month;

    return {
      month: monthLabel,
      count: item.count,
      volume: item.volume ?? item.count,
    };
  });

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
              Monthly finalized assessments and recommendation volume
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
            <span className="size-2.5 rounded-full bg-primary" />
            Completed assessments
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-input" />
            Recommendation volume
          </span>
        </div>
      </div>

      {/* Dual Bar Chart or Empty State */}
      <div className="mt-6 flex min-h-[250px] flex-1 flex-col justify-end w-full">
        {chartData.length > 0 ? (
          <ChartContainer
            config={activityChartConfig}
            className="aspect-auto h-full min-h-[240px] w-full"
          >
            <BarChart
              data={chartData}
              barGap={6}
              margin={{ left: -16, right: 12, top: 12, bottom: 0 }}
            >
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
                cursor={{ fill: "var(--secondary)", opacity: 0.5 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl border border-border bg-popover p-3 text-xs text-popover-foreground shadow-xl">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <span className="size-2 rounded-full bg-primary" />
                        <span>{payload[0]?.value} Completed</span>
                      </div>
                      {payload[1] ? (
                        <div className="mt-1 flex items-center gap-2 font-semibold text-muted-foreground">
                          <span className="size-2 rounded-full bg-input" />
                          <span>{payload[1]?.value} Recommendations</span>
                        </div>
                      ) : null}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="count"
                name="Completed assessments"
                fill="var(--primary)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
              <Bar
                dataKey="volume"
                name="Recommendation volume"
                fill="var(--input)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center">
            <p className="font-display text-sm font-bold text-foreground">
              No activity recorded for this period
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Completed assessments and recommendation volumes will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
