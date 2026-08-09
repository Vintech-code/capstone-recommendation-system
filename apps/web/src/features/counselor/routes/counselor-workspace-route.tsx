import { Navigate, useLocation, useNavigate } from 'react-router'

import { CounselorWorkspacePage } from '@/features/admin/components/counselor-workspace-page'
import { CounselorStudentDetailPage } from '@/features/admin/components/admin-pages'
import { AdminReportsPage } from '@/features/admin/components/admin-pages'
import { useAuth } from '@/features/auth/auth-context'
import { ProtectedRoute } from '@/features/auth/components/protected-route'
import { WorkspacePreview } from '@/features/auth/components/workspace-preview'

const sections = ['students', 'requests', 'appointments', 'calendar', 'follow-ups', 'reports'] as const

function CounselorWorkspaceRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()
  const segments = location.pathname.split('/').filter(Boolean)
  const section = segments[1]
  const recordId = segments[2]

  if (section && !sections.includes(section as (typeof sections)[number])) {
    return <Navigate to="/not-found" replace />
  }

  return (
    <ProtectedRoute role="counselor">
      <WorkspacePreview
        role="counselor"
        activeModuleId={section ?? 'overview'}
        moduleSearchPlacement="topbar"
        onSelectModule={(id) => navigate(id === 'overview' ? '/counselor' : `/counselor/${id}`)}
        onExit={() => void signOut().finally(() => navigate('/counselor/login'))}
      >
        {section === 'students' && recordId
          ? <CounselorStudentDetailPage studentId={recordId} onNavigate={navigate} />
          : section === 'reports'
            ? <AdminReportsPage apiScope="counselor" />
            : <CounselorWorkspacePage apiScope="counselor" activeSection={section ?? 'overview'} onNavigate={(path) => navigate(path.replace('/admin', '/counselor'))} />}
      </WorkspacePreview>
    </ProtectedRoute>
  )
}

export { CounselorWorkspaceRoute }
