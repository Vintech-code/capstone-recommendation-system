import type { NavigateFunction } from 'react-router'

import { ApplicantDetailPage } from '@/features/admin/applicants/components/applicant-detail-page'
import { ApplicantManagementPage } from '@/features/admin/applicants/components/applicant-management-page'
import { AssessmentDetailPage } from '@/features/admin/assessments/components/assessment-detail-page'
import { AssessmentManagementPage } from '@/features/admin/assessments/components/assessment-management-page'
import { QuestionnaireDetailPage } from '@/features/admin/assessments/components/questionnaire-detail-page'
import { QuestionnaireVersionsPage } from '@/features/admin/assessments/components/questionnaire-versions-page'
import { AdmissionRuleDetailPage } from '@/features/admin/courses-rules/components/admission-rule-detail-page'
import { AdmissionRulesPage } from '@/features/admin/courses-rules/components/admission-rules-page'
import { CourseCataloguePage } from '@/features/admin/courses-rules/components/course-catalogue-page'
import { CourseDetailPage } from '@/features/admin/courses-rules/components/course-detail-page'
import { ManualResultEntryPage } from '@/features/admin/official-results/components/manual-result-entry-page'
import { OfficialResultDetailPage } from '@/features/admin/official-results/components/official-result-detail-page'
import { OfficialResultsPage } from '@/features/admin/official-results/components/official-results-page'
import { ResultImportReconciliationPage } from '@/features/admin/official-results/components/result-import-reconciliation-page'
import { ResultImportUploadPage } from '@/features/admin/official-results/components/result-import-upload-page'
import { RecommendationDetailPage } from '@/features/admin/recommendations/components/recommendation-detail-page'
import { RecommendationManagementPage } from '@/features/admin/recommendations/components/recommendation-management-page'
import { StudentDecisionsPage } from '@/features/admin/recommendations/components/student-decisions-page'
import { ValidationCasesPage } from '@/features/admin/recommendations/components/validation-cases-page'
import { ReportDetailPage } from '@/features/admin/reports/components/report-detail-page'
import { ReportManagementPage } from '@/features/admin/reports/components/report-management-page'
import type {
  AdminModuleId,
  AssessmentView,
  CoursesRulesView,
  OfficialResultsView,
  RecommendationsView,
} from '@/features/admin/routes/admin-route-types'

interface AdminRouteContentProps {
  activeModuleId: AdminModuleId
  assessmentView: AssessmentView
  coursesRulesView: CoursesRulesView
  officialResultsView: OfficialResultsView
  recommendationsView: RecommendationsView
  navigate: NavigateFunction
  params: {
    applicantId?: string
    assessmentId?: string
    courseId?: string
    importId?: string
    questionnaireId?: string
    recommendationId?: string
    reportId?: string
    resultId?: string
    ruleId?: string
  }
}

function AdminRouteContent(props: AdminRouteContentProps) {
  return <AdminFeatureContent {...props} />
}

function AdminFeatureContent({
  activeModuleId,
  assessmentView,
  coursesRulesView,
  officialResultsView,
  recommendationsView,
  navigate,
  params,
}: AdminRouteContentProps) {
  const {
    applicantId,
    assessmentId,
    courseId,
    importId,
    questionnaireId,
    recommendationId,
    reportId,
    resultId,
    ruleId,
  } = params

  if (activeModuleId === 'applicants') {
    return applicantId ? (
      <ApplicantDetailPage
        applicantId={applicantId}
        onBack={() => navigate('/admin/applicants')}
      />
    ) : (
      <ApplicantManagementPage
        onOpenApplicant={(id) => navigate(`/admin/applicants/${id}`)}
      />
    )
  }

  if (activeModuleId === 'official-results') {
    if (officialResultsView === 'new') {
      return (
        <ManualResultEntryPage
          onBack={() => navigate('/admin/official-results')}
        />
      )
    }
    if (officialResultsView === 'import-upload') {
      return (
        <ResultImportUploadPage
          onBack={() => navigate('/admin/official-results')}
          onOpenImport={(id) => navigate(`/admin/imports/${id}`)}
        />
      )
    }
    if (officialResultsView === 'import-detail' && importId) {
      return (
        <ResultImportReconciliationPage
          importId={importId}
          onBack={() => navigate('/admin/official-results')}
        />
      )
    }
    return resultId ? (
      <OfficialResultDetailPage
        resultId={resultId}
        onBack={() => navigate('/admin/official-results')}
        onOpenApplicant={(id) => navigate(`/admin/applicants/${id}`)}
      />
    ) : (
      <OfficialResultsPage
        onCreateResult={() => navigate('/admin/exam-results/new')}
        onImportResults={() => navigate('/admin/imports/new')}
        onOpenResult={(id) => navigate(`/admin/official-results/${id}`)}
      />
    )
  }

  if (activeModuleId === 'assessments') {
    if (assessmentView === 'questionnaires') {
      return questionnaireId ? (
        <QuestionnaireDetailPage
          questionnaireId={questionnaireId}
          onBack={() => navigate('/admin/questionnaires')}
        />
      ) : (
        <QuestionnaireVersionsPage
          onOpenAssessments={() => navigate('/admin/assessments')}
          onOpenQuestionnaire={(id) => navigate(`/admin/questionnaires/${id}`)}
        />
      )
    }
    return assessmentId ? (
      <AssessmentDetailPage
        assessmentId={assessmentId}
        onBack={() => navigate('/admin/assessments')}
        onOpenApplicant={(id) => navigate(`/admin/applicants/${id}`)}
      />
    ) : (
      <AssessmentManagementPage
        onOpenAssessment={(id) => navigate(`/admin/assessments/${id}`)}
        onOpenQuestionnaires={() => navigate('/admin/questionnaires')}
      />
    )
  }

  if (activeModuleId === 'recommendations') {
    if (recommendationsView === 'validation-cases') {
      return (
        <ValidationCasesPage
          onBack={() => navigate('/admin/recommendations')}
        />
      )
    }
    if (recommendationsView === 'decisions') {
      return (
        <StudentDecisionsPage
          onBack={() => navigate('/admin/recommendations')}
          onOpenRecommendation={(id) =>
            navigate(`/admin/recommendations/${id}`)
          }
        />
      )
    }
    return recommendationId ? (
      <RecommendationDetailPage
        recommendationId={recommendationId}
        onBack={() => navigate('/admin/recommendations')}
        onOpenApplicant={(id) => navigate(`/admin/applicants/${id}`)}
      />
    ) : (
      <RecommendationManagementPage
        onOpenDecisions={() => navigate('/admin/decisions')}
        onOpenRecommendation={(id) =>
          navigate(`/admin/recommendations/${id}`)
        }
        onOpenValidationCases={() => navigate('/admin/validation-cases')}
      />
    )
  }

  if (activeModuleId === 'courses-rules') {
    if (coursesRulesView === 'rules') {
      return ruleId ? (
        <AdmissionRuleDetailPage
          ruleId={ruleId}
          onBack={() => navigate('/admin/rules')}
        />
      ) : (
        <AdmissionRulesPage
          onOpenCatalogue={() => navigate('/admin/courses')}
          onOpenRule={(id) => navigate(`/admin/rules/${id}`)}
        />
      )
    }
    return courseId ? (
      <CourseDetailPage
        courseId={courseId}
        onBack={() => navigate('/admin/courses')}
      />
    ) : (
      <CourseCataloguePage
        onOpenCourse={(id) => navigate(`/admin/courses/${id}`)}
        onOpenRules={() => navigate('/admin/rules')}
      />
    )
  }

  if (activeModuleId === 'reports') {
    return reportId ? (
      <ReportDetailPage
        reportId={reportId}
        onBack={() => navigate('/admin/reports')}
        onOpenApplicant={(id) => navigate(`/admin/applicants/${id}`)}
        onOpenRecommendation={(id) =>
          navigate(`/admin/recommendations/${id}`)
        }
      />
    ) : (
      <ReportManagementPage
        onOpenReport={(id) => navigate(`/admin/reports/${id}`)}
      />
    )
  }

  return null
}

export { AdminRouteContent }
