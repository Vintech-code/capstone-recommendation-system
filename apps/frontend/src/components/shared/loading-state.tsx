import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  title?: string;
  description?: string;
  compact?: boolean;
  variant?:
    | "default"
    | "assessment"
    | "catalogue"
    | "dashboard"
    | "recommendations";
  className?: string;
}

function LoadingState({
  title = "Loading",
  description = "Please wait while the requested information is prepared.",
  compact = false,
  variant = "default",
  className,
}: LoadingStateProps) {
  if (compact) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn("w-full py-6 space-y-3 animate-pulse", className)}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
        </div>
        <p className="sr-only">{title}</p>
        {description ? <span className="sr-only">{description}</span> : null}
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn("w-full space-y-6 py-4 animate-pulse", className)}
      >
        {/* Hero Banner Skeleton */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 space-y-4">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-8 w-64 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
          <div className="pt-2 flex gap-3">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        {/* Feature Cards Grid Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/70 bg-card p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="size-8 rounded-xl" />
              </div>
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-4/5 rounded-md" />
            </div>
          ))}
        </div>
        <p className="sr-only">{title}</p>
        {description ? <span className="sr-only">{description}</span> : null}
      </div>
    );
  }

  if (variant === "catalogue") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn("w-full space-y-6 py-4 animate-pulse", className)}
      >
        {/* Catalogue Filter Bar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4">
          <Skeleton className="h-10 w-64 max-w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>

        {/* Programme Cards Grid Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/70 bg-card p-5 space-y-3"
            >
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-2/3 rounded-md" />
              <div className="pt-2 flex justify-between items-center">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <p className="sr-only">{title}</p>
        {description ? <span className="sr-only">{description}</span> : null}
      </div>
    );
  }

  if (variant === "recommendations") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn("w-full space-y-6 py-4 animate-pulse", className)}
      >
        {/* Results Header / Summary Skeleton */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-8 w-72 max-w-full rounded-lg" />
              <Skeleton className="h-4 w-96 max-w-full rounded-md" />
            </div>
            <Skeleton className="size-24 rounded-2xl shrink-0 self-center" />
          </div>
        </div>

        {/* Match Cards List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-1/3 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-4/5 rounded-md" />
              <div className="pt-2 flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <p className="sr-only">{title}</p>
        {description ? <span className="sr-only">{description}</span> : null}
      </div>
    );
  }

  /* Default / Assessment Skeleton */
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "w-full max-w-3xl mx-auto space-y-6 py-8 animate-pulse",
        className,
      )}
    >
      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-4">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-7 w-64 max-w-full rounded-lg" />
        <Skeleton className="h-4 w-80 max-w-full rounded-md" />

        <div className="pt-4 space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
      <p className="sr-only">{title}</p>
      {description ? <span className="sr-only">{description}</span> : null}
    </div>
  );
}

export { LoadingState };
export type { LoadingStateProps };
