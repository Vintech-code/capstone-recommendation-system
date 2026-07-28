type AssessmentResponseValue =
  | 'not-like-me'
  | 'somewhat-like-me'
  | 'very-like-me'

interface AssessmentResponseOption {
  value: AssessmentResponseValue
  label: string
  description: string
}

interface AssessmentQuestion {
  id: string
  prompt: string
}

// Isolated D-015 UI data. These prompts and response choices demonstrate the
// session interaction only; they are not an approved instrument, mapping,
// scoring key, interpretation, or production seed.
const mockAssessmentSession = {
  id: 'ASMT-STU-001',
  versionReference: 'IA-2026-01',
  questions: [
    {
      id: 'item-01',
      prompt: 'I enjoy learning how unfamiliar tools or systems work.',
    },
    {
      id: 'item-02',
      prompt: 'I like turning an idea into something I can show to others.',
    },
    {
      id: 'item-03',
      prompt: 'I feel comfortable helping someone understand a difficult task.',
    },
    {
      id: 'item-04',
      prompt: 'I enjoy organizing information so it is easier to use.',
    },
    {
      id: 'item-05',
      prompt: 'I like exploring several possible answers before choosing one.',
    },
    {
      id: 'item-06',
      prompt: 'I enjoy taking responsibility for moving a shared task forward.',
    },
  ] satisfies AssessmentQuestion[],
  responseOptions: [
    {
      value: 'not-like-me',
      label: 'Not like me',
      description: 'This does not usually describe my interests.',
    },
    {
      value: 'somewhat-like-me',
      label: 'Somewhat like me',
      description: 'This describes my interests in some situations.',
    },
    {
      value: 'very-like-me',
      label: 'Very much like me',
      description: 'This usually describes my interests.',
    },
  ] satisfies AssessmentResponseOption[],
} as const

export { mockAssessmentSession }
export type {
  AssessmentQuestion,
  AssessmentResponseOption,
  AssessmentResponseValue,
}
