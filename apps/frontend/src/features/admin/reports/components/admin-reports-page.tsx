import {
  Activity,
  Bookmark,
  CheckCircle2,
  Compass,
  Layers,
  Printer,
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
      {/* 1. Header */}
      <AdminPageHeader title="System reports" />

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
            {/* Card 1: Total Students */}
            <KpiMetricCard
              icon={<Users className="size-5 text-primary-ink" />}
              iconBg="bg-primary/10"
              badge="Applicant pool"
              badgeColor="bg-primary/10 text-primary-ink"
              label="Total Students"
              value={data.studentCount.toLocaleString()}
              detail="Active registered student accounts"
            />

            {/* Card 2: Completed Assessments */}
            <KpiMetricCard
              icon={<CheckCircle2 className="size-5 text-primary-ink" />}
              iconBg="bg-primary/10"
              badge={`${completionRate}% rate`}
              badgeColor="bg-primary/10 text-primary-ink"
              label="Completed Assessments"
              value={data.completedAssessments.toLocaleString()}
              detail="Finalized RIASEC assessment sessions"
            />

            {/* Card 3: Students with Matches */}
            <KpiMetricCard
              icon={<Compass className="size-5 text-warning-ink" />}
              iconBg="bg-warning/15"
              badge="Results ready"
              badgeColor="bg-warning/15 text-warning-ink"
              label="Students with Matches"
              value={data.recommendationRuns.toLocaleString()}
              detail="Generated course recommendation sets"
            />

            {/* Card 4: Saved Programmes */}
            <KpiMetricCard
              icon={<Bookmark className="size-5 text-info-ink" />}
              iconBg="bg-info/15"
              badge="Shortlisted"
              badgeColor="bg-info/15 text-info-ink"
              label="Saved Programmes"
              value={data.programmeSaves.toLocaleString()}
              detail="Course bookmarks saved by students"
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
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <span className="font-label text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className={`flex size-10 items-center justify-center rounded-xl transition-transform duration-200 ${iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <strong className="block font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {value}
        </strong>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3 text-xs text-muted-foreground">
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 font-label text-[11px] font-bold ${badgeColor}`}
        >
          {badge}
        </span>
        <span className="font-medium text-muted-foreground">{detail}</span>
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
    <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border/70 bg-card/60 p-3.5 shadow-2xs">
      <form
        className="flex flex-wrap items-end gap-2.5"
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
          className="h-9 rounded-lg px-4 text-xs font-bold"
        >
          Apply dates
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={onClear}
        >
          Clear
        </Button>

        {invalid ? (
          <span role="alert" className="pb-2 text-xs font-bold text-destructive-ink">
            The end date must be on or after the start date.
          </span>
        ) : null}
      </form>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="h-9 rounded-lg gap-2 px-3.5 text-xs font-bold shadow-2xs hover:bg-secondary"
      >
        <Printer className="size-3.5 text-primary-ink" /> Print report
      </Button>
    </div>
  );
}
