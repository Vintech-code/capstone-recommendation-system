import {
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Printer,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

const completionsChartConfig = {
  count: {
    label: "Completed assessments",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

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
  const startedTotal = Math.max(1, data.assessmentFunnel.started);
  const completionRate = Math.min(
    100,
    Math.max(
      0,
      data.assessmentCompletionRate > 0
        ? data.assessmentCompletionRate
        : Math.round((data.completedAssessments / startedTotal) * 100),
    ),
  );
  const saveToRunRatio = data.recommendationRuns
    ? Math.round((data.programmeSaves / data.recommendationRuns) * 100)
    : 0;
  const dateScope =
    data.from || data.to
      ? `${data.from ? formatDate(data.from) : "First record"} – ${
          data.to ? formatDate(data.to) : "Latest record"
        }`
      : "All recorded dates";

  const lifecycle = [
    { label: "Started", value: data.assessmentFunnel.started },
    { label: "In progress", value: data.assessmentFunnel.inProgress },
    { label: "Processing", value: data.assessmentFunnel.processing },
    {
      label: "Results available",
      value: data.assessmentFunnel.resultAvailable,
    },
  ];

  return (
    <div
      className="mx-auto w-full min-w-0 max-w-[1500px] space-y-6 pb-8"
      data-report-print
    >
      <AdminPageHeader
        title="System reports"
        action={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" /> Print report
          </Button>
        }
      />

      <section aria-labelledby="report-snapshot-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
              Institution snapshot
            </p>
            <h2
              id="report-snapshot-heading"
              className="mt-1 font-display text-xl font-extrabold tracking-tight"
            >
              Assessment and recommendation activity
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Aggregate records only. Student-identifiable information is not
              included in this report.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="size-4 text-primary-ink" /> {dateScope}
          </div>
        </div>

        <ReportFilters
          from={from}
          to={to}
          invalid={invalid}
          onFromChange={setFrom}
          onToChange={setTo}
          onApply={() => {
            setQuery(
              from || to
                ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) })}`
                : "",
            );
          }}
          onClear={() => {
            setFrom("");
            setTo("");
            setQuery("");
          }}
        />
      </section>

      <section
        aria-label="Report totals"
        className="grid overflow-hidden rounded-xs bg-secondary/65 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SnapshotMetric
          icon={<Users className="size-4" />}
          label="Students in scope"
          value={data.studentCount}
          detail="Registered accounts"
        />
        <SnapshotMetric
          icon={<CheckCircle2 className="size-4" />}
          label="Completed assessments"
          value={data.completedAssessments}
          detail={`${completionRate}% of started assessments`}
        />
        <SnapshotMetric
          icon={<ClipboardList className="size-4" />}
          label="Recommendation runs"
          value={data.recommendationRuns}
          detail="Generated result records"
        />
        <SnapshotMetric
          icon={<Bookmark className="size-4" />}
          label="Programme saves"
          value={data.programmeSaves}
          detail="Recorded student saves"
        />
      </section>

      <section
        aria-labelledby="completion-heading"
        className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(17rem,.65fr)]"
      >
        <div className="min-w-0">
          <SectionHeading
            eyebrow="Completion history"
            title="Completed results over time"
            description="Monthly finalized assessments within the selected reporting period."
            id="completion-heading"
          />
          <CompletionTrend items={data.assessmentCompletionsByMonth} />
        </div>

        <aside className="bg-primary/10 px-5 py-5 lg:px-6">
          <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
            Completion overview
          </p>
          <div className="mt-4 flex items-end gap-3">
            <strong className="font-display text-5xl font-black tracking-tight">
              {completionRate}%
            </strong>
            <span className="pb-1 text-xs leading-5 text-muted-foreground">
              of started assessments have an available result
            </span>
          </div>
          <Progress
            value={completionRate}
            aria-label={`Assessment completion: ${completionRate}%`}
            className="mt-5 h-2.5 bg-background"
          />
          <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4">
            <CompactFact label="Started" value={data.assessmentFunnel.started} />
            <CompactFact
              label="Results available"
              value={data.assessmentFunnel.resultAvailable}
            />
            <CompactFact
              label="In progress"
              value={data.assessmentFunnel.inProgress}
            />
            <CompactFact
              label="Processing"
              value={data.assessmentFunnel.processing}
            />
          </dl>
        </aside>
      </section>

      <section aria-labelledby="lifecycle-heading">
        <SectionHeading
          eyebrow="Assessment lifecycle"
          title="Current stage distribution"
          description="Exact counts from the recorded assessment lifecycle. Stages are shown independently and are not inferred from one another."
          id="lifecycle-heading"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {lifecycle.map((item, index) => (
            <LifecycleStage
              key={item.label}
              index={index + 1}
              label={item.label}
              value={item.value}
              share={Math.round((item.value / startedTotal) * 100)}
            />
          ))}
        </div>
      </section>

      {data.retakeMetrics ? (
        <section aria-labelledby="retakes-heading">
          <SectionHeading
            eyebrow="Assessment frequency & retakes"
            title="Retake assessment activity"
            description="Institutional monitoring of multiple assessment attempts and completed retakes."
            id="retakes-heading"
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xs border border-border bg-card p-4 shadow-sm">
              <span className="block font-label text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Attempts
              </span>
              <span className="mt-1 block font-display text-2xl font-black text-foreground">
                {data.retakeMetrics.totalAssessmentAttempts}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                All initiated assessment sessions
              </span>
            </div>
            <div className="rounded-xs border border-border bg-card p-4 shadow-sm">
              <span className="block font-label text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Completed Attempts
              </span>
              <span className="mt-1 block font-display text-2xl font-black text-primary-ink">
                {data.retakeMetrics.totalCompletedAttempts}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                All finalized RIASEC outcomes
              </span>
            </div>
            <div className="rounded-xs border border-border bg-card p-4 shadow-sm">
              <span className="block font-label text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Students with Retakes
              </span>
              <span className="mt-1 block font-display text-2xl font-black text-foreground">
                {data.retakeMetrics.studentsWithRetakes}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Students with &gt;1 completed result
              </span>
            </div>
            <div className="rounded-xs border border-border bg-card p-4 shadow-sm">
              <span className="block font-label text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Retake Sessions
              </span>
              <span className="mt-1 block font-display text-2xl font-black text-amber-800 dark:text-amber-300">
                {data.retakeMetrics.totalRetakeAttempts}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Attempts beyond initial (attempt &gt; 1)
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <section
        className="grid gap-8 lg:grid-cols-2"
        aria-label="Report breakdowns"
      >
        <EligibilityBreakdown
          board={data.eligibilityDistribution.board}
          nonBoard={data.eligibilityDistribution.nonBoard}
        />
        <EngagementBreakdown
          recommendations={data.recommendationRuns}
          saves={data.programmeSaves}
          ratio={saveToRunRatio}
        />
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 font-label text-xs text-muted-foreground">
        <span>Updated {formatDate(data.generatedAt)}</span>
        <span>Institution-wide aggregate reporting scope</span>
      </footer>
    </div>
  );
}

function ReportFilters({
  from,
  to,
  invalid,
  onFromChange,
  onToChange,
  onApply,
  onClear,
}: {
  from: string;
  to: string;
  invalid: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <form
      className="mt-5 grid gap-3 bg-secondary/55 p-4 sm:grid-cols-[minmax(9rem,1fr)_minmax(9rem,1fr)_auto_auto] sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        if (!invalid) onApply();
      }}
    >
      <label className="font-label text-xs font-bold text-muted-foreground">
        From date
        <Input
          className="mt-1.5 bg-background"
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
        />
      </label>
      <label className="font-label text-xs font-bold text-muted-foreground">
        To date
        <Input
          className="mt-1.5 bg-background"
          type="date"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
        />
      </label>
      <Button type="submit" disabled={invalid} className="h-10">
        Apply dates
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-10"
        onClick={onClear}
      >
        Clear
      </Button>
      {invalid ? (
        <p role="alert" className="text-sm text-destructive-ink sm:col-span-4">
          The end date must be on or after the start date.
        </p>
      ) : null}
    </form>
  );
}

function SnapshotMetric({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="min-w-0 border-b border-border px-4 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-center gap-2 font-label text-xs font-bold text-muted-foreground">
        <span className="text-primary-ink" aria-hidden="true">
          {icon}
        </span>
        {label}
      </div>
      <strong className="mt-2 block font-display text-3xl font-black">
        {value}
      </strong>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow: string;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <div>
      <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-1 font-display text-xl font-extrabold tracking-tight"
      >
        {title}
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function CompletionTrend({
  items,
}: {
  items: Array<{ month: string; count: number }>;
}) {
  if (!items.length) {
    return (
      <p className="mt-5 bg-secondary/55 px-5 py-16 text-center text-sm text-muted-foreground">
        No completed assessments were recorded in this period.
      </p>
    );
  }

  const accessibleLabel = items
    .map((item) => `${item.month}: ${item.count}`)
    .join(", ");

  return (
    <div className="mt-5" role="img" aria-label={accessibleLabel}>
      <ChartContainer
        config={completionsChartConfig}
        className="aspect-auto h-[260px] w-full"
      >
        <AreaChart
          data={items}
          margin={{ left: 0, right: 12, top: 12, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="reportCompletionFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="var(--primary)"
                stopOpacity={0.34}
              />
              <stop
                offset="95%"
                stopColor="var(--primary)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 5" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            dataKey="count"
            type="monotone"
            fill="url(#reportCompletionFill)"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{
              fill: "var(--background)",
              stroke: "var(--primary)",
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{ fill: "var(--primary)", r: 6 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

function CompactFact({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs leading-5 text-muted-foreground">{label}</dt>
      <dd className="font-display text-2xl font-black">{value}</dd>
    </div>
  );
}

function LifecycleStage({
  index,
  label,
  value,
  share,
}: {
  index: number;
  label: string;
  value: number;
  share: number;
}) {
  return (
    <div className="bg-secondary/55 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-label text-xs font-bold text-muted-foreground">
          {String(index).padStart(2, "0")}
        </span>
        <span className="font-label text-xs text-muted-foreground">
          {share}% of started
        </span>
      </div>
      <strong className="mt-4 block font-display text-3xl font-black">
        {value}
      </strong>
      <p className="mt-1 text-sm font-semibold">{label}</p>
    </div>
  );
}

function EligibilityBreakdown({
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
    <div>
      <SectionHeading
        eyebrow="Declared entrance group"
        title="Recorded group distribution"
        description="Aggregate self-declared entrance groups. This guidance is separate from programme ranking."
        id="eligibility-heading"
      />
      <div
        className="mt-5 flex h-3 overflow-hidden rounded-full bg-secondary"
        role="img"
        aria-label={`Board eligible: ${board}, non-board eligible: ${nonBoard}`}
      >
        <span className="bg-primary" style={{ width: `${boardShare}%` }} />
        <span className="bg-warning" style={{ width: `${nonBoardShare}%` }} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-6">
        <BreakdownFact
          label="Board group"
          value={board}
          share={boardShare}
          markerClass="bg-primary"
        />
        <BreakdownFact
          label="Non-board group"
          value={nonBoard}
          share={nonBoardShare}
          markerClass="bg-warning"
        />
      </dl>
    </div>
  );
}

function BreakdownFact({
  label,
  value,
  share,
  markerClass,
}: {
  label: string;
  value: number;
  share: number;
  markerClass: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span className={`size-2.5 rounded-full ${markerClass}`} /> {label}
      </dt>
      <dd className="mt-2 font-display text-3xl font-black">{value}</dd>
      <p className="mt-1 text-xs text-muted-foreground">
        {share}% of declared records
      </p>
    </div>
  );
}

function EngagementBreakdown({
  recommendations,
  saves,
  ratio,
}: {
  recommendations: number;
  saves: number;
  ratio: number;
}) {
  return (
    <div className="bg-info/10 px-5 py-5 lg:px-6">
      <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
        Recommendation engagement
      </p>
      <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
        From generated results to saved programmes
      </h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Saves record student interest. They do not represent applications,
        admissions, or enrolments.
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-6">
        <CompactFact label="Recommendation runs" value={recommendations} />
        <CompactFact label="Programme saves" value={saves} />
      </dl>
      <div className="mt-6 flex items-end justify-between gap-4 bg-background/70 px-4 py-3">
        <span className="text-xs leading-5 text-muted-foreground">
          Saves per 100 recommendation runs
        </span>
        <strong className="font-display text-2xl font-black">{ratio}</strong>
      </div>
    </div>
  );
}
