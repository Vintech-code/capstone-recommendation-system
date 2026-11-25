import { CheckCircle2, ExternalLink, FileText, XCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  verifyStudentEnrollment,
  type AdminStudentRecord,
} from "@/features/admin/data/admin-api";
import { openProtectedFile } from "@/services/api-client";

interface AdminStudentEnrollmentPanelProps {
  studentId: number;
  enrollment: NonNullable<AdminStudentRecord["enrollment"]>;
  onUpdated: () => void;
}

export function AdminStudentEnrollmentPanel({
  studentId,
  enrollment,
  onUpdated,
}: AdminStudentEnrollmentPanelProps) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = enrollment.verificationStatus ?? "pending";

  async function handleAction(nextStatus: "verified" | "rejected") {
    if (nextStatus === "rejected" && note.trim() === "") {
      setError("Enter a short reason why this COR is rejected.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await verifyStudentEnrollment(studentId, nextStatus, note);
      setRejecting(false);
      setNote("");
      onUpdated();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not update verification status.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-secondary/30 px-4 py-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-foreground">
          Enrolled: {enrollment.enrolledProgrammeId}
        </span>
        {enrollment.corReference ? (
          <span className="text-muted-foreground">
            COR Ref: <strong className="text-foreground">{enrollment.corReference}</strong>
          </span>
        ) : null}
        {enrollment.hasCorFile && enrollment.corFileUrl ? (
          <button
            type="button"
            onClick={() => {
              void openProtectedFile(
                enrollment.corFileUrl!,
                enrollment.corOriginalName ?? "cor",
              ).catch((caught) =>
                setError(
                  caught instanceof Error
                    ? caught.message
                    : "Could not open the COR file.",
                ),
              );
            }}
            className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primary-ink underline underline-offset-2"
          >
            <FileText className="size-3.5" />
            View COR
            <ExternalLink className="size-3" />
          </button>
        ) : null}
        <span
          className={`rounded-full px-2.5 py-0.5 font-label text-[11px] font-bold ${
            status === "verified"
              ? "bg-primary/15 text-primary-ink"
              : status === "rejected"
                ? "bg-destructive/15 text-destructive-ink"
                : "bg-warning/15 text-warning-ink"
          }`}
        >
          {status === "verified"
            ? "Verified"
            : status === "rejected"
              ? "Rejected"
              : "Pending review"}
        </span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2 print:hidden">
        {status !== "verified" ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={saving}
            onClick={() => handleAction("verified")}
            className="h-7 gap-1 border-primary/30 text-xs font-bold text-primary-ink hover:bg-primary/10"
          >
            <CheckCircle2 className="size-3.5" />
            Verify COR
          </Button>
        ) : null}
        {!rejecting ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={saving}
            onClick={() => {
              setRejecting(true);
              setError(null);
            }}
            className="h-7 gap-1 border-destructive/30 text-xs font-bold text-destructive-ink hover:bg-destructive/10"
          >
            <XCircle className="size-3.5" />
            Reject
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason (e.g. Not a valid COR)"
              className="h-7 w-52 text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={saving}
              onClick={() => handleAction("rejected")}
              className="h-7 text-xs font-bold"
            >
              Confirm Reject
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                setRejecting(false);
                setError(null);
              }}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {enrollment.verificationNote && status === "rejected" ? (
        <p className="w-full text-xs text-destructive-ink">
          Note: {enrollment.verificationNote}
        </p>
      ) : null}
      {error ? <p className="w-full text-xs font-medium text-destructive-ink">{error}</p> : null}
    </div>
  );
}
