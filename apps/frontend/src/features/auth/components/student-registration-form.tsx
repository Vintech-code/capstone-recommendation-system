import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  AuthApiError,
  type StudentRegistrationFields,
} from "@/features/auth/auth-api";
import { FloatingInputField } from "@/features/auth/components/floating-input-field";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_MESSAGE,
  passwordMeetsPolicy,
} from "@/features/auth/password-policy";

const registrationSchema = z
  .object({
    firstName: z.string().trim().min(1, "Enter your first name."),
    lastName: z.string().trim().min(1, "Enter your last name."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .email("Enter a valid email address."),
    password: z
      .string()
      .min(1, "Enter a password.")
      .refine(passwordMeetsPolicy, PASSWORD_POLICY_MESSAGE),
    passwordConfirmation: z.string().min(1, "Confirm your password."),
  })
  .refine((fields) => fields.password === fields.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords must match.",
  });

interface StudentRegistrationFormProps {
  onRegister: (fields: StudentRegistrationFields) => Promise<void>;
}

function StudentRegistrationForm({ onRegister }: StudentRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentRegistrationFields>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const submit = handleSubmit(async (fields) => {
    try {
      await onRegister(fields);
    } catch (error) {
      if (error instanceof AuthApiError) {
        const emailError = error.fieldErrors.email?.[0];
        if (emailError) {
          setError("email", { message: emailError }, { shouldFocus: true });
          return;
        }
        setError("root", { message: error.message });
        return;
      }
      setError("root", {
        message: "Account creation could not be completed. Please try again.",
      });
    }
  });

  return (
    <form noValidate onSubmit={submit} className="space-y-2.5">
      {errors.root ? (
        <div
          role="alert"
          className="rounded-xs bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive-ink"
        >
          {errors.root.message}
        </div>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-2">
        <FloatingInputField
          id="registration-first-name"
          label="First name"
          icon={UserRound}
          type="text"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <FloatingInputField
          id="registration-last-name"
          label="Last name"
          icon={UserRound}
          type="text"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>
      <FloatingInputField
        id="registration-email"
        label="Email address"
        icon={Mail}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <FloatingInputField
        id="registration-password"
        label="Password"
        icon={LockKeyhole}
        type="password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        error={errors.password?.message}
        {...register("password")}
      />
      <p className="text-[11px] leading-4 text-muted-foreground">
        {PASSWORD_POLICY_MESSAGE}
      </p>
      <FloatingInputField
        id="registration-password-confirmation"
        label="Confirm password"
        icon={LockKeyhole}
        type="password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        error={errors.passwordConfirmation?.message}
        {...register("passwordConfirmation")}
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 min-h-9.5 h-9.5 w-full rounded-xs text-xs sm:text-sm font-semibold"
      >
        {isSubmitting ? "Creating account…" : "Create student account"}
      </Button>
    </form>
  );
}

export { StudentRegistrationForm };
