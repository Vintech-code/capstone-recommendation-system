import { ArrowRight, Check, Compass, RotateCcw } from "lucide-react";
import { useState } from "react";

import { StatusBadge } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AssessmentLifecycle } from "@/features/student/assessment/assessment-api";
import { RetakeAssessmentDialog } from "@/features/student/assessment/components/retake-assessment-dialog";
import { formatAssessmentDate } from "@/features/student/assessment/assessment-result-mapper";
import { StudentPageHeader } from "@/features/student/components/student-page-header";

interface CompletedAssessmentStateProps {
  lifecycle: AssessmentLifecycle | null;
  retakeError: string | null;
  onExit: () => void;
  onViewResult: () => void;
  onViewMatches?: () => void;
  onStartRetake: (reason?: string) => Promise<void>;
}

function CompletedAssessmentState({ lifecycle, retakeError, onExit, onViewResult, onViewMatches, onStartRetake }: CompletedAssessmentStateProps) {
  const [retakeDialogOpen, setRetakeDialogOpen] = useState(false);
  const completedDate = lifecycle?.result_available_at ?? lifecycle?.submitted_at;

  return (
    <div className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-secondary/35 pb-14 pt-6 sm:pb-20 sm:pt-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-48 -z-10 size-[34rem] rounded-full bg-primary-fixed/55 blur-3xl" />
      <div className="student-page">
        <StudentPageHeader title="Assessment complete" description={completedDate ? `Completed ${formatAssessmentDate(completedDate)}. Your recorded answers are read-only.` : "Your responses have been submitted."} onBack={onExit} actions={<StatusBadge label="Completed" tone="success" />} />
        <section aria-labelledby="assessment-complete-title" className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <span className="flex size-11 items-center justify-center rounded bg-success/15 text-success-ink"><Check aria-hidden="true" className="size-5" /></span>
            <p className="mt-5 font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary-ink">Assessment complete</p>
            <h2 id="assessment-complete-title" className="mt-2 max-w-2xl font-display text-3xl font-bold tracking-[-0.04em] text-primary-ink sm:text-4xl">Responses submitted successfully</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">{completedDate ? `Completed ${formatAssessmentDate(completedDate)}. Your recorded answers are read-only.` : "Your recorded answers are read-only."}</p>
            {retakeError ? <Alert variant="destructive" className="mt-5"><AlertTitle>Retake could not be started</AlertTitle><AlertDescription>{retakeError}</AlertDescription></Alert> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button type="button" variant="clay" onClick={onViewResult} className="font-semibold text-primary-ink">View assessment result <ArrowRight aria-hidden="true" /></Button>
              {onViewMatches ? <Button type="button" variant="clay" onClick={onViewMatches} className="font-semibold text-primary-ink">View course matches <Compass aria-hidden="true" /></Button> : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Button type="button" variant="link" onClick={onExit} className="h-auto p-0">Return to dashboard</Button>
              {lifecycle?.can_retake ? (
                <Button type="button" variant="link" onClick={() => setRetakeDialogOpen(true)} className="h-auto p-0"><RotateCcw aria-hidden="true" /> Retake assessment</Button>
              ) : lifecycle?.retake_available_at ? (
                <p className="text-xs text-muted-foreground">Retake available {formatAssessmentDate(lifecycle.retake_available_at)}</p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
      <RetakeAssessmentDialog open={retakeDialogOpen} onOpenChange={setRetakeDialogOpen} description="Your completed result will remain available in Assessment history. The new attempt starts with no answers and becomes your current assessment." onConfirm={onStartRetake} />
    </div>
  );
}

export { CompletedAssessmentState };
