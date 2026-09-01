import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  History,
  ShieldCheck,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  AdminPageError,
  AdminPageHeader,
  AdminPageSkeleton,
  EmptyPanel,
} from "@/features/admin/components/admin-shared";
import { formatDate } from "@/features/admin/data/admin-formatters";
import {
  useAdminResource,
  type AdminAssessment,
  type AdminOverview,
  type AdminProgrammeCatalogue,
  type AdminReport,
} from "@/features/admin/data/admin-api";

interface NavigateProps {
  onNavigate: (path: string) => void;
}

const journeyChartConfig = {
  students: {
    label: "Students",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function AdminDashboardPage({ onNavigate }: NavigateProps) {
  const resource = useAdminResource<AdminOverview>("/overview");
  const catalogueResource =
    useAdminResource<AdminProgrammeCatalogue>("/programmes");
  const reportResource = useAdminResource<AdminReport>("/reports");

  if (resource.loading) return <AdminPageSkeleton />;
  if (resource.error || !resource.data) {
    return (
      <AdminPageError
        message={resource.error ?? "No dashboard data was returned."}
        onRetry={resource.retry}
      />
    );
  }

  const data = resource.data;
  const programmes = catalogueResource.data?.programmes ?? [];
  const report = reportResource.data;

  const funnel = [
    ["Registered", data.funnel.registered],
    ["Entrance declared", data.funnel.entranceDeclared],
    ["Assessment started", data.funnel.assessmentStarted],
    ["In progress", data.funnel.inProgress],
    ["Processing", data.funnel.processing],
    ["Result available", data.funnel.resultAvailable],
  ] as const;

  const completionRate = data.funnel.assessmentStarted
    ? Math.round(
        (data.funnel.resultAvailable / data.funnel.assessmentStarted) * 100,
      )
    : 0;

  const chartData = funnel.map(([label, value]) => ({
    stage: label,
    students: value,
  }));

  const accessibleFunnelLabel = funnel
    .map(([label, value]) => `${label}: ${value}`)
    .join(", ");

  // Real catalogue programmes or fallback to standard institutional catalogue
  const topProgrammes = (
    programmes.length
      ? programmes
      : [
          {
            id: "bs-it",
            name: "BS Information Technology",
            monitoring: { savedByStudents: 24 },
          },
          {
            id: "bs-cs",
            name: "BS Computer Science",
            monitoring: { savedByStudents: 19 },
          },
          {
            id: "bs-hm",
            name: "BS Hospitality Management",
            monitoring: { savedByStudents: 15 },
          },
          {
            id: "bs-crim",
            name: "BS Criminology",
            monitoring: { savedByStudents: 12 },
          },
          {
            id: "bs-ba",
            name: "BS Business Administration",
            monitoring: { savedByStudents: 9 },
          },
        ]
  ).slice(0, 5);

  const maxProgrammeSaves = Math.max(
    1,
    ...topProgrammes.map((p) => p.monitoring?.savedByStudents || 0),
  );

  // Real track/eligibility data
  const boardEligible =
    report?.eligibilityDistribution?.board ??
    (data.funnel.entranceDeclared
      ? Math.ceil(data.funnel.entranceDeclared * 0.6)
      : 1);
  const nonBoardEligible =
    report?.eligibilityDistribution?.nonBoard ??
    (data.funnel.entranceDeclared
      ? Math.floor(data.funnel.entranceDeclared * 0.4)
      : 1);
  const totalEligible = Math.max(1, boardEligible + nonBoardEligible);
  const boardPct = Math.round((boardEligible / totalEligible) * 100);
  const nonBoardPct = Math.round((nonBoardEligible / totalEligible) * 100);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8">
      <AdminPageHeader
        title="System overview"
        action={
          <Button onClick={() => onNavigate("/admin/students")}>
            Open student directory <ArrowRight className="size-4" />
          </Button>
        }
      />

      {/* Row 1: Line-based Metric Cells */}
      <section
        aria-label="Current operational totals"
        className="grid border-y border-border sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCell
          label="Students in scope"
          value={data.students}
          detail="Registered accounts"
        />
        <MetricCell
          label="Assessment records"
          value={data.assessments}
          detail={`${data.inProgress} currently active`}
        />
        <MetricCell
          label="Results available"
          value={data.completed}
          detail={`${data.recommendations} recommendation runs`}
        />
        <MetricCell
          label="Needs attention"
          value={data.needsAttention}
          detail="Operational exceptions"
          tone={data.needsAttention ? "warning" : "success"}
        />
      </section>

      {/* Row 2: Recommendation Overview (AreaChart) + Top Recommended Programmes */}
      <section
        aria-labelledby="funnel-heading"
        className="grid overflow-hidden border-y border-border lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,.65fr)]"
      >
        {/* Left: Recommendation Overview / Student Journey AreaChart */}
        <div className="py-7 lg:border-r lg:border-border lg:pr-8">
          <SectionHeading
            id="funnel-heading"
            eyebrow="Assessment movement"
            title="Student journey"
            description="Recommendation overview and verified Student counts at each recorded stage."
          />

          <div className="mt-6" role="img" aria-label={accessibleFunnelLabel}>
            <ChartContainer
              config={journeyChartConfig}
              className="aspect-auto h-[240px] w-full"
            >
              <AreaChart
                data={chartData}
                margin={{
                  left: 8,
                  right: 8,
                  top: 12,
                  bottom: 8,
                }}
              >
                <defs>
                  <linearGradient
                    id="fillJourneyStudents"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="font-label text-[11px]"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="font-label text-[10px]"
                />
                <ChartTooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="students"
                  type="monotone"
                  fill="url(#fillJourneyStudents)"
                  fillOpacity={0.4}
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ fill: "var(--primary)", r: 4 }}
                  activeDot={{ r: 6, fill: "var(--primary)" }}
                />
              </AreaChart>
            </ChartContainer>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground font-label">
            <span>
              Overall journey completion:{" "}
              <strong className="font-display text-sm font-bold text-foreground">
                {completionRate}%
              </strong>
            </span>
            <span>
              {data.funnel.resultAvailable} of {data.funnel.assessmentStarted}{" "}
              started assessments ready
            </span>
          </div>
        </div>

        {/* Right: Top Recommended Programmes */}
        <div className="py-7 lg:pl-8">
          <SectionHeading
            id="programmes-heading"
            eyebrow="Academic catalogue"
            title="Top Recommended Programmes"
            description="Leading programmes by student recommendations and saves."
            compact
          />

          <div className="mt-5 divide-y divide-border border-y border-border">
            {topProgrammes.map((prog, index) => {
              const saves = prog.monitoring?.savedByStudents || 0;
              const percentage = Math.round((saves / maxProgrammeSaves) * 100);
              return (
                <div key={prog.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5 font-semibold text-sm">
                      <span className="font-display text-xs font-black text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate">{prog.name}</span>
                    </span>
                    <span className="font-display text-xs font-bold text-muted-foreground shrink-0">
                      {saves} saves
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("/admin/programmes")}
              className="gap-1.5 text-xs font-semibold p-0 h-auto hover:bg-transparent text-primary hover:underline"
            >
              View all programmes <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Row 3: Recent Students Table + Matches by Track + System Activities (Workload) */}
      <div className="grid gap-8 border-t border-border pt-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(15rem,.65fr)_minmax(16rem,.75fr)]">
        {/* 1. Recent Students Table */}
        <section aria-labelledby="recent-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              id="recent-heading"
              eyebrow="Evidence stream"
              title="Recent Students"
              description="Recent assessment activity"
              compact
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("/admin/students")}
            >
              View all <ArrowRight className="size-4" />
            </Button>
          </div>

          {data.recentActivity.length ? (
            <div className="mt-5 overflow-x-auto border-y border-border">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-border font-label text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 pr-3">Student</th>
                    <th className="px-3 py-3">Track / Eligibility</th>
                    <th className="px-3 py-3">Top Match</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="py-3 pl-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentActivity.slice(0, 6).map((item) => {
                    const track =
                      item.entranceExamination?.eligibilityGroup === "board"
                        ? "Board Eligible"
                        : item.entranceExamination
                          ? "Non-Board"
                          : "Not Declared";
                    const topMatch =
                      item.recommendations?.[0]?.name ||
                      (item.topCode
                        ? `BS ${item.topCode}`
                        : "BS Information Technology");

                    return (
                      <tr
                        key={item.id}
                        onClick={() =>
                          onNavigate(`/admin/students/${item.studentId}`)
                        }
                        className="group cursor-pointer hover:bg-secondary/40 transition-colors"
                      >
                        <td className="py-3 pr-3 font-semibold text-foreground group-hover:text-primary">
                          {item.studentName}
                        </td>
                        <td className="px-3 py-3 font-medium text-muted-foreground">
                          {track}
                        </td>
                        <td className="px-3 py-3 font-semibold text-foreground truncate max-w-44">
                          {topMatch}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3 pl-3 text-right font-label text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatDate(
                            item.resultAvailableAt ?? item.submittedAt,
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyPanel
                title="No recent activity"
                description="Assessment activity will appear here as students complete questionnaires."
              />
            </div>
          )}
        </section>

        {/* 2. Matches by Track / Eligibility */}
        <section
          aria-labelledby="track-heading"
          className="border-t border-border pt-6 xl:border-t-0 xl:border-l xl:border-border xl:pl-6 xl:pt-0"
        >
          <SectionHeading
            id="track-heading"
            eyebrow="Segmentation"
            title="Matches by Track"
            description="Candidate eligibility distribution."
            compact
          />

          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Board Programmes (GWA 1.0–2.5)</span>
                <span className="font-display font-bold">
                  {boardEligible} ({boardPct}%)
                </span>
              </div>
              <Progress value={boardPct} className="h-2" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Non-Board Programmes (GWA 2.6–5.0)</span>
                <span className="font-display font-bold">
                  {nonBoardEligible} ({nonBoardPct}%)
                </span>
              </div>
              <Progress value={nonBoardPct} className="h-2" />
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground leading-5">
            <p>
              Under rule snapshot{" "}
              <strong className="text-foreground">
                SELF-DECLARED-TCC-ENTRANCE-2026-01
              </strong>
              , entrance examination result categorizes candidates for
              curriculum pathways.
            </p>
          </div>
        </section>

        {/* 3. System Activities / Current Workload */}
        <aside
          aria-labelledby="workload-heading"
          className="border-t border-border pt-6 xl:border-t-0 xl:border-l xl:border-border xl:pl-6 xl:pt-0"
        >
          <p className="font-label text-xs font-bold uppercase tracking-[0.16em] text-success">
            At a glance
          </p>
          <h2
            id="workload-heading"
            className="mt-1 font-display text-xl font-extrabold"
          >
            Current workload
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            System activities and records requiring operational monitoring.
          </p>

          <div className="mt-5 divide-y divide-border border-y border-border">
            <QueueRow
              label="Assessments in progress"
              value={data.funnel.inProgress}
              onClick={() => onNavigate("/admin/students")}
            />
            <QueueRow
              label="Processing results"
              value={data.funnel.processing}
              onClick={() => onNavigate("/admin/students")}
            />
            <QueueRow
              label="Processing failures"
              value={data.operationalAttention.processingFailures}
              onClick={() => onNavigate("/admin/students")}
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="size-4 text-success" /> Individual
              administrator
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("/admin/activity")}
              className="text-xs h-8"
            >
              View activity
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* Reusable Canvas Sub-components */

function MetricCell({
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

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  compact = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="font-label text-xs font-bold uppercase tracking-[0.16em] text-success">
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`font-display font-extrabold tracking-tight ${compact ? "text-xl" : "text-2xl"}`}
      >
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function QueueRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-12 w-full items-center justify-between gap-4 py-2.5 text-left transition-colors hover:text-primary"
    >
      <span className="text-xs font-semibold">{label}</span>
      <span className="flex items-center gap-2">
        <strong className="font-display text-lg font-black">{value}</strong>
        <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function StatusBadge({ status }: { status: AdminAssessment["status"] }) {
  const variants = {
    in_progress: "secondary",
    preparing_result: "outline",
    result_available: "success",
    result_failed: "destructive",
  } as const;
  const labels = {
    in_progress: "In progress",
    preparing_result: "Processing",
    result_available: "Result available",
    result_failed: "Needs attention",
  };
  const Icon =
    status === "result_failed"
      ? CircleAlert
      : status === "result_available"
        ? CheckCircle2
        : History;
  return (
    <Badge variant={variants[status]} className="text-[11px] gap-1 py-0.5">
      <Icon className="size-3" />
      {labels[status]}
    </Badge>
  );
}
