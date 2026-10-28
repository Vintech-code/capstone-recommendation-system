import { Link, useNavigate, useSearchParams } from "react-router";

import type { AccessRole } from "@/features/auth/access-types";
import { useAuth } from "@/features/auth/auth-context";
import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { SignInForm } from "@/features/auth/components/sign-in-form";

interface PortalSignInPageProps {
  role: AccessRole;
}

const googleErrorMessages = {
  account_conflict:
    "This account is already connected to another Google account.",
  account_inactive:
    "This account is not active. Contact an authorized administrator.",
  email_unverified:
    "Google could not confirm a verified email address for this account.",
  not_configured:
    "Google sign-in is temporarily unavailable. Please use email and password.",
  oauth_failed: "Google sign-in could not be completed. Please try again.",
  portal_forbidden: "This Google account cannot access this portal.",
} as const;

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

function PortalSignInPage({ role }: PortalSignInPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const googleError = searchParams.get("google_error");
  const googleAuthOrigin = (import.meta.env.VITE_API_ORIGIN ?? "").replace(
    /\/$/,
    "",
  );

  function continueWithGoogle() {
    window.location.assign(
      `${googleAuthOrigin}/auth/google/redirect?portal=${role}`,
    );
  }

  return (
    <AuthSplitLayout>
      <div className="text-center">
        <h1
          id="sign-in-title"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Welcome back!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {role === "admin"
            ? "Sign in to access your administrator portal."
            : "Sign in to access your assessment & recommendations."}
        </p>
      </div>

      <div className="relative mt-3.5">
        <SignInForm
          onSignIn={async (credentials) => {
            await signIn({ ...credentials, portal: role });
            navigate(`/${role}`, { replace: true });
          }}
        />

        <p className="mt-2 text-right text-xs">
          <Link
            to={`/forgot-password?portal=${role}`}
            className="font-semibold text-primary-ink underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </p>

        {googleError ? (
          <p
            role="alert"
            className="mt-2.5 rounded-xs bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive-ink"
          >
            {googleErrorMessages[
              googleError as keyof typeof googleErrorMessages
            ] ?? googleErrorMessages.oauth_failed}
          </p>
        ) : null}

        <div className="my-3 flex items-center gap-2.5" aria-hidden="true">
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

        {role === "student" ? (
          <p className="mt-3.5 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/student/register"
              className="font-bold text-primary-ink underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        ) : null}
      </div>
    </AuthSplitLayout>
  );
}

export { PortalSignInPage };
