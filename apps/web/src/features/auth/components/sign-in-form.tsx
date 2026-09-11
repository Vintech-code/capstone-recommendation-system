import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { AuthApiError } from '@/features/auth/auth-api'
import { FloatingInputField } from '@/features/auth/components/floating-input-field'

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
    <form noValidate onSubmit={submit} className="space-y-3.5">
      {errors.root ? (
        <div
          role="alert"
          className="rounded-xs bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive-ink"
        >
          {errors.root.message}
        </div>
      ) : null}

      <FloatingInputField
        id="email"
        label="Email address"
        icon={Mail}
        type="email"
        autoComplete="username"
        error={errors.email?.message}
        {...register('email')}
      />

      <FloatingInputField
        id="password"
        label="Password"
        icon={LockKeyhole}
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        error={errors.password?.message}
        endAdornment={(
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-1.5 top-1/2 z-30 flex size-7.5 -translate-y-1/2 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-3.5" />
            ) : (
              <Eye aria-hidden="true" className="size-3.5" />
            )}
          </button>
        )}
        {...register('password')}
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="min-h-9.5 h-9.5 w-full rounded-xs text-xs sm:text-sm font-semibold"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}

export { SignInForm }
