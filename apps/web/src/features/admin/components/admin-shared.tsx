import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

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
      aria-label="Loading guidance workspace"
      className="flex min-h-[360px] flex-col items-center justify-center py-16 text-center"
    >
      <Loader2
        className="size-8 animate-spin text-primary"
        aria-hidden="true"
      />
      <p className="mt-3 font-display text-sm font-semibold text-foreground">
        Loading workspace...
      </p>
      <span className="sr-only">Loading guidance workspace</span>
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
