import { FileText, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { appToast } from "@/components/ui/app-toast";
import { AdminDateRangePicker } from "@/features/admin/components/admin-date-range-picker";
import {
  AdminPageError,
  AdminPageHeader,
  AdminPageSkeleton,
} from "@/features/admin/components/admin-shared";
import {
  downloadEnrollmentAlignmentReport,
  useAdminResource,
  type AdminReport,
} from "@/features/admin/data/admin-api";
import { formatDate } from "@/features/admin/data/admin-formatters";
import { ReportEnrollmentAlignmentCard } from "./report-enrollment-alignment-card";
import { ReportPreviewModal } from "./report-preview-modal";

export function AdminReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
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
          downloading={downloading}
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
          onDownload={async () => {
            setPreviewOpen(true);
          }}
        />
      </div>

      {/* 2. Program Enrollment Alignment Table */}
      <ReportEnrollmentAlignmentCard alignment={data.enrollmentAlignment} />

      <ReportPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        report={data}
        downloading={downloading}
        onConfirmDownload={async () => {
          setDownloading(true);
          try {
            await downloadEnrollmentAlignmentReport(query);
            setPreviewOpen(false);
            appToast.success(
              "Word report downloaded",
              "The recommendation and enrollment alignment report is ready.",
            );
          } catch (error) {
            appToast.error(
              "Word report not downloaded",
              error instanceof Error ? error.message : "Try again.",
            );
          } finally {
            setDownloading(false);
          }
        }}
      />

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
  downloading,
  onFromChange,
  onToChange,
  onApply,
  onClear,
  onDownload,
}: {
  from: string;
  to: string;
  invalid: boolean;
  downloading: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onDownload: () => Promise<void>;
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

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={downloading}
          onClick={() => void onDownload()}
          className="h-9 rounded-lg gap-2 px-3.5 text-xs font-bold shadow-2xs hover:bg-secondary"
        >
          {downloading ? (
            <LoaderCircle className="size-3.5 animate-spin text-primary-ink" />
          ) : (
            <FileText className="size-3.5 text-primary-ink" />
          )}
          {downloading ? "Preparing report" : "Preview & download report"}
        </Button>
      </div>
    </div>
  );
}
