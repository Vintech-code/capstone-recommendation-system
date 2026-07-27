type ReportStatus = 'Ready' | 'In review' | 'Archived'

type ReportType =
  | 'Individual guidance'
  | 'Programme overview'
  | 'Assessment overview'

interface ReportSection {
  title: string
  description: string
}

interface MockReport {
  id: string
  title: string
  type: ReportType
  status: ReportStatus
  version: number
  cycle: string
  generatedAt: string
  generatedLabel: string
  coverage: string
  applicantId?: string
  applicantName?: string
  recommendationId?: string
  introduction: string
  sections: ReportSection[]
  sourceVersions: string[]
}

const individualSections: ReportSection[] = [
  {
    title: 'Applicant context',
    description:
      'Presents the applicant reference and the admission-cycle context used for the report.',
  },
  {
    title: 'Interest profile',
    description:
      'Summarizes the recorded assessment profile and its version reference.',
  },
  {
    title: 'Course guidance',
    description:
      'Lists the ranked course guidance and the reasons stored with the recommendation snapshot.',
  },
]

const reportDefinitions: MockReport[] = [
  {
    id: 'RPT-001',
    title: 'Applicant guidance summary',
    type: 'Individual guidance',
    status: 'Ready',
    version: 1,
    cycle: '2026-2027',
    generatedAt: '2026-07-28T09:30:00+08:00',
    generatedLabel: 'Jul 28, 2026',
    coverage: 'Single applicant',
    applicantId: 'APP-001',
    applicantName: 'Alex Rivera',
    recommendationId: 'REC-001',
    introduction:
      'A concise record of the applicant profile, interest assessment, and stored course-guidance snapshot.',
    sections: individualSections,
    sourceVersions: ['QNR-01', 'RES-001-v1', 'RULE-01', 'REC-001-v1'],
  },
  {
    id: 'RPT-002',
    title: 'Applicant guidance summary',
    type: 'Individual guidance',
    status: 'In review',
    version: 2,
    cycle: '2026-2027',
    generatedAt: '2026-07-27T14:15:00+08:00',
    generatedLabel: 'Jul 27, 2026',
    coverage: 'Single applicant',
    applicantId: 'APP-002',
    applicantName: 'Jamie Cruz',
    recommendationId: 'REC-002',
    introduction:
      'A concise record of the applicant profile, interest assessment, and stored course-guidance snapshot.',
    sections: individualSections,
    sourceVersions: ['QNR-01', 'RES-002-v1', 'RULE-01', 'REC-002-v1'],
  },
  {
    id: 'RPT-003',
    title: 'Programme interest overview',
    type: 'Programme overview',
    status: 'Ready',
    version: 1,
    cycle: '2026-2027',
    generatedAt: '2026-07-26T11:00:00+08:00',
    generatedLabel: 'Jul 26, 2026',
    coverage: 'Admission cycle',
    introduction:
      'An organized overview of programme-interest patterns represented in the selected admission cycle.',
    sections: [
      {
        title: 'Programme grouping',
        description:
          'Organizes course-interest records by programme for review.',
      },
      {
        title: 'Guidance context',
        description:
          'Provides the report scope and the source-version references used to prepare the view.',
      },
      {
        title: 'Review notes',
        description:
          'Reserves a clear section for authorized contextual review.',
      },
    ],
    sourceVersions: ['CAT-2026-v1', 'RULE-01', 'QNR-01'],
  },
  {
    id: 'RPT-004',
    title: 'Assessment activity overview',
    type: 'Assessment overview',
    status: 'Archived',
    version: 1,
    cycle: '2025-2026',
    generatedAt: '2026-07-24T08:45:00+08:00',
    generatedLabel: 'Jul 24, 2026',
    coverage: 'Admission cycle',
    introduction:
      'A cycle-level view of assessment activity grouped by recorded session state and questionnaire version.',
    sections: [
      {
        title: 'Session states',
        description:
          'Groups assessment records by their stored lifecycle state.',
      },
      {
        title: 'Questionnaire versions',
        description:
          'Shows the version references represented by the selected cycle.',
      },
      {
        title: 'Record coverage',
        description:
          'Describes the date and cycle boundaries applied to the report.',
      },
    ],
    sourceVersions: ['QNR-00', 'CYCLE-2025'],
  },
  {
    id: 'RPT-005',
    title: 'Applicant guidance summary',
    type: 'Individual guidance',
    status: 'Ready',
    version: 1,
    cycle: '2026-2027',
    generatedAt: '2026-07-23T16:20:00+08:00',
    generatedLabel: 'Jul 23, 2026',
    coverage: 'Single applicant',
    applicantId: 'APP-004',
    applicantName: 'Taylor Santos',
    recommendationId: 'REC-004',
    introduction:
      'A concise record of the applicant profile, interest assessment, and stored course-guidance snapshot.',
    sections: individualSections,
    sourceVersions: ['QNR-01', 'RES-004-v1', 'RULE-01', 'REC-004-v1'],
  },
  {
    id: 'RPT-006',
    title: 'Programme interest overview',
    type: 'Programme overview',
    status: 'In review',
    version: 2,
    cycle: '2026-2027',
    generatedAt: '2026-07-22T10:10:00+08:00',
    generatedLabel: 'Jul 22, 2026',
    coverage: 'Admission cycle',
    introduction:
      'An organized overview of programme-interest patterns represented in the selected admission cycle.',
    sections: [
      {
        title: 'Programme grouping',
        description:
          'Organizes course-interest records by programme for review.',
      },
      {
        title: 'Guidance context',
        description:
          'Provides the report scope and the source-version references used to prepare the view.',
      },
      {
        title: 'Review notes',
        description:
          'Reserves a clear section for authorized contextual review.',
      },
    ],
    sourceVersions: ['CAT-2026-v1', 'RULE-01', 'QNR-01'],
  },
]

// These report definitions and contents are isolated synthetic UI data. They
// are not official TCC layouts, recipients, signatories, records, or evidence.
const mockReports = reportDefinitions

const reportStatuses: ReportStatus[] = ['Ready', 'In review', 'Archived']
const reportTypes: ReportType[] = [
  'Individual guidance',
  'Programme overview',
  'Assessment overview',
]

export { mockReports, reportStatuses, reportTypes }
export type { MockReport, ReportSection, ReportStatus, ReportType }
