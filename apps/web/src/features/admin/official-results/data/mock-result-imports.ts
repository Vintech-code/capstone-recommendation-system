type ImportRowStatus = 'Ready' | 'Needs review' | 'Duplicate'

interface ImportPreviewRow {
  id: string
  rowNumber: number
  applicantReference: string
  examReference: string
  resultValue: string
  scoreFormat: string
  examinationDate: string
  status: ImportRowStatus
  issues: string[]
}

interface MockImportBatch {
  id: string
  fileName: string
  status: 'Reconciliation review'
  createdAt: string
  createdLabel: string
  rows: ImportPreviewRow[]
}

const expectedImportHeaders = [
  'applicant_reference',
  'exam_reference',
  'result_value',
  'score_format',
  'examination_date',
] as const

const sampleResultImportCsv = [
  expectedImportHeaders.join(','),
  'APP-010,EXAM-MOCK-010,88.5,100-point scale,2026-07-20',
  'APP-011,EXAM-MOCK-011,92.0,100-point scale,2026-07-20',
  ',EXAM-MOCK-012,84.0,100-point scale,2026-07-21',
  'APP-012,EXAM-MOCK-013,90.0,100-point scale,2026-07-21',
  'APP-012,EXAM-MOCK-014,91.0,100-point scale,2026-07-22',
  'APP-013,EXAM-MOCK-015,,100-point scale,2026-07-22',
].join('\n')

function parseCsvLine(line: string) {
  const values: string[] = []
  let value = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      values.push(value.trim())
      value = ''
    } else {
      value += character
    }
  }

  values.push(value.trim())
  return values
}

function parseResultImport(content: string): ImportPreviewRow[] {
  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim())

  if (lines.length < 2) {
    throw new Error('Choose a CSV file containing a header and at least one row.')
  }

  const headers = parseCsvLine(lines[0]).map((header) =>
    header.trim().toLowerCase(),
  )
  const missingHeaders = expectedImportHeaders.filter(
    (header) => !headers.includes(header),
  )

  if (missingHeaders.length) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}.`)
  }

  const indexOf = (header: (typeof expectedImportHeaders)[number]) =>
    headers.indexOf(header)
  const seenApplicants = new Set<string>()

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line)
    const applicantReference = values[indexOf('applicant_reference')] ?? ''
    const examReference = values[indexOf('exam_reference')] ?? ''
    const resultValue = values[indexOf('result_value')] ?? ''
    const scoreFormat = values[indexOf('score_format')] ?? ''
    const examinationDate = values[indexOf('examination_date')] ?? ''
    const issues: string[] = []

    if (!applicantReference) issues.push('Applicant reference is missing.')
    if (!examReference) issues.push('Examination reference is missing.')
    if (!resultValue) issues.push('Result value is missing.')
    if (!scoreFormat) issues.push('Score format is missing.')
    if (!examinationDate) issues.push('Examination date is missing.')

    const duplicate =
      Boolean(applicantReference) && seenApplicants.has(applicantReference)
    if (applicantReference) seenApplicants.add(applicantReference)
    if (duplicate) {
      issues.push('Applicant reference appears more than once in this file.')
    }

    return {
      id: `ROW-${String(index + 2).padStart(3, '0')}`,
      rowNumber: index + 2,
      applicantReference,
      examReference,
      resultValue,
      scoreFormat,
      examinationDate,
      status: duplicate
        ? 'Duplicate'
        : issues.length
          ? 'Needs review'
          : 'Ready',
      issues,
    }
  })
}

const mockImportBatch: MockImportBatch = {
  id: 'IMP-001',
  fileName: 'results-july-2026.csv',
  status: 'Reconciliation review',
  createdAt: '2026-07-28T01:36:00+08:00',
  createdLabel: 'Jul 28, 2026',
  rows: parseResultImport(sampleResultImportCsv),
}

const importRowStatuses: ImportRowStatus[] = [
  'Ready',
  'Needs review',
  'Duplicate',
]

export {
  expectedImportHeaders,
  importRowStatuses,
  mockImportBatch,
  parseResultImport,
  sampleResultImportCsv,
}
export type { ImportPreviewRow, ImportRowStatus, MockImportBatch }
