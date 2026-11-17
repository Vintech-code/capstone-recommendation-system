import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAppAt } from "@/test/render-app";

describe("public landing page", () => {
  it("presents the project journey with the supplied landing artwork", async () => {
    await renderAppAt("/");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /discover your interests/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByAltText(/students discovering career interests/i),
    ).toHaveAttribute("src", expect.stringMatching(/landing-image-home\.png$/));
    expect(screen.getByTestId("landing-hero-background")).toHaveAttribute(
      "src",
      expect.stringMatching(/landing-image-bg\.png$/),
    );
    expect(screen.getByAltText(/confident students ready/i)).toHaveAttribute(
      "src",
      expect.stringMatching(/landing-image2\.png$/),
    );
    expect(
      screen.getByAltText(/student thoughtfully considering/i),
    ).toHaveAttribute(
      "src",
      expect.stringMatching(/landing-image-question\.png$/),
    );
    const readyCta = screen.getByTestId("landing-ready-cta");
    expect(readyCta.querySelector("img")).not.toBeInTheDocument();
    expect(
      within(readyCta).getByRole("heading", {
        name: "Start building your recorded interest profile",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Six ways interests can show up" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "What is RIASEC?" }),
    ).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(10);
    expect(screen.getByText("Realistic")).toBeVisible();
    expect(screen.getByText("Conventional")).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Three clear stages, with evidence at each step",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Guidance you can understand and revisit",
      }),
    ).toBeVisible();
    const guidanceSection = document.querySelector("#why-guidance");
    expect(guidanceSection).not.toBeNull();
    const guidanceReveal = guidanceSection?.querySelector(
      "[data-landing-reveal]",
    );
    expect(guidanceReveal).toHaveAttribute("data-landing-reveal", "guidance");
    expect(guidanceReveal).toHaveAttribute("data-reveal-duration", "460");
    expect(guidanceReveal).toHaveAttribute("data-reveal-fade", "false");
    expect(
      guidanceSection?.querySelector(".landing-stagger"),
    ).not.toBeInTheDocument();
    expect(
      guidanceSection?.querySelectorAll('[data-motion="item"]'),
    ).toHaveLength(4);
    expect(
      guidanceSection?.querySelectorAll('[data-motion="art"]'),
    ).toHaveLength(4);
    const guidanceImages = Array.from(
      guidanceSection?.querySelectorAll("article img") ?? [],
    );
    expect(guidanceImages).toHaveLength(4);
    expect(guidanceImages.map((image) => image.getAttribute("src"))).toEqual([
      expect.stringMatching(/compass\.png$/),
      expect.stringMatching(/clipboard\.png$/),
      expect.stringMatching(/chart\.png$/),
      expect.stringMatching(/filetext\.png$/),
    ]);
    guidanceImages.forEach((image) => expect(image).toHaveAttribute("alt", ""));
    expect(
      screen.getByRole("contentinfo", { name: "Public site footer" }),
    ).toBeVisible();
    expect(screen.getByTestId("riasec-grid")).toHaveClass(
      "grid-cols-2",
      "lg:grid-cols-3",
    );

    const expectedReveals = [
      ["landing-hero", "hero", "420", "false"],
      ["why-guidance", "guidance", "460", "false"],
      ["journey", "journey", "500", "false"],
      ["riasec", "riasec", "540", "false"],
      ["faq", "faq", "480", "false"],
    ] as const;

    expectedReveals.forEach(([sectionId, variant, duration, fade]) => {
      const reveal = document.querySelector(
        `#${sectionId} [data-landing-reveal]`,
      );
      expect(reveal).toHaveAttribute("data-landing-reveal", variant);
      expect(reveal).toHaveAttribute("data-reveal-duration", duration);
      expect(reveal).toHaveAttribute("data-reveal-fade", fade);
    });

    expect(document.querySelectorAll(".landing-stagger")).toHaveLength(0);
    expect(
      document.querySelectorAll('[data-motion="heading"], [data-motion="heading-group"]'),
    ).toHaveLength(3);
    expect(document.querySelectorAll('[data-motion="art"]')).toHaveLength(13);
  });

  it("provides an accessible mobile menu and keeps sign-in and unsupported footer copy out", async () => {
    const user = userEvent.setup();
    await renderAppAt("/");

    const header = screen.getByRole("banner");
    expect(
      within(header).queryByRole("link", { name: "Student portal" }),
    ).not.toBeInTheDocument();
    expect(
      within(header).queryByRole("link", { name: "Admin portal" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Student sign in" }),
    ).not.toBeInTheDocument();

    const menuButton = within(header).getByRole("button", {
      name: "Open navigation menu",
    });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(
      within(header).queryByRole("navigation", {
        name: "Mobile landing navigation",
      }),
    ).not.toBeInTheDocument();
    await user.click(menuButton);
    expect(
      within(header).getByRole("button", { name: "Close navigation menu" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      within(header).getByRole("navigation", {
        name: "Mobile landing navigation",
      }),
    ).toBeVisible();

    screen
      .getAllByRole("link", { name: /start assessment/i })
      .forEach((link) => {
        expect(link).toHaveAttribute("href", "/student/login");
        expect(link).toHaveClass("rounded-full");
      });
    expect(
      screen.getByRole("link", { name: "Get started now" }),
    ).toHaveAttribute("href", "/student/register");
    expect(screen.getByText("Guidance principles")).toBeVisible();
    expect(screen.getByTestId("footer-wordmark")).toHaveTextContent(
      "TCCHOICE",
    );
    expect(screen.queryByTestId("footer-logo-watermark")).not.toBeInTheDocument();
    expect(screen.queryByText("Access Portals")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Administrator sign in" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Capstone Project/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Exclusively built for TCC applicants/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/do not guarantee admission or programme success/i),
    ).toBeVisible();
    expect(
      screen.queryByText(
        /perfect course|scientifically valid|research-backed/i,
      ),
    ).not.toBeInTheDocument();
  });
});
