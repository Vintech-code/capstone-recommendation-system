import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Layers,
  Users,
  type LucideIcon,
} from "lucide-react";

interface LifecycleStageItem {
  label: string;
  value: number;
  change: string;
  color: string;
  icon: LucideIcon;
}

interface ReportStageGaugeCardProps {
  completionRate: number;
  completedCount: number;
  stages: LifecycleStageItem[];
}

export function ReportStageGaugeCard({
  completionRate,
  completedCount,
  stages,
}: ReportStageGaugeCardProps) {
  const outerRatio = Math.min(1, Math.max(0.08, completionRate / 100));
  const midRatio = Math.min(1, Math.max(0.12, (completionRate * 0.75) / 100));
  const innerRatio = Math.min(1, Math.max(0.16, (completionRate * 0.5) / 100));

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs sm:p-7">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h2 className="font-display text-lg font-extrabold text-foreground sm:text-xl">
            Current stage distribution
          </h2>
          <p className="text-xs text-muted-foreground">
            Distribution across assessment stages
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-border/80 bg-secondary/70 px-3 py-1 text-xs font-bold text-foreground">
          <span>Active</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </span>
      </div>

      {/* Radial Gauge Arc using System Colors */}
      <div className="py-4">
        <div className="relative mx-auto flex aspect-square w-full max-w-[210px] items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="size-full -rotate-90 transform"
            aria-hidden="true"
          >
            {/* Background track rings using system border */}
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke="var(--border)"
              strokeWidth="9"
              opacity="0.5"
              strokeDasharray="380 478"
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="var(--border)"
              strokeWidth="9"
              opacity="0.5"
              strokeDasharray="300 377"
            />
            <circle
              cx="100"
              cy="100"
              r="44"
              fill="none"
              stroke="var(--border)"
              strokeWidth="9"
              opacity="0.5"
              strokeDasharray="220 276"
            />

            {/* Active colored arcs: Primary Green, Sun Warning, Info Mauve */}
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${Math.round(380 * outerRatio)} 478`}
              className="transition-all duration-1000"
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="var(--warning)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${Math.round(300 * midRatio)} 377`}
              className="transition-all duration-1000"
            />
            <circle
              cx="100"
              cy="100"
              r="44"
              fill="none"
              stroke="var(--info)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${Math.round(220 * innerRatio)} 276`}
              className="transition-all duration-1000"
            />
          </svg>

          {/* Center Statistic */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <strong className="font-display text-2xl font-black text-foreground sm:text-3xl">
              {completionRate}%
            </strong>
            <span className="text-[11px] font-bold text-muted-foreground">
              {completedCount} Completed
            </span>
            <span className="mt-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black text-primary-ink">
              +5.34%
            </span>
          </div>
        </div>
      </div>

      {/* Stage Categories Breakdown List */}
      <div className="space-y-3 divide-y divide-border/50 pt-2">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.label}
              className="flex items-center justify-between pt-3 first:pt-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex size-8 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                >
                  <Icon className="size-4" />
                </div>
                <span className="font-label text-xs font-bold text-foreground">
                  {stage.label}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-black tabular-nums text-foreground">
                  {stage.value}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    stage.change.startsWith("+")
                      ? "bg-primary/15 text-primary-ink"
                      : "bg-destructive/15 text-destructive-ink"
                  }`}
                >
                  {stage.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Activity, CheckCircle2, Layers, Users };
export type { LifecycleStageItem };
