import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthApiError } from '@/features/auth/auth-api'

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

type SignInFields = z.infer<typeof signInSchema>

interface SignInFormProps {
  onSignIn: (fields: SignInFields) => Promise<void>
}

function SignInForm({ onSignIn }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFields>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = handleSubmit(async (fields) => {
    try {
      await onSignIn(fields)
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
        message: 'Sign in could not be completed. Please try again.',
      })
    }
  })

  return (
    <form
      noValidate
      onSubmit={submit}
      className="space-y-5"
    >
      {errors.root ? (
        <div
          role="alert"
          className="rounded-lg bg-destructive/8 px-4 py-3 text-sm font-semibold text-destructive"
        >
          {errors.root.message}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="h-12 pl-10"
            {...register('email')}
          />
        </div>
        {errors.email ? (
          <p id="email-error" className="text-xs font-semibold text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password">Password</Label>
        </div>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="h-12 px-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p
            id="password-error"
            className="text-xs font-semibold text-destructive"
          >
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="min-h-12 w-full rounded-x"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
        <ArrowRight aria-hidden="true" />
      </Button>
    </form>
  )
}

export { SignInForm }
