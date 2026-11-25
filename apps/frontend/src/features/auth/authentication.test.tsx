import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderAppAt } from "@/test/render-app";
import { AuthProvider } from "@/features/auth/auth-provider";
import { useAuth } from "@/features/auth/auth-context";

function SessionProbe() {
  const { refreshSession, status, user } = useAuth();

  return (
    <div>
      <p>{status}:{user?.email ?? "guest"}:{user?.photoUrl ?? "no-photo"}</p>
      <button type="button" onClick={() => void refreshSession()}>
        Refresh session
      </button>
    </div>
  );
}

describe("server-backed authentication", () => {
  it("restores a guest session without calling the protected current-user endpoint", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      if (input.toString() === "/api/v1/auth/session") {
        return Response.json({ user: null });
      }

      return Response.json({ message: "Unexpected request." }, { status: 500 });
    });

    render(<AuthProvider><SessionProbe /></AuthProvider>);

    expect(await screen.findByText("ready:guest:no-photo")).toBeVisible();
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/auth/session",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("refreshes a preloaded user after an identity update", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({
        user: {
          id: 7,
          name: "Admin User",
          email: "admin@example.test",
          roles: ["admin"],
          photoUrl: "/api/v1/admin/profile/photo?v=new-photo",
        },
      }),
    );

    const user = userEvent.setup();
    render(
      <AuthProvider
        initialUser={{
          id: 7,
          name: "Admin User",
          email: "admin@example.test",
          roles: ["admin"],
          photoUrl: null,
        }}
      >
        <SessionProbe />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Refresh session" }));

    expect(
      await screen.findByText(
        "ready:admin@example.test:/api/v1/admin/profile/photo?v=new-photo",
      ),
    ).toBeVisible();
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/auth/session",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("requests password recovery without exposing whether the account exists", async () => {
    const user = userEvent.setup();
    await renderAppAt("/forgot-password?portal=student");

    await user.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "student@example.test",
    );
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "If an active account matches that email",
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/auth/forgot-password",
      expect.objectContaining({
        body: JSON.stringify({ email: "student@example.test" }),
      }),
    );
  });

  it("resets a password from a tokenized recovery link", async () => {
    const user = userEvent.setup();
    await renderAppAt(
      "/reset-password/test-token?email=student%40example.test&portal=admin",
    );

    await user.type(screen.getByLabelText("New password"), "NewSecure!2026");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "NewSecure!2026",
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Your password has been reset",
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/auth/reset-password",
      expect.objectContaining({
        body: JSON.stringify({
          token: "test-token",
          email: "student@example.test",
          password: "NewSecure!2026",
          password_confirmation: "NewSecure!2026",
        }),
      }),
    );
    expect(screen.getByRole("link", { name: "Continue to Administrator sign in" })).toHaveAttribute(
      "href",
      "/admin/login",
    );
  });

  it("registers with split names and requires email verification", async () => {
    const user = userEvent.setup();
    await renderAppAt("/student/register");

    await user.type(
      screen.getByRole("textbox", { name: "First name" }),
      "Clark",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Last name" }),
      "Cabatuan",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "new.student@example.test",
    );
    await user.type(screen.getByLabelText("Password"), "StudentPass!2026");
    await user.type(
      screen.getByLabelText("Confirm password"),
      "StudentPass!2026",
    );
    await user.click(
      screen.getByRole("button", { name: "Create student account" }),
    );

    expect(await screen.findByRole("heading", { name: "Verify your email" })).toBeVisible();
    expect(screen.getByText(/new\.student@example\.test/)).toBeVisible();
    expect(window.location.pathname).toBe("/student/register");
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/auth/register",
      expect.objectContaining({
        body: JSON.stringify({
          firstName: "Clark",
          lastName: "Cabatuan",
          email: "new.student@example.test",
          password: "StudentPass!2026",
          password_confirmation: "StudentPass!2026",
        }),
      }),
    );
    expect(fetch).not.toHaveBeenCalledWith(
      "/api/v1/auth/login",
      expect.anything(),
    );

    await user.click(screen.getByRole("button", { name: "Resend verification email" }));
    expect(await screen.findByRole("status")).toHaveTextContent("new verification link has been sent");
  });

  it("redirects an unauthenticated Admin request to the Admin portal", async () => {
    await renderAppAt("/admin/applicants", { authUser: null });

    await waitFor(() => expect(window.location.pathname).toBe("/admin/login"), {
      timeout: 5_000,
    });
    expect(
      await screen.findByRole(
        "heading",
        { name: "Welcome back!" },
        { timeout: 5_000 },
      ),
    ).toBeVisible();
  });

  it("sends the selected portal with the credentials and enters Admin", async () => {
    const user = userEvent.setup();
    await renderAppAt("/admin/login");

    await user.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "admin@example.test",
    );
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(window.location.pathname).toBe("/admin"));
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/auth/login",
      expect.objectContaining({
        body: JSON.stringify({
          email: "admin@example.test",
          password: "correct-password",
          portal: "admin",
        }),
      }),
    );
  });

  it("keeps credentials in the form and shows a server validation error", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      if (input.toString() === "/sanctum/csrf-cookie") {
        return new Response(null, { status: 204 });
      }
      if (input.toString() === "/api/v1/auth/login") {
        return Response.json(
          {
            message: "The provided credentials are incorrect.",
            errors: {
              email: ["The provided credentials are incorrect."],
            },
          },
          { status: 422 },
        );
      }
      return Response.json({ message: "Unexpected request." }, { status: 500 });
    });

    const user = userEvent.setup();
    await renderAppAt("/admin/login");
    const email = screen.getByRole("textbox", { name: "Email address" });

    await user.type(email, "admin@example.test");
    await user.type(screen.getByLabelText("Password"), "incorrect-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("The provided credentials are incorrect."),
    ).toBeVisible();
    expect(email).toHaveValue("admin@example.test");
    expect(window.location.pathname).toBe("/admin/login");
  });

  it("blocks an authenticated user from another role", async () => {
    await renderAppAt("/admin", {
      authUser: {
        id: 4,
        name: "Student Applicant",
        email: "student@example.test",
        roles: ["student"],
      },
    });

    await waitFor(() => expect(window.location.pathname).toBe("/forbidden"));
    expect(
      await screen.findByRole("heading", {
        name: "You cannot open this page",
      }),
    ).toBeVisible();
  });

  it("uses the server portal boundary before rendering a protected workspace", async () => {
    await renderAppAt("/student");

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/auth/authorize/student",
      expect.objectContaining({
        credentials: "include",
      }),
    );
    expect(
      await screen.findByRole("button", { name: "Go to dashboard" }),
    ).toBeVisible();
  });

  it("opens session recovery when the server rejects an expired session", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      if (input.toString() === "/api/v1/auth/authorize/student") {
        return Response.json(
          {
            message: "Unauthenticated.",
            error: {
              code: "AUTHENTICATION_REQUIRED",
            },
          },
          { status: 401 },
        );
      }
      return Response.json({ message: "Unexpected request." }, { status: 500 });
    });

    await renderAppAt("/student");

    await waitFor(() =>
      expect(window.location.pathname).toBe("/session-expired"),
    );
    expect(
      screen.getByRole("heading", { name: "Sign in to continue" }),
    ).toBeVisible();
  });

  it("opens permission recovery when the server denies the portal role", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      if (input.toString() === "/api/v1/auth/authorize/student") {
        return Response.json(
          {
            message: "You do not have permission to access this portal.",
            error: {
              code: "ROLE_FORBIDDEN",
            },
          },
          { status: 403 },
        );
      }
      return Response.json({ message: "Unexpected request." }, { status: 500 });
    });

    await renderAppAt("/student");

    await waitFor(() => expect(window.location.pathname).toBe("/forbidden"));
    expect(
      screen.getByRole("heading", { name: "You cannot open this page" }),
    ).toBeVisible();
  });
});
