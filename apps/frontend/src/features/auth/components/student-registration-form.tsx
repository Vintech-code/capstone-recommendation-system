import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
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

  const password = watch("password") || "";

  const hasLength = password.length >= PASSWORD_MIN_LENGTH;
  const hasUpper = /\p{Lu}/u.test(password);
  const hasLower = /\p{Ll}/u.test(password);
  const hasNumber = /\p{N}/u.test(password);
  const hasSymbol = /[\p{Z}\p{S}\p{P}]/u.test(password);

  const passedCount = [hasLength, hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  const isFullyCompliant = passwordMeetsPolicy(password);

  let strength: "empty" | "weak" | "moderate" | "strong" = "empty";
  if (password.length > 0) {
    if (isFullyCompliant) {
      strength = "strong";
    } else if (passedCount >= 3 && password.length >= 8) {
      strength = "moderate";
    } else {
      strength = "weak";
    }
  }

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
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        error={errors.password?.message}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-1.5 top-1/2 z-30 flex size-7.5 -translate-y-1/2 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-3.5" />
            ) : (
              <Eye aria-hidden="true" className="size-3.5" />
            )}
          </button>
        }
        {...register("password")}
      />

      {/* Password Rule & Strength 3-Bar Notification */}
      {strength === "empty" ? (
        <p className="text-[11px] leading-4 text-muted-foreground">
          {PASSWORD_POLICY_MESSAGE}
        </p>
      ) : (
        <div
          data-testid="password-strength-meter"
          className="space-y-1.5 pt-0.5"
        >
          {/* Strength Level & Notification Text */}
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              {strength === "strong" ? (
                <ShieldCheck className="size-3.5 text-primary-ink" aria-hidden="true" />
              ) : (
                <ShieldAlert
                  className={`size-3.5 ${
                    strength === "moderate" ? "text-warning-ink" : "text-destructive-ink"
                  }`}
                  aria-hidden="true"
                />
              )}
              Password strength:
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                strength === "strong"
                  ? "bg-primary/20 text-primary-ink"
                  : strength === "moderate"
                    ? "bg-warning/20 text-warning-ink"
                    : "bg-destructive/15 text-destructive-ink"
              }`}
            >
              {strength === "strong"
                ? "Strong"
                : strength === "moderate"
                  ? "Moderate"
                  : "Weak"}
            </span>
          </div>

          {/* 3-Segment Strength Progress Bar */}
          <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
            <div
              className={`h-1.5 rounded-full transition-colors duration-200 ${
                strength === "weak"
                  ? "bg-destructive"
                  : strength === "moderate"
                    ? "bg-warning"
                    : "bg-primary"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-colors duration-200 ${
                strength === "moderate"
                  ? "bg-warning"
                  : strength === "strong"
                    ? "bg-primary"
                    : "bg-muted"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-colors duration-200 ${
                strength === "strong" ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
        </div>
      )}

      <FloatingInputField
        id="registration-password-confirmation"
        label="Confirm password"
        icon={LockKeyhole}
        type={showConfirmPassword ? "text" : "password"}
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        error={errors.passwordConfirmation?.message}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((visible) => !visible)}
            className="absolute right-1.5 top-1/2 z-30 flex size-7.5 -translate-y-1/2 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff aria-hidden="true" className="size-3.5" />
            ) : (
              <Eye aria-hidden="true" className="size-3.5" />
            )}
          </button>
        }
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
