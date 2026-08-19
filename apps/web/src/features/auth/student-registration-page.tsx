import { Link, useNavigate } from 'react-router'

import { useAuth } from '@/features/auth/auth-context'
import {
  registerStudent,
  type StudentRegistrationFields,
} from '@/features/auth/auth-api'
import { AuthSplitLayout } from '@/features/auth/components/auth-split-layout'
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
    <AuthSplitLayout>
      <div className="text-center">
        <h1
          id="registration-title"
          className="text-3xl font-bold tracking-[-0.045em] sm:text-4xl"
        >
          Create your account
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Create your profile to begin your learning journey.
        </p>
      </div>

      <div className="mt-9">
        <StudentRegistrationForm onRegister={createAccount} />
      </div>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Already registered?{' '}
        <Link
          to="/student/login"
          className="font-extrabold text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  )
}

export { StudentRegistrationPage }
