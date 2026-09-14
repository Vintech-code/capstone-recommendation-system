import { ArrowRight, CheckCircle2, CircleAlert, History } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import adminBanner from "@/assets/images/admin-banner.png";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/features/admin/data/admin-formatters";
import {
  useAdminResource,
  type AdminAssessment,
  type AdminOverview,
} from "@/features/admin/data/admin-api";
import { cn } from "@/lib/utils";

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
    ? Math.round(
        (data.funnel.resultAvailable / data.funnel.assessmentStarted) * 100,
      )
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
      {/* TOP SECTION: 2-COLUMN SPLIT MATCHING THE REFERENCE COMPOSITION (60% / 40%) */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-5 items-stretch">
        {/* LEFT COLUMN: 60% WIDTH FEATURE CARD */}
        <section
          aria-label="Welcome and workspace overview"
          className="lg:col-span-3 flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[#ECE7DC] bg-[#FAF8F2] p-5 sm:p-6 lg:p-7 shadow-xs relative"
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative z-10 pb-4 sm:pb-6">
            {/* Title & Action Button */}
            <div className="space-y-3 sm:space-y-4 max-w-sm sm:max-w-md py-1">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-black leading-[1.12] tracking-tight text-foreground">
                System overview
              </h1>

              <div>
                <Button
                  onClick={() => onNavigate("/admin/students")}
                  className="rounded-full bg-[#1A1F16] text-white hover:bg-[#2C3426] px-5 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition-colors inline-flex items-center gap-2"
                >
                  View all records <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>

            {/* Prominent 3D Character Illustration */}
            <div className="relative flex justify-center sm:justify-end self-center sm:self-end shrink-0">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-full bg-emerald-100/60 blur-2xl -z-10"
              />
              <img
                src={adminBanner}
                alt="Administrator reviewing guidance documentation and student records"
                className="h-44 sm:h-52 lg:h-56 xl:h-64 w-auto object-contain drop-shadow-md select-none"
              />
            </div>
          </div>

          {/* Bottom Half: Pure White Glassy Card with 3 Stats - Overlaying the lower portion of the avatar */}
          <div
            data-testid="admin-operational-strip"
            className="-mt-8 sm:-mt-12 lg:-mt-14 relative z-20 overflow-hidden rounded-[1.5rem] border border-white/90 bg-card bg-white/95 backdrop-blur-xl p-4 sm:p-4.5 lg:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] grid grid-cols-3 divide-x divide-neutral-200/70"
          >
            {/* Stat 1: Active students */}
            <div className="px-2.5 sm:px-4">
              <p className="text-xs sm:text-sm font-semibold text-neutral-600 truncate">
                Active students
              </p>
              <div className="mt-1.5 flex items-baseline gap-1.5 sm:gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {data.students}
                </span>
                <span className="inline-flex items-center text-xs sm:text-sm font-bold text-emerald-600">
                  ▲ 32%
                </span>
              </div>
            </div>

            {/* Stat 2: Results ready */}
            <div className="px-2.5 sm:px-4">
              <p className="text-xs sm:text-sm font-semibold text-neutral-600 truncate">
                Results ready
              </p>
              <div className="mt-1.5 flex items-baseline gap-1.5 sm:gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {data.completed}
                </span>
                <span className="inline-flex items-center text-xs sm:text-sm font-bold text-emerald-600">
                  ▲ {completionRate}%
                </span>
              </div>
            </div>

            {/* Stat 3: In progress */}
            <div className="px-2.5 sm:px-4">
              <p className="text-xs sm:text-sm font-semibold text-neutral-600 truncate">
                In progress
              </p>
              <div className="mt-1.5 flex items-baseline gap-1.5 sm:gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {data.inProgress}
                </span>
                <span className="inline-flex items-center text-xs sm:text-sm font-bold text-rose-500">
                  ▼ {data.inProgress > 0 ? "Active" : "0%"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: 40% WIDTH TWO COMPACT STACKED CARDS */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5 justify-between">
          {/* Card 1 (Top Right): "Student journey" Bar Chart (like "Membership" in reference) */}
          <section
            aria-labelledby="funnel-heading"
            className="flex-1 flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/80 bg-card p-4.5 sm:p-5 shadow-xs"
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
                    tickFormatter={(val: string) => {
                      const words = val.split(" ");
                      return words[0];
                    }}
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
              {data.funnel.resultAvailable} of {data.funnel.assessmentStarted}{" "}
              completed
            </p>
          </section>

          {/* Card 2 (Bottom Right): "Journey stage detail" with Circular Gauge (like "Audiences" in reference) */}
          <section
            aria-labelledby="flow-heading"
            className="flex-1 flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/80 bg-card p-4.5 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Recorded flow
                </p>
                <h3
                  id="flow-heading"
                  className="mt-0.5 font-display text-base sm:text-lg font-black tracking-tight text-foreground"
                >
                  Journey stage detail
                </h3>
              </div>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold text-foreground border border-border/70 shadow-2xs">
                6 stages
              </span>
            </div>

            {/* Circular Gauge / Percentage Widget matching "Audiences" composition */}
            <div className="mt-3 flex items-center gap-5">
              {/* Circular Ring */}
              <div className="relative size-16 shrink-0 flex items-center justify-center">
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
                <span className="absolute font-display text-xs font-extrabold text-foreground">
                  {completionRate}%
                </span>
              </div>

              {/* Stats detail */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2.5xl font-black text-foreground">
                    {completionRate}%
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    completion
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                    <span
                      className="size-2 rounded-full bg-emerald-500"
                      aria-hidden="true"
                    />
                    Ready: {data.funnel.resultAvailable}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600">
                    <span
                      className="size-2 rounded-full bg-rose-500"
                      aria-hidden="true"
                    />
                    In progress: {data.funnel.inProgress}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-2 text-right text-[11px] font-medium text-muted-foreground">
              {data.funnel.resultAvailable} of{" "}
              {data.funnel.assessmentStarted || 1} assessments completed
            </p>
          </section>
        </div>
      </div>

      {/* BOTTOM SECTION: FULL-WIDTH RECENT STUDENTS TABLE WITH UNIFIED ROUNDED-[2REM] */}
      <section
        aria-labelledby="recent-heading"
        className="overflow-hidden rounded-[2rem] border border-border/80 bg-card p-6 sm:p-7 shadow-xs"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5">
          <SectionHeading
            id="recent-heading"
            eyebrow="Evidence stream"
            title="Recent Students"
            description="Latest recorded assessment activity and available evidence."
            compact
          />
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4 text-xs font-semibold bg-surface hover:bg-surface-subtle"
            onClick={() => onNavigate("/admin/students")}
          >
            View all records <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </div>

        {data.recentActivity.length ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-border/70 bg-surface/50">
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/60 text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Entrance group</th>
                    <th className="px-4 py-3.5">Top match</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Date</th>
                    <th className="px-5 py-3.5 text-right">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
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

            <ul className="divide-y divide-border sm:hidden">
              {data.recentActivity.slice(0, 6).map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate(`/admin/students/${item.studentId}`)
                    }
                    className="grid min-h-24 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/30"
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
                      <span className="mt-1 block truncate text-xs font-semibold text-foreground">
                        {topMatchLabel(item)}
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
          <div className="mt-5">
            <EmptyPanel
              title="No recent activity"
              description="Assessment activity will appear here as students complete questionnaires."
            />
          </div>
        )}
      </section>
    </div>
  );
}

function RecentStudentRow({
  item,
  color,
  onOpen,
}: {
  item: AdminAssessment;
  color: string;
  onOpen: () => void;
}) {
  const name = studentName(item);

  return (
    <tr className="transition-colors hover:bg-secondary/40">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <StudentMarker name={name} color={color} />
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground text-xs sm:text-sm">
              {name}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {item.studentEmail ?? "Email unavailable"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 font-medium text-muted-foreground">
        {entranceGroupLabel(item)}
      </td>
      <td className="max-w-48 truncate px-4 py-3.5 font-semibold text-foreground">
        {topMatchLabel(item)}
      </td>
      <td className="px-4 py-3.5 text-center">
        <StatusBadge status={item.status} />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-right text-[11px] text-muted-foreground">
        {formatDate(item.resultAvailableAt ?? item.submittedAt)}
      </td>
      <td className="px-5 py-3.5 text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-8 rounded-full px-3 text-xs font-semibold hover:bg-surface"
          onClick={onOpen}
          aria-label={`Open ${name}'s Student record`}
        >
          Open <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Button>
      </td>
    </tr>
  );
}

function StudentMarker({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black text-foreground shadow-2xs"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 20%, var(--background))`,
      }}
    >
      {initials || "ST"}
    </span>
  );
}

function studentName(item: AdminAssessment) {
  return item.studentName ?? "Student record";
}

function entranceGroupLabel(item: AdminAssessment) {
  if (!item.entranceExamination) return "Not declared";
  return item.entranceExamination.eligibilityGroup === "board"
    ? "Board programme group"
    : "Non-board programme group";
}

function topMatchLabel(item: AdminAssessment) {
  return item.recommendations?.[0]?.name ?? "Not available";
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
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-ink">
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "font-display font-extrabold tracking-tight text-foreground",
          compact ? "text-lg" : "text-xl sm:text-2xl",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
    </div>
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
    <Badge
      variant={variants[status]}
      className="gap-1 whitespace-nowrap py-0.5 text-[10px] font-bold"
    >
      <Icon className="size-3" />
      {labels[status]}
    </Badge>
  );
}
