import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  History,
  Route,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

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
  AdminPageHeader,
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

type MetricTone = "green" | "violet" | "yellow" | "pink";

const metricToneClasses: Record<
  MetricTone,
  { surface: string; icon: string; accent: string }
> = {
  green: {
    surface: "bg-primary-fixed",
    icon: "bg-primary text-primary-foreground",
    accent: "bg-primary",
  },
  violet: {
    surface:
      "bg-[color-mix(in_srgb,var(--riasec-i)_13%,var(--background))]",
    icon: "bg-[var(--riasec-i)] text-white",
    accent: "bg-[var(--riasec-i)]",
  },
  yellow: {
    surface: "bg-[var(--canvas-sun)]",
    icon: "bg-warning text-warning-foreground",
    accent: "bg-warning",
  },
  pink: {
    surface: "bg-[color-mix(in_srgb,var(--info)_13%,var(--background))]",
    icon: "bg-info text-info-foreground",
    accent: "bg-info",
  },
};

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
    <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-5">
      <AdminPageHeader
        eyebrow="Administrator workspace"
        title="System overview"
        description="Follow recorded Student movement from account creation to available programme recommendations."
      />

      <section
        aria-label="Current operational totals"
        data-testid="admin-operational-strip"
        className="grid overflow-hidden rounded-xs border border-border bg-card shadow-sm sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCell
          icon={UserRound}
          label="Students in scope"
          value={data.students}
          detail="Registered accounts"
          tone="green"
        />
        <MetricCell
          icon={ClipboardList}
          label="Assessment records"
          value={data.assessments}
          detail={`${data.inProgress} currently active`}
          tone="violet"
        />
        <MetricCell
          icon={BadgeCheck}
          label="Results available"
          value={data.completed}
          detail="Recorded results"
          tone="yellow"
        />
        <MetricCell
          icon={Route}
          label="Recommendation runs"
          value={data.recommendations}
          detail="Generated matches"
          tone="pink"
        />
      </section>

      <section
        aria-labelledby="funnel-heading"
        className="grid min-w-0 overflow-hidden rounded-xs border border-border bg-card shadow-sm xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]"
      >
        <div className="min-w-0 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SectionHeading
              id="funnel-heading"
              eyebrow="Assessment movement"
              title="Student journey"
              description="Recorded counts at each step of the current assessment journey."
            />
            <div className="rounded-xs border border-primary/25 bg-primary-fixed px-3 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-ink">
                Completion
              </p>
              <p className="font-display text-2xl font-black text-foreground">
                {completionRate}%
              </p>
            </div>
          </div>

          <div
            className="mt-5"
            role="img"
            aria-label={accessibleFunnelLabel}
          >
            <ChartContainer
              config={journeyChartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                data={chartData}
                margin={{ left: 0, right: 4, top: 10, bottom: 8 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={9}
                  className="font-label text-[10px]"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={24}
                  className="font-label text-[10px]"
                />
                <ChartTooltip
                  cursor={{ fill: "var(--secondary)" }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="students" radius={[2, 2, 0, 0]} maxBarSize={54}>
                  {chartData.map((entry) => (
                    <Cell key={entry.stage} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>Each color marks a named journey stage.</span>
            <strong className="font-semibold text-foreground">
              {data.funnel.resultAvailable} of {data.funnel.assessmentStarted}{" "}
              started assessments have results
            </strong>
          </div>
        </div>

        <aside className="border-t border-border bg-secondary/45 xl:border-l xl:border-t-0">
          <div className="border-b border-border px-4 py-4 sm:px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Recorded flow
            </p>
            <h3 className="mt-1 font-display text-lg font-extrabold">
              Journey stage detail
            </h3>
          </div>
          <ol className="divide-y divide-border">
            {chartData.map((item, index) => (
              <li
                key={item.stage}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5"
              >
                <span
                  aria-hidden="true"
                  className="flex size-7 items-center justify-center rounded-xs text-[10px] font-black text-foreground"
                  style={{ backgroundColor: item.color }}
                >
                  {index + 1}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {item.stage}
                </span>
                <strong className="font-display text-lg font-black">
                  {item.students}
                </strong>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section aria-labelledby="recent-heading" className="min-w-0 pt-1">
        <div className="flex flex-wrap items-end justify-between gap-4">
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
            onClick={() => onNavigate("/admin/students")}
          >
            View all records <ArrowRight className="size-4" />
          </Button>
        </div>

        {data.recentActivity.length ? (
          <div className="mt-4 overflow-hidden rounded-xs border border-border bg-card shadow-sm">
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/70 text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-3 py-3">Entrance group</th>
                    <th className="px-3 py-3">Top match</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-right">Date</th>
                    <th className="px-4 py-3 text-right"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
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
                      <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4">
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

function MetricCell({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
  tone: MetricTone;
}) {
  const colors = metricToneClasses[tone];

  return (
    <div
      className={cn(
        "relative min-w-0 border-b border-border p-4 last:border-b-0 sm:min-h-32 sm:border-r sm:[&:nth-child(2)]:border-r-0 xl:border-b-0 xl:[&:nth-child(2)]:border-r xl:last:border-r-0",
        colors.surface,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-1", colors.accent)}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-foreground">
            {label}
          </p>
          <strong className="mt-2 block font-display text-3xl font-black leading-none text-foreground">
            {value}
          </strong>
          <p className="mt-2 text-xs font-medium text-foreground">
            {detail}
          </p>
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xs shadow-sm",
            colors.icon,
          )}
        >
          <Icon aria-hidden="true" className="size-4.5" />
        </span>
      </div>
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
    <tr className="transition-colors hover:bg-secondary/45">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <StudentMarker name={name} color={color} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{name}</p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {item.studentEmail ?? "Email unavailable"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 font-medium text-muted-foreground">
        {entranceGroupLabel(item)}
      </td>
      <td className="max-w-48 truncate px-3 py-3 font-semibold text-foreground">
        {topMatchLabel(item)}
      </td>
      <td className="px-3 py-3 text-center">
        <StatusBadge status={item.status} />
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-right text-[10px] text-muted-foreground">
        {formatDate(item.resultAvailableAt ?? item.submittedAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-9 px-2.5"
          onClick={onOpen}
          aria-label={`Open ${name}'s Student record`}
        >
          Open <ArrowRight aria-hidden="true" className="size-3.5" />
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
      className="flex size-9 shrink-0 items-center justify-center rounded-xs text-[10px] font-black text-foreground"
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
          "font-display font-extrabold tracking-tight",
          compact ? "text-lg" : "text-xl",
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
      className="gap-1 whitespace-nowrap py-0.5 text-[10px]"
    >
      <Icon className="size-3" />
      {labels[status]}
    </Badge>
  );
}
