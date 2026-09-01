import { Printer } from "lucide-react";
import { useState } from "react";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  AdminPageError,
  AdminPageHeader,
  AdminPageSkeleton,
} from "@/features/admin/components/admin-shared";
import { formatDate } from "@/features/admin/data/admin-formatters";
import {
  useAdminResource,
  type AdminReport,
} from "@/features/admin/data/admin-api";

export function AdminReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");

  const resource = useAdminResource<AdminReport>(`/reports${query}`);

  if (resource.loading) return <AdminPageSkeleton />;
  if (resource.error || !resource.data) {
    return (
      <AdminPageError
        message={resource.error ?? "No report data was returned."}
        onRetry={resource.retry}
      />
    );
  }

  const data = resource.data;
  const invalid = Boolean(from && to && to < from);

  const funnel = [
    ["Started", data.assessmentFunnel.started],
    ["In progress", data.assessmentFunnel.inProgress],
    ["Processing", data.assessmentFunnel.processing],
    ["Results available", data.assessmentFunnel.resultAvailable],
  ] as const;

  const startedTotal = Math.max(1, data.assessmentFunnel.started);
  const completionRate =
    data.assessmentCompletionRate > 0
      ? data.assessmentCompletionRate
      : Math.round((data.completedAssessments / startedTotal) * 100);

  const saveRate =
    data.recommendationRuns > 0
      ? Math.round((data.programmeSaves / data.recommendationRuns) * 100)
      : 0;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8" data-report-print>
      <AdminPageHeader
        title="System reports"
        action={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" /> Print report
          </Button>
        }
      />

      {/* Date Filter Toolbar */}
      <form
        className="grid gap-4 border-y border-border p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          if (!invalid) {
            setQuery(
              from || to
                ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) })}`
                : "",
            );
          }
        }}
      >
        <label className="font-label text-xs font-bold uppercase tracking-wide text-muted-foreground">
          From
          <Input
            className="mt-1.5"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="font-label text-xs font-bold uppercase tracking-wide text-muted-foreground">
          To
          <Input
            className="mt-1.5"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
        <Button type="submit" disabled={invalid} className="h-10">
          Apply dates
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-10"
          onClick={() => {
            setFrom("");
            setTo("");
            setQuery("");
          }}
        >
          Clear
        </Button>
        {invalid ? (
          <p role="alert" className="text-sm text-destructive sm:col-span-4">
            The end date must be on or after the start date.
          </p>
        ) : null}
      </form>

      {/* Core Institutional KPIs */}
      <section
        aria-label="Current operational totals"
        className="grid border-y border-border sm:grid-cols-2 xl:grid-cols-4"
      >
        <ReportMetricCell
          label="Students in scope"
          value={data.studentCount}
          detail="Registered accounts"
        />
        <ReportMetricCell
          label="Completed assessments"
          value={data.completedAssessments}
          detail={`${completionRate}% completion rate`}
          tone="success"
        />
        <ReportMetricCell
          label="Recommendations"
          value={data.recommendationRuns}
          detail="Generated matches"
        />
        <ReportMetricCell
          label="Programme saves"
          value={data.programmeSaves}
          detail={`${saveRate}% bookmark rate`}
        />
      </section>

      {/* Primary Analytics Row: Completion Trend & Assessment Pipeline */}
      <div className="grid overflow-hidden border-y border-border lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,.65fr)]">
        <div className="py-7 lg:border-r lg:border-border lg:pr-8">
          <SectionHeading
            eyebrow="Completion history"
            title="Results over time"
            description="Monthly count of finalized assessments with available recommendation results."
          />
          <CompletionTrend items={data.assessmentCompletionsByMonth} />
        </div>

        <div className="py-7 lg:pl-8">
          <SectionHeading
            eyebrow="Current progress"
            title="Assessment status"
            description="Progression of started assessments through recorded lifecycle stages."
            compact
          />
          <div className="mt-6 flex items-center gap-6 border-b border-border pb-6">
            <ProgressRing
              value={completionRate}
              label="Assessment completion"
            />
            <div>
              <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Results available
              </p>
              <strong className="mt-1 block font-display text-4xl font-black">
                {data.assessmentFunnel.resultAvailable}
              </strong>
              <p className="mt-1 text-sm text-muted-foreground">
                of {data.assessmentFunnel.started} started assessments
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {funnel.map(([label, value], index) => (
              <DataBar
                key={label}
                label={label}
                value={value}
                max={startedTotal}
                accent={index === funnel.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Analytics Row: Entrance Eligibility & Student Engagement */}
      <div className="grid gap-10 border-b border-border pb-8 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Entrance result"
            title="Eligibility distribution"
            description="Self-declared entrance examination score segmentation under rule SELF-DECLARED-TCC-ENTRANCE-2026-01."
            compact
          />
          <EligibilityChart
            board={data.eligibilityDistribution.board}
            nonBoard={data.eligibilityDistribution.nonBoard}
          />
        </div>

        <div className="lg:border-l lg:border-border lg:pl-8">
          <SectionHeading
            eyebrow="Student choices"
            title="Recommendation engagement"
            description="Comparison of generated course recommendations to student programme saves."
            compact
          />
          <EngagementChart
            recommendations={data.recommendationRuns}
            saves={data.programmeSaves}
          />
        </div>
      </div>

      <p className="font-label text-sm text-muted-foreground">
        Updated {formatDate(data.generatedAt)} · Institution-wide reporting
        scope.
      </p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  compact = false,
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  compact?: boolean;
  id?: string;
}) {
  return (
    <div>
      <p className="font-label text-xs font-bold uppercase tracking-[0.15em] text-primary">
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-1 font-display font-extrabold tracking-tight ${compact ? "text-2xl" : "text-3xl"}`}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ReportMetricCell({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone?: "warning" | "success";
}) {
  return (
    <div className="relative px-5 py-6 sm:border-r sm:border-border sm:last:border-r-0">
      <span
        className={`absolute inset-y-5 left-0 w-1 rounded-full ${
          tone === "warning"
            ? "bg-warning"
            : tone === "success"
              ? "bg-success"
              : "bg-primary"
        }`}
      />
      <p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-end gap-3">
        <strong className="font-display text-4xl font-black">{value}</strong>
        <span className="pb-1 text-xs text-muted-foreground">{detail}</span>
      </div>
    </div>
  );
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div
      className="relative flex size-24 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--success) ${safeValue}%, var(--secondary) 0)`,
      }}
      role="img"
      aria-label={`${label}: ${safeValue}%`}
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-background font-display text-xl font-black">
        {safeValue}%
      </span>
    </div>
  );
}

function DataBar({
  label,
  value,
  max,
  accent = false,
}: {
  label: string;
  value: number;
  max: number;
  accent?: boolean;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold">{label}</span>
        <div className="flex items-center gap-2">
          <strong className="font-display text-lg">{value}</strong>
          <span className="font-label text-xs text-muted-foreground">
            ({Math.round(percentage)}%)
          </span>
        </div>
      </div>
      <Progress
        value={percentage}
        aria-label={label}
        className="h-2.5"
        indicatorClassName={accent ? "bg-success" : "bg-foreground"}
      />
    </div>
  );
}

const completionsChartConfig = {
  count: {
    label: "Completions",
    color: "var(--success)",
  },
} satisfies ChartConfig;

function CompletionTrend({
  items,
}: {
  items: Array<{ month: string; count: number }>;
}) {
  const accessibleLabel = items
    .map((item) => `${item.month}: ${item.count}`)
    .join(", ");

  if (!items.length) {
    return (
      <p className="mt-6 border-y border-border py-14 text-sm text-muted-foreground">
        No completion activity in this period.
      </p>
    );
  }

  return (
    <div className="mt-6" role="img" aria-label={accessibleLabel}>
      <ChartContainer
        config={completionsChartConfig}
        className="aspect-auto h-[230px] w-full"
      >
        <AreaChart
          data={items}
          margin={{
            left: 8,
            right: 8,
            top: 12,
            bottom: 8,
          }}
        >
          <defs>
            <linearGradient id="fillCompletions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--success)" stopOpacity={0.7} />
              <stop
                offset="95%"
                stopColor="var(--success)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="font-label text-[11px]"
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            dataKey="count"
            type="monotone"
            fill="url(#fillCompletions)"
            fillOpacity={0.4}
            stroke="var(--success)"
            strokeWidth={2.5}
            dot={{ fill: "var(--success)", r: 4 }}
            activeDot={{ r: 6, fill: "var(--success)" }}
          />
        </AreaChart>
      </ChartContainer>

      <div className="mt-4 grid grid-cols-3 divide-x divide-border border-y border-border py-3 font-label text-xs">
        <div className="pr-4">
          <span className="text-muted-foreground">Recorded periods</span>
          <strong className="mt-1 block font-display text-lg font-extrabold">
            {items.length}
          </strong>
        </div>
        <div className="px-4">
          <span className="text-muted-foreground">Peak month count</span>
          <strong className="mt-1 block font-display text-lg font-extrabold">
            {Math.max(0, ...items.map((i) => i.count))}
          </strong>
        </div>
        <div className="pl-4">
          <span className="text-muted-foreground">Total completions</span>
          <strong className="mt-1 block font-display text-lg font-extrabold">
            {items.reduce((sum, i) => sum + i.count, 0)}
          </strong>
        </div>
      </div>
    </div>
  );
}

function EligibilityChart({
  board,
  nonBoard,
}: {
  board: number;
  nonBoard: number;
}) {
  const total = board + nonBoard;
  const boardShare = total ? Math.round((board / total) * 100) : 0;
  const nonBoardShare = total ? 100 - boardShare : 0;

  return (
    <div className="mt-7">
      <div
        className="flex h-10 overflow-hidden rounded-md bg-secondary"
        role="img"
        aria-label={`Board eligible: ${board}, non-board eligible: ${nonBoard}`}
      >
        {board ? (
          <span
            className="bg-success transition-all"
            style={{ width: `${boardShare}%` }}
          />
        ) : null}
        {nonBoard ? (
          <span
            className="bg-primary transition-all"
            style={{ width: `${nonBoardShare}%` }}
          />
        ) : null}
      </div>

      <dl className="mt-5 grid grid-cols-2 divide-x divide-border border-y border-border">
        <div className="py-4 pr-5">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2.5 rounded-full bg-success" /> Board eligible
          </dt>
          <dd className="mt-1 font-display text-3xl font-black">{board}</dd>
          <p className="mt-1 font-label text-xs text-muted-foreground">
            {boardShare}% of declared · Score 1.0–2.5
          </p>
        </div>
        <div className="py-4 pl-5">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2.5 rounded-full bg-primary" /> Non-board
            eligible
          </dt>
          <dd className="mt-1 font-display text-3xl font-black">{nonBoard}</dd>
          <p className="mt-1 font-label text-xs text-muted-foreground">
            {nonBoardShare}% of declared · Score 2.6–5.0
          </p>
        </div>
      </dl>
    </div>
  );
}

function EngagementChart({
  recommendations,
  saves,
}: {
  recommendations: number;
  saves: number;
}) {
  const maximum = Math.max(1, recommendations, saves);
  const saveRate =
    recommendations > 0 ? Math.round((saves / recommendations) * 100) : 0;

  return (
    <div className="mt-7">
      <div
        className="grid grid-cols-2 items-end gap-6 border-b border-border px-4"
        role="img"
        aria-label={`Recommendations: ${recommendations}, programme saves: ${saves}`}
      >
        <div className="flex min-h-56 flex-col justify-end">
          <strong className="mb-2 font-display text-3xl font-black">
            {recommendations}
          </strong>
          <span
            aria-hidden="true"
            className="bg-foreground"
            style={{
              height: `${Math.max(8, (recommendations / maximum) * 150)}px`,
            }}
          />
          <span className="min-h-14 pt-3 text-sm font-semibold text-muted-foreground">
            Recommendations
          </span>
        </div>

        <div className="flex min-h-56 flex-col justify-end">
          <strong className="mb-2 font-display text-3xl font-black">
            {saves}
          </strong>
          <span
            aria-hidden="true"
            className="bg-success"
            style={{
              height: `${Math.max(8, (saves / maximum) * 150)}px`,
            }}
          />
          <span className="min-h-14 pt-3 text-sm font-semibold text-muted-foreground">
            Programme saves
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-y border-border py-3 font-label text-xs">
        <span className="text-muted-foreground">Bookmark conversion rate</span>
        <strong className="font-display text-base font-extrabold">
          {saveRate}%
        </strong>
      </div>
    </div>
  );
}
