import { ArrowRight, BarChart3, GraduationCap } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssessmentApiError, type EntranceExaminationState } from "@/features/student/assessment/assessment-api";
import { formatEntranceScoreInput } from "@/features/student/assessment/utils/assessment-session-utils";

interface EntranceExaminationGateProps {
  examination: EntranceExaminationState;
  onDeclare: (score: number) => Promise<void>;
}

function EntranceExaminationGate({ examination, onDeclare }: EntranceExaminationGateProps) {
  const [score, setScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const numericScore = Number(score);
  const hasValidScore =
    score !== "" &&
    Number.isFinite(numericScore) &&
    numericScore >= examination.policy.minimum &&
    numericScore <= examination.policy.maximum &&
    Math.abs(numericScore - Math.round(numericScore * 10) / 10) < 0.00001;
  const group = hasValidScore
    ? numericScore <= examination.policy.boardRange.maximum
      ? "Board programmes"
      : "Non-board programmes"
    : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasValidScore) {
      setError("Enter a valid exam score from 1.0 to 5.0.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onDeclare(numericScore);
    } catch (caught) {
      setError(caught instanceof AssessmentApiError ? caught.message : "Your result could not be saved. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-4.5rem)] flex-col justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto my-auto flex w-full max-w-md flex-col items-center">
        <div className="w-full rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-ink">
            <GraduationCap aria-hidden="true" className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Entrance Exam Result</h1>
          <p id="entrance-result-help" className="mt-3 text-sm leading-6 text-muted-foreground">
            Enter your entrance examination grade (1.0 to 5.0). This determines your admission eligibility for board and non-board programmes.
          </p>
          {error ? (
            <Alert variant="destructive" className="mt-4 text-left">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <form className="mt-6 text-left" onSubmit={submit} noValidate>
            <Label htmlFor="entrance-examination-score" className="text-xs font-bold text-foreground">Entrance Exam Score</Label>
            <div className="relative mt-2">
              <BarChart3 aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary-ink" />
              <Input
                id="entrance-examination-score"
                type="text"
                inputMode="decimal"
                min={examination.policy.minimum}
                max={examination.policy.maximum}
                step="0.1"
                value={score}
                onChange={(event) => {
                  setScore(formatEntranceScoreInput(event.target.value, examination.policy.decimalPlaces));
                  setError(null);
                }}
                aria-describedby="entrance-result-help entrance-result-preview"
                className="h-14 w-full rounded-2xl border border-input bg-background pl-12 pr-4 text-base font-medium text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10"
                placeholder="e.g. 2.5"
                required
              />
            </div>
            <div id="entrance-result-preview" className="mt-2.5 flex items-center justify-between text-xs text-slate-400" aria-live="polite">
              <span>Allowed range: 1.0 â€“ 5.0</span>
              {group ? <span className="inline-flex items-center rounded-full bg-primary-fixed px-3 py-1 font-label text-xs font-semibold text-primary-ink">{group}</span> : null}
            </div>
            <Button type="submit" variant="clay" className="mt-6 flex h-14 w-full items-center justify-center gap-2.5 text-base font-bold text-primary-ink" disabled={submitting} aria-busy={submitting}>
              {submitting ? "Saving score..." : "Continue to Assessment"}
              {!submitting ? <ArrowRight aria-hidden="true" className="size-5" /> : null}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export { EntranceExaminationGate };
