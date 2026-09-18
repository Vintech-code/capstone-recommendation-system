import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Compass,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import adminBanner from "@/assets/images/admin-banner.png";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AdminPageError,
  AdminPageSkeleton,
  EmptyPanel,
} from "@/features/admin/components/admin-shared";
import {
  RecentStudentRow,
  StudentMarker,
  StatusBadge,
} from "@/features/admin/components/admin-dashboard-widgets";
import {
  entranceGroupLabel,
  studentName,
} from "@/features/admin/components/admin-dashboard-helpers";
import {
  useAdminResource,
  type AdminOverview,
} from "@/features/admin/data/admin-api";

interface NavigateProps {
  onNavigate: (path: string) => void;
}

const journeyColors = [
  "var(--riasec-i)",
  "var(--chart-coral)",
  "var(--chart-yellow)",
  "var(--chart-pink)",
  "var(--chart-teal)",
  "var(--chart-green)",
];

const journeyChartConfig = {
  students: {
    label: "Students",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function AdminDashboardPage({ onNavigate }: NavigateProps) {
  const resource = useAdminResource<AdminOverview>("/overview");

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
  const funnel = [
    ["Registered", data.funnel.registered],
    ["Entrance declared", data.funnel.entranceDeclared],
    ["Assessment started", data.funnel.assessmentStarted],
    ["In progress", data.funnel.inProgress],
    ["Processing", data.funnel.processing],
    ["Result available", data.funnel.resultAvailable],
  ] as const;

  const completionRate = data.funnel.assessmentStarted
    ? Math.round((data.funnel.resultAvailable / data.funnel.assessmentStarted) * 100)
    : 0;
  const entranceRate = data.students
    ? Math.round((data.funnel.entranceDeclared / data.students) * 100)
    : 0;
  const recommendationsRate = data.students
    ? Math.round((data.recommendations / data.students) * 100)
    : 0;

  const chartData = funnel.map(([stage, students], index) => ({
    stage,
    students,
    color: journeyColors[index],
  }));

  const accessibleFunnelLabel = funnel
    .map(([label, value]) => `${label}: ${value}`)
    .join(", ");

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-4 sm:space-y-5">
      {/* TOP SECTION: 2-COLUMN SPLIT (40% / 60%) */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-5 items-stretch">
        {/* LEFT COLUMN: 40% WIDTH */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5 justify-between">
          <section
            aria-label="Welcome and workspace overview"
            className="flex flex-col gap-2.5 sm:gap-3 overflow-hidden rounded-xl border border-[#ECE7DC] bg-[#FAF8F2] p-3.5 sm:p-4 shadow-xs relative"
          >
            {/* Subtle Ambient Glow Shapes (No bg-gradient) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 -left-10 size-64 rounded-full bg-amber-100/40 blur-3xl -z-0"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 right-10 size-72 rounded-full bg-emerald-100/30 blur-3xl -z-0"
            />

            {/* Top Half: Title + Button on Left, Prominent 3D Avatar on Right */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
              <div className="space-y-2.5 sm:space-y-3 max-w-xs sm:max-w-sm py-0.5">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-[1.85rem] xl:text-[2.15rem] font-black leading-[1.12] tracking-tight text-foreground">
                  System overview
                </h1>

                <div>
                  <Button
                    onClick={() => onNavigate("/admin/students")}
                    className="rounded-full bg-[#1A1F16] text-white hover:bg-[#2C3426] px-4.5 py-2 text-xs sm:text-sm font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    View all records <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Prominent 3D Character Illustration */}
              <div className="relative flex justify-center sm:justify-end self-center sm:self-end shrink-0">
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-full bg-emerald-100/60 blur-2xl -z-10"
                />
                <img
                  src={adminBanner}
                  alt="Administrator reviewing guidance documentation and student records"
                  className="h-36 sm:h-44 lg:h-48 xl:h-52 w-auto object-contain drop-shadow-md select-none"
                />
              </div>
            </div>

            {/* Bottom Half: Pure White Glassy Card with 3 Stats - Overlaying the lower portion of the avatar */}
            <div
              data-testid="admin-operational-strip"
              className="relative z-20 mt-1 sm:mt-2 overflow-hidden rounded-xl border border-white/90 bg-card bg-white/95 backdrop-blur-xl p-3 sm:p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] grid grid-cols-3 divide-x divide-neutral-200/70"
            >
              {/* Stat 1: Active students */}
              <div className="px-2 sm:px-2.5 lg:px-2 xl:px-3">
                <p className="text-[11px] sm:text-xs font-semibold text-neutral-600 leading-tight">
                  Active students
                </p>
                <div className="mt-1 flex items-baseline gap-1 sm:gap-1.5">
                  <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {data.students}
                  </span>
                  <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-emerald-600">
                    ▲ 32%
                  </span>
                </div>
              </div>

              {/* Stat 2: Results ready */}
              <div className="px-2 sm:px-2.5 lg:px-2 xl:px-3">
                <p className="text-[11px] sm:text-xs font-semibold text-neutral-600 leading-tight">
                  Results ready
                </p>
                <div className="mt-1 flex items-baseline gap-1 sm:gap-1.5">
                  <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {data.completed}
                  </span>
                  <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-emerald-600">
                    ▲ {completionRate}%
                  </span>
                </div>
              </div>

              {/* Stat 3: In progress */}
              <div className="px-2 sm:px-2.5 lg:px-2 xl:px-3">
                <p className="text-[11px] sm:text-xs font-semibold text-neutral-600 leading-tight">
                  In progress
                </p>
                <div className="mt-1 flex items-baseline gap-1 sm:gap-1.5">
                  <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {data.inProgress}
                  </span>
                  <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-rose-500">
                    ▼ {data.inProgress > 0 ? "Active" : "0%"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Engine Status & Quick Navigation */}
          <section
            aria-label="System status and quick access"
            className="flex-1 flex flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Recommendation Engine
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    RIASEC 6-factor model active
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                {data.recommendations} generated
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate("/admin/programmes")}
                className="group flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-2.5 sm:p-3 text-left transition-all hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-foreground shadow-2xs group-hover:text-primary-ink">
                  <BookOpen className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">Programmes</p>
                  <p className="truncate text-[10px] text-muted-foreground">Catalogue & rules</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("/admin/students")}
                className="group flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-2.5 sm:p-3 text-left transition-all hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-foreground shadow-2xs group-hover:text-primary-ink">
                  <Users className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">Students</p>
                  <p className="truncate text-[10px] text-muted-foreground">Records & status</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("/admin/assessment-monitoring")}
                className="group flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-2.5 sm:p-3 text-left transition-all hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-foreground shadow-2xs group-hover:text-primary-ink">
                  <Compass className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">Assessment</p>
                  <p className="truncate text-[10px] text-muted-foreground">Session progress</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("/admin/reports")}
                className="group flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-2.5 sm:p-3 text-left transition-all hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-foreground shadow-2xs group-hover:text-primary-ink">
                  <BarChart3 className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">Reports</p>
                  <p className="truncate text-[10px] text-muted-foreground">Cohort analytics</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: 60% WIDTH TWO COMPACT STACKED CARDS */}
        <div className="lg:col-span-3 flex flex-col gap-4 sm:gap-5 justify-between">
          {/* Card 1 (Top Right): "Student journey" Bar Chart */}
          <section
            aria-labelledby="funnel-heading"
            className="flex-1 flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-4.5 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-ink">
                  Assessment movement
                </p>
                <h2
                  id="funnel-heading"
                  className="mt-0.5 font-display text-base sm:text-lg font-black tracking-tight text-foreground"
                >
                  Student journey
                </h2>
              </div>
              <span className="rounded-full bg-primary-fixed px-3 py-0.5 text-xs font-extrabold text-primary-ink border border-primary/25">
                {completionRate}% rate
              </span>
            </div>

            <div
              className="mt-2.5"
              role="img"
              aria-label={accessibleFunnelLabel}
            >
              <ChartContainer
                config={journeyChartConfig}
                className="aspect-auto h-[115px] w-full"
              >
                <BarChart
                  data={chartData}
                  margin={{ left: -18, right: 4, top: 4, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="stage"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    className="font-label text-[9px]"
                    tickFormatter={(val: string) => val.split(" ")[0]}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    className="font-label text-[9px]"
                  />
                  <ChartTooltip
                    cursor={{ fill: "var(--secondary)" }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="students" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {chartData.map((entry) => (
                      <Cell key={entry.stage} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>

            <p className="mt-2 text-right text-[11px] font-semibold text-muted-foreground">
              {data.funnel.resultAvailable} of {data.funnel.assessmentStarted} completed
            </p>
          </section>

          {/* Card 2 (Bottom Right): Assessment Milestones fulfilling wide space cleanly */}
          <section
            aria-labelledby="flow-heading"
            className="flex-1 flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-4 sm:p-4.5 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Institutional throughput
                </p>
                <h3
                  id="flow-heading"
                  className="mt-0.5 font-display text-base sm:text-lg font-black tracking-tight text-foreground"
                >
                  Assessment Milestones
                </h3>
              </div>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold text-foreground border border-border/70 shadow-2xs">
                Live metrics
              </span>
            </div>

            {/* Content: Left side Circular Gauge + Right side Milestone Progress Bars */}
            <div className="mt-2.5 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              {/* Left Widget: Circular Gauge with completion summary */}
              <div className="flex items-center gap-3.5 shrink-0 sm:border-r sm:border-border/60 sm:pr-5">
                <div className="relative size-14 shrink-0 flex items-center justify-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-border/60"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary transition-all duration-500 ease-out"
                      strokeDasharray={`${completionRate}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-display text-[11px] font-extrabold text-foreground">
                    {completionRate}%
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-display text-xl sm:text-2xl font-black text-foreground">
                    {completionRate}%
                  </span>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Completion rate
                  </p>
                  <p className="text-[10px] text-muted-foreground/80">
                    {data.funnel.resultAvailable} of {data.funnel.assessmentStarted || 1} ready
                  </p>
                </div>
              </div>

              {/* Right Widget: Milestone Progress Bars fulfilling the wide card */}
              <div className="flex-1 w-full space-y-2.5">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Entrance Exam Declared</span>
                    <span className="font-bold text-muted-foreground">{data.funnel.entranceDeclared} of {data.students} ({entranceRate}%)</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted/60">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, entranceRate)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Course Recommendations Delivered</span>
                    <span className="font-bold text-muted-foreground">{data.recommendations} of {data.students} ({recommendationsRate}%)</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted/60">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, recommendationsRate)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-1.5 text-[10px] sm:text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {data.funnel.resultAvailable} results ready
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-amber-600">
                <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                {data.funnel.inProgress} in progress
              </span>
            </div>
          </section>
        </div>
      </div>

      {/* BOTTOM SECTION: RECENT STUDENTS */}
      <section aria-labelledby="recent-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-4 pb-1">
          <h2
            id="recent-heading"
            className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-foreground"
          >
            Recent Students
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg border-border/80 bg-background px-3 text-xs font-semibold shadow-2xs hover:bg-muted"
            onClick={() => onNavigate("/admin/students")}
          >
            View all records <ArrowRight className="size-3.5" />
          </Button>
        </div>

        {data.recentActivity.length ? (
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-2xs">
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40 text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Entrance group</th>
                    <th className="px-4 py-3.5">RIASEC code</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Date</th>
                    <th className="px-5 py-3.5 text-right">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.recentActivity.slice(0, 6).map((item, index) => (
                    <RecentStudentRow
                      key={item.id}
                      item={item}
                      color={journeyColors[index % journeyColors.length]}
                      onOpen={() =>
                        onNavigate(`/admin/students/${item.studentId}`)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-border/50 sm:hidden">
              {data.recentActivity.slice(0, 6).map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate(`/admin/students/${item.studentId}`)
                    }
                    className="grid min-h-24 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/30"
                  >
                    <StudentMarker
                      name={studentName(item)}
                      color={journeyColors[index % journeyColors.length]}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-foreground">
                        {studentName(item)}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {entranceGroupLabel(item)}
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        RIASEC:{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {item.topCode ?? "Pending"}
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-2">
                      <StatusBadge status={item.status} />
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyPanel
            title="No recent activity"
            description="Assessment activity will appear here as students complete questionnaires."
          />
        )}
      </section>
    </div>
  );
}
