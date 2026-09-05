import { lazy, Suspense, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router'

import { ApplicationStatePage } from '@/components/shared'
import { LandingPage } from '@/features/landing/landing-page'
import type { AccessRole } from '@/features/auth/access-types'
import { useAuth } from '@/features/auth/auth-context'
import { ProtectedRoute } from '@/features/auth/components/protected-route'
import { WorkspacePreview } from '@/features/auth/components/workspace-preview'
import { PortalSignInPage } from '@/features/auth/portal-sign-in-page'
import { StudentRegistrationPage } from '@/features/auth/student-registration-page'
import { PasswordRecoveryPage } from '@/features/auth/password-recovery-page'
import { PasswordResetPage } from '@/features/auth/password-reset-page'
import { PasswordChangePage } from '@/features/auth/password-change-page'
import { StudentAssessmentSessionPage } from '@/features/student/assessment/components/student-assessment-session-page'
import { StudentAssessmentHistoryPage } from '@/features/student/assessment/components/student-assessment-history-page'
import { StudentRecommendationResultsPage } from '@/features/student/recommendations/components/student-recommendation-results-page'
import { StudentProgrammeCataloguePage } from '@/features/student/programmes/components/student-programme-catalogue-page'
import type { StudentProgrammeMatchContext } from '@/features/student/programmes/programme-types'

const AdminWorkspaceRoute = lazy(() =>
  import('@/features/admin/routes/admin-workspace-route').then((module) => ({
    default: module.AdminWorkspaceRoute,
  })),
)
function WorkspaceRoute({ role }: { role: AccessRole }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [programmeMatchContext, setProgrammeMatchContext] = useState<StudentProgrammeMatchContext[]>([])

  return (
    <ProtectedRoute role={role}>
      <WorkspacePreview
        role={role}
        onExit={() => {
          void signOut().finally(() => navigate(`/${role}/login`))
        }}
        renderOverview={
          role === 'student'
            ? ({ onSelect }) => (
                <StudentRecommendationResultsPage
                  onBack={() => onSelect('recommendations')}
                  onOpenAssessment={() => onSelect('assessment')}
                  onExploreProgrammes={(courses) => {
                    setProgrammeMatchContext(courses.map((course) => ({
                      programmeId: course.id,
                      match: course.match,
                      factors: course.factors,
                    })))
                    onSelect('programmes')
                  }}
                />
              )
            : undefined
        }
        renderModule={
          role === 'student'
            ? ({ module, onBack, onSelect }) => {
                if (module.id === 'assessment') {
                  return (
                    <StudentAssessmentSessionPage
                      onExit={onBack}
                      onReturnToIntroduction={onBack}
                      onViewResult={() => onSelect('history')}
                      onViewMatches={() => onSelect('recommendations')}
                      remotePersistence
                    />
                  )
                }
                if (module.id === 'recommendations') {
                  return (
                    <StudentRecommendationResultsPage
                      onBack={onBack}
                      onOpenAssessment={() => onSelect('assessment')}
                      onExploreProgrammes={(courses) => {
                        setProgrammeMatchContext(courses.map((course) => ({
                          programmeId: course.id,
                          match: course.match,
                          factors: course.factors,
                        })))
                        onSelect('programmes')
                      }}
                    />
                  )
                }
                if (module.id === 'history') {
                  return (
                    <StudentAssessmentHistoryPage
                      onBack={onBack}
                      onOpenAssessment={() => onSelect('assessment')}
                    />
                  )
                }
                if (module.id === 'programmes') {
                  return <StudentProgrammeCataloguePage matchContext={programmeMatchContext} />
                }
                return undefined
              }
            : undefined
        }
        embedBreadcrumbInPageHeader={role === 'student'}
      />
    </ProtectedRoute>
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
    <Suspense fallback={<span role="status" className="sr-only">Opening workspace.</span>}>
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/student/login"
        element={<PortalSignInPage role="student" />}
      />
      <Route
        path="/student/register"
        element={<StudentRegistrationPage />}
      />
      <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
      <Route path="/reset-password/:token?" element={<PasswordResetPage />} />
      <Route path="/change-password" element={<PasswordChangePage />} />
      <Route
        path="/admin/login"
        element={<PortalSignInPage role="admin" />}
      />
      <Route
        path="/student"
        element={<WorkspaceRoute role="student" />}
      />
      <Route path="/admin" element={<AdminWorkspaceRoute />} />
      <Route path="/admin/students" element={<AdminWorkspaceRoute />} />
      <Route path="/admin/students/:studentId" element={<AdminWorkspaceRoute />} />
      <Route path="/admin/assessments" element={<Navigate to="/admin/students" replace />} />
      <Route path="/admin/programmes" element={<AdminWorkspaceRoute />} />
      <Route path="/admin/programmes/sources" element={<Navigate to="/admin/programmes" replace />} />
      <Route path="/admin/reports" element={<AdminWorkspaceRoute />} />
      <Route path="/admin/activity" element={<AdminWorkspaceRoute />} />
      <Route path="/admin/applicants/*" element={<Navigate to="/admin/students" replace />} />
      <Route path="/admin/official-results/*" element={<Navigate to="/admin/students" replace />} />
      <Route path="/admin/exam-results/*" element={<Navigate to="/admin/students" replace />} />
      <Route path="/admin/imports/*" element={<Navigate to="/admin/students" replace />} />
      <Route path="/admin/questionnaires/*" element={<Navigate to="/admin/students" replace />} />
      <Route path="/admin/recommendations/*" element={<Navigate to="/admin/students" replace />} />
      <Route path="/admin/validation-cases" element={<Navigate to="/admin/students" replace />} />
      <Route path="/admin/decisions" element={<Navigate to="/admin/students" replace />} />
      <Route path="/admin/courses/*" element={<Navigate to="/admin/programmes" replace />} />
      <Route path="/admin/rules/*" element={<Navigate to="/admin/programmes" replace />} />
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
