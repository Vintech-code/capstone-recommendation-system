import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";

import logo from "@/assets/logo/login-logo.png";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-context";
import {
  registerStudent,
  type StudentRegistrationFields,
} from "@/features/auth/auth-api";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { StudentRegistrationForm } from "@/features/auth/components/student-registration-form";

interface StudentAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "signin" | "signup";
}

const googleErrorMessages: Record<string, string> = {
  account_conflict:
    "This Student account is already connected to another Google account.",
  account_inactive:
    "This account is not active. Contact an authorized administrator.",
  email_unverified:
    "Google could not confirm a verified email address for this account.",
  not_configured:
    "Google sign-in is temporarily unavailable. Please use email and password.",
  oauth_failed: "Google sign-in could not be completed. Please try again.",
  portal_forbidden: "This Google account cannot access the Student portal.",
};

function GmailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path fill="#4285F4" d="M4 7.6 7 9.85V19H4V7.6Z" />
      <path fill="#34A853" d="M20 7.6 17 9.85V19h3V7.6Z" />
      <path fill="#FBBC04" d="m4 7.6 3 2.25V7.4L4 5.15V7.6Z" />
      <path
        fill="#EA4335"
        d="M20 7.6 12 13.6 4 7.6V6.25c0-1.22 1.4-1.91 2.38-1.18L12 9.3l5.62-4.23C18.6 4.34 20 5.03 20 6.25V7.6Z"
      />
    </svg>
  );
}

function StudentAuthModal({
  open,
  onOpenChange,
  initialMode = "signin",
}: StudentAuthModalProps) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const googleError = searchParams.get("google_error");
  const googleAuthOrigin = (import.meta.env.VITE_API_ORIGIN ?? "").replace(
    /\/$/,
    "",
  );

  if (!prevOpen && open) {
    setPrevOpen(true);
    setMode(initialMode);
  } else if (prevOpen && !open) {
    setPrevOpen(false);
  }

  function continueWithGoogle() {
    window.location.assign(`${googleAuthOrigin}/auth/google/redirect`);
  }

  async function handleRegister(fields: StudentRegistrationFields) {
    await registerStudent(fields);
    await signIn({
      email: fields.email,
      password: fields.password,
      portal: "student",
    });
    navigate("/student", { replace: true });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* Dim backdrop overlay without blur - soft glass is on the card itself */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 transition-opacity data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />

        {/* Soft Glass modal card with rounded-xs and balanced proportions */}
        <DialogPrimitive.Content
          aria-describedby="auth-modal-description"
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2",
            "overflow-y-auto rounded-xs p-7 sm:p-9",
            "border border-white/80 dark:border-white/20",
            "bg-white/80 dark:bg-card/85 backdrop-blur-md",
            "shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16),0_0_0_1px_rgba(255,255,255,0.7)_inset]",
            "outline-none transition-all duration-200",
            "data-[state=closed]:scale-95 data-[state=closed]:opacity-0",
            "data-[state=open]:scale-100 data-[state=open]:opacity-100",
          )}
        >
          {/* Subtle specular gloss top reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-18 rounded-t-xs bg-gradient-to-b from-white/50 via-white/10 to-transparent"
          />

          {/* Close button with rounded-xs */}
          <DialogPrimitive.Close className="absolute right-3.5 top-3.5 z-10 inline-flex size-7.5 items-center justify-center rounded-xs border border-white/80 bg-white/75 text-muted-foreground shadow-xs backdrop-blur-sm transition hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
            <X aria-hidden="true" className="size-3.5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {/* Modal Header with Logo and Brand context */}
          <div className="relative text-center">
            <div className="mx-auto flex justify-center pb-3">
              <img
                src={logo}
                alt="TCCence"
                className="size-24 object-contain sm:size-32"
              />
            </div>
            <DialogPrimitive.Title
              id="auth-modal-title"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              {mode === "signin" ? "Welcome back!" : "Create your account"}
            </DialogPrimitive.Title>
            <p
              id="auth-modal-description"
              className="mt-2 text-sm text-muted-foreground sm:text-base"
            >
              {mode === "signin"
                ? "Sign in to access your assessment & recommendations."
                : "Create your Student Applicant profile to begin."}
            </p>
          </div>

          {/* Form Content */}
          <div className="relative">
            {mode === "signin" ? (
              <div>
                <SignInForm
                  onSignIn={async (credentials) => {
                    await signIn({ ...credentials, portal: "student" });
                    navigate("/student", { replace: true });
                  }}
                />

                <p className="mt-2 text-right text-xs">
                  <Link
                    to="/forgot-password?portal=student"
                    className="font-semibold text-primary-ink underline-offset-4 hover:underline"
                    onClick={() => onOpenChange(false)}
                  >
                    Forgot password?
                  </Link>
                </p>

                {googleError ? (
                  <p
                    role="alert"
                    className="mt-2.5 rounded-xs bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive-ink"
                  >
                    {googleErrorMessages[googleError] ??
                      googleErrorMessages.oauth_failed}
                  </p>
                ) : null}

                <div
                  className="my-3 flex items-center gap-2.5"
                  aria-hidden="true"
                >
                  <span className="h-px flex-1 bg-border/70" />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Or continue with
                  </span>
                  <span className="h-px flex-1 bg-border/70" />
                </div>

                <button
                  type="button"
                  onClick={continueWithGoogle}
                  className="flex min-h-9 w-full items-center justify-center gap-2 rounded-xs border border-input/80 bg-white/70 px-3 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xs transition-colors hover:border-primary/40 hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
                >
                  <GmailIcon />
                  Continue with Google
                </button>

                <p className="mt-3.5 text-center text-xs text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-bold text-primary-ink underline-offset-4 hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            ) : (
              <div>
                <StudentRegistrationForm onRegister={handleRegister} />

                <div
                  className="my-3 flex items-center gap-2.5"
                  aria-hidden="true"
                >
                  <span className="h-px flex-1 bg-border/70" />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Or continue with
                  </span>
                  <span className="h-px flex-1 bg-border/70" />
                </div>

                <button
                  type="button"
                  onClick={continueWithGoogle}
                  className="flex min-h-9 w-full items-center justify-center gap-2 rounded-xs border border-input/80 bg-white/70 px-3 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xs transition-colors hover:border-primary/40 hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
                >
                  <GmailIcon />
                  Continue with Google
                </button>

                <p className="mt-3.5 text-center text-xs text-muted-foreground">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="font-bold text-primary-ink underline-offset-4 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

export { StudentAuthModal };
export type { StudentAuthModalProps };
