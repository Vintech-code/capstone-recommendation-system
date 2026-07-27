type QuestionnaireStatus = 'Active' | 'Draft' | 'Retired'

interface MockQuestionnaireVersion {
  id: string
  name: string
  version: string
  status: QuestionnaireStatus
  itemCount: number
  responseFormat: string
  updatedAt: string
  updatedLabel: string
  description: string
  sampleItems: string[]
}

// Synthetic questionnaire content exists only to demonstrate the prototype UI.
// It is not an approved instrument, mapping, scoring key, or production seed.
const mockQuestionnaires: MockQuestionnaireVersion[] = [
  {
    id: 'QNR-01',
    name: 'Student Interest Inventory',
    version: '1.2',
    status: 'Active',
    itemCount: 42,
    responseFormat: 'Yes or No',
    updatedAt: '2026-07-24T09:00:00+08:00',
    updatedLabel: 'Jul 24, 2026',
    description:
      'Current questionnaire version used for student assessment sessions.',
    sampleItems: [
      'I enjoy solving practical problems.',
      'I like investigating how things work.',
      'I enjoy creating original work.',
      'I like helping people learn.',
      'I enjoy organizing group activities.',
      'I prefer keeping information orderly.',
    ],
  },
  {
    id: 'QNR-02',
    name: 'Student Interest Inventory',
    version: '1.3',
    status: 'Draft',
    itemCount: 42,
    responseFormat: 'Yes or No',
    updatedAt: '2026-07-27T10:30:00+08:00',
    updatedLabel: 'Jul 27, 2026',
    description:
      'Draft version prepared for questionnaire and version-control review.',
    sampleItems: [
      'I enjoy completing hands-on activities.',
      'I like exploring answers to difficult questions.',
      'I enjoy expressing ideas creatively.',
      'I like supporting other people.',
      'I enjoy leading a shared task.',
      'I prefer working with clear records.',
    ],
  },
  {
    id: 'QNR-00',
    name: 'Student Interest Inventory',
    version: '1.1',
    status: 'Retired',
    itemCount: 42,
    responseFormat: 'Yes or No',
    updatedAt: '2026-07-18T15:20:00+08:00',
    updatedLabel: 'Jul 18, 2026',
    description:
      'Earlier version retained for historical traceability.',
    sampleItems: [
      'I enjoy building useful things.',
      'I like learning through research.',
      'I enjoy artistic activities.',
      'I like working with people.',
      'I enjoy presenting ideas.',
      'I prefer structured tasks.',
    ],
  },
]

function getMockQuestionnaire(
  questionnaireId: string,
): MockQuestionnaireVersion | undefined {
  return mockQuestionnaires.find((item) => item.id === questionnaireId)
}

export { getMockQuestionnaire, mockQuestionnaires }
export type { MockQuestionnaireVersion, QuestionnaireStatus }
