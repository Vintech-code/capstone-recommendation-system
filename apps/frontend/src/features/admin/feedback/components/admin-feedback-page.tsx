import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AdminDateRangePicker } from "@/features/admin/components/admin-date-range-picker";
import {
  AdminPageError,
  AdminPageHeader,
  AdminPageSkeleton,
} from "@/features/admin/components/admin-shared";
import {
  useAdminResource,
  type AdminRecommendationFeedback,
} from "@/features/admin/data/admin-api";
import { formatDate } from "@/features/admin/data/admin-formatters";
import { RecommendationFeedbackSummary } from "@/features/admin/feedback/components/recommendation-feedback-summary";

function AdminFeedbackPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const resource = useAdminResource<AdminRecommendationFeedback>(
    `/feedback${query}`,
  );

  if (resource.loading) return <AdminPageSkeleton />;
  if (resource.error || !resource.data) {
    return (
      <AdminPageError
        message={resource.error ?? "No Student feedback was returned."}
        onRetry={resource.retry}
      />
    );
  }

  const feedback = resource.data;
  const invalid = Boolean(from && to && to < from);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] pb-10">
      <AdminPageHeader title="Student feedback" />

      <div className="mt-4 rounded-xl border border-border/70 bg-card/60 p-3.5 shadow-2xs">
        <form
          className="flex flex-wrap items-end gap-2.5"
          onSubmit={(event) => {
            event.preventDefault();
            if (invalid) return;
            setQuery(
              from || to
                ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) })}`
                : "",
            );
          }}
        >
          <AdminDateRangePicker
            from={from}
            to={to}
            onChange={({ from: nextFrom, to: nextTo }) => {
              setFrom(nextFrom);
              setTo(nextTo);
            }}
          />
          <Button
            type="submit"
            size="sm"
            disabled={invalid}
            className="h-9 rounded-lg px-4 text-xs font-bold"
          >
            Apply dates
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => {
              setFrom("");
              setTo("");
              setQuery("");
            }}
          >
            Clear
          </Button>
          {invalid ? (
            <span role="alert" className="pb-2 text-xs font-bold text-destructive-ink">
              The end date must be on or after the start date.
            </span>
          ) : null}
        </form>
      </div>

      <div className="mt-6">
        <RecommendationFeedbackSummary feedback={feedback} />
      </div>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 font-label text-xs text-muted-foreground">
        <span>Updated {formatDate(feedback.generatedAt)}</span>
        <span>Authorized Administrator review</span>
      </footer>
    </div>
  );
}

export { AdminFeedbackPage };
