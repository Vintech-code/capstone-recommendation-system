import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StudentRegistrationForm } from "@/features/auth/components/student-registration-form";

describe("StudentRegistrationForm", () => {
  it("toggles password visibility with eye icons", async () => {
    const user = userEvent.setup();
    render(<StudentRegistrationForm onRegister={vi.fn()} />);

    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const togglePasswordBtn = screen.getByRole("button", { name: "Show password" });
    const toggleConfirmBtn = screen.getByRole("button", { name: "Show confirm password" });

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    // Toggle password
    await user.click(togglePasswordBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(passwordInput).toHaveAttribute("type", "password");

    // Toggle confirm password
    await user.click(toggleConfirmBtn);
    expect(confirmPasswordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide confirm password" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Hide confirm password" }));
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("displays live password strength notification and 3-bar meter without checklist clutter", async () => {
    const user = userEvent.setup();
    render(<StudentRegistrationForm onRegister={vi.fn()} />);

    const passwordInput = screen.getByLabelText("Password");

    // Initially shows policy message
    expect(
      screen.getByText("Use at least 12 characters with uppercase, lowercase, a number, and a symbol."),
    ).toBeVisible();
    expect(screen.queryByTestId("password-strength-meter")).not.toBeInTheDocument();

    // Type weak password
    await user.type(passwordInput, "short");
    expect(screen.getByTestId("password-strength-meter")).toBeVisible();
    expect(screen.getByText("Weak")).toBeVisible();
    expect(screen.queryByText("12+ characters")).not.toBeInTheDocument();

    // Type password meeting all rules
    await user.clear(passwordInput);
    await user.type(passwordInput, "ValidPassword!123");
    expect(screen.getByText("Strong")).toBeVisible();
    expect(screen.queryByText("12+ characters")).not.toBeInTheDocument();
  });
});
