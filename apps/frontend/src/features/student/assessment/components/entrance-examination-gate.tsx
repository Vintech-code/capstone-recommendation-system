import {
  ArrowRight,
  BarChart3,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AssessmentApiError,
  type EntranceExaminationState,
} from "@/features/student/assessment/assessment-api";
import { formatEntranceScoreInput } from "@/features/student/assessment/utils/assessment-session-utils";

interface EntranceExaminationGateProps {
  examination: EntranceExaminationState;
  onDeclare: (score: number) => Promise<void>;
}

function EntranceExaminationGate({
  examination,
  onDeclare,
}: EntranceExaminationGateProps) {
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

  const isBoard =
    hasValidScore && numericScore <= examination.policy.boardRange.maximum;
  const group = hasValidScore
    ? isBoard
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
      setError(
        caught instanceof AssessmentApiError
          ? caught.message
          : "Your result could not be saved. Try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative ambient background layers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Soft radial glow centers */}
        <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/12 blur-[130px]" />
        <div className="absolute -bottom-32 left-1/4 h-[450px] w-[450px] rounded-full bg-accent/15 blur-[140px]" />
        <div className="absolute -bottom-24 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[130px]" />

        {/* Textured dot-grid matrix */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--color-border) 1.2px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Decorative subtle ambient rings */}
        <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/40 opacity-60" />
        <div className="absolute left-1/2 top-1/2 h-[960px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/25 opacity-40" />
      </div>

      {/* Main Single Centered Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-7 text-center shadow-2xl shadow-foreground/[0.05] backdrop-blur-md sm:p-9">
          {/* Subtle top edge glass shine */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
          />

          {/* Icon Badge */}
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-primary/20 to-primary/5 text-primary-ink shadow-xs ring-1 ring-primary/20">
            <GraduationCap aria-hidden="true" className="size-7" />
          </div>

          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Entrance Exam Result
          </h1>
          <p id="entrance-result-help" className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            Enter your entrance examination grade (1.0 to 5.0). This determines your admission eligibility for board and non-board programmes.
          </p>

          {error ? (
            <Alert variant="destructive" className="mt-4 text-left">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form className="mt-6 text-left" onSubmit={submit} noValidate>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="entrance-examination-score"
                className="font-label text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Entrance Exam Score
              </Label>
              <span className="text-[11px] font-medium text-muted-foreground">
                Scale: 1.0 (Highest) – 5.0
              </span>
            </div>

            <div className="relative mt-2">
              <BarChart3
                aria-hidden="true"
                className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary-ink"
              />
              <Input
                id="entrance-examination-score"
                type="text"
                inputMode="decimal"
                min={examination.policy.minimum}
                max={examination.policy.maximum}
                step="0.1"
                value={score}
                onChange={(event) => {
                  setScore(
                    formatEntranceScoreInput(
                      event.target.value,
                      examination.policy.decimalPlaces,
                    ),
                  );
                  setError(null);
                }}
                aria-describedby="entrance-result-help entrance-result-preview"
                className="h-14 w-full rounded-2xl border border-input/90 bg-background/80 pl-12 pr-4 text-base font-bold text-foreground transition-all placeholder:font-normal placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/15"
                placeholder="e.g. 2.5"
                required
              />
            </div>

            <div
              id="entrance-result-preview"
              className="mt-3 flex min-h-6 items-center justify-between text-xs text-muted-foreground"
              aria-live="polite"
            >
              <span>Allowed range: 1.0 – 5.0</span>
              {group ? (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label text-xs font-bold transition-all ${
                    isBoard
                      ? "bg-primary/15 text-primary-ink"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {group}
                </span>
              ) : null}
            </div>

            <Button
              type="submit"
              variant="clay"
              className="mt-6 flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 text-base font-bold text-primary-ink shadow-md transition-all hover:shadow-lg"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? "Saving score..." : "Continue to Assessment"}
              {!submitting ? (
                <ArrowRight aria-hidden="true" className="size-5" />
              ) : null}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary-ink" />
              <span>Self-declared score saved with your assessment record</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export { EntranceExaminationGate };
