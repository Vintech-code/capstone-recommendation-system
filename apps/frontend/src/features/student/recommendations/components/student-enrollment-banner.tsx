import { ArrowRight, BellRing, CheckCircle2, Clock, FileWarning, X } from "lucide-react";
import { useEffect, useState } from "react";

import { StudentEnrollmentModal } from "@/features/student/recommendations/components/student-enrollment-modal";
import {
  getStudentEnrollment,
  type EnrollmentProgrammeOption,
  type StudentEnrollmentRecord,
} from "@/features/student/recommendations/enrollment-api";

export function StudentEnrollmentBanner() {
  const [loaded, setLoaded] = useState(false);
  const [hasRecommendation, setHasRecommendation] = useState(false);
  const [enrollment, setEnrollment] = useState<StudentEnrollmentRecord | null>(null);
  const [programmes, setProgrammes] = useState<EnrollmentProgrammeOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissedVerifiedKey, setDismissedVerifiedKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getStudentEnrollment()
      .then((data) => {
        if (!active || !data || !Array.isArray(data.programmes)) return;
        setHasRecommendation(Boolean(data.hasRecommendation));
        setEnrollment(data.enrollment ?? null);
        setProgrammes(data.programmes);
        if (data.enrollment?.verificationStatus === "verified") {
          const key = `cor-verified-dismissed:${data.enrollment.verifiedAt ?? data.enrollment.enrolledProgrammeId}`;
          try {
            if (window.localStorage.getItem(key) === "1") {
              setDismissedVerifiedKey(key);
            }
          } catch {
            // Ignore storage errors in restricted contexts
          }
        }
        setLoaded(true);
      })
      .catch(() => {
        // Non-blocking in tests or unauthenticated transitions
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loaded || (!hasRecommendation && !enrollment) || programmes.length === 0) {
    return null;
  }

  const isVerified = enrollment?.verificationStatus === "verified";
  const verifiedStorageKey = isVerified
    ? `cor-verified-dismissed:${enrollment.verifiedAt ?? enrollment.enrolledProgrammeId}`
    : null;

  if (isVerified && verifiedStorageKey && dismissedVerifiedKey === verifiedStorageKey) {
    return null;
  }

  const isRejected = enrollment?.verificationStatus === "rejected";
  const isPending = enrollment !== null && !isRejected && !isVerified;

  function dismissVerifiedNotice() {
    if (!verifiedStorageKey) return;
    setDismissedVerifiedKey(verifiedStorageKey);
    try {
      window.localStorage.setItem(verifiedStorageKey, "1");
    } catch {
      // Ignore storage errors
    }
  }

  return (
    <>
      <div className="border-b border-border/60 bg-background/80 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-left text-xs transition-all sm:text-sm ${
              isVerified
                ? "border-primary/40 bg-primary/10 text-primary-ink"
                : isRejected
                  ? "border-destructive/40 bg-destructive/10 text-destructive-ink"
                  : isPending
                    ? "border-border bg-secondary/45 text-foreground"
                    : "border-primary/40 bg-primary/10 text-primary-ink"
            }`}
          >
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex min-w-0 flex-1 cursor-pointer flex-wrap items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-2.5">
                {isVerified ? (
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
                ) : isRejected ? (
                  <FileWarning aria-hidden="true" className="size-4 shrink-0" />
                ) : isPending ? (
                  <Clock aria-hidden="true" className="size-4 shrink-0 text-warning-ink" />
                ) : (
                  <BellRing aria-hidden="true" className="size-4 shrink-0" />
                )}
                <span className="font-semibold">
                  {isVerified
                    ? `Your COR${enrollment?.studentIdNumber ? ` and Student ID (${enrollment.studentIdNumber})` : ""} for ${enrollment?.enrolledProgrammeCode} ${enrollment?.studentIdNumber ? "have" : "has"} been verified by Admin.`
                    : isRejected
                      ? `Your uploaded COR needs re-upload${enrollment?.verificationNote ? `: ${enrollment.verificationNote}` : "."}`
                      : isPending
                        ? `COR submitted for ${enrollment?.enrolledProgrammeCode} — Pending Admin verification.`
                        : "Already enrolled at TCC? Upload your COR and confirm your enrolled programme."}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 font-display font-bold underline-offset-4 hover:underline">
                {isVerified
                  ? "View details"
                  : isRejected
                    ? "Re-upload COR"
                    : isPending
                      ? "View / Update"
                      : "Upload COR"}
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </span>
            </button>

            {isVerified ? (
              <button
                type="button"
                onClick={dismissVerifiedNotice}
                aria-label="Dismiss verification notification"
                className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-primary-ink/70 transition-colors hover:bg-primary/15 hover:text-primary-ink"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <StudentEnrollmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        enrollment={enrollment}
        programmes={programmes}
        onSaved={(record) => setEnrollment(record)}
      />
    </>
  );
}
