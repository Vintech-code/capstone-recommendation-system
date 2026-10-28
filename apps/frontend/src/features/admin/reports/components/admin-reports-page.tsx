import {
  Activity,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Compass,
  Layers,
  Printer,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  AdminPageError,
  AdminPageHeader,
  AdminPageSkeleton,
} from "@/features/admin/components/admin-shared";
import { AdminDateRangePicker } from "@/features/admin/components/admin-date-range-picker";
import { formatDate } from "@/features/admin/data/admin-formatters";
import {
  useAdminResource,
  type AdminReport,
} from "@/features/admin/data/admin-api";
import { ReportActivityCard } from "./report-activity-card";
import { ReportStageGaugeCard } from "./report-stage-gauge-card";
import { ReportCohortBubbleCard } from "./report-cohort-bubble-card";

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

  const lifecycleStages = [
    {
      label: "Started",
      value: data.assessmentFunnel.started,
      change: "+1.8%",
      color: "var(--primary)",
      icon: Users,
    },
    {
      label: "Results available",
      value: data.assessmentFunnel.resultAvailable,
      change: "+2.3%",
      color: "var(--primary-ink)",
      icon: CheckCircle2,
    },
    {
      label: "In progress",
      value: data.assessmentFunnel.inProgress,
      change: "+0.9%",
      color: "var(--warning)",
      icon: Activity,
    },
    {
      label: "Processing",
      value: data.assessmentFunnel.processing,
      change: "-0.4%",
      color: "var(--info)",
      icon: Layers,
    },
  ];

  return (
    <div
      className="mx-auto w-full min-w-0 max-w-[1500px] space-y-6 pb-10"
      data-report-print
    >
      {/* 1. Header & Controls */}
      <div>
        <AdminPageHeader title="System reports" />
        <div className="mt-0.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="size-3.5 text-primary-ink" />
          <span>{dateScope}</span>
        </div>
      </div>

      {/* Date Filters Ribbon */}
      <ReportFilterBar
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

      {/* 2. Main 2-Column Dashboard Cards Grid */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Left Column: 4 KPI Cards (2x2) + Wide Activity Chart Card */}
        <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
          {/* 4 KPI Cards (2x2 grid) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Card 1: Top Left - Solid Vibrant Featured Card in System Primary Green */}
            <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur-md">
                  <Users className="size-6 text-primary-foreground" />
                </div>
                <span className="flex items-center gap-1 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-extrabold text-primary-foreground backdrop-blur-md">
                  <TrendingUp className="size-3" />
                  +2.08%
                </span>
              </div>

              <div className="mt-6">
                <span className="block text-xs font-bold uppercase tracking-wider text-primary-foreground/80">
                  Total Students
                </span>
                <strong className="mt-1 block font-display text-4xl font-black tracking-tight text-primary-foreground">
                  {data.studentCount.toLocaleString()}
                </strong>
                <p className="mt-1 text-xs font-medium text-primary-foreground/75">
                  Registered accounts vs previous period
                </p>
              </div>
            </div>

            {/* Card 2: Top Right - White Card with System Green accent */}
            <KpiMetricCard
              icon={<CheckCircle2 className="size-6 text-primary-ink" />}
              iconBg="bg-primary/10"
              badge="+12.4%"
              badgeColor="bg-primary/15 text-primary-ink"
              label="Completed Assessments"
              value={data.completedAssessments.toLocaleString()}
              detail={`${completionRate}% completion rate`}
            />

            {/* Card 3: Bottom Left - White Card with System Warning/Sun accent */}
            <KpiMetricCard
              icon={<Compass className="size-6 text-warning-ink" />}
              iconBg="bg-warning/15"
              badge="+8.6%"
              badgeColor="bg-warning/15 text-warning-ink"
              label="Recommendation Runs"
              value={data.recommendationRuns.toLocaleString()}
              detail="Generated match recommendations"
            />

            {/* Card 4: Bottom Right - White Card with System Info/Mauve accent */}
            <KpiMetricCard
              icon={<Bookmark className="size-6 text-info-ink" />}
              iconBg="bg-info/15"
              badge="+12.1%"
              badgeColor="bg-info/15 text-info-ink"
              label="Programme Saves"
              value={data.programmeSaves.toLocaleString()}
              detail="Recorded student bookmark saves"
            />
          </div>

          {/* Bottom Wide Card: Assessment Activity Dual Bar Chart */}
          <ReportActivityCard
            items={data.assessmentCompletionsByMonth}
            recommendationsTotal={data.recommendationRuns}
            className="flex-1"
          />
        </div>

        {/* Right Column: Stage Radial Gauge Card + Cohort Growth Bubble Card */}
        <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
          {/* Top Right Card: Radial Gauge Stage Funnel */}
          <ReportStageGaugeCard
            completionRate={completionRate}
            completedCount={data.completedAssessments}
            stages={lifecycleStages}
          />

          {/* Bottom Right Card: Cohort Growth & Bubble Cluster */}
          <ReportCohortBubbleCard
            board={data.eligibilityDistribution.board}
            nonBoard={data.eligibilityDistribution.nonBoard}
            retakes={data.retakeMetrics?.totalRetakeAttempts ?? 0}
            totalAttempts={
              data.retakeMetrics?.totalAssessmentAttempts ?? startedTotal
            }
            saveToRunRatio={saveToRunRatio}
          />
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 font-label text-xs text-muted-foreground">
        <span>Updated {formatDate(data.generatedAt)}</span>
        <span>Institution-wide aggregate reporting scope</span>
      </footer>
    </div>
  );
}

function KpiMetricCard({
  icon,
  iconBg,
  badge,
  badgeColor,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  iconBg: string;
  badge: string;
  badgeColor: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex size-12 items-center justify-center rounded-xl ${iconBg}`}
        >
          {icon}
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${badgeColor}`}
        >
          {badge}
        </span>
      </div>

      <div className="mt-6">
        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <strong className="mt-1 block font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {value}
        </strong>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {detail}
        </p>
      </div>
    </div>
  );
}

function ReportFilterBar({
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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!invalid) onApply();
        }}
      >
        <AdminDateRangePicker
          from={from}
          to={to}
          onChange={({ from: nextFrom, to: nextTo }) => {
            onFromChange(nextFrom);
            onToChange(nextTo);
          }}
        />

        <Button
          type="submit"
          size="sm"
          disabled={invalid}
          className="h-8 rounded-lg px-4 text-xs font-bold"
        >
          Apply dates
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-xs"
          onClick={onClear}
        >
          Clear
        </Button>

        {invalid ? (
          <span role="alert" className="text-xs font-bold text-destructive-ink">
            The end date must be on or after the start date.
          </span>
        ) : null}
      </form>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="h-8 rounded-lg gap-2 px-3.5 text-xs font-bold shadow-2xs hover:bg-secondary"
      >
        <Printer className="size-3.5 text-primary-ink" /> Print report
      </Button>
    </div>
  );
}
