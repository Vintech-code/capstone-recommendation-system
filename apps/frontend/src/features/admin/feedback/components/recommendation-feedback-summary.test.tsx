import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { AdminRecommendationFeedback } from "@/features/admin/data/admin-api";
import { RecommendationFeedbackSummary } from "@/features/admin/feedback/components/recommendation-feedback-summary";

const feedback: AdminRecommendationFeedback = {
  generatedAt: "2026-11-27T10:00:00+08:00",
  from: null,
  to: null,
  publishedResponseCount: 1,
  publishedRespondentCount: 1,
  eligibleProgrammeCount: 1,
  commentCount: 0,
  respondents: [
    {
      respondentNumber: 1,
      responseCount: 1,
      commentCount: 0,
      averageRating: 4,
      latestUpdatedAt: "2026-11-27T09:00:00+08:00",
      programmeFeedback: [],
      resultSets: [
        {
          resultSetNumber: 1,
          resultDate: "2026-11-27T08:00:00+08:00",
          assessmentResult: {
            topCode: "I-S-A",
            profileVariantVersion: "PROPOSED-RIASEC-TIED-TIERS-2026-11-26",
            profileVariants: [
              { code: "I-S-A", labels: ["Investigative", "Social", "Artistic"] },
              { code: "I-S-C", labels: ["Investigative", "Social", "Conventional"] },
            ],
            dimensions: [
              { code: "R", label: "Realistic", value: 4 },
              { code: "I", label: "Investigative", value: 7 },
              { code: "A", label: "Artistic", value: 5 },
              { code: "S", label: "Social", value: 6 },
              { code: "E", label: "Enterprising", value: 3 },
              { code: "C", label: "Conventional", value: 5 },
            ],
          },
          recommendationCount: 1,
          feedbackCount: 1,
          recommendations: [
            {
              programmeId: "bs-information-technology",
              programmeCode: "BSIT",
              programmeName: "BS Information Technology",
              rank: 1,
              match: 90,
              feedback: {
                rating: 4,
                comment: null,
                updatedAt: "2026-11-27T09:00:00+08:00",
              },
            },
          ],
        },
      ],
    },
  ],
  programmes: [],
  comments: [],
};

describe("RecommendationFeedbackSummary", () => {
  it("shows the anonymous Student assessment result before the programme ranking", async () => {
    const user = userEvent.setup();
    render(<RecommendationFeedbackSummary feedback={feedback} />);

    await user.click(screen.getByRole("button", { name: "View feedback" }));

    const dialog = await screen.findByRole("dialog");
    const result = within(dialog).getByRole("region", { name: "Student RIASEC result" });
    expect(within(result).getAllByText("I-S-A")).toHaveLength(2);
    expect(within(result).getByText("I · Investigative")).toBeVisible();
    expect(within(result).getByText("7 / 7")).toBeVisible();
    expect(within(result).getByText("2 tied-score variants")).toBeVisible();

    await user.click(within(result).getByText("View all 2 recorded variants"));
    expect(within(result).getByText("I-S-C")).toBeVisible();
    expect(within(dialog).getByText("Complete programme ranking")).toBeVisible();
  });
});
