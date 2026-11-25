import { ArrowRight, BellRing, FileWarning, Clock } from "lucide-react";
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

  useEffect(() => {
    let active = true;
    getStudentEnrollment()
      .then((data) => {
        if (!active || !data || !Array.isArray(data.programmes)) return;
        setHasRecommendation(Boolean(data.hasRecommendation));
        setEnrollment(data.enrollment ?? null);
        setProgrammes(data.programmes);
        setLoaded(true);
      })
      .catch(() => {
        // Non-blocking in tests or unauthenticated transitions
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loaded || !hasRecommendation || programmes.length === 0) {
    return null;
  }

  // Hide reminder once verified by Admin
  if (enrollment?.verificationStatus === "verified") {
    return null;
  }

  const isRejected = enrollment?.verificationStatus === "rejected";
  const isPending = enrollment !== null && !isRejected;

  return (
    <>
      <div className="border-b border-border/60 bg-background/80 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={`flex w-full cursor-pointer flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-left text-xs transition-all sm:text-sm ${
              isRejected
                ? "border-destructive/40 bg-destructive/10 text-destructive-ink hover:bg-destructive/15"
                : isPending
                  ? "border-border bg-secondary/45 text-foreground hover:bg-secondary/70"
                  : "border-primary/40 bg-primary/10 text-primary-ink hover:bg-primary/15"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isRejected ? (
                <FileWarning aria-hidden="true" className="size-4 shrink-0" />
              ) : isPending ? (
                <Clock aria-hidden="true" className="size-4 shrink-0 text-warning-ink" />
              ) : (
                <BellRing aria-hidden="true" className="size-4 shrink-0" />
              )}
              <span className="font-semibold">
                {isRejected
                  ? `Your uploaded COR needs re-upload${enrollment?.verificationNote ? `: ${enrollment.verificationNote}` : "."}`
                  : isPending
                    ? `COR submitted for ${enrollment?.enrolledProgrammeCode} — Pending Admin verification.`
                    : "Already enrolled at TCC? Upload your COR and confirm your enrolled programme."}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 font-display font-bold underline-offset-4 hover:underline">
              {isRejected ? "Re-upload COR" : isPending ? "View / Update" : "Upload COR"}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </span>
          </button>
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
