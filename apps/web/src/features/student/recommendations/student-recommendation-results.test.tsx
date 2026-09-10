import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";

import { StudentRecommendationResultsPage } from "@/features/student/recommendations/components/student-recommendation-results-page";
import {
  testAssessmentLifecycle,
  testRecommendationSnapshot,
} from "@/test/fixtures/student-api-fixtures";

describe("Student recommendation results", () => {
  it("renders only recommendation data supplied by the API boundary", () => {
    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialAssessment={testAssessmentLifecycle}
        initialSnapshot={{
          ...testRecommendationSnapshot,
          courses: [
            {
              ...testRecommendationSnapshot.courses[0],
              careerDirections: ["Systems and business analysis"],
            },
          ],
          status: "Temporary methodology",
        }}
      />,
    );
    expect(screen.getAllByText(/Test Course/).length).toBeGreaterThan(0);
    expect(screen.getByText("Generated Aug 7, 2026")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "RIASEC scores" }),
    ).toBeVisible();
    const resultHeading = screen.getByRole("heading", {
      level: 1,
      name: "Investigative, Conventional, and Social",
    });
    expect(resultHeading).toBeVisible();
    expect(resultHeading).toHaveClass("font-display", "font-black");
    expect(resultHeading.closest("section")).not.toHaveClass(
      "border",
      "bg-card",
      "shadow-sm",
    );
    expect(
      screen.queryByRole("img", { name: /RIASEC profile/i }),
    ).not.toBeInTheDocument();
    const resultSummary = screen.getByText(
      /three leading recorded areas are investigative, conventional, and social/i,
    );
    expect(resultSummary).toBeVisible();
    expect(resultSummary).toHaveClass("text-base", "font-medium");
    expect(screen.getByText("Your leading areas")).toBeVisible();
    expect(screen.getAllByText("Investigative").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Conventional").length).toBeGreaterThan(0);
    const careerHeading = screen.getByRole("heading", {
      name: "Recommended career paths",
    });
    const careerSection = careerHeading.closest("section");
    expect(careerHeading).toHaveClass("text-2xl", "font-extrabold");
    expect(careerSection).toHaveClass(
      "lg:col-span-2",
      "rounded-3xl",
      "border",
      "bg-card",
    );
    expect(
      screen.getByText("Built from your recorded pattern: I-C-S"),
    ).toBeVisible();
    expect(screen.getByText("Career directions")).toBeVisible();
    expect(screen.getByText("Systems and business analysis")).toBeVisible();
    expect(screen.getByText("Why it fits you")).toBeVisible();
    expect(screen.getByRole("heading", { name: "RIASEC scores" })).toHaveClass(
      "text-2xl",
      "font-extrabold",
    );
    const page = screen
      .getByRole("heading", { name: "All ranked matches" })
      .closest(".student-grid-page");
    expect(page).not.toBeNull();
    expect(page).toHaveClass("student-dashboard-canvas");
    expect(screen.getAllByText("I · Investigative").length).toBeGreaterThan(0);
    expect(screen.getByText("Top fit")).toBeVisible();
    expect(screen.getByText("90%")).toBeVisible();
    expect(
      screen.getByText(/current provisional programme-matching rule/),
    ).toBeVisible();
    expect(screen.getAllByText("C · Conventional").length).toBeGreaterThan(0);
    const matchRow = screen
      .getByRole("heading", { level: 3, name: "Test Course" })
      .closest("article");
    expect(matchRow).toHaveClass(
      "overflow-hidden",
      "rounded-3xl",
      "border",
      "bg-card",
    );
    expect(
      screen.getByRole("progressbar", { name: "Test Course strong match" }),
    ).toHaveAttribute("aria-valuenow", "90");
    expect(screen.getByText("Strong match")).toBeVisible();
    expect(screen.queryByText("TEST", { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText("TEST-SESSION-001")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/temporary methodology/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/programme guidance for review/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/learning areas to explore/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/requirements to confirm with tcc/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/logical reasoning/i)).not.toBeInTheDocument();
  });

  it("explains the self-declared entrance group used before interest matching", () => {
    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialAssessment={testAssessmentLifecycle}
        initialSnapshot={{
          ...testRecommendationSnapshot,
          entranceExamination: {
            resultId: 4,
            score: 2.5,
            eligibilityGroup: "board",
            ruleReference: "SELF-DECLARED-TCC-ENTRANCE-2026-01",
            source: "student_self_declared",
            declaredAt: "2026-08-28T09:00:00+08:00",
          },
        }}
      />,
    );

    expect(screen.getByText("Board programmes")).toBeVisible();
  });

  it("uses the reference-inspired pastel row without repeating catalogue photography", () => {
    const picturedCourse = {
      ...testRecommendationSnapshot.courses[0],
      id: "bs-information-technology",
      name: "BS Information Technology",
      coverImageUrl:
        "/storage/programme-media/bs-information-technology/cover/published.webp",
      coverImagePosition: { x: 30, y: 70, zoom: 1.4 },
    };

    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialAssessment={testAssessmentLifecycle}
        initialSnapshot={{
          ...testRecommendationSnapshot,
          courses: [picturedCourse],
        }}
      />,
    );

    expect(
      screen.queryByRole("img", {
        name: "BS Information Technology programme",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen
        .getByRole("heading", { name: "BS Information Technology" })
        .closest("article"),
    ).toHaveClass("rounded-3xl");
  });

  it("steps down the colored field across the top three and leaves later ranks plain", () => {
    const courses = Array.from({ length: 4 }, (_, index) => ({
      ...testRecommendationSnapshot.courses[0],
      id: `course-${index + 1}`,
      name: `Course ${index + 1}`,
      rank: index + 1,
    }));

    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialAssessment={testAssessmentLifecycle}
        initialSnapshot={{ ...testRecommendationSnapshot, courses }}
      />,
    );

    expect(document.querySelector('[data-rank-highlight="1"]')).toHaveClass(
      "lg:w-[68%]",
    );
    expect(document.querySelector('[data-rank-highlight="2"]')).toHaveClass(
      "lg:w-[58%]",
    );
    expect(document.querySelector('[data-rank-highlight="3"]')).toHaveClass(
      "lg:w-[48%]",
    );
    expect(
      document.querySelector('[data-rank-highlight="4"]'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Course 4" }).closest("article"),
    ).not.toHaveClass("rounded-3xl");
  });

  it("shows equal scores as shared ranks without inventing a score difference", () => {
    const courses = [
      {
        ...testRecommendationSnapshot.courses[0],
        id: "course-a",
        name: "Course A",
        rank: 1,
        isTie: true,
        match: 85.71,
      },
      {
        ...testRecommendationSnapshot.courses[0],
        id: "course-b",
        name: "Course B",
        rank: 1,
        isTie: true,
        match: 85.71,
      },
      {
        ...testRecommendationSnapshot.courses[0],
        id: "course-c",
        name: "Course C",
        rank: 3,
        match: 80,
      },
    ];

    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialAssessment={testAssessmentLifecycle}
        initialSnapshot={{
          ...testRecommendationSnapshot,
          courses,
          totalRanked: 3,
          showingAll: true,
        }}
      />,
    );

    expect(screen.getAllByText("Rank #1")).toHaveLength(2);
    expect(screen.getAllByText("Tied at #1")).toHaveLength(2);
    expect(screen.getAllByText("85.71%")).toHaveLength(2);
    expect(screen.getByText("Rank #3")).toBeVisible();
  });

  it("keeps a programme visible as classification pending without inventing a match", () => {
    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialAssessment={testAssessmentLifecycle}
        initialSnapshot={{
          ...testRecommendationSnapshot,
          pendingProgrammes: [
            {
              id: "bs-community-development",
              code: "BS Community Development",
              name: "BS Community Development",
              status: "classification_pending",
              reason: "PROFILE_UNAVAILABLE",
              profileStatus: "pending_authoritative_psg_basis",
              profileVersion: "PSG-MATRIX-2026-09-10",
              notice: "No RIASEC code is assigned while the source is being processed.",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Classification in progress" }),
    ).toBeVisible();
    expect(screen.getByText("BS Community Development")).toBeVisible();
    expect(screen.getByText("RIASEC classification pending")).toBeVisible();
  });

  it("shows an honest empty state when no recommendation exists", () => {
    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialSnapshot={null}
        initialLoadState="empty"
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No academic matches yet" }),
    ).toBeVisible();
    expect(screen.queryByText("Test Course")).not.toBeInTheDocument();
  });

  it("renders the assessment profile embedded in the recommendation response", () => {
    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialSnapshot={testRecommendationSnapshot}
      />,
    );

    expect(screen.getAllByText("I · Investigative").length).toBeGreaterThan(0);
    expect(screen.getAllByText("19 / 25")).toHaveLength(2);
    expect(
      screen.queryByLabelText("Interest profile unavailable"),
    ).not.toBeInTheDocument();
  });

  it("defines loading, pending, and retryable error states", () => {
    const loading = render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialLoadState="loading"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading your academic matches",
    );
    loading.unmount();
    const pending = render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialLoadState="pending"
      />,
    );
    expect(screen.getByText("Your matches are being prepared")).toBeVisible();
    pending.unmount();
    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialLoadState="error"
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "We could not load your academic matches",
    );
  });

  it("renders the complete ranked result without a separate view-all request", () => {
    const expanded = {
      ...testRecommendationSnapshot,
      canViewAll: false,
      showingAll: true,
      totalEligible: 2,
      courses: [
        ...testRecommendationSnapshot.courses,
        {
          ...testRecommendationSnapshot.courses[0],
          id: "second-course",
          rank: 2,
          name: "Second Course",
        },
      ],
    };
    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialSnapshot={expanded}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Second Course" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /View all .* ranked programmes/ }),
    ).not.toBeInTheDocument();
  });

  it("opens a selected match in the reference-informed course detail view", async () => {
    const user = userEvent.setup();
    const detailedCourse = {
      ...testRecommendationSnapshot.courses[0],
      summary: "A programme connected to the recorded assessment profile.",
      factors: ["Profile includes I", "Profile includes C"],
      interestAreas: ["I", "C"],
      learningAreas: ["Software development", "Information management"],
      learningAreaDescriptions: {
        "Software development":
          "Design, build, test, and maintain software applications.",
        "Information management":
          "Organise and protect information using structured data practices.",
      },
      careerDirections: ["Systems support"],
      careerOpportunities: [
        {
          label: "ICT system administrator",
          description:
            "Maintains reliable information and communication technology systems.",
          escoUri:
            "http://data.europa.eu/esco/occupation/ict-system-administrator",
          escoCode: "2522.2",
          iscoCode: "2522",
          skills: ["manage ICT systems"],
          source: "esco" as const,
          sourceLanguage: "en",
          sourceVersion: "v1.2.0",
          retrievedAt: "2026-09-06T12:00:00+08:00",
          reviewStatus: "proposed" as const,
        },
      ],
      reviewNotes: ["Review the published programme guidance before deciding."],
    };

    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialSnapshot={{
          ...testRecommendationSnapshot,
          courses: [detailedCourse],
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "View programme" }));

    expect(
      screen.queryByRole("navigation", { name: "Breadcrumb" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Test Course" }),
    ).toBeVisible();
    expect(screen.getByText("Strong match")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Your match score" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Why this fits you" }),
    ).toBeVisible();
    expect(screen.getByText("Investigative recorded score: 19")).toBeVisible();
    expect(
      screen.getByText("Catalogue learning areas: Software development"),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Core learning areas" }),
    ).toBeVisible();
    expect(screen.getByText("Degree type")).toBeVisible();
    expect(screen.getByText("Bachelor's degree")).toBeVisible();
    expect(screen.getByText("Career directions")).toBeVisible();
    expect(screen.getByText("1 to explore")).toBeVisible();
    expect(screen.getByText("Programme type")).toBeVisible();
    expect(screen.getByText("Board programme")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Possible career directions" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "ICT system administrator" }),
    ).toBeVisible();
    expect(screen.getByText("manage ICT systems")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /View ESCO record/i }),
    ).toHaveAttribute(
      "href",
      "http://data.europa.eu/esco/occupation/ict-system-administrator",
    );
    expect(
      screen.queryByRole("heading", { name: "Career trajectory" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Software development")).toBeVisible();
    expect(
      screen.getByText(
        "Design, build, test, and maintain software applications.",
      ),
    ).toBeVisible();
    expect(screen.getAllByText("Systems support").length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("heading", { name: "Before you decide" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Official data sources" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /apply/i }),
    ).not.toBeInTheDocument();

    const detail = screen.getByRole("article", { name: "Test Course" });
    const accessibility = await axe.run(detail, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(accessibility.violations).toEqual([]);

    await user.click(screen.getByRole("button", { name: "Back to matches" }));
    expect(
      screen.getByRole("heading", { name: "All ranked matches" }),
    ).toBeVisible();
  });

  it("confirms a retake before creating the new assessment", async () => {
    const user = userEvent.setup();
    const onOpenAssessment = vi.fn();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: 2, status: "in_progress", question_count: 30 },
      }),
    } as Response);

    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        onOpenAssessment={onOpenAssessment}
        initialSnapshot={testRecommendationSnapshot}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Retake assessment" }));
    expect(
      screen.getByRole("alertdialog", { name: "Start a new assessment?" }),
    ).toBeVisible();
    await user.type(
      screen.getByRole("textbox", { name: "Reason for retaking (optional)" }),
      "I want to reconsider my programme options.",
    );
    await user.click(screen.getByRole("button", { name: "Start retake" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/student/assessments/riasec/sessions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          retakeReason: "I want to reconsider my programme options.",
        }),
      }),
    );
    expect(onOpenAssessment).toHaveBeenCalledOnce();
  });

  it("has no automatically detectable accessibility violations", async () => {
    render(
      <StudentRecommendationResultsPage
        onBack={vi.fn()}
        initialSnapshot={null}
        initialLoadState="empty"
      />,
    );
    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
