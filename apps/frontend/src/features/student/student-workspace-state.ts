const studentWorkspaceModuleStoragePrefix =
  "tcc-guidance:student-workspace-module";

const studentWorkspaceModulePaths = {
  assessment: "/student",
  programmes: "/student/programmes",
  recommendations: "/student/matches",
  profile: "/student/profile",
  history: "/student/history",
} as const;

type StudentWorkspaceModuleId = keyof typeof studentWorkspaceModulePaths;

const studentWorkspaceModuleIds = new Set<StudentWorkspaceModuleId>(
  Object.keys(studentWorkspaceModulePaths) as StudentWorkspaceModuleId[],
);

function getStudentWorkspaceModuleStorageKey(userId: number) {
  return `${studentWorkspaceModuleStoragePrefix}:${userId}`;
}

function readStudentWorkspaceModule(userId: number): StudentWorkspaceModuleId {
  try {
    const storedModuleId = window.sessionStorage.getItem(
      getStudentWorkspaceModuleStorageKey(userId),
    );

    return storedModuleId &&
      studentWorkspaceModuleIds.has(storedModuleId as StudentWorkspaceModuleId)
      ? (storedModuleId as StudentWorkspaceModuleId)
      : "assessment";
  } catch {
    return "assessment";
  }
}

function getStudentWorkspaceModulePath(moduleId: string) {
  return studentWorkspaceModuleIds.has(moduleId as StudentWorkspaceModuleId)
    ? studentWorkspaceModulePaths[moduleId as StudentWorkspaceModuleId]
    : null;
}

function getStudentWorkspaceModuleFromPath(pathname: string) {
  const entry = Object.entries(studentWorkspaceModulePaths).find(
    ([, path]) => path === pathname,
  );

  return (entry?.[0] as StudentWorkspaceModuleId | undefined) ?? null;
}

function persistStudentWorkspaceModule(userId: number, moduleId: string) {
  if (!studentWorkspaceModuleIds.has(moduleId as StudentWorkspaceModuleId)) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getStudentWorkspaceModuleStorageKey(userId),
      moduleId,
    );
  } catch {
    // The workspace remains usable when browser storage is unavailable.
  }
}

function clearStudentWorkspaceModule(userId: number) {
  try {
    window.sessionStorage.removeItem(
      getStudentWorkspaceModuleStorageKey(userId),
    );
  } catch {
    // Signing out must not depend on browser storage access.
  }
}

export {
  clearStudentWorkspaceModule,
  getStudentWorkspaceModuleFromPath,
  getStudentWorkspaceModulePath,
  persistStudentWorkspaceModule,
  readStudentWorkspaceModule,
};
export type { StudentWorkspaceModuleId };
