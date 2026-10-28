import { AlertCircle, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid gap-3 py-1 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-3">
            <span
              className="h-7 w-1 rounded-full bg-secondary-container"
              aria-hidden="true"
            />
            <p className="font-label text-xs font-semibold uppercase tracking-[0.18em] text-primary-ink">
              {eyebrow}
            </p>
          </div>
        )}
        <h1
          className={`font-display font-bold tracking-tight ${eyebrow ? "mt-2 text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-3xl text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}

function AdminPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading workspace"
      className="space-y-6 animate-pulse"
    >
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </div>

      {/* Metric / Stat cards grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/70 bg-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="size-7 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-2.5 w-32 rounded-md" />
          </div>
        ))}
      </div>

      {/* Content panel / table skeleton */}
      <div className="rounded-xl border border-border/70 bg-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3 rounded-md" />
                <Skeleton className="h-3 w-1/4 rounded-md" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading workspace</span>
    </div>
  );
}

function AdminPageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section
      role="alert"
      className="flex min-h-64 flex-col items-center justify-center rounded-xs border border-border bg-card px-5 text-center shadow-sm"
    >
      <span className="flex size-11 items-center justify-center rounded-xs bg-destructive/10 text-destructive-ink">
        <AlertCircle aria-hidden="true" />
      </span>
      <h1 className="mt-3 font-display text-xl font-semibold">
        Unable to load this workspace
      </h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">{message}</p>
      <Button className="mt-5 rounded" onClick={onRetry}>
        <RotateCcw aria-hidden="true" /> Try again
      </Button>
    </section>
  );
}

function EmptyPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xs border border-border bg-card px-5 text-center shadow-sm">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export { AdminPageError, AdminPageHeader, AdminPageSkeleton, EmptyPanel };
