import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StudentAssessmentSessionPage } from "@/features/student/assessment/components/student-assessment-session-page";
import { testAssessmentContent } from "@/test/fixtures/student-api-fixtures";

function renderSession(
  props: Partial<ComponentProps<typeof StudentAssessmentSessionPage>> = {},
) {
  const onExit = vi.fn();
  const onReturnToIntroduction = vi.fn();
  const onViewResult = vi.fn();
  const result = render(
    <StudentAssessmentSessionPage
      onExit={onExit}
      onReturnToIntroduction={onReturnToIntroduction}
      onViewResult={onViewResult}
      initialContent={testAssessmentContent}
      {...props}
    />,
  );

  return { ...result, onExit, onReturnToIntroduction, onViewResult };
}

async function answerQuestion(
  user: ReturnType<typeof userEvent.setup>,
  questionNumber: number,
) {
  await waitFor(() => {
    expect(
      screen.getByRole("group", {
        name: `Response for question ${questionNumber}`,
      }),
    ).toBeVisible();
  });
  await user.click(screen.getByRole("radio", { name: /^Agree/i }));
  if (questionNumber === 6) {
    await user.click(
      screen.getByRole("button", {
        name: "Finish assessment",
      }),
    );
  }
}

describe("Student assessment session", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("uses a simple single-question layout with truthful session data", () => {
    renderSession();

    const assessment = screen.getByRole("main");
    const progressRegion = screen
      .getByRole("progressbar", { name: "Assessment completion" })
      .closest(".sticky");
    const navigation = screen.getByRole("navigation", {
      name: "Question navigation",
    });

    expect(assessment).toHaveClass("bg-background");
    expect(assessment).not.toHaveClass("bg-white");
    expect(progressRegion).toHaveClass("bg-background");
    expect(navigation).toHaveClass("bg-background");
    expect(
      screen.getByRole("heading", { name: "Interest assessment" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Question 01 of 6")).toBeVisible();
    expect(screen.getByText("0 answered · 6 remaining")).toBeVisible();
    expect(screen.getByText("0%")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: "Assessment completion" }),
    ).toBeVisible();
    expect(screen.getByText("Does this activity interest you?")).toBeVisible();
    expect(
      screen.queryByRole("link", {
        name: "University of Hawai‘i Community Colleges Career Explorer",
      }),
    ).not.toBeInTheDocument();
    expect(navigation).toBeVisible();
    expect(screen.getByText("👍")).toBeVisible();
    expect(screen.getByText("👎")).toBeVisible();
    expect(screen.getByText("This sounds like me")).toBeVisible();
    expect(screen.getByText("This does not sound like me")).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Illustration for question 1" }),
    ).toBeVisible();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.queryByText("Career compass module")).not.toBeInTheDocument();
  });

  it("answers questions and autosaves progress locally", async () => {
    const user = userEvent.setup();
    renderSession();

    await user.click(screen.getByRole("radio", { name: /^Agree/i }));

    expect(
      screen.getByRole("progressbar", { name: "Assessment completion" }),
    ).toHaveAttribute("aria-valuenow", "17");
    expect(screen.getByRole("status")).toHaveTextContent("Saving...");

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Saved"),
    );
    expect(
      window.localStorage.getItem("tcc-guidance:student-assessment-session"),
    ).toContain('"item-01":1');
  });

  it("automatically advances upon selecting an answer and preserves it when navigating back", async () => {
    const user = userEvent.setup();
    renderSession();

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: /^Agree/i }));
    await waitFor(() => {
      expect(
        screen.getByRole("group", { name: "Response for question 2" }),
      ).toBeVisible();
    });
    expect(
      screen.queryByRole("img", { name: "Illustration for question 1" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Illustration for question 2" }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(
      screen.getByRole("group", { name: "Response for question 1" }),
    ).toBeVisible();
    expect(screen.getByRole("radio", { name: /^Agree/i })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("group", { name: "Response for question 2" }),
    ).toBeVisible();
  });

  it("shows pointer click feedback without changing the native radio control", () => {
    renderSession();

    const agreeChoice = screen.getByRole("radio", { name: /^Agree/i });
    const choiceLabel = agreeChoice.closest("label");
    expect(choiceLabel).not.toBeNull();

    fireEvent.pointerDown(choiceLabel as HTMLLabelElement, {
      clientX: 24,
      clientY: 18,
    });

    expect(
      choiceLabel?.querySelector(".assessment-choice-click-pulse"),
    ).toBeInTheDocument();
    expect(agreeChoice).toHaveAttribute("type", "radio");
  });

  it("finishes without a review list and locks the responses", async () => {
    const user = userEvent.setup();
    const session = renderSession();

    for (let questionNumber = 1; questionNumber <= 6; questionNumber += 1) {
      await answerQuestion(user, questionNumber);
    }

    expect(
      await screen.findByRole("heading", {
        name: "Responses submitted successfully",
      }),
    ).toBeVisible();
    expect(
      screen.getByText("Your recorded answers are read-only."),
    ).toBeVisible();
    expect(screen.queryByText("Version reference")).not.toBeInTheDocument();
    expect(screen.queryByText("Final review")).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem("tcc-guidance:student-assessment-session"),
    ).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "View assessment result" }),
    );
    expect(session.onViewResult).toHaveBeenCalledOnce();
  });

  it("restores saved responses after leaving the session", async () => {
    const user = userEvent.setup();
    const first = renderSession();

    await user.click(screen.getByRole("radio", { name: /^Do not agree/i }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Saved"),
    );
    first.unmount();

    renderSession();
    expect(screen.getByRole("radio", { name: /^Do not agree/i })).toBeChecked();
    expect(
      screen.getByRole("progressbar", { name: "Assessment completion" }),
    ).toHaveAttribute("aria-valuenow", "17");
  });

  it("autosaves an online session to the authenticated API", async () => {
    const user = userEvent.setup();
    renderSession({ remotePersistence: true });

    expect(
      await screen.findByRole("group", { name: "Response for question 1" }),
    ).toBeVisible();
    await user.click(screen.getByRole("radio", { name: /^Agree/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/v1/student/assessments/riasec/sessions/1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("requires and records the self-declared entrance result before starting", async () => {
    const fallbackFetch = vi.mocked(fetch).getMockImplementation();
    expect(fallbackFetch).toBeDefined();
    let declared = false;
    const policy = {
      ruleReference: "SELF-DECLARED-TCC-ENTRANCE-2026-01",
      minimum: 1,
      maximum: 5,
      decimalPlaces: 1,
      boardRange: { minimum: 1, maximum: 2.5 },
      nonBoardRange: { minimum: 2.6, maximum: 5 },
      source: "student_self_declared",
    };
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (input.toString() === "/api/v1/student/entrance-examination") {
        if (init?.method === "POST") {
          declared = true;
          return Response.json(
            {
              data: {
                status: "declared",
                result: {
                  id: 1,
                  score: 2.6,
                  eligibilityGroup: "non_board",
                  ruleReference: policy.ruleReference,
                  source: policy.source,
                  declaredAt: "2026-08-28T09:00:00+08:00",
                },
                policy,
              },
            },
            { status: 201 },
          );
        }
        if (!declared)
          return Response.json({
            data: { status: "required", result: null, policy },
          });
      }
      return fallbackFetch!(input, init);
    });

    const user = userEvent.setup();
    renderSession({ remotePersistence: true });

    expect(
      await screen.findByRole("heading", { name: "Entrance Exam Result" }),
    ).toBeVisible();
    expect(screen.getByLabelText("Entrance Exam Score")).toBeVisible();
    expect(fetch).not.toHaveBeenCalledWith(
      "/api/v1/student/assessments/riasec/sessions",
      expect.objectContaining({ method: "POST" }),
    );

    await user.type(screen.getByLabelText("Entrance Exam Score"), "2.6");
    expect(screen.getByText("Non-board programmes")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Continue to Assessment" }),
    );

    expect(
      await screen.findByRole("group", { name: "Response for question 1" }),
    ).toBeVisible();
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/student/entrance-examination",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ score: 2.6 }),
      }),
    );
    vi.mocked(fetch).mockImplementation(fallbackFetch!);
  });

  it("inserts the decimal separator while entering the exam score", async () => {
    const fallbackFetch = vi.mocked(fetch).getMockImplementation();
    expect(fallbackFetch).toBeDefined();
    const policy = {
      ruleReference: "SELF-DECLARED-TCC-ENTRANCE-2026-01",
      minimum: 1,
      maximum: 5,
      decimalPlaces: 1,
      boardRange: { minimum: 1, maximum: 2.5 },
      nonBoardRange: { minimum: 2.6, maximum: 5 },
      source: "student_self_declared",
    };
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (
        input.toString() === "/api/v1/student/entrance-examination" &&
        init?.method !== "POST"
      ) {
        return Response.json({
          data: { status: "required", result: null, policy },
        });
      }
      return fallbackFetch!(input, init);
    });

    const user = userEvent.setup();
    try {
      renderSession({ remotePersistence: true });

      const scoreInput = await screen.findByLabelText("Entrance Exam Score");
      await user.type(scoreInput, "11");
      expect(scoreInput).toHaveValue("1.1");

      await user.clear(scoreInput);
      await user.type(scoreInput, "10");
      expect(scoreInput).toHaveValue("1.0");
    } finally {
      vi.mocked(fetch).mockImplementation(fallbackFetch!);
    }
  });

  it("keeps an existing completed assessment visible without silently creating a retake", async () => {
    const fallbackFetch = vi.mocked(fetch).getMockImplementation();
    expect(fallbackFetch).toBeDefined();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (input.toString() === "/api/v1/student/assessments/riasec/session") {
        return Response.json({
          data: {
            id: 1,
            status: "result_available",
            question_count: 42,
            result_available_at: "2026-08-19T10:00:00+08:00",
            can_retake: true,
          },
        });
      }
      return fallbackFetch!(input, init);
    });

    const session = renderSession({ remotePersistence: true });

    expect(
      await screen.findByRole("heading", {
        name: "Responses submitted successfully",
      }),
    ).toBeVisible();
    expect(screen.getByText(/Completed Aug 19, 2026/)).toBeVisible();
    expect(screen.getByText(/recorded answers are read-only/i)).toBeVisible();
    expect(session.onViewResult).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Retake assessment" }),
    ).toBeVisible();
    expect(fetch).not.toHaveBeenCalledWith(
      "/api/v1/student/assessments/riasec/sessions",
      expect.objectContaining({ method: "POST" }),
    );
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "View assessment result" }));
    expect(session.onViewResult).toHaveBeenCalledOnce();
  });

  it("shows the persistent completed state after an online submission succeeds", async () => {
    const user = userEvent.setup();
    const session = renderSession({ remotePersistence: true });

    expect(
      await screen.findByRole("group", { name: "Response for question 1" }),
    ).toBeVisible();
    for (let questionNumber = 1; questionNumber <= 6; questionNumber += 1) {
      await answerQuestion(user, questionNumber);
    }

    expect(
      await screen.findByRole("heading", {
        name: "Responses submitted successfully",
      }),
    ).toBeVisible();
    expect(session.onViewResult).not.toHaveBeenCalled();
    const requests = vi.mocked(fetch).mock.calls;
    const submitIndex = requests.findIndex(([input]) =>
      input.toString().endsWith("/submit"),
    );
    expect(submitIndex).toBeGreaterThanOrEqual(0);
    expect(
      requests
        .slice(submitIndex + 1)
        .some(
          ([input, init]) =>
            input.toString().includes("/sessions/1") &&
            init?.method === "PATCH",
        ),
    ).toBe(false);
  });

  it("does not submit when the final answer save fails", async () => {
    const fallbackFetch = vi.mocked(fetch).getMockImplementation();
    expect(fallbackFetch).toBeDefined();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (
        input.toString().includes("/sessions/1") &&
        init?.method === "PATCH"
      ) {
        return Response.json(
          { message: "The answers could not be saved." },
          { status: 422 },
        );
      }
      return fallbackFetch!(input, init);
    });

    try {
      const user = userEvent.setup();
      renderSession({ remotePersistence: true });
      expect(
        await screen.findByRole("group", { name: "Response for question 1" }),
      ).toBeVisible();

      for (let questionNumber = 1; questionNumber <= 6; questionNumber += 1) {
        await answerQuestion(user, questionNumber);
      }

      expect(
        await screen.findByText(
          "Your assessment could not be submitted. Check your connection and try again.",
        ),
      ).toBeVisible();
      expect(
        vi
          .mocked(fetch)
          .mock.calls.some(([input]) => input.toString().endsWith("/submit")),
      ).toBe(false);
    } finally {
      vi.mocked(fetch).mockImplementation(fallbackFetch!);
    }
  });

  it("retries a previously failed result instead of resubmitting locked answers", async () => {
    const fallbackFetch = vi.mocked(fetch).getMockImplementation();
    expect(fallbackFetch).toBeDefined();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = input.toString();
      if (url.endsWith("/submit") && init?.method === "POST") {
        return Response.json({
          data: { id: 1, status: "result_failed", question_count: 6 },
        });
      }
      if (url.endsWith("/retry-result") && init?.method === "POST") {
        return Response.json({
          data: { id: 1, status: "result_available", question_count: 6 },
        });
      }
      return fallbackFetch!(input, init);
    });

    const user = userEvent.setup();
    const session = renderSession({ remotePersistence: true });
    expect(
      await screen.findByRole("group", { name: "Response for question 1" }),
    ).toBeVisible();
    for (let questionNumber = 1; questionNumber <= 6; questionNumber += 1) {
      await answerQuestion(user, questionNumber);
    }

    expect(
      await screen.findByRole("heading", {
        name: "Responses submitted successfully",
      }),
    ).toBeVisible();
    expect(session.onViewResult).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/student/assessments/riasec/sessions/1/retry-result",
      expect.objectContaining({ method: "POST" }),
    );
    vi.mocked(fetch).mockImplementation(fallbackFetch!);
  });

  it("shows the custom calculation state and opens My Matches when the result is ready", async () => {
    const fallbackFetch = vi.mocked(fetch).getMockImplementation();
    expect(fallbackFetch).toBeDefined();
    let resolveSubmission: ((response: Response) => void) | undefined;
    const pendingSubmission = new Promise<Response>((resolve) => {
      resolveSubmission = resolve;
    });
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (input.toString().endsWith("/submit") && init?.method === "POST") {
        return pendingSubmission;
      }
      return fallbackFetch!(input, init);
    });

    const user = userEvent.setup();
    const onViewMatches = vi.fn();
    renderSession({ remotePersistence: true, onViewMatches });
    expect(
      await screen.findByRole("group", { name: "Response for question 1" }),
    ).toBeVisible();

    for (let questionNumber = 1; questionNumber <= 6; questionNumber += 1) {
      await answerQuestion(user, questionNumber);
    }

    expect(
      screen.getByRole("heading", {
        name: "Calculating your programme matches",
      }),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Calculating your programme matches",
    );
    expect(screen.queryByText("Final review")).not.toBeInTheDocument();
    expect(onViewMatches).not.toHaveBeenCalled();

    resolveSubmission?.(
      Response.json({
        data: { id: 1, status: "result_available", question_count: 6 },
      }),
    );
    await waitFor(() => expect(onViewMatches).toHaveBeenCalledOnce());
    vi.mocked(fetch).mockImplementation(fallbackFetch!);
  });

  it("keeps calculating while the submitted result is still preparing", async () => {
    const fallbackFetch = vi.mocked(fetch).getMockImplementation();
    expect(fallbackFetch).toBeDefined();
    let submitted = false;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = input.toString();
      if (url.endsWith("/submit") && init?.method === "POST") {
        submitted = true;
        return Response.json({
          data: { id: 1, status: "preparing_result", question_count: 6 },
        });
      }
      if (submitted && url === "/api/v1/student/assessments/riasec/session") {
        return Response.json({
          data: { id: 1, status: "result_available", question_count: 6 },
        });
      }
      return fallbackFetch!(input, init);
    });

    const user = userEvent.setup();
    const onViewMatches = vi.fn();
    renderSession({ remotePersistence: true, onViewMatches });
    expect(
      await screen.findByRole("group", { name: "Response for question 1" }),
    ).toBeVisible();

    for (let questionNumber = 1; questionNumber <= 6; questionNumber += 1) {
      await answerQuestion(user, questionNumber);
    }

    expect(
      screen.getByRole("heading", {
        name: "Calculating your programme matches",
      }),
    ).toBeVisible();
    await waitFor(() => expect(onViewMatches).toHaveBeenCalledOnce());
    vi.mocked(fetch).mockImplementation(fallbackFetch!);
  });

  it("keeps responses on the device while offline and supports retry", async () => {
    const user = userEvent.setup();
    renderSession({ initialConnectionState: "offline" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "You are working offline",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Saved on device");
    await user.click(screen.getByRole("radio", { name: /^Agree/i }));
    await user.click(screen.getByRole("button", { name: "Retry connection" }));

    expect(
      screen.queryByText("You are working offline"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("defines loading, empty, retryable error, and stale-version states", async () => {
    const loading = renderSession({ initialLoadState: "loading" });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading your assessment session",
    );
    loading.unmount();

    const empty = renderSession({ initialLoadState: "empty" });
    expect(
      screen.getByRole("heading", {
        name: "No assessment session was found",
      }),
    ).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Return to introduction" }),
    );
    expect(empty.onReturnToIntroduction).toHaveBeenCalledOnce();
    empty.unmount();

    const error = renderSession({ initialLoadState: "error" });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "We could not load your session",
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      screen.getByRole("heading", { name: "Interest assessment" }),
    ).toBeInTheDocument();
    error.unmount();

    const stale = renderSession({ versionState: "stale" });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This session needs to be refreshed",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Return to introduction" }),
    );
    expect(stale.onReturnToIntroduction).toHaveBeenCalledOnce();
  });

  it("does not render a question card when loaded content has no questions", async () => {
    const user = userEvent.setup();
    renderSession({
      initialLoadState: "error",
      initialContent: {
        id: "",
        versionReference: "",
        questions: [],
        responseOptions: [],
      },
    });

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The assessment questions are unavailable",
    );
  });

  it("has no automatically detectable accessibility violations", async () => {
    renderSession();
    const results = await axe.run(document.body, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });
});
