// Isolated D-015 document data. The content and references demonstrate the
// Student report experience only and are not an approved institutional report,
// signatory record, production export, or validation artifact.
const mockStudentReport = {
  id: 'RPT-STU-001',
  title: 'Course Guidance Summary',
  version: 'UI-01',
  status: 'Available',
  preparedAt: 'Jul 28, 2026',
  applicantName: 'Alex Rivera',
  applicantReference: 'APP-STU-001',
  cycle: 'Current application cycle',
  recommendationReference: 'REC-STU-001',
  assessmentReference: 'RIA-RES-001',
  decisionReference: 'DEC-STU-001',
  summary:
    'This report brings together the recorded assessment pattern, ranked course guidance, and current Student decision for review.',
  boundaries: [
    'This report supports guidance discussion.',
    'It does not guarantee admission, reserve a slot, assign a course, or complete enrolment.',
    'Current institutional requirements must still be confirmed through authorized channels.',
  ],
} as const

export { mockStudentReport }
