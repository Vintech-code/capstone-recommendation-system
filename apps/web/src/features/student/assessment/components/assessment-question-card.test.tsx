import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import stylesheet from "@/index.css?raw";
import { AssessmentQuestionCard } from "@/features/student/assessment/components/assessment-question-card";

const question = {
  id: "question-1",
  prompt: "Build or repair a machine",
};

const options = [
  { value: 1 as const, label: "Agree", description: "Agree" },
  {
    value: 2 as const,
    label: "Do not agree",
    description: "Do not agree",
  },
];

describe("AssessmentQuestionCard", () => {
  it("uses the approved minimalist clay surface and shadow-sm depth", () => {
    expect(stylesheet).toContain("background-color: var(--card)");
    expect(stylesheet).toContain("border-radius: 1.5rem");
    expect(stylesheet).toContain("box-shadow: var(--shadow-clay-sm)");
    expect(stylesheet).not.toContain("rgba(145, 192, 255");
    expect(stylesheet).not.toContain("35px 35px 68px");
  });

  it("uses green clay surfaces and preserves radio selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AssessmentQuestionCard
        question={question}
        questionNumber={2}
        options={options}
        value={1}
        onChange={onChange}
      />,
    );

    const agree = screen.getByRole("radio", { name: /^Agree/i });
    const disagree = screen.getByRole("radio", { name: /^Do not agree/i });
    expect(agree.closest("fieldset")).toHaveClass("grid-cols-2");

    expect(agree.closest("label")).toHaveClass("assessment-response-clay");
    expect(agree.closest("label")).toHaveAttribute("data-selected", "true");
    expect(disagree.closest("label")).toHaveClass("assessment-response-clay");
    expect(disagree.closest("label")).toHaveAttribute("data-selected", "false");

    await user.click(disagree);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("places the interest prompt below the first assessment image", () => {
    render(
      <AssessmentQuestionCard
        question={question}
        questionNumber={1}
        options={options}
        onChange={vi.fn()}
      />,
    );

    const image = screen.getByRole("img", {
      name: "Illustration for question 1",
    });
    const interestPrompt = screen.getByText("Does this activity interest you?");

    expect(image.compareDocumentPosition(interestPrompt)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("renders the matching numbered illustration for every question", () => {
    render(
      <AssessmentQuestionCard
        question={question}
        questionNumber={42}
        options={options}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Illustration for question 42" }),
    ).toBeInTheDocument();
  });
});
