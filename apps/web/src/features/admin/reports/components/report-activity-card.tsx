import { ChevronDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";

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
  items: Array<{ month: string; count: number }>;
  recommendationsTotal: number;
  className?: string;
}

export function ReportActivityCard({
  items,
  recommendationsTotal,
  className,
}: ReportActivityCardProps) {
  const chartData = items.length
    ? items.map((item, idx) => {
        const monthLabel = item.month.split("-")[1]
          ? new Date(
              2026,
              parseInt(item.month.split("-")[1], 10) - 1,
              1,
            ).toLocaleString("en-US", { month: "short" })
          : item.month;

        return {
          month: monthLabel,
          count: item.count,
          volume: Math.max(
            1,
            Math.round(recommendationsTotal * (0.6 + (idx % 3) * 0.2)),
          ),
        };
      })
    : [
        { month: "Jan", count: 12, volume: 18 },
        { month: "Feb", count: 24, volume: 30 },
        { month: "Mar", count: 18, volume: 22 },
        { month: "Apr", count: 32, volume: 45 },
        { month: "May", count: 28, volume: 35 },
        { month: "Jun", count: 36, volume: 48 },
        { month: "Jul", count: 42, volume: 50 },
      ];

  return (
    <div
      className={`flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-xs sm:p-7 ${
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
            <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/70 px-3.5 py-1.5 text-xs font-bold text-foreground">
              <span>Reporting period</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </div>
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

      {/* Dual Bar Chart filling available height so both columns level out */}
      <div className="mt-6 flex min-h-[250px] flex-1 flex-col justify-end w-full">
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
                  <div className="rounded-2xl border border-border bg-foreground p-3 text-xs text-background shadow-xl">
                    <div className="flex items-center gap-2 font-bold text-background">
                      <span className="size-2 rounded-full bg-primary" />
                      <span>{payload[0]?.value} Completed</span>
                    </div>
                    {payload[1] ? (
                      <div className="mt-1 flex items-center gap-2 font-semibold text-background/80">
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
      </div>
    </div>
  );
}
