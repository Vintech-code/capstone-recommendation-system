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
    | "profile"
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
        data-loading-layout="catalogue"
        className={cn("w-full pb-16", className)}
      >
        <header
          data-loading-region="catalogue-hero"
          className="min-h-[25rem] bg-secondary lg:min-h-[30rem]"
        >
          <div className="student-page py-12 sm:py-16 lg:py-20">
            <div className="max-w-2xl space-y-5">
              <Skeleton className="h-9 w-48 rounded-full" />
              <Skeleton className="h-12 w-[34rem] max-w-full rounded-xl sm:h-16" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-[30rem] max-w-full" />
                <Skeleton className="h-5 w-80 max-w-[80%]" />
              </div>
            </div>
          </div>
        </header>

        <div className="student-page relative z-10 -mt-10 grid items-start gap-7 sm:-mt-14 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside
            data-loading-region="catalogue-filters"
            className="space-y-5 rounded-xl bg-secondary p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-3 border-t border-border/60 pt-4">
              <Skeleton className="h-4 w-28" />
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-4 w-40 max-w-[75%]" />
                </div>
              ))}
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
          </aside>

          <main className="min-w-0">
            <div
              data-loading-region="catalogue-toolbar"
              className="grid gap-4 rounded-xl bg-card p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center"
            >
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            <div
              data-loading-region="catalogue-programmes"
              className="mt-7 grid gap-6 sm:grid-cols-2"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
                >
                  <Skeleton className="h-52 w-full rounded-none sm:h-60" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-7 w-20 rounded-full" />
                      <Skeleton className="h-10 w-28 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
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
        data-loading-layout="recommendations"
        className={cn(
          "student-grid-page student-dashboard-canvas w-full",
          className,
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10 md:px-8 lg:px-10">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(28rem,34rem)] lg:gap-12 xl:gap-14">
            <section
              data-loading-region="recommendation-summary"
              className="flex min-w-0 flex-col"
            >
              <Skeleton className="mx-auto aspect-square w-52 rounded-[2rem] sm:w-60" />
              <Skeleton className="mt-5 h-11 w-[34rem] max-w-full rounded-xl sm:h-14" />
              <Skeleton className="mt-3 h-4 w-80 max-w-[85%]" />
              <div className="mt-5 space-y-2">
                <Skeleton className="h-5 w-full max-w-xl" />
                <Skeleton className="h-5 w-11/12 max-w-lg" />
              </div>
              <Skeleton className="mt-6 h-4 w-36" />
              <div className="mt-3 flex flex-wrap gap-2">
                <Skeleton className="h-9 w-32 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-36 rounded-full" />
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Skeleton className="h-10 w-40 rounded-lg" />
                <Skeleton className="h-10 w-48 rounded-lg" />
              </div>
            </section>

            <aside
              data-loading-region="recommendation-scores"
              className="w-full rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
            >
              <Skeleton className="h-9 w-48 rounded-lg" />
              <Skeleton className="mt-2 h-4 w-72 max-w-full" />
              <div className="mt-7 space-y-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
              <div className="mt-7 space-y-3 rounded-2xl bg-secondary/60 p-5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </aside>

            <section
              data-loading-region="recommendation-careers"
              className="space-y-5 rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-7 sm:py-7 lg:col-span-2"
            >
              <Skeleton className="h-9 w-72 max-w-full" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2 border-t border-border pt-5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </section>
          </div>

          <section data-loading-region="recommendation-list" className="mt-12 sm:mt-16">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-9 w-64 max-w-full" />
                <Skeleton className="h-4 w-80 max-w-full" />
              </div>
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
            <div className="space-y-4 sm:space-y-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:grid-cols-[minmax(0,1fr)_19rem]"
                >
                  <div className="space-y-3 bg-primary-fixed/40 p-5 sm:p-6">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                  <div className="space-y-3 border-t border-border p-5 md:border-l md:border-t-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <p className="sr-only">{title}</p>
        {description ? <span className="sr-only">{description}</span> : null}
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        data-loading-layout="profile"
        className={cn(
          "student-grid-page student-dashboard-canvas min-h-[calc(100vh-5rem)] py-4 sm:py-6",
          className,
        )}
      >
        <div className="student-page max-w-5xl space-y-5">
          <div
            data-loading-region="profile-heading"
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="size-4" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>

          <section
            data-loading-region="profile-editor"
            className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-10"
          >
            <div className="mb-8 flex items-center justify-between gap-4 border-b border-border/80 pb-3">
              <div className="flex gap-5">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="hidden h-8 w-48 sm:block" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
              <div
                data-loading-region="profile-identity"
                className="space-y-5 lg:col-span-6"
              >
                <div className="flex flex-col items-center pb-2">
                  <Skeleton className="size-28 rounded-full" />
                  <Skeleton className="mt-3 h-7 w-44" />
                  <Skeleton className="mt-2 h-6 w-52 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-11 w-full rounded-xs" />
                  <Skeleton className="h-11 w-full rounded-xs" />
                </div>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-11 w-full rounded-xs" />
                  </div>
                ))}
              </div>

              <div
                data-loading-region="profile-details"
                className="space-y-5 lg:col-span-6"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-11 w-full rounded-xs" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-11 w-full rounded-xs" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-11 w-full rounded-xs" />
                    </div>
                  ))}
                </div>
                <div className="space-y-3 rounded-xs border border-border/70 bg-muted/20 p-4">
                  <div className="flex justify-between gap-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-4">
                  <Skeleton className="h-10 w-44 rounded-xs" />
                  <Skeleton className="h-10 w-28 rounded-xs" />
                </div>
              </div>
            </div>
          </section>
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
