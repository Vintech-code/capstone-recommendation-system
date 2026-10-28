interface AssessmentProgressPanelProps {
  answeredCount: number;
  currentQuestion: number;
  totalQuestions: number;
}

function AssessmentProgressPanel({
  answeredCount,
  currentQuestion,
  totalQuestions,
}: AssessmentProgressPanelProps) {
  const progress = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;
  const remainingCount = Math.max(totalQuestions - answeredCount, 0);

  return (
    <section
      aria-labelledby="assessment-progress-title"
      className="py-3"
    >
      <h2 id="assessment-progress-title" className="sr-only">
        Assessment progress
      </h2>

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-label text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-primary-ink">
            Question {String(currentQuestion).padStart(2, "0")} of {totalQuestions}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
            Interest check-in
          </p>
        </div>
        <div className="shrink-0 text-right">
          <strong className="font-mono text-sm text-primary-ink">{progress}%</strong>
          <p className="text-[0.6875rem] text-muted-foreground">
            {answeredCount} answered · {remainingCount} remaining
          </p>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Assessment completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="relative h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        >
          <span className="absolute right-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary-foreground/70" />
        </div>
      </div>
    </section>
  );
}

export { AssessmentProgressPanel };
