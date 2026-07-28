const mockStudentOfficialResult = {
  reference: 'RES-2026-004',
  recordedValue: '84',
  recordedFormat: 'Numeric result',
  examinationDate: 'July 15, 2026',
  source: 'Authorized manual record',
  verifiedAt: 'July 18, 2026 at 10:30 AM',
  verifiedBy: 'Authorized Admin',
  status: 'Verified',
  timeline: [
    {
      id: 'recorded',
      label: 'Result recorded',
      description: 'The examination record was added from an authorized source.',
      date: 'July 15, 2026',
    },
    {
      id: 'reviewed',
      label: 'Record reviewed',
      description: 'The source details were checked by an authorized reviewer.',
      date: 'July 17, 2026',
    },
    {
      id: 'verified',
      label: 'Result verified',
      description: 'The record became available in the Student workspace.',
      date: 'July 18, 2026',
    },
  ],
} as const

export { mockStudentOfficialResult }
