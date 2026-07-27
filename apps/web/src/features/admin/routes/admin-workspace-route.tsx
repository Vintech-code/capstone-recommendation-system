import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'

import { AdminRouteState } from '@/features/admin/components/admin-route-state'
import { AdminDashboardPage } from '@/features/admin/dashboard/components/admin-dashboard-page'
import { isAdminPreviewState } from '@/features/admin/routes/admin-preview-state'
import { AdminRouteContent } from '@/features/admin/routes/admin-route-content'
import {
  isAdminModuleId,
  type AdminModuleId,
  type AssessmentView,
  type CoursesRulesView,
  type OfficialResultsView,
  type RecommendationsView,
} from '@/features/admin/routes/admin-route-types'
import { WorkspacePreview } from '@/features/auth/components/workspace-preview'

interface AdminWorkspaceRouteProps {
  fixedModuleId?: AdminModuleId
  assessmentView?: AssessmentView
  coursesRulesView?: CoursesRulesView
  officialResultsView?: OfficialResultsView
  recommendationsView?: RecommendationsView
}

function AdminWorkspaceRoute({
  fixedModuleId,
  assessmentView = 'sessions',
  coursesRulesView = 'courses',
  officialResultsView = 'list',
  recommendationsView = 'list',
}: AdminWorkspaceRouteProps) {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { moduleId } = params

  if (!fixedModuleId && moduleId && !isAdminModuleId(moduleId)) {
    return <Navigate to="/not-found" replace />
  }

  const activeModuleId = resolveActiveModule(fixedModuleId, params)
  const pageLabel = resolvePageLabel({
    ...params,
    officialResultsView,
    recommendationsView,
  })
  const previewState = searchParams.get('state')

  function clearPreviewState() {
    const next = new URLSearchParams(searchParams)
    next.delete('state')
    setSearchParams(next, { replace: true })
  }

  const content =
    isAdminPreviewState(previewState) && activeModuleId !== 'overview' ? (
      <AdminRouteState state={previewState} onClear={clearPreviewState} />
    ) : activeModuleId === 'overview' ? null : (
      <AdminRouteContent
        activeModuleId={activeModuleId}
        assessmentView={assessmentView}
        coursesRulesView={coursesRulesView}
        officialResultsView={officialResultsView}
        recommendationsView={recommendationsView}
        navigate={navigate}
        params={params}
      />
    )

  return (
    <WorkspacePreview
      role="admin"
      activeModuleId={activeModuleId}
      pageLabel={pageLabel}
      onSelectModule={(id) =>
        navigate(id === 'overview' ? '/admin' : `/admin/${id}`)
      }
      onExit={() => navigate('/admin/login')}
      renderOverview={({ modules, query, onSelect }) => (
        <AdminDashboardPage
          modules={modules}
          query={query}
          onSelectModule={onSelect}
          onNavigate={navigate}
        />
      )}
    >
      {content}
    </WorkspacePreview>
  )
}

function resolveActiveModule(
  fixedModuleId: AdminModuleId | undefined,
  params: Record<string, string | undefined>,
): AdminModuleId {
  if (fixedModuleId) return fixedModuleId
  if (params.applicantId) return 'applicants'
  if (params.resultId) return 'official-results'
  if (params.assessmentId || params.questionnaireId) return 'assessments'
  if (params.recommendationId) return 'recommendations'
  if (params.courseId || params.ruleId) return 'courses-rules'
  if (params.reportId) return 'reports'
  return isAdminModuleId(params.moduleId) ? params.moduleId : 'overview'
}

function resolvePageLabel({
  officialResultsView,
  recommendationsView,
  ...params
}: Record<string, string | undefined> & {
  officialResultsView: OfficialResultsView
  recommendationsView: RecommendationsView
}) {
  if (officialResultsView === 'new') return 'Encode result'
  if (officialResultsView === 'import-upload') return 'Import CSV'
  if (officialResultsView === 'import-detail') return params.importId
  if (recommendationsView === 'validation-cases') return 'Validation cases'
  if (recommendationsView === 'decisions') return 'Student decisions'

  return (
    params.applicantId ??
    params.resultId ??
    params.assessmentId ??
    params.questionnaireId ??
    params.recommendationId ??
    params.courseId ??
    params.ruleId ??
    params.reportId
  )
}

export { AdminWorkspaceRoute }
