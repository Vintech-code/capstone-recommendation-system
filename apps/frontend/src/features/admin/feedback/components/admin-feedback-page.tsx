import { CalendarDays } from "lucide-react";
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
  const dateScope =
    feedback.from || feedback.to
      ? `${feedback.from ? formatDate(feedback.from) : "First response"} – ${
          feedback.to ? formatDate(feedback.to) : "Latest response"
        }`
      : "All recorded feedback";

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] pb-10">
      <AdminPageHeader
        title="Student feedback"
        description="Review how Students rated programme recommendations and read their submitted comments."
      />
      <div className="mt-0.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <CalendarDays aria-hidden="true" className="size-3.5 text-primary-ink" />
        <span>{dateScope}</span>
      </div>

      <form
        className="mt-5 flex flex-wrap items-center gap-3 border-y border-border py-4"
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
        <Button type="submit" size="sm" disabled={invalid}>
          Apply dates
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setFrom("");
            setTo("");
            setQuery("");
          }}
        >
          Clear
        </Button>
        {invalid ? (
          <span role="alert" className="text-xs font-bold text-destructive-ink">
            The end date must be on or after the start date.
          </span>
        ) : null}
      </form>

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
