import type { CareerOpportunity, ProgrammeContentSource } from '@/features/student/programmes/programme-types'

interface AdminOverview {
  students: number
  assessments: number
  completed: number
  inProgress: number
  needsAttention: number
  recommendations: number
  funnel: { registered: number; entranceDeclared: number; assessmentStarted: number; inProgress: number; processing: number; resultAvailable: number }
  operationalAttention: { processingFailures: number }
  recentActivity: AdminAssessment[]
}

interface AdminStudent {
  id: number
  name: string
  email: string
  photoUrl?: string | null
  accountStatus: string
  attemptCount: number
  completedAssessmentCount?: number
  retakeCount?: number
  latestResultAt: string | null
  latestTopCode: string | null
  declarationStatus: 'required' | 'declared'
  selfDeclaredScore: number | null
  eligibilityGroup: 'board' | 'non_board' | null
  currentAssessmentStatus: 'not_started' | AdminAssessment['status']
  currentAssessmentReference: string | null
  recommendationAvailable: boolean
  savedProgrammeCount: number
  lastActivityAt: string | null
}

interface AdminPagination { currentPage: number; lastPage: number; perPage: number; total: number; from: number; to: number }
interface AdminStudentDirectory { items: AdminStudent[]; pagination: AdminPagination }
interface RiasecDimension { code: string; label: string; value: number }

interface AdminAssessment {
  id: number
  reference: string
  studentId: number
  studentName: string | null
  studentEmail: string | null
  attemptNumber: number
  attemptCount?: number
  retakeReason?: string | null
  instrumentCode: string
  status: 'in_progress' | 'preparing_result' | 'result_available' | 'result_failed'
  answerCount: number
  questionCount: number
  topCode: string | null
  startedAt: string | null
  savedAt: string | null
  submittedAt: string | null
  resultAvailableAt: string | null
  processingErrorCode: string | null
  processingFailedAt: string | null
  entranceExamination: { resultId: number; score: number; eligibilityGroup: 'board' | 'non_board'; ruleReference: string; source: 'student_self_declared'; declaredAt: string | null } | null
  recommendationSnapshot: { catalogueReference: string; ruleReference: string; methodologyStatus: string; generatedAt: string | null; totalEligible: number } | null
  dimensions?: RiasecDimension[]
  recommendations?: AdminRecommendation[]
}

interface AdminRecommendation { id: string; rank: number; code: string; name: string; match: number }

interface AdminStudentRecord {
  id: number
  name: string
  email: string
  photoUrl?: string | null
  accountStatus: string
  savedProgrammeCount: number
  profile: {
    photoUrl?: string | null
    lrn: string | null
    birthDate: string | null
    age: number | null
    phone: string | null
    location?: { regionId: number; provinceId: number | null; cityMunicipalityId: number; barangayId: number; code: string } | null
    addressLine: string | null
    barangay: string | null
    municipality: string | null
    province: string | null
    shsSchoolName: string | null
    shsStrand: string | null
    shsGraduationYear: number | null
  } | null
  assessmentSummary?: { totalAttempts: number; completedAttempts: number; retakeCount: number; latestAttempt: AdminAssessment | null } | null
  attempts: AdminAssessment[]
}

interface ProgrammeSourceValue { status: string; display?: string; source_name?: string; source_url?: string; note?: string }

interface AdminProgramme {
  id: string
  code: string
  name: string
  profile: string[]
  profileStatus: string
  profileVersion: string | null
  majors: string[]
  recommendedStrands: string[]
  description: string
  learningAreas: string[]
  learningAreaDescriptions: Record<string, string>
  learningAreaTopics: Record<string, string[]>
  careerDirections: string[]
  careerOpportunities?: CareerOpportunity[]
  strandGuidance: string
  requirements: string[]
  readinessPrompt: string
  contentStatus?: string
  contentSource?: ProgrammeContentSource | null
  contentVersion: string | null
  degreeType: string
  duration: ProgrammeSourceValue | null
  salary: ProgrammeSourceValue | null
  jobGrowth: ProgrammeSourceValue | null
  outlookVersion: string | null
  coverImageUrl: string | null
  logoImageUrl: string | null
  monitoring: { savedByStudents: number }
  eligibilityGroup: 'board' | 'non_board' | null
}

interface AdminProgrammeCatalogue { academicYear: string; catalogueVersion: number; catalogueStatus: string; programmes: AdminProgramme[] }

interface AdminReport {
  generatedAt: string
  from: string | null
  to: string | null
  scope: 'institution'
  studentCount: number
  eligibilityDistribution: { board: number; nonBoard: number }
  completedAssessments: number
  assessmentCompletionRate: number
  assessmentFunnel: { started: number; inProgress: number; processing: number; resultAvailable: number }
  recommendationRuns: number
  programmeSaves: number
  assessmentCompletionsByMonth: Array<{ month: string; count: number; volume?: number }>
  retakeMetrics?: { totalAssessmentAttempts: number; totalCompletedAttempts: number; studentsWithRetakes: number; totalRetakeAttempts: number }
}

interface ConfigurationVersion {
  id: number
  kind: 'catalogue'
  version: number
  status: 'draft' | 'published' | 'archived'
  academicYear: string | null
  payload: Record<string, unknown>
  createdBy: string | null
  publishedBy: string | null
  createdAt: string
  publishedAt: string | null
}

interface ConfigurationDiffField { field: string; before: unknown; after: unknown }
interface ConfigurationPreview {
  hasChanges: boolean
  changedSections: string[]
  changedProgrammeCount: number
  programmeChanges: Array<{ programmeId: string; code: string | null; name: string | null; fields: ConfigurationDiffField[] }>
}
interface ConfigurationWorkspace { kind: 'catalogue'; runtime: Record<string, unknown>; versions: ConfigurationVersion[] }
interface AdminActivity { id: number; actorId: number; actor: string | null; action: string; createdAt: string }
interface AdminActivityResponse { items: AdminActivity[]; pagination: AdminPagination; filters: { actors: Array<{ id: number; name: string }>; actions: string[] } }
interface ManagedAdministrator { id: number; name: string; email: string; accountStatus: 'active' | 'suspended' | 'archived'; canManageAdministrators: boolean; lastActiveAt: string | null; createdAt: string }
interface ManagedAdministrator { id: number; name: string; email: string; photoUrl?: string | null; accountStatus: 'active' | 'suspended' | 'archived'; canManageAdministrators: boolean; lastActiveAt: string | null; createdAt: string }
interface AdministratorInvitation { id: number; name: string; email: string; status: 'pending' | 'expired' | 'accepted' | 'revoked'; canManageAdministrators: boolean; invitedBy: string | null; expiresAt: string; sentAt: string | null; createdAt: string }
interface AdministratorManagement { administrators: ManagedAdministrator[]; invitations: AdministratorInvitation[] }
interface EscoOccupationSearchResult { uri: string; title: string; escoCode: string | null; iscoCode: string | null }

export type {
  AdminActivity,
  AdminActivityResponse,
  AdminAssessment,
  AdminOverview,
  AdminPagination,
  AdminProgramme,
  AdminProgrammeCatalogue,
  AdminReport,
  AdminStudent,
  AdminStudentDirectory,
  AdminStudentRecord,
  AdministratorInvitation,
  AdministratorManagement,
  ConfigurationPreview,
  ConfigurationVersion,
  ConfigurationWorkspace,
  EscoOccupationSearchResult,
  ManagedAdministrator,
  RiasecDimension,
}
