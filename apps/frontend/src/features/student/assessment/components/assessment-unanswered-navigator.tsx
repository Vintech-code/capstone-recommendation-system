import { CircleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AssessmentUnansweredNavigatorProps {
  questionNumbers: number[];
  onSelect: (questionNumber: number) => void;
}

function AssessmentUnansweredNavigator({
  questionNumbers,
  onSelect,
}: AssessmentUnansweredNavigatorProps) {
  if (questionNumbers.length === 0) return null;

  return (
    <Alert className="mb-3">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>
        You skipped {questionNumbers.length}{" "}
        {questionNumbers.length === 1 ? "question" : "questions"}
      </AlertTitle>
      <AlertDescription>
        <p>Select a question number to answer it.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {questionNumbers.map((questionNumber) => (
            <Button
              key={questionNumber}
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Go to unanswered question ${questionNumber}`}
              onClick={() => onSelect(questionNumber)}
            >
              Question {questionNumber}
            </Button>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export { AssessmentUnansweredNavigator };
