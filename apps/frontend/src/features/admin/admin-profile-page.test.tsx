import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminProfilePage } from "@/features/admin/components/admin-profile-page";
import { uploadAdminProfilePhoto } from "@/features/auth/auth-api";
import { apiUrl } from "@/services/api-client";

const authState = vi.hoisted(() => ({
  refreshSession: vi.fn<() => Promise<void>>(),
}));

vi.mock("@/features/auth/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: 7,
      name: "Clark Cabatuan",
      email: "clark@example.test",
      roles: ["admin"],
      canManageAdministrators: true,
      photoUrl: null,
    },
    refreshSession: authState.refreshSession,
  }),
}));

vi.mock("@/features/auth/auth-api", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/features/auth/auth-api")
  >();

  return {
    ...actual,
    uploadAdminProfilePhoto: vi.fn(),
  };
});

describe("AdminProfilePage", () => {
  beforeEach(() => {
    authState.refreshSession.mockReset();
    authState.refreshSession.mockResolvedValue(undefined);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:profile-photo");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  it("shows an uploaded photo immediately and refreshes shared identity", async () => {
    vi.mocked(uploadAdminProfilePhoto).mockResolvedValueOnce({
      data: { photoUrl: "/api/v1/admin/profile/photo?v=replacement" },
    });
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("profile", {
        headers: { "Content-Type": "image/png" },
      }),
    );
    const user = userEvent.setup();
    const view = render(<AdminProfilePage />);
    const fileInput = view.container.querySelector<HTMLInputElement>(
      'input[type="file"]',
    );

    expect(fileInput).not.toBeNull();
    await user.upload(
      fileInput!,
      new File(["profile"], "profile.png", { type: "image/png" }),
    );

    expect(
      await screen.findByRole("img", { name: "Clark Cabatuan" }),
    ).toHaveAttribute(
      "src",
      "blob:profile-photo",
    );
    expect(
      screen.getByText("Profile photo updated successfully."),
    ).toBeVisible();
    expect(authState.refreshSession).toHaveBeenCalledOnce();
    expect(view.container.firstElementChild).toHaveClass("w-full");
    expect(view.container.firstElementChild).not.toHaveClass("max-w-300");
    expect(fetch).toHaveBeenCalledWith(
      apiUrl("/api/v1/admin/profile/photo?v=replacement"),
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
