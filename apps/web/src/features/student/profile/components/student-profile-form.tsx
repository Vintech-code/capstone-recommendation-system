import type {
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { StudentProfileFields } from '@/features/student/profile/schemas/student-profile-schema'

interface StudentProfileFormProps {
  register: UseFormRegister<StudentProfileFields>
  errors: FieldErrors<StudentProfileFields>
}

function StudentProfileForm({
  register,
  errors,
}: StudentProfileFormProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <ProfileField
        id="student-full-name"
        label="Full name"
        error={errors.fullName?.message}
        className="sm:col-span-2"
      >
        <Input
          id="student-full-name"
          autoComplete="name"
          className="text-base sm:text-sm"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={
            errors.fullName ? 'student-full-name-error' : undefined
          }
          {...register('fullName')}
        />
      </ProfileField>

      <ProfileField
        id="student-email"
        label="Contact email"
        error={errors.contactEmail?.message}
      >
        <Input
          id="student-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className="text-base sm:text-sm"
          aria-invalid={Boolean(errors.contactEmail)}
          aria-describedby={
            errors.contactEmail ? 'student-email-error' : undefined
          }
          {...register('contactEmail')}
        />
      </ProfileField>

      <ProfileField
        id="student-mobile"
        label="Mobile number"
        error={errors.mobileNumber?.message}
      >
        <Input
          id="student-mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className="text-base sm:text-sm"
          aria-invalid={Boolean(errors.mobileNumber)}
          aria-describedby={
            errors.mobileNumber ? 'student-mobile-error' : undefined
          }
          {...register('mobileNumber')}
        />
      </ProfileField>

      <ProfileField
        id="student-school"
        label="Current school"
        error={errors.currentSchool?.message}
        className="sm:col-span-2"
      >
        <Input
          id="student-school"
          autoComplete="organization"
          className="text-base sm:text-sm"
          aria-invalid={Boolean(errors.currentSchool)}
          aria-describedby={
            errors.currentSchool ? 'student-school-error' : undefined
          }
          {...register('currentSchool')}
        />
      </ProfileField>

      <ProfileField
        id="student-level"
        label="Current level"
        error={errors.currentLevel?.message}
      >
        <Input
          id="student-level"
          className="text-base sm:text-sm"
          aria-invalid={Boolean(errors.currentLevel)}
          aria-describedby={
            errors.currentLevel ? 'student-level-error' : undefined
          }
          {...register('currentLevel')}
        />
      </ProfileField>

      <ProfileField
        id="student-track"
        label="Track or strand"
        optional
        error={errors.trackOrStrand?.message}
      >
        <Input
          id="student-track"
          className="text-base sm:text-sm"
          aria-invalid={Boolean(errors.trackOrStrand)}
          aria-describedby={
            errors.trackOrStrand ? 'student-track-error' : undefined
          }
          {...register('trackOrStrand')}
        />
      </ProfileField>

      <ProfileField
        id="student-address"
        label="Home address"
        error={errors.homeAddress?.message}
        className="sm:col-span-2"
      >
        <Textarea
          id="student-address"
          autoComplete="street-address"
          className="text-base sm:text-sm"
          aria-invalid={Boolean(errors.homeAddress)}
          aria-describedby={
            errors.homeAddress ? 'student-address-error' : undefined
          }
          {...register('homeAddress')}
        />
      </ProfileField>
    </div>
  )
}

function ProfileField({
  id,
  label,
  error,
  optional = false,
  className = '',
  children,
}: {
  id: string
  label: string
  error?: string
  optional?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {optional ? (
          <span className="text-xs text-muted-foreground">Optional</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-semibold text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { StudentProfileForm }
