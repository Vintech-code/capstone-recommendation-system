import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GoogleAuthCompletionPage } from "@/features/auth/google-auth-completion-page";

describe("Google authentication completion page", () => {
  const originalBroadcastChannel = globalThis.BroadcastChannel;

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(globalThis, "BroadcastChannel", {
      configurable: true,
      writable: true,
      value: originalBroadcastChannel,
    });
    vi.restoreAllMocks();
  });

  it("notifies the original tab and closes without inspecting window.closed", () => {
    vi.useFakeTimers();
    const postMessage = vi.fn();
    const closeChannel = vi.fn();
    const closeWindow = vi.spyOn(window, "close").mockImplementation(() => undefined);

    class TestBroadcastChannel {
      readonly name: string;
      constructor(name: string) {
        this.name = name;
      }
      postMessage = postMessage;
      close = closeChannel;
    }
    Object.defineProperty(globalThis, "BroadcastChannel", {
      configurable: true,
      writable: true,
      value: TestBroadcastChannel,
    });

    render(
      <MemoryRouter
        initialEntries={[
          "/google-auth/complete?flow=flow-1234567890&portal=student&status=success",
        ]}
      >
        <GoogleAuthCompletionPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Google sign-in complete" }),
    ).toBeVisible();
    expect(postMessage).toHaveBeenCalledWith({
      type: "google-auth-complete",
      flow: "flow-1234567890",
      portal: "student",
      status: "success",
      error: undefined,
    });
    expect(closeChannel).toHaveBeenCalledOnce();

    act(() => vi.advanceTimersByTime(150));
    expect(closeWindow).toHaveBeenCalledOnce();
  });
});
