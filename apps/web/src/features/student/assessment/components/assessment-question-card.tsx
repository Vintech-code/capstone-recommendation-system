import { Check } from 'lucide-react'

import type {
  AssessmentQuestion,
  AssessmentResponseOption,
  AssessmentResponseValue,
} from '@/features/student/assessment/assessment-types'

interface AssessmentQuestionCardProps {
  question: AssessmentQuestion
  questionNumber: number
  options: readonly AssessmentResponseOption[]
  value?: AssessmentResponseValue
  onChange: (value: AssessmentResponseValue) => void
}

function AssessmentQuestionCard({
  question,
  questionNumber,
  options,
  value,
  onChange,
}: AssessmentQuestionCardProps) {
  return (
    <section
      aria-labelledby={`question-${question.id}`}
      className="flex min-h-[25rem] flex-1 flex-col items-center justify-center py-12 text-center sm:min-h-[30rem] sm:py-16"
    >
      <p className="text-sm font-medium text-muted-foreground">
        Does this activity interest you?
      </p>
      <h2
        id={`question-${question.id}`}
        className="mt-4 max-w-3xl font-display text-2xl font-bold leading-9 tracking-[-0.025em] sm:text-3xl sm:leading-10"
      >
        {question.prompt}
      </h2>

      <fieldset className="mt-10 grid w-full max-w-xl gap-3 sm:grid-cols-2">
        <legend className="sr-only">Response for question {questionNumber}</legend>
        {options.map((option) => {
          const selected = option.value === value
          const emoji = option.value === 1 ? '👍' : '👎'

          return (
            <label
              key={option.value}
              className={`relative flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors focus-within:ring-3 focus-within:ring-primary/25 ${
                selected
                  ? 'border-primary bg-primary-fixed text-primary'
                  : 'border-border-strong bg-background text-foreground hover:border-primary/45 hover:bg-primary-fixed/25'
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
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-2xl shadow-sm"
              >
                {emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  {option.value === 1 ? 'This sounds like me' : 'This does not sound like me'}
                </span>
              </span>
              {selected ? <Check aria-hidden="true" className="size-5 shrink-0" /> : null}
            </label>
          )
        })}
      </fieldset>
    </section>
  )
}

export { AssessmentQuestionCard }
