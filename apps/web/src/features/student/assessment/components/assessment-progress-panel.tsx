interface AssessmentProgressPanelProps {
  answeredCount: number
  currentQuestion: number
  totalQuestions: number
}

function AssessmentProgressPanel({
  answeredCount,
  currentQuestion,
  totalQuestions,
}: AssessmentProgressPanelProps) {
  const progress = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0
  const remainingCount = Math.max(totalQuestions - answeredCount, 0)

  return (
    <section
      aria-labelledby="assessment-progress-title"
      className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-5"
    >
      <h2 id="assessment-progress-title" className="sr-only">
        Assessment progress
      </h2>
      <div className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <strong className="font-display text-xl leading-none sm:text-2xl">
          {String(currentQuestion).padStart(2, '0')}
        </strong>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-75">
          of {totalQuestions}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Interest check-in</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {answeredCount} answered · {remainingCount} remaining
            </p>
          </div>
          <strong className="text-sm text-primary">{progress}%</strong>
        </div>
        <div
          role="progressbar"
          aria-label="Assessment completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  )
}

export { AssessmentProgressPanel }
