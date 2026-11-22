import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";

import { ApplicationStatePage } from "@/components/shared";
import { LandingPage } from "@/features/landing/landing-page";
import type { AccessRole } from "@/features/auth/access-types";
import { useAuth } from "@/features/auth/auth-context";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { WorkspacePreview } from "@/features/auth/components/workspace-preview";
import { PortalSignInPage } from "@/features/auth/portal-sign-in-page";
import { PasswordRecoveryPage } from "@/features/auth/password-recovery-page";
import { PasswordResetPage } from "@/features/auth/password-reset-page";
import { PasswordChangePage } from "@/features/auth/password-change-page";
import { AdministratorSetupPage } from "@/features/auth/administrator-setup-page";
import { GoogleAuthCompletionPage } from "@/features/auth/google-auth-completion-page";
import { StudentAssessmentSessionPage } from "@/features/student/assessment/components/student-assessment-session-page";
import { StudentAssessmentHistoryPage } from "@/features/student/assessment/components/student-assessment-history-page";
import { StudentRecommendationResultsPage } from "@/features/student/recommendations/components/student-recommendation-results-page";
import { StudentProgrammeCataloguePage } from "@/features/student/programmes/components/student-programme-catalogue-page";
import type { StudentProgrammeMatchContext } from "@/features/student/programmes/programme-types";
import { StudentProfilePage } from "@/features/student/profile/components/student-profile-page";
import {
  clearStudentWorkspaceModule,
  getStudentWorkspaceModuleFromPath,
  getStudentWorkspaceModulePath,
  persistStudentWorkspaceModule,
  readStudentWorkspaceModule,
} from "@/features/student/student-workspace-state";
import { SharedResultPage } from "@/features/shared/shared-result-page";

const AdminWorkspaceRoute = lazy(() =>
  import("@/features/admin/routes/admin-workspace-route").then((module) => ({
    default: module.AdminWorkspaceRoute,
  })),
);
function WorkspaceRoute({ role }: { role: AccessRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSession, signOut, user } = useAuth();
  const restoredStudentId = useRef<number | null>(null);
  const activeModuleId =
    role === "student"
      ? (getStudentWorkspaceModuleFromPath(location.pathname) ?? "assessment")
      : "overview";
  const [programmeMatchContext, setProgrammeMatchContext] = useState<
    StudentProgrammeMatchContext[]
  >([]);
  const [selectedRecommendationSessionId, setSelectedRecommendationSessionId] =
    useState<number | null>(null);

  useEffect(() => {
    if (
      role !== "student" ||
      !user ||
      restoredStudentId.current === user.id
    ) {
      return;
    }

    restoredStudentId.current = user.id;
    if (location.pathname !== "/student") return;

    const restoredModuleId = readStudentWorkspaceModule(user.id);
    const restoredPath = getStudentWorkspaceModulePath(restoredModuleId);
    if (restoredPath && restoredPath !== location.pathname) {
      navigate(restoredPath, { replace: true });
    }
  }, [location.pathname, navigate, role, user]);

  const handleSelectModule = (id: string) => {
    const moduleId = id === "overview" ? "recommendations" : id;
    if (moduleId === "recommendations") {
      setSelectedRecommendationSessionId(null);
    }
    if (role === "student" && user) {
      persistStudentWorkspaceModule(user.id, moduleId);
    }

    const path = getStudentWorkspaceModulePath(moduleId);
    if (path && path !== location.pathname) {
      navigate(path);
    }
  };

  return (
    <ProtectedRoute role={role}>
      <WorkspacePreview
        role={role}
        activeModuleId={role === "student" ? activeModuleId : undefined}
        onSelectModule={role === "student" ? handleSelectModule : undefined}
        onExit={() => {
          if (role === "student" && user) {
            clearStudentWorkspaceModule(user.id);
          }
          void signOut().finally(() => navigate(`/${role}/login`));
        }}
        renderOverview={
          role === "student"
            ? () => (
                <StudentRecommendationResultsPage
                  assessmentSessionId={selectedRecommendationSessionId}
                  onBack={() => {
                    if (selectedRecommendationSessionId) {
                      setSelectedRecommendationSessionId(null);
                      handleSelectModule("history");
                    } else {
                      handleSelectModule("recommendations");
                    }
                  }}
                  onViewLatest={() => setSelectedRecommendationSessionId(null)}
                  onOpenAssessment={() => handleSelectModule("assessment")}
                  onExploreProgrammes={(courses) => {
                    setProgrammeMatchContext(
                      courses.map((course) => ({
                        programmeId: course.id,
                        match: course.match,
                        factors: course.factors,
                      })),
                    );
                    handleSelectModule("programmes");
                  }}
                />
              )
            : undefined
        }
        renderModule={
          role === "student"
            ? ({ module, onBack }) => {
                if (module.id === "assessment") {
                  return (
                    <StudentAssessmentSessionPage
                      onExit={onBack}
                      onReturnToIntroduction={onBack}
                      onViewResult={() => handleSelectModule("history")}
                      onViewMatches={() => {
                        setSelectedRecommendationSessionId(null);
                        handleSelectModule("recommendations");
                      }}
                      remotePersistence
                    />
                  );
                }
                if (module.id === "recommendations") {
                  return (
                    <StudentRecommendationResultsPage
                      assessmentSessionId={selectedRecommendationSessionId}
                      onBack={() => {
                        if (selectedRecommendationSessionId) {
                          setSelectedRecommendationSessionId(null);
                          handleSelectModule("history");
                        } else {
                          onBack();
                        }
                      }}
                      onViewLatest={() => setSelectedRecommendationSessionId(null)}
                      onOpenAssessment={() => handleSelectModule("assessment")}
                      onExploreProgrammes={(courses) => {
                        setProgrammeMatchContext(
                          courses.map((course) => ({
                            programmeId: course.id,
                            match: course.match,
                            factors: course.factors,
                          })),
                        );
                        handleSelectModule("programmes");
                      }}
                    />
                  );
                }
                if (module.id === "history") {
                  return (
                    <StudentAssessmentHistoryPage
                      onBack={onBack}
                      onOpenAssessment={() => handleSelectModule("assessment")}
                      onExploreMatches={(sessionId) => {
                        handleSelectModule("recommendations");
                        setSelectedRecommendationSessionId(sessionId ?? null);
                      }}
                    />
                  );
                }
                if (module.id === "programmes") {
                  return (
                    <StudentProgrammeCataloguePage
                      matchContext={programmeMatchContext}
                    />
                  );
                }
                if (module.id === "profile") {
                  return (
                    <StudentProfilePage
                      onBack={onBack}
                      onIdentityUpdated={refreshSession}
                    />
                  );
                }
                return undefined;
              }
            : undefined
        }
        embedBreadcrumbInPageHeader={role === "student"}
      />
    </ProtectedRoute>
  );
}

function SharedStateRoute({
  kind,
}: {
  kind: "forbidden" | "session-expired" | "not-found";
}) {
  const navigate = useNavigate();

  return (
    <ApplicationStatePage
      kind={kind}
      onPrimaryAction={() => navigate("/student/login")}
      onBack={kind === "not-found" ? () => navigate(-1) : undefined}
    />
  );
}

function AccessRoutes() {
  return (
    <Suspense
      fallback={
        <span role="status" className="sr-only">
          Opening workspace.
        </span>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/student/login"
          element={<LandingPage initialAuth="signin" />}
        />
        <Route
          path="/student/register"
          element={<LandingPage initialAuth="signup" />}
        />
        <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
        <Route path="/reset-password/:token?" element={<PasswordResetPage />} />
        <Route path="/change-password" element={<PasswordChangePage />} />
        <Route path="/admin/setup" element={<AdministratorSetupPage />} />
        <Route
          path="/google-auth/complete"
          element={<GoogleAuthCompletionPage />}
        />
        <Route
          path="/results/shared/:shareToken"
          element={<SharedResultPage />}
        />
        <Route
          path="/admin/login"
          element={<PortalSignInPage role="admin" />}
        />
        <Route path="/student" element={<WorkspaceRoute role="student" />} />
        <Route
          path="/student/programmes"
          element={<WorkspaceRoute role="student" />}
        />
        <Route
          path="/student/matches"
          element={<WorkspaceRoute role="student" />}
        />
        <Route
          path="/student/profile"
          element={<WorkspaceRoute role="student" />}
        />
        <Route
          path="/student/history"
          element={<WorkspaceRoute role="student" />}
        />
        <Route path="/admin" element={<AdminWorkspaceRoute />} />
        <Route path="/admin/students" element={<AdminWorkspaceRoute />} />
        <Route
          path="/admin/students/:studentId"
          element={<AdminWorkspaceRoute />}
        />
        <Route
          path="/admin/assessments"
          element={<Navigate to="/admin/students" replace />}
        />
        <Route path="/admin/programmes" element={<AdminWorkspaceRoute />} />
        <Route
          path="/admin/programmes/:programmeId"
          element={<AdminWorkspaceRoute />}
        />
        <Route
          path="/admin/programmes/sources"
          element={<Navigate to="/admin/programmes" replace />}
        />
        <Route path="/admin/reports" element={<AdminWorkspaceRoute />} />
        <Route path="/admin/feedback" element={<AdminWorkspaceRoute />} />
        <Route path="/admin/activity" element={<AdminWorkspaceRoute />} />
        <Route path="/admin/administrators" element={<AdminWorkspaceRoute />} />
        <Route path="/admin/profile" element={<AdminWorkspaceRoute />} />
        <Route
          path="/admin/settings"
          element={<Navigate to="/admin/profile" replace />}
        />
        <Route
          path="/admin/applicants/*"
          element={<Navigate to="/admin/students" replace />}
        />
        <Route
          path="/admin/official-results/*"
          element={<Navigate to="/admin/students" replace />}
        />
        <Route
          path="/admin/exam-results/*"
          element={<Navigate to="/admin/students" replace />}
        />
        <Route
          path="/admin/imports/*"
          element={<Navigate to="/admin/students" replace />}
        />
        <Route
          path="/admin/questionnaires/*"
          element={<Navigate to="/admin/students" replace />}
        />
        <Route
          path="/admin/recommendations/*"
          element={<Navigate to="/admin/students" replace />}
        />
        <Route
          path="/admin/validation-cases"
          element={<Navigate to="/admin/students" replace />}
        />
        <Route
          path="/admin/decisions"
          element={<Navigate to="/admin/students" replace />}
        />
        <Route
          path="/admin/courses/*"
          element={<Navigate to="/admin/programmes" replace />}
        />
        <Route
          path="/admin/rules/*"
          element={<Navigate to="/admin/programmes" replace />}
        />
        <Route
          path="/forbidden"
          element={<SharedStateRoute kind="forbidden" />}
        />
        <Route
          path="/session-expired"
          element={<SharedStateRoute kind="session-expired" />}
        />
        <Route
          path="/not-found"
          element={<SharedStateRoute kind="not-found" />}
        />
        <Route path="*" element={<SharedStateRoute kind="not-found" />} />
      </Routes>
    </Suspense>
  );
}

export { AccessRoutes };
