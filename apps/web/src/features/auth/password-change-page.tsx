import { KeyRound } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation } from "react-router";

import logo from "@/assets/logo/header-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/features/auth/auth-api";
import { useAuth } from "@/features/auth/auth-context";
import type { AccessRole } from "@/features/auth/access-types";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_MESSAGE,
  passwordMeetsPolicy,
} from "@/features/auth/password-policy";

function PasswordChangePage() {
  const { user } = useAuth();
  const location = useLocation();
  const role = ((location.state as { role?: AccessRole } | null)?.role ??
    user?.roles[0] ??
    "student") as AccessRole;
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return <Navigate to={`/${role}/login`} replace />;
  async function submit() {
    if (!passwordMeetsPolicy(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }
    if (password !== confirmation) {
      setError("Passwords must match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await changePassword({
        currentPassword,
        password,
        passwordConfirmation: confirmation,
      });
      window.location.assign(`/${role}`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The password could not be changed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-secondary/70 p-4">
      <form
        className="w-full max-w-md rounded-t-none rounded-b-[1.75rem] bg-card p-7 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <img
          src={logo}
          alt="Academic guidance system"
          className="h-10 w-auto"
        />
        <div className="mt-7 flex size-12 items-center justify-center rounded-lg bg-primary-fixed text-on-primary-fixed">
          <KeyRound aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold">
          Create your private password
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your temporary password can only be used to reach this step.{' '}
          {PASSWORD_POLICY_MESSAGE}
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="current-password">Temporary password</Label>
            <Input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              required
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-2"
            />
          </div>
        </div>
        {error ? (
          <p
            role="alert"
            className="mt-4 text-sm font-semibold text-destructive-ink"
          >
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-6 w-full" disabled={busy}>
          Save password and continue
        </Button>
      </form>
    </main>
  );
}

export { PasswordChangePage };
