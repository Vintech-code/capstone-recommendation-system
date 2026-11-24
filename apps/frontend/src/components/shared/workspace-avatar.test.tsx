import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import { apiUrl } from "@/services/api-client";

describe("WorkspaceAvatar", () => {
  it("tries a replacement photo after the previous URL failed", () => {
    const view = render(
      <WorkspaceAvatar photoUrl="/old-photo.jpg" name="Clark Cabatuan" />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Clark Cabatuan" }));
    expect(screen.getByText("CC")).toBeVisible();

    view.rerender(
      <WorkspaceAvatar photoUrl="/new-photo.jpg" name="Clark Cabatuan" />,
    );

    expect(screen.getByRole("img", { name: "Clark Cabatuan" })).toHaveAttribute(
      "src",
      apiUrl("/new-photo.jpg"),
    );
  });
});
