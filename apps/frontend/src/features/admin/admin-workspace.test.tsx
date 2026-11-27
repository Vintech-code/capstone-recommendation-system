import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderAppAt } from "@/test/render-app";

describe("Administration workspace", () => {
  it("shows the system dashboard without removed staff workflows", async () => {
    await renderAppAt("/admin");

    expect(
      await screen.findByRole("heading", { name: "System overview" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Feedback" })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Student journey" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Assessment Milestones" }),
    ).toBeVisible();
    expect(screen.getByRole("img", { name: /Registered: 2/ })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Recent Students" }),
    ).toBeVisible();
    expect(screen.getByTestId("admin-operational-strip")).toHaveClass(
      "bg-card",
    );
    expect(screen.getByTestId("admin-operational-strip")).toHaveClass(
      "bg-card",
    );
    expect(screen.getAllByText("I-C-R").length).toBeGreaterThan(0);
    expect(document.querySelector('[class*="bg-gradient"]')).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Open student directory/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /notifications/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Active students")).toBeVisible();
    expect(screen.queryByText("Recommendation runs")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Current workload" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Entrance Exam & Eligibility" }),
    ).toBeVisible();
    expect(screen.getByText("Board Programme Group")).toBeVisible();
    expect(screen.getByText("Non-Board Programme Group")).toBeVisible();
    expect(screen.queryByText("Catalogue & rules")).not.toBeInTheDocument();
    expect(screen.queryByText("Session progress")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Top Recommended Programmes"),
    ).not.toBeInTheDocument();
  }, 30000);

  it("opens a student record with immutable results and recommendations", async () => {
    const user = userEvent.setup();
    await renderAppAt("/admin/students");

    const studentGrid = await screen.findByTestId("admin-student-grid");
    const row = (
      await within(studentGrid).findByText("ana@example.test")
    ).closest("tr");
    expect(row).toBeDefined();
    await user.click(
      within(row as HTMLTableRowElement).getByRole("button", { name: "Open" }),
    );

    expect(window.location.pathname).toBe("/admin/students/10");
    expect(
      await screen.findByRole("heading", { name: "Ana Santos" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Psychometric dimension matrix" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Academic programme recommendations",
      }),
    ).toBeVisible();
    expect(screen.getByTestId("student-resume-card")).toBeVisible();
    expect(screen.getByText("ID number: 12345678")).toBeVisible();
    expect(screen.queryByText("Tagoloan National High School")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Assessment context" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "Assessment history and evidence",
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/GWA/i)).not.toBeInTheDocument();
    expect(
      screen.getAllByText("BS Information Technology").length,
    ).toBeGreaterThan(0);

    await user.click(
      screen.getByRole("button", { name: "Review Curriculum & Quotas" }),
    );
    expect(window.location.pathname).toBe(
      "/admin/programmes/bs-information-technology",
    );
    expect(
      await screen.findByRole("heading", {
        name: "BS Information Technology",
      }),
    ).toBeVisible();
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("provides programme monitoring and configuration", async () => {
    const user = userEvent.setup();
    await renderAppAt("/admin/programmes");

    expect(
      await screen.findByRole("heading", { name: "Programme monitoring" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Open catalogue evidence" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("BS Information Technology")).toBeVisible();
    expect(document.querySelector('[class*="bg-gradient"]')).toBeNull();
    await user.click(screen.getByRole("button", { name: "View details" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(document.querySelector('[class*="bg-gradient"]')).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Possible career directions" }),
    ).toBeVisible();
  });

  it("redirects the removed catalogue-evidence route to programme monitoring", async () => {
    await renderAppAt("/admin/programmes/sources");

    expect(window.location.pathname).toBe("/admin/programmes");
    expect(
      await screen.findByRole("heading", { name: "Programme monitoring" }),
    ).toBeVisible();
  });

  it("presents aggregate assessment and engagement reporting", async () => {
    await renderAppAt("/admin/reports");

    expect(
      await screen.findByRole("heading", { name: "System reports" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Export aggregate/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Catalogue governance")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Program Enrollment Alignment" }),
    ).toBeVisible();
    expect(screen.getByText("BSIT")).toBeVisible();
    expect(screen.getByText("Enrolled in #1 recommendation")).toBeVisible();
    expect(screen.getByText("Actual programme chosen instead")).toBeVisible();
    expect(screen.getByText("BSCrim")).toBeVisible();
    expect(screen.getByText(/BS Criminology/)).toBeVisible();
    expect(screen.getByText(/does not prove that the recommendation caused/i)).toBeVisible();
    expect(screen.getByText("Overall")).toBeVisible();
    expect(screen.getByRole("button", { name: "Date range" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Print report" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Preview & download report" }),
    ).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Preview & download report" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Word Report Preview" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Confirm & Download .docx" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", {
        name: "Recommendation interest-match feedback",
      }),
    ).not.toBeInTheDocument();
  });

  it("lists anonymous respondents and opens their complete programme feedback", async () => {
    const user = userEvent.setup();
    await renderAppAt("/admin/feedback");

    expect(
      await screen.findByRole("heading", { name: "Student feedback" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Feedback respondents",
      }),
    ).toBeVisible();
    expect(screen.getByRole("table")).toBeVisible();
    expect(screen.getByText("Student Applicant")).toBeVisible();
    expect(screen.getByText(/not Student numbers or account identifiers/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Date range" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "View feedback" }));

    const details = await screen.findByRole("dialog");
    expect(
      within(details).getByRole("heading", { name: "Student Applicant #1" }),
    ).toBeVisible();
    expect(within(details).getByText("BS Information Technology")).toBeVisible();
    expect(
      within(details).getByText("Bachelor of Library and Information Science"),
    ).toBeVisible();
    expect(
      within(details).getByText("BS Business Administration - Financial Management"),
    ).toBeVisible();
    expect(within(details).getByText("Result #1")).toBeVisible();
    expect(within(details).getByText("90%")).toBeVisible();
    expect(within(details).getByText("88.57%")).toBeVisible();
    expect(within(details).getByText("82.86%")).toBeVisible();
    expect(
      within(details).getByText(/This recommendation reflects my interests in technology/i),
    ).toBeVisible();
    expect(within(details).getByText("No comment submitted.")).toBeVisible();
    expect(within(details).getByText("No feedback submitted")).toBeVisible();
  });

  it("shows a concise activity timeline without raw record metadata", async () => {
    await renderAppAt("/admin/activity");

    expect(
      await screen.findByRole("heading", { name: "Admin activity" }),
    ).toBeVisible();
    expect(screen.getByText("Configuration Published")).toBeVisible();
    expect(screen.queryByText(/catalogue-v2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Before Status/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Date range" })).toBeVisible();
  });

  it("combines students and assessments in one searchable ledger", async () => {
    const user = userEvent.setup();
    await renderAppAt("/admin/students");

    expect(
      await screen.findByRole("heading", { name: "Student records" }),
    ).toBeVisible();
    const studentGrid = screen.getByTestId("admin-student-grid");
    expect(studentGrid).toHaveClass("admin-grid");
    expect(await within(studentGrid).findByRole("grid")).toBeInTheDocument();
    await user.type(
      screen.getByRole("searchbox", { name: "Search student records" }),
      "Ana",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() => {
      expect(
        within(screen.getByTestId("admin-student-grid")).getAllByRole(
          "button",
          {
            name: "Open",
          },
        ).length,
      ).toBeGreaterThan(0);
    });
  });

  it("shows a retryable error when an Admin endpoint fails", async () => {
    const defaultImplementation = vi.mocked(fetch).getMockImplementation();
    vi.mocked(fetch).mockImplementation((input, init) => {
      if (input.toString() === "/api/v1/admin/overview") {
        return Promise.resolve(
          Response.json({ message: "Service unavailable." }, { status: 503 }),
        );
      }
      return defaultImplementation!(input, init);
    });
    await renderAppAt("/admin");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Service unavailable.",
    );
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
  });
});
