import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StudentEnrollmentBanner } from "./student-enrollment-banner";

describe("StudentEnrollmentBanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows a dismissible notification when Admin has verified the student COR and ID", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input) => {
      if (String(input) === "/api/v1/student/enrollment") {
        return Response.json({
          data: {
            hasRecommendation: true,
            enrollment: {
              enrolledProgrammeId: "bs-information-technology",
              enrolledProgrammeCode: "BSIT",
              enrolledProgrammeName: "BS Information Technology",
              studentIdNumber: "2026001234",
              hasCorFile: true,
              corOriginalName: "cor.pdf",
              corFileUrl: "/api/v1/enrollment-cor/1",
              declaredAt: "2026-11-27T07:00:00Z",
              verificationStatus: "verified",
              verificationNote: null,
              verifiedAt: "2026-11-27T07:10:00Z",
            },
            programmes: [
              {
                id: "bs-information-technology",
                code: "BSIT",
                name: "BS Information Technology",
                isEnrollmentOpen: true,
              },
            ],
          },
        });
      }
      return Response.json({ data: {} });
    });

    render(<StudentEnrollmentBanner />);

    expect(
      await screen.findByText(
        "Your COR and Student ID (2026001234) for BSIT have been verified by Admin.",
      ),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: /View details/i }));
    expect(screen.getByLabelText("Enrolled Academic Programme")).toBeDisabled();
    expect(screen.getByLabelText("Student ID Number")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Save enrollment record" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));

    await user.click(
      screen.getByRole("button", { name: "Dismiss verification notification" }),
    );

    expect(
      screen.queryByText(
        "Your COR and Student ID (2026001234) for BSIT have been verified by Admin.",
      ),
    ).not.toBeInTheDocument();
  });
});
