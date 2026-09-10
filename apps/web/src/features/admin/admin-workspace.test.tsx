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
    expect(
      screen.getByRole("heading", { name: "Student journey" }),
    ).toBeVisible();
    expect(screen.getByRole("img", { name: /Registered: 2/ })).toBeVisible();
    expect(screen.getByText("Recent assessment activity")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Current workload" }),
    ).toBeVisible();
  });

  it("opens a student record with immutable results and recommendations", async () => {
    const user = userEvent.setup();
    await renderAppAt("/admin/students");

    const studentGrid = await screen.findByTestId("admin-student-grid");
    const row = (await within(studentGrid).findByText("ana@example.test")).closest(
      "tr",
    );
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
      screen.getByRole("heading", { name: "Academic programme pathways" }),
    ).toBeVisible();
    expect(screen.getByTestId("student-resume-card")).toBeVisible();
    expect(screen.getByText("LRN: 128490000011")).toBeVisible();
    expect(screen.getByText("Tagoloan National High School")).toBeVisible();
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
    await user.click(screen.getByRole("button", { name: "View details" }));
    expect(screen.getByRole("dialog")).toBeVisible();
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

  it("keeps reports focused on assessment and engagement charts", async () => {
    await renderAppAt("/admin/reports");

    expect(
      await screen.findByRole("heading", { name: "System reports" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Export aggregate/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Catalogue governance")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /Board eligible: 1/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("img", { name: /Recommendations: 2/ }),
    ).toBeVisible();
  });

  it("shows a concise activity timeline without raw record metadata", async () => {
    await renderAppAt("/admin/activity");

    expect(
      await screen.findByRole("heading", { name: "Admin activity" }),
    ).toBeVisible();
    expect(screen.getByText("Configuration Published")).toBeVisible();
    expect(screen.queryByText(/catalogue-v2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Before Status/i)).not.toBeInTheDocument();
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
        within(screen.getByTestId("admin-student-grid")).getAllByRole("button", {
          name: "Open",
        }).length,
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
