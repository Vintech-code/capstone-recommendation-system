import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

import {
  AdminActivityPage,
  AdminDashboardPage,
  AdminReportsPage,
  AdminStudentsPage,
} from "@/features/admin/components/admin-pages";
import { AdminProgrammesPage } from "@/features/admin/components/admin-programmes-page";
import { AdminStudentDetailPage } from "@/features/admin/components/admin-student-detail-page";
import { AdminAdministratorsPage } from "@/features/admin/components/admin-administrators-page";
import { useAuth } from "@/features/auth/auth-context";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { WorkspacePreview } from "@/features/auth/components/workspace-preview";

const sections = [
  "students",
  "programmes",
  "reports",
  "activity",
  "administrators",
] as const;
type AdminSection = (typeof sections)[number];

function AdminWorkspaceRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const segments = location.pathname.split("/").filter(Boolean);
  const section = segments[1];
  const recordId = segments[2];

  useEffect(() => {
    document.body.classList.add("admin-workspace-body");
    return () => {
      document.body.classList.remove("admin-workspace-body");
    };
  }, []);

  if (section && !sections.includes(section as AdminSection)) {
    return <Navigate to="/not-found" replace />;
  }

  if (section === "administrators" && user && !user.canManageAdministrators) {
    return <Navigate to="/forbidden" replace />;
  }

  const activeModuleId = (section as AdminSection | undefined) ?? "overview";
  const content = resolveContent(activeModuleId, recordId, navigate);

  return (
    <ProtectedRoute role="admin">
      <WorkspacePreview
        role="admin"
        activeModuleId={activeModuleId}
        pageLabel={recordId}
        moduleSearchPlacement="topbar"
        onSelectModule={(id) =>
          navigate(id === "overview" ? "/admin" : `/admin/${id}`)
        }
        onExit={() => void signOut().finally(() => navigate("/admin/login"))}
      >
        {content}
      </WorkspacePreview>
    </ProtectedRoute>
  );
}

function resolveContent(
  activeId: string,
  recordId: string | undefined,
  navigate: ReturnType<typeof useNavigate>,
) {
  if (activeId === "students") {
    return recordId ? (
      <AdminStudentDetailPage studentId={recordId} onNavigate={navigate} />
    ) : (
      <AdminStudentsPage onNavigate={navigate} />
    );
  }
  if (activeId === "programmes") return <AdminProgrammesPage />;
  if (activeId === "reports") return <AdminReportsPage />;
  if (activeId === "activity") return <AdminActivityPage />;
  if (activeId === "administrators") return <AdminAdministratorsPage />;
  return <AdminDashboardPage onNavigate={navigate} />;
}

export { AdminWorkspaceRoute };
export default AdminWorkspaceRoute;
