import firstAssessmentQuestionImage from "@/assets/assessment-avatars/1.png";
import { AssessmentChoice } from "@/features/student/assessment/components/assessment-choice";
import type {
  AssessmentQuestion,
  AssessmentResponseOption,
  AssessmentResponseValue,
} from "@/features/student/assessment/assessment-types";

interface AssessmentQuestionCardProps {
  question: AssessmentQuestion;
  questionNumber: number;
  options: readonly AssessmentResponseOption[];
  value?: AssessmentResponseValue;
  onChange: (value: AssessmentResponseValue) => void;
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
      className="flex min-h-[18rem] flex-1 flex-col items-center justify-center py-4 text-center sm:min-h-[21rem] sm:py-6"
    >
      {questionNumber === 1 ? (
        <img
          src={firstAssessmentQuestionImage}
          alt="Student working on a car"
          className="mx-auto max-h-48 w-auto max-w-full rounded-3xl object-contain sm:max-h-56"
        />
      ) : null}
      <p className="mt-4 text-xs font-medium text-muted-foreground sm:text-sm">
        Does this activity interest you?
      </p>
      <h2
        id={`question-${question.id}`}
        className="mt-3 max-w-3xl font-display text-xl font-bold leading-8 tracking-[-0.025em] sm:text-2xl sm:leading-9"
      >
        {question.prompt}
      </h2>

      <fieldset className="mt-6 grid w-full max-w-lg grid-cols-2 gap-2">
        <legend className="sr-only">
          Response for question {questionNumber}
        </legend>
        {options.map((option) => (
          <AssessmentChoice
            key={option.value}
            name={`response-${question.id}`}
            option={option}
            selected={option.value === value}
            onChange={onChange}
          />
        ))}
      </fieldset>
    </section>
  );
}

export { AssessmentQuestionCard };
