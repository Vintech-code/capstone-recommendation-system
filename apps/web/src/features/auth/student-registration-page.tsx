import { UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { ThemeToggle } from '@/components/shared'
import { useAuth } from '@/features/auth/auth-context'
import {
  registerStudent,
  type StudentRegistrationFields,
} from '@/features/auth/auth-api'
import { StudentRegistrationForm } from '@/features/auth/components/student-registration-form'

function StudentRegistrationPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  async function createAccount(fields: StudentRegistrationFields) {
    await registerStudent(fields)
    await signIn({
      email: fields.email,
      password: fields.password,
      portal: 'student',
    })
    navigate('/student', { replace: true })
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-secondary/70 px-4 py-10 sm:px-8">
      <ThemeToggle className="absolute right-4 top-4 bg-background shadow-sm sm:right-6 sm:top-6" />
      <section
        aria-labelledby="registration-title"
        className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-sm sm:p-9"
      >
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <UserPlus aria-hidden="true" className="size-5" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Student Applicant
        </p>
        <h1
          id="registration-title"
          className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-4xl"
        >
          Create your account
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Register as a Student Applicant to access the assessment flow.
        </p>

        <div className="mt-8">
          <StudentRegistrationForm onRegister={createAccount} />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered?{' '}
          <Link
            to="/student/login"
            className="font-extrabold text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}

export { StudentRegistrationPage }
