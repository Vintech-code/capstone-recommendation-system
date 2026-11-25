import { Printer } from "lucide-react";
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
  type AdminReport,
} from "@/features/admin/data/admin-api";
import { formatDate } from "@/features/admin/data/admin-formatters";
import { ReportEnrollmentAlignmentCard } from "./report-enrollment-alignment-card";

export function AdminReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const resource = useAdminResource<AdminReport>(`/reports${query}`);

  if (resource.loading) return <AdminPageSkeleton />;
  if (resource.error || !resource.data) {
    return (
      <AdminPageError
        message={resource.error ?? "System reports are unavailable."}
        onRetry={resource.retry}
      />
    );
  }

  const data = resource.data;
  const invalid = Boolean(from && to && to < from);

  return (
    <div className="space-y-6">
      {/* 1. Header & Date Range Filter */}
      <div className="space-y-4">
        <AdminPageHeader title="System reports" />
        <ReportFilterBar
          from={from}
          to={to}
          invalid={invalid}
          onFromChange={setFrom}
          onToChange={setTo}
          onApply={() => {
            const params = new URLSearchParams();
            if (from) params.set("from", from);
            if (to) params.set("to", to);
            setQuery(params.size ? `?${params.toString()}` : "");
          }}
          onClear={() => {
            setFrom("");
            setTo("");
            setQuery("");
          }}
        />
      </div>

      {/* 2. Program Enrollment Alignment Table */}
      <ReportEnrollmentAlignmentCard alignment={data.enrollmentAlignment} />

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 font-label text-xs text-muted-foreground">
        <span>Updated {formatDate(data.generatedAt)}</span>
        <span>Institution-wide aggregate reporting scope</span>
      </footer>
    </div>
  );
}

function ReportFilterBar({
  from,
  to,
  invalid,
  onFromChange,
  onToChange,
  onApply,
  onClear,
}: {
  from: string;
  to: string;
  invalid: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border/70 bg-card/60 p-3.5 shadow-2xs">
      <form
        className="flex flex-wrap items-end gap-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!invalid) onApply();
        }}
      >
        <AdminDateRangePicker
          from={from}
          to={to}
          onChange={({ from: nextFrom, to: nextTo }) => {
            onFromChange(nextFrom);
            onToChange(nextTo);
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
          onClick={onClear}
        >
          Clear
        </Button>

        {invalid ? (
          <span role="alert" className="pb-2 text-xs font-bold text-destructive-ink">
            The end date must be on or after the start date.
          </span>
        ) : null}
      </form>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="h-9 rounded-lg gap-2 px-3.5 text-xs font-bold shadow-2xs hover:bg-secondary"
      >
        <Printer className="size-3.5 text-primary-ink" /> Print report
      </Button>
    </div>
  );
}
