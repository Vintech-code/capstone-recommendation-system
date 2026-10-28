import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  AdminThemeProvider,
  useAdminTheme,
} from "@/features/admin/theme/admin-theme-context";
import {
  AdminThemeToggle,
  AdminThemeDropdownItem,
} from "@/features/admin/theme/admin-theme-toggle";
import { AdminProfileAppearanceCard } from "@/features/admin/components/admin-profile-appearance-card";
import { DropdownMenu, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";

function TestThemeConsumer() {
  const { themeMode, resolvedTheme, setThemeMode, toggleTheme } = useAdminTheme();
  return (
    <div>
      <span data-testid="theme-mode">{themeMode}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button type="button" onClick={() => setThemeMode("dark")}>Set Dark</button>
      <button type="button" onClick={() => setThemeMode("light")}>Set Light</button>
      <button type="button" onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe("Administrator Theme System", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
  });

  it("defaults to light theme and manages dark mode classes", async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <AdminThemeProvider>
        <TestThemeConsumer />
      </AdminThemeProvider>
    );

    expect(screen.getByTestId("theme-mode")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.body.classList.contains("dark")).toBe(false);

    // Switch to dark
    await user.click(screen.getByRole("button", { name: "Set Dark" }));

    expect(screen.getByTestId("theme-mode")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.body.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("tcc_admin_theme_mode")).toBe("dark");

    // Toggle back to light
    await user.click(screen.getByRole("button", { name: "Toggle" }));

    expect(screen.getByTestId("theme-mode")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Unmounting cleans up dark class so other routes (like student) are never polluted
    await user.click(screen.getByRole("button", { name: "Set Dark" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    unmount();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.body.classList.contains("dark")).toBe(false);
  });

  it("renders AdminThemeToggle button with accessible labels and toggles theme", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <AdminThemeProvider>
          <AdminThemeToggle />
        </AdminThemeProvider>
      </TooltipProvider>
    );

    const toggleButton = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(toggleButton).toBeInTheDocument();

    await user.click(toggleButton);

    expect(screen.getByRole("button", { name: /switch to light mode/i })).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("renders AdminThemeDropdownItem and toggles theme", async () => {
    const user = userEvent.setup();

    render(
      <AdminThemeProvider>
        <DropdownMenu open>
          <DropdownMenuContent>
            <AdminThemeDropdownItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </AdminThemeProvider>
    );

    const item = screen.getByRole("menuitem", { name: /dark mode/i });
    expect(item).toBeInTheDocument();

    await user.click(item);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("renders AdminProfileAppearanceCard and allows selecting Light, Dark, and System modes", async () => {
    const user = userEvent.setup();

    render(
      <AdminThemeProvider>
        <AdminProfileAppearanceCard />
      </AdminThemeProvider>
    );

    expect(screen.getByRole("heading", { name: "Workspace appearance" })).toBeVisible();

    const lightBtn = screen.getByRole("button", { name: /light mode/i });
    const darkBtn = screen.getByRole("button", { name: /dark mode/i });
    const systemBtn = screen.getByRole("button", { name: /system default/i });

    expect(lightBtn).toBeVisible();
    expect(darkBtn).toBeVisible();
    expect(systemBtn).toBeVisible();

    // Switch to dark
    await user.click(darkBtn);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("tcc_admin_theme_mode")).toBe("dark");

    // Switch to system
    await user.click(systemBtn);
    expect(window.localStorage.getItem("tcc_admin_theme_mode")).toBe("system");
  });
});

