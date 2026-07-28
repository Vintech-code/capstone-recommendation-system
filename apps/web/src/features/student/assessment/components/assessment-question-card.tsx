import { Check } from 'lucide-react'

import type {
  AssessmentQuestion,
  AssessmentResponseOption,
  AssessmentResponseValue,
} from '@/features/student/assessment/data/mock-assessment-session'

interface AssessmentQuestionCardProps {
  question: AssessmentQuestion
  questionNumber: number
  totalQuestions: number
  options: readonly AssessmentResponseOption[]
  value?: AssessmentResponseValue
  onChange: (value: AssessmentResponseValue) => void
}

function AssessmentQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  options,
  value,
  onChange,
}: AssessmentQuestionCardProps) {
  return (
    <section
      aria-labelledby={`question-${question.id}`}
      className="rounded-2xl bg-background p-5 shadow-sm sm:p-7"
    >
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
        Question {questionNumber} of {totalQuestions}
      </p>
      <h2
        id={`question-${question.id}`}
        className="mt-3 text-xl font-extrabold leading-8 tracking-[-0.03em] sm:text-2xl"
      >
        {question.prompt}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Choose the response that feels most accurate for you.
      </p>

      <fieldset className="mt-6 space-y-3">
        <legend className="sr-only">
          Response for question {questionNumber}
        </legend>
        {options.map((option) => {
          const selected = option.value === value

          return (
            <label
              key={option.value}
              className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors focus-within:ring-3 focus-within:ring-ring/40 ${
                selected
                  ? 'border-primary bg-primary/6'
                  : 'border-border bg-secondary/35 hover:bg-secondary/65'
              }`}
            >
              <input
                type="radio"
                name={`response-${question.id}`}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border ${
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/40 bg-background'
                }`}
              >
                {selected ? <Check className="size-3.5" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          )
        })}
      </fieldset>
    </section>
  )
}

export { AssessmentQuestionCard }
