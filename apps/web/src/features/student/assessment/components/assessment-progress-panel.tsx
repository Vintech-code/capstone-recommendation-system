import { Check, Circle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { AssessmentResponseValue } from '@/features/student/assessment/data/mock-assessment-session'

interface AssessmentProgressPanelProps {
  questionIds: readonly string[]
  answers: Record<string, AssessmentResponseValue>
  currentIndex: number
  onSelectQuestion: (index: number) => void
}

function AssessmentProgressPanel({
  questionIds,
  answers,
  currentIndex,
  onSelectQuestion,
}: AssessmentProgressPanelProps) {
  const answeredCount = questionIds.filter((id) => answers[id]).length
  const progress = Math.round((answeredCount / questionIds.length) * 100)

  return (
    <aside
      aria-labelledby="assessment-progress-title"
      className="rounded-2xl bg-background p-4 shadow-sm sm:p-5 xl:sticky xl:top-20"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Session progress
          </p>
          <h2 id="assessment-progress-title" className="mt-1 font-extrabold">
            {answeredCount} of {questionIds.length} answered
          </h2>
        </div>
        <span className="text-sm font-extrabold text-primary">{progress}%</span>
      </div>

      <div
        role="progressbar"
        aria-label="Assessment completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        aria-label="Question navigator"
        className="mt-5 grid grid-cols-6 gap-2 xl:grid-cols-3"
      >
        {questionIds.map((id, index) => {
          const answered = Boolean(answers[id])
          const current = index === currentIndex

          return (
            <Button
              key={id}
              type="button"
              variant="secondary"
              size="icon"
              aria-label={`Go to question ${index + 1}${
                answered ? ', answered' : ', unanswered'
              }`}
              aria-current={current ? 'step' : undefined}
              onClick={() => onSelectQuestion(index)}
              className={`size-11 rounded-xl shadow-none ${
                current
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : ''
              }`}
            >
              {answered && !current ? (
                <Check aria-hidden="true" />
              ) : (
                <span>{index + 1}</span>
              )}
            </Button>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Check aria-hidden="true" className="size-3.5 text-success" />
          Answered
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Circle aria-hidden="true" className="size-3.5" />
          Not answered
        </span>
      </div>
    </aside>
  )
}

export { AssessmentProgressPanel }
