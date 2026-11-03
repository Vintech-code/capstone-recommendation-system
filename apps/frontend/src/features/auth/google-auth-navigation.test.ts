import { describe, expect, it, vi } from "vitest";

import { startGoogleAuthentication } from "@/features/auth/google-auth-navigation";

describe("Google authentication popup navigation", () => {
  it("opens Google outside the main tab and accepts only the matching completion", () => {
    const messageListeners: Array<(event: MessageEvent<unknown>) => void> = [];
    const close = vi.fn();
    const removeEventListener = vi.fn();
    const focus = vi.fn();
    const openPopup = vi.fn((...args: [string, string, string]) => {
      expect(args).toHaveLength(3);
      return { focus } as unknown as Window;
    });
    const onResult = vi.fn();

    const started = startGoogleAuthentication("/auth/google/redirect", {
      portal: "student",
      onResult,
      createFlowId: () => "flow-1234567890",
      createChannel: () => ({
        addEventListener: (_type, listener) => {
          messageListeners.push(listener);
        },
        removeEventListener,
        close,
      }),
      openPopup,
      scheduleTimeout: () => 7,
      cancelTimeout: vi.fn(),
    });

    expect(started).toBe(true);
    const openedUrl = new URL(openPopup.mock.calls[0][0]);
    expect(openedUrl.pathname).toBe("/auth/google/redirect");
    expect(openedUrl.searchParams.get("popup")).toBe("1");
    expect(openedUrl.searchParams.get("flow")).toBe("flow-1234567890");
    expect(focus).toHaveBeenCalledOnce();

    const messageListener = messageListeners.at(0);
    expect(messageListener).toBeDefined();
    messageListener?.(
      new MessageEvent("message", {
        data: {
          type: "google-auth-complete",
          flow: "another-flow",
          portal: "student",
          status: "success",
        },
      }),
    );
    expect(onResult).not.toHaveBeenCalled();

    messageListener?.(
      new MessageEvent("message", {
        data: {
          type: "google-auth-complete",
          flow: "flow-1234567890",
          portal: "student",
          status: "success",
        },
      }),
    );
    expect(onResult).toHaveBeenCalledWith({
      status: "success",
      portal: "student",
      error: undefined,
    });
    expect(removeEventListener).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it("reports a blocked popup without navigating the main tab", () => {
    const onResult = vi.fn();
    const close = vi.fn();

    const started = startGoogleAuthentication("/auth/google/redirect", {
      portal: "student",
      onResult,
      createFlowId: () => "flow-1234567890",
      createChannel: () => ({
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        close,
      }),
      openPopup: () => null,
    });

    expect(started).toBe(false);
    expect(onResult).toHaveBeenCalledWith({
      status: "error",
      portal: "student",
      error: "popup_blocked",
    });
    expect(close).toHaveBeenCalledOnce();
  });
});
