import { Check, Laptop, Moon, Sun } from "lucide-react";
import {
  useAdminTheme,
  type AdminThemeMode,
} from "@/features/admin/theme/admin-theme-context";
import { cn } from "@/lib/utils";

const options: Array<{
  value: AdminThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: "light",
    label: "Light mode",
    description: "Clean, high-visibility daylight interface.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark mode",
    description: "Low-glare, dark charcoal with emerald accents.",
    icon: Moon,
  },
  {
    value: "system",
    label: "System default",
    description: "Automatically match your operating system theme.",
    icon: Laptop,
  },
];

export function AdminProfileAppearanceCard() {
  const { themeMode, setThemeMode, resolvedTheme } = useAdminTheme();

  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
      <div className="border-b border-border/60 pb-4">
        <h2 className="font-display text-lg font-extrabold text-foreground">
          Workspace appearance
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Choose your preferred theme for the Administrator panel. Currently active:{" "}
          <strong className="capitalize text-foreground font-bold">{resolvedTheme}</strong>
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const isSelected = themeMode === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setThemeMode(option.value)}
              className={cn(
                "relative flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary/10 shadow-xs dark:bg-primary/15"
                  : "border-border/70 bg-background/50 hover:border-border hover:bg-muted/40",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                {isSelected ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                ) : null}
              </div>

              <div>
                <p className="text-xs font-bold text-foreground">
                  {option.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

