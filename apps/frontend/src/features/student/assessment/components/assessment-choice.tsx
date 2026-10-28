import { Check } from "lucide-react";
import { useState, type PointerEvent } from "react";

import type {
  AssessmentResponseOption,
  AssessmentResponseValue,
} from "@/features/student/assessment/assessment-types";

interface ClickPulse {
  id: number;
  x: number;
  y: number;
}

interface AssessmentChoiceProps {
  name: string;
  option: AssessmentResponseOption;
  selected: boolean;
  onChange: (value: AssessmentResponseValue) => void;
}

function AssessmentChoice({
  name,
  option,
  selected,
  onChange,
}: AssessmentChoiceProps) {
  const [clickPulse, setClickPulse] = useState<ClickPulse | null>(null);
  const emoji = option.value === 1 ? "👍" : "👎";

  function showPointerPulse(event: PointerEvent<HTMLLabelElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setClickPulse({
      id: event.timeStamp,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  }

  function showKeyboardPulse() {
    setClickPulse({ id: performance.now(), x: 50, y: 50 });
  }

  return (
    <label
      data-selected={selected ? "true" : "false"}
      className={`assessment-response-clay relative flex min-h-16 cursor-pointer items-center gap-3 overflow-hidden px-4 py-3 text-left transition-[background-color,border-color,box-shadow] duration-200 focus-within:ring-3 focus-within:ring-primary/35 ${
        selected ? "text-primary-ink" : "text-foreground"
      }`}
      onPointerDown={showPointerPulse}
    >
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={selected}
        onChange={() => onChange(option.value)}
        onKeyDown={(event) => {
          if (event.key === " ") showKeyboardPulse();
        }}
        className="sr-only"
      />
      {clickPulse ? (
        <span
          key={clickPulse.id}
          aria-hidden="true"
          className="assessment-choice-click-pulse"
          style={
            clickPulse.x === 50 && clickPulse.y === 50
              ? { left: "50%", top: "50%" }
              : { left: clickPulse.x, top: clickPulse.y }
          }
          onAnimationEnd={() => setClickPulse(null)}
        />
      ) : null}
      <span
        aria-hidden="true"
        className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-xl shadow-sm"
      >
        {emoji}
      </span>
      <span className="relative z-10 min-w-0 flex-1">
        <span className="block text-sm font-semibold">{option.label}</span>
        <span className="mt-0.5 block text-[0.6875rem] font-normal text-muted-foreground">
          {option.value === 1
            ? "This sounds like me"
            : "This does not sound like me"}
        </span>
      </span>
      {selected ? (
        <Check aria-hidden="true" className="relative z-10 size-5 shrink-0" />
      ) : null}
    </label>
  );
}

export { AssessmentChoice };
