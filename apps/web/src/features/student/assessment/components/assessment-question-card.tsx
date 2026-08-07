import { ArrowRight, Check, Lightbulb } from 'lucide-react'

import type {
  AssessmentQuestion,
  AssessmentResponseOption,
  AssessmentResponseValue,
} from '@/features/student/assessment/assessment-types'

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
      className="relative flex min-h-[34rem] flex-1 flex-col overflow-hidden rounded-t-lg bg-card shadow-[0_12px_36px_var(--shadow-primary)]"
    >
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-primary via-secondary-container to-primary" />
      <div className="flex flex-1 flex-col p-6 sm:p-9 lg:p-10">
        <p className="flex items-center gap-3 font-label text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <Lightbulb aria-hidden="true" className="size-5 text-secondary-foreground" />
          Question {questionNumber} of {totalQuestions}
        </p>
        <h2
          id={`question-${question.id}`}
          className="mt-6 max-w-3xl font-display text-2xl font-semibold leading-9 tracking-[-0.025em] sm:text-3xl sm:leading-10"
        >
          {question.prompt}
        </h2>

        <fieldset className="mt-8 grid flex-1 content-start gap-3 sm:grid-cols-2">
          <legend className="sr-only">Response for question {questionNumber}</legend>
          {options.map((option, index) => {
            const selected = option.value === value
            const isLastOddOption = options.length % 2 === 1 && index === options.length - 1

            return (
              <label
                key={option.value}
                className={`group relative flex min-h-24 cursor-pointer items-start justify-between gap-4 overflow-hidden rounded-lg p-5 transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
                  selected
                    ? 'bg-primary-fixed shadow-[inset_0_0_0_2px_var(--primary)]'
                    : 'bg-secondary hover:bg-muted'
                } ${isLastOddOption ? 'sm:col-span-2' : ''}`}
              >
                <input
                  type="radio"
                  name={`response-${question.id}`}
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                <span className="min-w-0">
                  <span className="block font-display text-base font-semibold text-primary sm:text-lg">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="mt-1.5 block text-sm leading-5 text-muted-foreground">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-all ${
                    selected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-primary opacity-0 shadow-sm group-hover:opacity-100'
                  }`}
                >
                  {selected ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
                </span>
              </label>
            )
          })}
        </fieldset>
      </div>
    </section>
  )
}

export { AssessmentQuestionCard }
