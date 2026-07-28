import { z } from 'zod'

const studentProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  contactEmail: z.email('Enter a valid email address.'),
  mobileNumber: z
    .string()
    .trim()
    .min(7, 'Enter a valid mobile number.')
    .max(20, 'Enter a valid mobile number.'),
  currentSchool: z.string().trim().min(2, 'Enter your current school.'),
  currentLevel: z.string().trim().min(1, 'Enter your current level.'),
  trackOrStrand: z.string().trim().max(80, 'Keep this under 80 characters.'),
  homeAddress: z.string().trim().min(5, 'Enter your current home address.'),
})

type StudentProfileFields = z.infer<typeof studentProfileSchema>

export { studentProfileSchema }
export type { StudentProfileFields }
