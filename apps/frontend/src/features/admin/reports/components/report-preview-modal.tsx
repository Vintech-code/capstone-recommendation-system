import { Fragment } from "react";
import { FileDown, FileText, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminReport } from "@/features/admin/data/admin-api";
import { formatDate } from "@/features/admin/data/admin-formatters";
import tccSealLeft from "../assets/tcc-seal-1.png";
import tccSealRight from "../assets/tcc-seal-2.png";

interface ReportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: AdminReport;
  downloading: boolean;
  onConfirmDownload: () => Promise<void>;
}

function formatPeriod(from: string | null, to: string | null): string {
  if (from && to) return `${from} to ${to}`;
  if (from) return `From ${from}`;
  if (to) return `Up to ${to}`;
  return "All recorded recommendation dates";
}

export function ReportPreviewModal({
  open,
  onOpenChange,
  report,
  downloading,
  onConfirmDownload,
}: ReportPreviewModalProps) {
  const { enrollmentAlignment } = report;
  if (!enrollmentAlignment) {
    return null;
  }
  const { overall, programs } = enrollmentAlignment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary-ink">
              <FileText aria-hidden="true" className="size-4" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-extrabold text-foreground">
                Word Report Preview
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Full document layout preview before downloading the .docx file.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-neutral-200/80 p-4 sm:p-7">
          <div
            className="mx-auto max-w-[816px] bg-white text-black shadow-lg ring-1 ring-black/10"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {/* Word Document Header */}
            <div className="px-8 pt-6 pb-3 sm:px-12">
              <div className="flex items-center justify-between gap-4">
                <img
                  src={tccSealLeft}
                  alt="Tagoloan Community College Seal"
                  className="size-16 shrink-0 object-contain sm:size-20"
                />
                <div className="text-center text-[10px] leading-snug text-black sm:text-[11px]">
                  <p>Republic of the Philippines</p>
                  <p>Province of Misamis Oriental</p>
                  <p>Municipality of Tagoloan</p>
                  <p className="text-xs font-bold tracking-wide sm:text-[13px]">
                    TAGOLOAN COMMUNITY COLLEGE
                  </p>
                  <p>M.H. Del Pilar ST. Brgy. Baluarte, Tagoloan, Misamis Oriental</p>
                  <p>Email: tccadmin@tcc.edu.ph</p>
                  <p>Member: Association of Local Colleges &amp; Universities (ALCU)</p>
                  <p>
                    Member: Association of Local Colleges &amp; Universities Commission on
                    Accreditation
                  </p>
                </div>
                <img
                  src={tccSealRight}
                  alt="Municipality of Tagoloan Seal"
                  className="size-16 shrink-0 object-contain sm:size-20"
                />
              </div>
            </div>

            <div className="h-2.5 w-full bg-[#a68386]" />

            {/* Word Document Body */}
            <div className="space-y-4 px-8 py-6 sm:px-12 sm:py-8">
              <div className="space-y-0.5 text-center">
                <h2 className="text-base font-bold text-black sm:text-lg">
                  Recommendation and Enrollment Alignment Report
                </h2>
                <p className="text-xs text-black">
                  Reporting period: {formatPeriod(report.from, report.to)}
                </p>
                <p className="text-[11px] text-[#666666]">
                  Generated: {formatDate(report.generatedAt)}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-black">Programme Alignment</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-[#d9d9d9] text-[11px]">
                    <thead>
                      <tr className="bg-[#650710] text-white">
                        <th className="border border-[#d9d9d9] px-2 py-2 text-center font-bold">
                          Rank #1 recommended programme
                        </th>
                        <th className="border border-[#d9d9d9] px-1.5 py-2 text-center font-bold">
                          Students recommended
                        </th>
                        <th className="border border-[#d9d9d9] px-1.5 py-2 text-center font-bold">
                          Verified enrollments
                        </th>
                        <th className="border border-[#d9d9d9] px-1.5 py-2 text-center font-bold">
                          Enrolled in #1
                        </th>
                        <th className="border border-[#d9d9d9] px-1.5 py-2 text-center font-bold">
                          Enrolled elsewhere
                        </th>
                        <th className="border border-[#d9d9d9] px-1.5 py-2 text-center font-bold">
                          No verified enrollment
                        </th>
                        <th className="border border-[#d9d9d9] px-1.5 py-2 text-center font-bold">
                          Alignment rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {programs.map((programme) => {
                        const alternateText =
                          programme.alternateEnrollments &&
                          programme.alternateEnrollments.length > 0
                            ? programme.alternateEnrollments
                                .map(
                                  (item) =>
                                    `${item.programmeCode} - ${item.programmeName} (${item.count})`,
                                )
                                .join(", ")
                            : "None recorded";

                        return (
                          <Fragment key={programme.programmeId}>
                            <tr>
                              <td className="border border-[#d9d9d9] px-2 py-1.5 font-bold">
                                {programme.programmeCode} - {programme.programmeName}
                              </td>
                              <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                                {programme.recommended}
                              </td>
                              <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                                {programme.verifiedEnrolled}
                              </td>
                              <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                                {programme.aligned}
                              </td>
                              <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                                {programme.notAligned}
                              </td>
                              <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                                {programme.unallocated}
                              </td>
                              <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center font-bold tabular-nums">
                                {programme.alignmentRate.toFixed(2)}%
                              </td>
                            </tr>
                            <tr>
                              <td
                                colSpan={7}
                                className="border border-[#d9d9d9] bg-[#fafafa] px-2 py-1 text-[10px] text-[#555555]"
                              >
                                Actual programme chosen instead: {alternateText}
                              </td>
                            </tr>
                          </Fragment>
                        );
                      })}
                      <tr className="bg-[#f2f2f2] font-bold">
                        <td className="border border-[#d9d9d9] px-2 py-1.5">Overall</td>
                        <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                          {overall.recommended}
                        </td>
                        <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                          {overall.verifiedEnrolled}
                        </td>
                        <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                          {overall.aligned}
                        </td>
                        <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                          {overall.notAligned}
                        </td>
                        <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                          {overall.unallocated}
                        </td>
                        <td className="border border-[#d9d9d9] px-1.5 py-1.5 text-center tabular-nums">
                          {overall.alignmentRate.toFixed(2)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-1 pt-2 text-[10px] text-[#555555]">
                <p className="italic text-black">
                  Interpretation: A match shows observed alignment with the Rank #1 recommendation.
                  It does not prove that the recommendation caused the enrollment decision.
                </p>
                <p>
                  Source: verified Certificate of Registration enrollment records and immutable
                  recommendation snapshots.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={downloading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={downloading}
            onClick={() => void onConfirmDownload()}
            className="gap-2 font-bold"
          >
            {downloading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <FileDown className="size-4" />
            )}
            {downloading ? "Preparing Word report..." : "Confirm & Download .docx"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
