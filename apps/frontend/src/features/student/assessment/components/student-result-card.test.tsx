import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toPng } from "html-to-image";
import { describe, expect, it, vi } from "vitest";

import type { ResultCardData } from "@/features/student/assessment/assessment-api";
import { StudentResultCard } from "@/features/student/assessment/components/student-result-card";

vi.mock("html-to-image", () => ({
  toPng: vi.fn(),
}));

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

  it("labels equal leading scores as a shared position", () => {
    render(<StudentResultCard card={{
      ...resultCard,
      topCode: "IR",
      formattedTopCode: "I-R",
      topDimensions: [
        { code: "I", label: "Investigative", value: 7, rank: 1, isTied: true },
        { code: "R", label: "Realistic", value: 7, rank: 1, isTied: true },
      ],
    }} />);

    expect(screen.getAllByText("Shared primary:")).toHaveLength(2);
  });

  it("shows accessible exact scores for every recorded dimension", () => {
    render(<StudentResultCard card={resultCard} />);

    expect(screen.getByRole("progressbar", { name: "Investigative: 7 out of 7" })).toBeVisible();
    expect(screen.queryByText("How to read this result")).not.toBeInTheDocument();
  });

  it("downloads the complete card as a PNG image instead of opening print", async () => {
    const user = userEvent.setup();
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    vi.mocked(toPng).mockResolvedValue("data:image/png;base64,card");

    render(<StudentResultCard card={resultCard} />);
    await user.click(screen.getByRole("button", { name: "Download card" }));

    await waitFor(() => expect(toPng).toHaveBeenCalledOnce());
    expect(toPng).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        backgroundColor: "#FBFFF7",
        pixelRatio: 2,
      }),
    );
    expect(anchorClick).toHaveBeenCalledOnce();
    expect(screen.queryByText("Download (PDF)")).not.toBeInTheDocument();
    anchorClick.mockRestore();
  });
});
