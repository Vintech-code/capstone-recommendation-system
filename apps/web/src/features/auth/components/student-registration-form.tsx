import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AuthApiError,
  type StudentRegistrationFields,
} from '@/features/auth/auth-api'

const registrationSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your full name.'),
    email: z
      .string()
      .trim()
      .min(1, 'Enter your email address.')
      .email('Enter a valid email address.'),
    password: z.string().min(1, 'Enter a password.'),
    passwordConfirmation: z.string().min(1, 'Confirm your password.'),
  })
  .refine((fields) => fields.password === fields.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Passwords must match.',
  })

interface StudentRegistrationFormProps {
  onRegister: (fields: StudentRegistrationFields) => Promise<void>
}

function StudentRegistrationForm({
  onRegister,
}: StudentRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentRegistrationFields>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  })

  const submit = handleSubmit(async (fields) => {
    try {
      await onRegister(fields)
    } catch (error) {
      if (error instanceof AuthApiError) {
        const emailError = error.fieldErrors.email?.[0]
        if (emailError) {
          setError('email', { message: emailError }, { shouldFocus: true })
          return
        }
        setError('root', { message: error.message })
        return
      }
      setError('root', {
        message: 'Account creation could not be completed. Please try again.',
      })
    }
  })

  const fields = [
    {
      id: 'registration-name',
      label: 'Full name',
      type: 'text',
      autoComplete: 'name',
      icon: UserRound,
      error: errors.name,
      registration: register('name'),
    },
    {
      id: 'registration-email',
      label: 'Email address',
      type: 'email',
      autoComplete: 'email',
      icon: Mail,
      error: errors.email,
      registration: register('email'),
    },
    {
      id: 'registration-password',
      label: 'Password',
      type: 'password',
      autoComplete: 'new-password',
      icon: LockKeyhole,
      error: errors.password,
      registration: register('password'),
    },
    {
      id: 'registration-password-confirmation',
      label: 'Confirm password',
      type: 'password',
      autoComplete: 'new-password',
      icon: LockKeyhole,
      error: errors.passwordConfirmation,
      registration: register('passwordConfirmation'),
    },
  ] as const

  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      {errors.root ? (
        <div
          role="alert"
          className="rounded-lg bg-destructive/8 px-4 py-3 text-sm font-semibold text-destructive"
        >
          {errors.root.message}
        </div>
      ) : null}

      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <div className="relative">
            <field.icon
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              aria-invalid={Boolean(field.error)}
              aria-describedby={field.error ? `${field.id}-error` : undefined}
              className="h-12 pl-10"
              {...field.registration}
            />
          </div>
          {field.error ? (
            <p
              id={`${field.id}-error`}
              className="text-xs font-semibold text-destructive"
            >
              {field.error.message}
            </p>
          ) : null}
        </div>
      ))}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="min-h-12 w-full"
      >
        {isSubmitting ? 'Creating account…' : 'Create student account'}
        <ArrowRight aria-hidden="true" />
      </Button>
    </form>
  )
}

export { StudentRegistrationForm }
