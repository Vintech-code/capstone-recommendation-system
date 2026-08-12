import { Navigate, useLocation, useNavigate } from 'react-router'

import {
  AdminAssessmentsPage,
  AdminActivityPage,
  AdminDashboardPage,
  AdminReportsPage,
  AdminStudentDetailPage,
  AdminStudentsPage,
} from '@/features/admin/components/admin-pages'
import { AdminProgrammesPage } from '@/features/admin/components/admin-programmes-page'
import { AdminProgrammeSourcesPage } from '@/features/admin/components/admin-programme-sources-page'
import { AdminCounselorAccountsPage } from '@/features/admin/components/admin-counselor-accounts-page'
import { useAuth } from '@/features/auth/auth-context'
import { ProtectedRoute } from '@/features/auth/components/protected-route'
import { WorkspacePreview } from '@/features/auth/components/workspace-preview'

const sections = ['students', 'counselors', 'assessments', 'programmes', 'reports', 'activity'] as const
type AdminSection = (typeof sections)[number]

function AdminWorkspaceRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()
  const segments = location.pathname.split('/').filter(Boolean)
  const section = segments[1]
  const recordId = segments[2]

  if (section && !sections.includes(section as AdminSection)) {
    return <Navigate to="/not-found" replace />
  }

  const activeModuleId = (section as AdminSection | undefined) ?? 'overview'
  const content = resolveContent(activeModuleId, recordId, navigate)

  return (
    <ProtectedRoute role="admin">
      <WorkspacePreview
        role="admin"
        activeModuleId={activeModuleId}
        pageLabel={recordId}
        moduleSearchPlacement="topbar"
        onSelectModule={(id) => navigate(id === 'overview' ? '/admin' : `/admin/${id}`)}
        onExit={() => void signOut().finally(() => navigate('/admin/login'))}
      >
        {content}
      </WorkspacePreview>
    </ProtectedRoute>
  )
}

function resolveContent(activeId: string, recordId: string | undefined, navigate: ReturnType<typeof useNavigate>) {
  if (activeId === 'students') {
    return recordId
      ? <AdminStudentDetailPage studentId={recordId} onNavigate={navigate} />
      : <AdminStudentsPage onNavigate={navigate} />
  }
  if (activeId === 'assessments') return <AdminAssessmentsPage onNavigate={navigate} />
  if (activeId === 'counselors') return <AdminCounselorAccountsPage />
  if (activeId === 'programmes') return recordId === 'sources' ? <AdminProgrammeSourcesPage onNavigate={navigate} /> : <AdminProgrammesPage onNavigate={navigate} />
  if (activeId === 'reports') return <AdminReportsPage />
  if (activeId === 'activity') return <AdminActivityPage />
  return <AdminDashboardPage onNavigate={navigate} />
}

export { AdminWorkspaceRoute }
