import { CheckCircle2, ExternalLink, FileText, GraduationCap, Upload } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  saveStudentEnrollment,
  type EnrollmentProgrammeOption,
  type StudentEnrollmentRecord,
} from "@/features/student/recommendations/enrollment-api";
import { openProtectedFile } from "@/services/api-client";

interface StudentEnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: StudentEnrollmentRecord | null;
  programmes: EnrollmentProgrammeOption[];
  onSaved: (record: StudentEnrollmentRecord) => void;
}

export function StudentEnrollmentModal({
  open,
  onOpenChange,
  enrollment,
  programmes,
  onSaved,
}: StudentEnrollmentModalProps) {
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [corFile, setCorFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedProgrammeId(enrollment?.enrolledProgrammeId ?? "");
    setCorFile(null);
    setError(null);
  }, [open, enrollment]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProgrammeId) {
      setError("Please select the academic programme you enrolled in.");
      return;
    }
    const hasExistingFile = Boolean(enrollment?.hasCorFile);
    if (!corFile && !hasExistingFile) {
      setError("Please upload your Certificate of Registration (COR) file.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const saved = await saveStudentEnrollment({
        enrolledProgrammeId: selectedProgrammeId,
        corFile,
      });
      onSaved(saved.enrollment);
      onOpenChange(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Your enrollment declaration could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-7">
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary-ink">
            <GraduationCap aria-hidden="true" className="size-5" />
          </div>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight text-foreground">
            Enrolled Programme &amp; COR
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select the TCC programme you officially enrolled in and upload your Certificate of Registration (COR).
          </DialogDescription>
        </DialogHeader>

        {enrollment ? (
          <div className="rounded-2xl border border-border/70 bg-secondary/35 p-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 font-bold text-primary-ink">
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
                Current submission:
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 font-label text-[11px] font-bold ${
                  enrollment.verificationStatus === "verified"
                    ? "bg-primary/15 text-primary-ink"
                    : enrollment.verificationStatus === "rejected"
                      ? "bg-destructive/15 text-destructive-ink"
                      : "bg-warning/15 text-warning-ink"
                }`}
              >
                {enrollment.verificationStatus === "verified"
                  ? "COR Verified"
                  : enrollment.verificationStatus === "rejected"
                    ? "Rejected — Please re-upload"
                    : "Pending Admin verification"}
              </span>
            </div>
            {enrollment.verificationStatus === "rejected" && enrollment.verificationNote ? (
              <p className="mt-1.5 font-medium text-destructive-ink">
                Admin note: {enrollment.verificationNote}
              </p>
            ) : null}
            {enrollment.hasCorFile && enrollment.corFileUrl ? (
              <button
                type="button"
                onClick={() => {
                  void openProtectedFile(
                    enrollment.corFileUrl!,
                    enrollment.corOriginalName ?? "cor",
                  ).catch(() => setError("Could not open the uploaded COR file."));
                }}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 font-semibold text-primary-ink underline underline-offset-2"
              >
                <FileText aria-hidden="true" className="size-3.5" />
                View current COR ({enrollment.corOriginalName ?? "COR"})
                <ExternalLink aria-hidden="true" className="size-3" />
              </button>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-2 space-y-5" noValidate>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Check your enrollment details</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="modal-enrolled-programme" className="text-xs font-bold text-foreground">
              Enrolled Academic Programme
            </Label>
            <select
              id="modal-enrolled-programme"
              value={selectedProgrammeId}
              onChange={(event) => {
                setSelectedProgrammeId(event.target.value);
                setError(null);
              }}
              className="h-12 w-full rounded-xl border border-input bg-background px-3.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">Select your enrolled programme...</option>
              {programmes.map((programme) => {
                const isClosed =
                  programme.isEnrollmentOpen === false &&
                  enrollment?.enrolledProgrammeId !== programme.id;
                return (
                  <option key={programme.id} value={programme.id} disabled={isClosed}>
                    {programme.code} — {programme.name}
                    {isClosed ? " (Full / Closed)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-cor-file" className="text-xs font-bold text-foreground">
              Upload COR Document{" "}
              <span className="font-normal text-muted-foreground">(PDF, JPG, PNG · max 5MB)</span>
            </Label>
            <label
              htmlFor="modal-cor-file"
              className="flex h-14 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-background px-4 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:bg-secondary/30"
            >
              <Upload aria-hidden="true" className="size-4 shrink-0 text-primary-ink" />
              <span className="truncate font-medium">
                {corFile
                  ? corFile.name
                  : enrollment?.hasCorFile
                    ? `Replace current COR (${enrollment.corOriginalName ?? "uploaded"})`
                    : "Choose your COR file to upload"}
              </span>
              <input
                id="modal-cor-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(event) => {
                  setCorFile(event.target.files?.[0] ?? null);
                  setError(null);
                }}
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="clay"
              disabled={submitting}
              className="font-bold text-primary-ink"
            >
              {submitting ? "Uploading..." : "Save enrollment record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
