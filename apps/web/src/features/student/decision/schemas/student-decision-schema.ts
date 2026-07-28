import { z } from 'zod'

const studentDecisionSchema = z.object({
  courseId: z.string().min(1, 'Select a course before continuing.'),
  decision: z.enum(['prefer', 'undecided', 'decline', 'other'], {
    message: 'Select the response that best describes your current decision.',
  }),
  note: z
    .string()
    .trim()
    .max(500, 'Keep your note within 500 characters.')
    .refine((value) => value.length > 0, 'Add a short note about your decision.'),
})

type StudentDecisionFormValues = z.infer<typeof studentDecisionSchema>

export { studentDecisionSchema }
export type { StudentDecisionFormValues }
