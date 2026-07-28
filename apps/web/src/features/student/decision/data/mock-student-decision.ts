type StudentDecisionValue = 'prefer' | 'undecided' | 'decline' | 'other'

interface StudentDecisionHistoryEntry {
  id: string
  decision: StudentDecisionValue
  courseName: string
  note: string
  recordedAt: string
}

interface StudentDecisionRecord {
  id: string
  recommendationReference: string
  courseId: string
  decision: StudentDecisionValue
  note: string
  updatedAt: string
  history: StudentDecisionHistoryEntry[]
}

// Isolated D-015 interaction data. This record demonstrates preference capture
// only and is not an admission, enrolment, assignment, or production record.
const mockStudentDecision: StudentDecisionRecord = {
  id: 'DEC-STU-001',
  recommendationReference: 'REC-STU-001',
  courseId: 'CRS-001',
  decision: 'undecided',
  note: 'I would like to compare the computing programs before deciding.',
  updatedAt: 'Jul 28, 2026',
  history: [
    {
      id: 'DEC-HIS-001',
      decision: 'undecided',
      courseName: 'BS Information Technology',
      note: 'I would like to compare the computing programs before deciding.',
      recordedAt: 'Jul 28, 2026',
    },
  ],
}

const studentDecisionOptions: Array<{
  value: StudentDecisionValue
  label: string
  description: string
}> = [
  {
    value: 'prefer',
    label: 'Prefer this course',
    description: 'Record this course as your current preferred option.',
  },
  {
    value: 'undecided',
    label: 'Still deciding',
    description: 'Keep the decision open while you review your options.',
  },
  {
    value: 'decline',
    label: 'Do not prefer this course',
    description: 'Record that this course is not your current preference.',
  },
  {
    value: 'other',
    label: 'Another response',
    description: 'Record a different preference using the note field.',
  },
]

export { mockStudentDecision, studentDecisionOptions }
export type {
  StudentDecisionHistoryEntry,
  StudentDecisionRecord,
  StudentDecisionValue,
}
