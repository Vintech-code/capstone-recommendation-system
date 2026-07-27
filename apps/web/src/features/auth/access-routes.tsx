import { lazy, Suspense } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router'

import { ApplicationStatePage, LoadingState } from '@/components/shared'
import type { AccessRole } from '@/features/auth/access-types'
import { WorkspacePreview } from '@/features/auth/components/workspace-preview'
import { PortalSignInPage } from '@/features/auth/portal-sign-in-page'

const AdminWorkspaceRoute = lazy(() =>
  import('@/features/admin/routes/admin-workspace-route').then((module) => ({
    default: module.AdminWorkspaceRoute,
  })),
)

function WorkspaceRoute({ role }: { role: AccessRole }) {
  const navigate = useNavigate()

  return (
    <WorkspacePreview
      role={role}
      onExit={() => navigate(`/${role}/login`)}
    />
  )
}

function SharedStateRoute({
  kind,
}: {
  kind: 'forbidden' | 'session-expired' | 'not-found'
}) {
  const navigate = useNavigate()

  return (
    <ApplicationStatePage
      kind={kind}
      onPrimaryAction={() => navigate('/student/login')}
      onBack={kind === 'not-found' ? () => navigate(-1) : undefined}
    />
  )
}

function AccessRoutes() {
  return (
    <Suspense
      fallback={
        <main className="min-h-svh bg-secondary/70 p-4 sm:p-8">
          <LoadingState
            title="Loading application"
            description="Preparing the requested workspace."
            className="mx-auto mt-24 max-w-xl"
          />
        </main>
      }
    >
      <Routes>
      <Route path="/" element={<Navigate to="/student/login" replace />} />
      <Route
        path="/student/login"
        element={<PortalSignInPage role="student" />}
      />
      <Route
        path="/admin/login"
        element={<PortalSignInPage role="admin" />}
      />
      <Route
        path="/system-admin/login"
        element={<PortalSignInPage role="system-admin" />}
      />
      <Route
        path="/student"
        element={<WorkspaceRoute role="student" />}
      />
      <Route path="/admin" element={<AdminWorkspaceRoute />} />
      <Route
        path="/admin/applicants"
        element={<AdminWorkspaceRoute fixedModuleId="applicants" />}
      />
      <Route
        path="/admin/applicants/:applicantId"
        element={<AdminWorkspaceRoute fixedModuleId="applicants" />}
      />
      <Route
        path="/admin/official-results"
        element={<AdminWorkspaceRoute fixedModuleId="official-results" />}
      />
      <Route
        path="/admin/official-results/:resultId"
        element={<AdminWorkspaceRoute fixedModuleId="official-results" />}
      />
      <Route
        path="/admin/exam-results/new"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="official-results"
            officialResultsView="new"
          />
        }
      />
      <Route
        path="/admin/imports/new"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="official-results"
            officialResultsView="import-upload"
          />
        }
      />
      <Route
        path="/admin/imports/:importId"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="official-results"
            officialResultsView="import-detail"
          />
        }
      />
      <Route
        path="/admin/assessments"
        element={<AdminWorkspaceRoute fixedModuleId="assessments" />}
      />
      <Route
        path="/admin/assessments/:assessmentId"
        element={<AdminWorkspaceRoute fixedModuleId="assessments" />}
      />
      <Route
        path="/admin/questionnaires"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="assessments"
            assessmentView="questionnaires"
          />
        }
      />
      <Route
        path="/admin/questionnaires/:questionnaireId"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="assessments"
            assessmentView="questionnaires"
          />
        }
      />
      <Route
        path="/admin/recommendations"
        element={<AdminWorkspaceRoute fixedModuleId="recommendations" />}
      />
      <Route
        path="/admin/recommendations/:recommendationId"
        element={<AdminWorkspaceRoute fixedModuleId="recommendations" />}
      />
      <Route
        path="/admin/validation-cases"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="recommendations"
            recommendationsView="validation-cases"
          />
        }
      />
      <Route
        path="/admin/decisions"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="recommendations"
            recommendationsView="decisions"
          />
        }
      />
      <Route
        path="/admin/courses"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="courses-rules"
            coursesRulesView="courses"
          />
        }
      />
      <Route
        path="/admin/courses/:courseId"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="courses-rules"
            coursesRulesView="courses"
          />
        }
      />
      <Route
        path="/admin/rules"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="courses-rules"
            coursesRulesView="rules"
          />
        }
      />
      <Route
        path="/admin/rules/:ruleId"
        element={
          <AdminWorkspaceRoute
            fixedModuleId="courses-rules"
            coursesRulesView="rules"
          />
        }
      />
      <Route
        path="/admin/reports"
        element={<AdminWorkspaceRoute fixedModuleId="reports" />}
      />
      <Route
        path="/admin/reports/:reportId"
        element={<AdminWorkspaceRoute fixedModuleId="reports" />}
      />
      <Route
        path="/admin/:moduleId"
        element={<AdminWorkspaceRoute />}
      />
      <Route
        path="/system-admin"
        element={<WorkspaceRoute role="system-admin" />}
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
  )
}

export { AccessRoutes }
