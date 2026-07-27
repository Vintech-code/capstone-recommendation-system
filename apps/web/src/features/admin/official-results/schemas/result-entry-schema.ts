import { z } from 'zod'

const resultEntrySchema = z.object({
  applicantId: z.string().min(1, 'Select an applicant.'),
  examReference: z
    .string()
    .trim()
    .min(1, 'Enter the examination reference.')
    .max(40, 'Keep the examination reference within 40 characters.'),
  scoreValue: z
    .string()
    .trim()
    .min(1, 'Enter the recorded result value.')
    .max(32, 'Keep the result value within 32 characters.'),
  scoreFormat: z
    .string()
    .trim()
    .min(1, 'Describe the score format or scale.')
    .max(60, 'Keep the score format within 60 characters.'),
  examinationDate: z.string().min(1, 'Select the examination date.'),
  sourceNote: z
    .string()
    .trim()
    .max(240, 'Keep the source note within 240 characters.'),
})

type ResultEntryFields = z.infer<typeof resultEntrySchema>

export { resultEntrySchema }
export type { ResultEntryFields }
