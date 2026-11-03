import { afterEach, describe, expect, it } from "vitest";

import {
  clearStudentWorkspaceModule,
  getStudentWorkspaceModuleFromPath,
  getStudentWorkspaceModulePath,
  persistStudentWorkspaceModule,
  readStudentWorkspaceModule,
} from "@/features/student/student-workspace-state";

describe("Student workspace state", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("restores the last valid module for the same Student account", () => {
    persistStudentWorkspaceModule(7, "recommendations");

    expect(readStudentWorkspaceModule(7)).toBe("recommendations");
    expect(readStudentWorkspaceModule(8)).toBe("assessment");
  });

  it("ignores unknown module identifiers", () => {
    persistStudentWorkspaceModule(7, "unknown-module");

    expect(readStudentWorkspaceModule(7)).toBe("assessment");
  });

  it("clears the remembered module when the Student signs out", () => {
    persistStudentWorkspaceModule(7, "profile");
    clearStudentWorkspaceModule(7);

    expect(readStudentWorkspaceModule(7)).toBe("assessment");
  });

  it("maps Student modules to protected browser-history paths", () => {
    expect(getStudentWorkspaceModulePath("recommendations")).toBe(
      "/student/matches",
    );
    expect(getStudentWorkspaceModuleFromPath("/student/programmes")).toBe(
      "programmes",
    );
    expect(getStudentWorkspaceModuleFromPath("/student/login")).toBeNull();
  });
});
