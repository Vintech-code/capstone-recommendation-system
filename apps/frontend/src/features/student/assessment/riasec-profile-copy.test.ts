import { describe, expect, it } from "vitest";

import {
  formatRiasecProfileDescription,
  getRiasecProfileCopy,
  riasecDimensionCodes,
  riasecProfileCopy,
} from "@/features/student/assessment/riasec-profile-copy";

describe("RIASEC profile presentation copy", () => {
  it("preserves the approved PSG-matrix profile names", () => {
    expect(Object.fromEntries(Object.entries(riasecProfileCopy).map(
      ([code, profile]) => [code, profile.name],
    ))).toMatchObject({
      ECI: "Strategic Organizer",
      ESC: "People Coordinator",
      IRS: "Practical Investigator",
      IRC: "Systems Solver",
      CIS: "Information Steward",
      SAC: "Creative Guide",
      SRE: "Active Motivator",
      SAI: "Insightful Mentor",
      SIE: "Civic Strategist",
      ISA: "Social Researcher",
      SIR: "Care Practitioner",
    });
  });

  it("defines presentation copy for every ordered three-code student result", () => {
    const expectedCodes = riasecDimensionCodes.flatMap((primary) =>
      riasecDimensionCodes.flatMap((secondary) =>
        riasecDimensionCodes
          .filter((tertiary) => new Set([primary, secondary, tertiary]).size === 3)
          .map((tertiary) => `${primary}${secondary}${tertiary}`),
      ),
    );

    expect(expectedCodes).toHaveLength(120);
    expect(Object.keys(riasecProfileCopy)).toHaveLength(120);
    expect(Object.keys(riasecProfileCopy).sort()).toEqual(expectedCodes.sort());
    expect(new Set(Object.values(riasecProfileCopy).map(({ name }) => name)).size).toBe(120);
    for (const { name } of Object.values(riasecProfileCopy)) {
      expect(name.trim().split(/\s+/)).toHaveLength(2);
    }
  });

  it("keeps every profile description at exactly two sentences", () => {
    for (const profile of Object.values(riasecProfileCopy)) {
      expect(profile.description).toHaveLength(2);
      expect(formatRiasecProfileDescription(profile).match(/[.!?](?:\s|$)/g)).toHaveLength(2);
    }
  });

  it("accepts compact and hyphenated valid codes and rejects invalid results", () => {
    expect(getRiasecProfileCopy("I-R-C")?.name).toBe("Systems Solver");
    expect(getRiasecProfileCopy("irc")?.name).toBe("Systems Solver");
    expect(getRiasecProfileCopy("C-S-R")?.name).toBe("Supportive Organizer");
    expect(getRiasecProfileCopy("I-C-S")).not.toBeNull();
    expect(getRiasecProfileCopy("S-S-I")).toBeNull();
    expect(getRiasecProfileCopy("XYZ")).toBeNull();
  });
});
