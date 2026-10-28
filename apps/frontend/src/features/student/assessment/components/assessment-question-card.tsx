import assessmentQuestionImage01 from "@/assets/assessment-avatars/1.png";
import assessmentQuestionImage02 from "@/assets/assessment-avatars/2.png";
import assessmentQuestionImage03 from "@/assets/assessment-avatars/3.png";
import assessmentQuestionImage04 from "@/assets/assessment-avatars/4.png";
import assessmentQuestionImage05 from "@/assets/assessment-avatars/5.png";
import assessmentQuestionImage06 from "@/assets/assessment-avatars/6.png";
import assessmentQuestionImage07 from "@/assets/assessment-avatars/7.png";
import assessmentQuestionImage08 from "@/assets/assessment-avatars/8.png";
import assessmentQuestionImage09 from "@/assets/assessment-avatars/9.png";
import assessmentQuestionImage10 from "@/assets/assessment-avatars/10.png";
import assessmentQuestionImage11 from "@/assets/assessment-avatars/11.png";
import assessmentQuestionImage12 from "@/assets/assessment-avatars/12.png";
import assessmentQuestionImage13 from "@/assets/assessment-avatars/13.png";
import assessmentQuestionImage14 from "@/assets/assessment-avatars/14.png";
import assessmentQuestionImage15 from "@/assets/assessment-avatars/15.png";
import assessmentQuestionImage16 from "@/assets/assessment-avatars/16.png";
import assessmentQuestionImage17 from "@/assets/assessment-avatars/17.png";
import assessmentQuestionImage18 from "@/assets/assessment-avatars/18.png";
import assessmentQuestionImage19 from "@/assets/assessment-avatars/19.png";
import assessmentQuestionImage20 from "@/assets/assessment-avatars/20.png";
import assessmentQuestionImage21 from "@/assets/assessment-avatars/21.png";
import assessmentQuestionImage22 from "@/assets/assessment-avatars/22.png";
import assessmentQuestionImage23 from "@/assets/assessment-avatars/23.png";
import assessmentQuestionImage24 from "@/assets/assessment-avatars/24.png";
import assessmentQuestionImage25 from "@/assets/assessment-avatars/25.png";
import assessmentQuestionImage26 from "@/assets/assessment-avatars/26.png";
import assessmentQuestionImage27 from "@/assets/assessment-avatars/27.png";
import assessmentQuestionImage28 from "@/assets/assessment-avatars/28.png";
import assessmentQuestionImage29 from "@/assets/assessment-avatars/29.png";
import assessmentQuestionImage30 from "@/assets/assessment-avatars/30.png";
import assessmentQuestionImage31 from "@/assets/assessment-avatars/31.png";
import assessmentQuestionImage32 from "@/assets/assessment-avatars/32.png";
import assessmentQuestionImage33 from "@/assets/assessment-avatars/33.png";
import assessmentQuestionImage34 from "@/assets/assessment-avatars/34.png";
import assessmentQuestionImage35 from "@/assets/assessment-avatars/35.png";
import assessmentQuestionImage36 from "@/assets/assessment-avatars/36.png";
import assessmentQuestionImage37 from "@/assets/assessment-avatars/37.png";
import assessmentQuestionImage38 from "@/assets/assessment-avatars/38.png";
import assessmentQuestionImage39 from "@/assets/assessment-avatars/39.png";
import assessmentQuestionImage40 from "@/assets/assessment-avatars/40.png";
import assessmentQuestionImage41 from "@/assets/assessment-avatars/41.png";
import assessmentQuestionImage42 from "@/assets/assessment-avatars/42.png";
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

const assessmentQuestionImages = [
  assessmentQuestionImage01,
  assessmentQuestionImage02,
  assessmentQuestionImage03,
  assessmentQuestionImage04,
  assessmentQuestionImage05,
  assessmentQuestionImage06,
  assessmentQuestionImage07,
  assessmentQuestionImage08,
  assessmentQuestionImage09,
  assessmentQuestionImage10,
  assessmentQuestionImage11,
  assessmentQuestionImage12,
  assessmentQuestionImage13,
  assessmentQuestionImage14,
  assessmentQuestionImage15,
  assessmentQuestionImage16,
  assessmentQuestionImage17,
  assessmentQuestionImage18,
  assessmentQuestionImage19,
  assessmentQuestionImage20,
  assessmentQuestionImage21,
  assessmentQuestionImage22,
  assessmentQuestionImage23,
  assessmentQuestionImage24,
  assessmentQuestionImage25,
  assessmentQuestionImage26,
  assessmentQuestionImage27,
  assessmentQuestionImage28,
  assessmentQuestionImage29,
  assessmentQuestionImage30,
  assessmentQuestionImage31,
  assessmentQuestionImage32,
  assessmentQuestionImage33,
  assessmentQuestionImage34,
  assessmentQuestionImage35,
  assessmentQuestionImage36,
  assessmentQuestionImage37,
  assessmentQuestionImage38,
  assessmentQuestionImage39,
  assessmentQuestionImage40,
  assessmentQuestionImage41,
  assessmentQuestionImage42,
] as const;

function AssessmentQuestionCard({
  question,
  questionNumber,
  options,
  value,
  onChange,
}: AssessmentQuestionCardProps) {
  const assessmentImage = assessmentQuestionImages[questionNumber - 1];

  return (
    <section
      aria-labelledby={`question-${question.id}`}
      className="flex min-h-[18rem] flex-1 flex-col items-center justify-center py-4 text-center sm:min-h-[21rem] sm:py-6"
    >
      {assessmentImage ? (
        <img
          src={assessmentImage}
          alt={`Illustration for question ${questionNumber}`}
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
