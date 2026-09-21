import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ResultCardData } from "@/features/student/assessment/assessment-api";
import { StudentResultCard } from "@/features/student/assessment/components/student-result-card";

const resultCard: ResultCardData = {
  id: 12,
  reference: "ASMT-000012",
  studentName: "Test Student",
  attemptNumber: 1,
  isCurrent: true,
  instrumentCode: "tcc-uhcc-riasec-42-v1",
  status: "result_available",
  resultAvailableAt: "2026-09-21T08:00:00+08:00",
  topCode: "IRC",
  formattedTopCode: "I-R-C",
  topDimensions: [
    { code: "I", label: "Investigative", value: 7 },
    { code: "R", label: "Realistic", value: 6 },
    { code: "C", label: "Conventional", value: 5 },
  ],
  dimensions: [
    { code: "R", label: "Realistic", value: 6 },
    { code: "I", label: "Investigative", value: 7 },
    { code: "A", label: "Artistic", value: 2 },
    { code: "S", label: "Social", value: 3 },
    { code: "E", label: "Enterprising", value: 4 },
    { code: "C", label: "Conventional", value: 5 },
  ],
  scoringVersion: "RIASEC-OQ42-2026-01",
  guidanceVersion: "PSG-PROFILE-NAMES-2026-09-21",
  disclaimer: "This result reflects self-reported vocational interests.",
};

describe("StudentResultCard", () => {
  it("shows the mapped profile name and its exact two-sentence description", () => {
    render(<StudentResultCard card={resultCard} />);

    expect(
      screen.getByRole("heading", { name: "Systems Solver" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "You enjoy understanding how systems work and fixing problems through logical, hands-on action. You often thrive with technology, structured processes, and tasks that reward accuracy and persistence.",
      ),
    ).toBeVisible();
  });
});
