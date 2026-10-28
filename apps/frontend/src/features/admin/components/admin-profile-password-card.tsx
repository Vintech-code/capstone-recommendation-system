import {
  AlertCircle,
  Check,
  CheckCircle2,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/features/auth/auth-api";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_MESSAGE,
  passwordMeetsPolicy,
} from "@/features/auth/password-policy";

export function AdminProfilePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasLength = password.length >= PASSWORD_MIN_LENGTH;
  const hasLower = /\p{Ll}/u.test(password);
  const hasUpper = /\p{Lu}/u.test(password);
  const hasNumber = /\p{N}/u.test(password);
  const hasSymbol = /[\p{Z}\p{S}\p{P}]/u.test(password);
  const matches = password.length > 0 && password === confirmation;

  async function submit() {
    if (!passwordMeetsPolicy(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }
    if (password !== confirmation) {
      setError("New password and confirmation must match.");
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(false);

    try {
      await changePassword({
        currentPassword,
        password,
        passwordConfirmation: confirmation,
      });
      setSuccess(true);
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The password could not be changed. Verify your current password.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs sm:p-7">
      <div className="border-b border-border/60 pb-4">
        <h2 className="font-display text-lg font-extrabold text-foreground">
          Change password
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Update your sign-in password. Note that changing your password revokes
          other active sessions.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="mt-6 space-y-5"
      >
        <div>
          <Label
            htmlFor="admin-profile-current-password"
            className="text-xs font-bold text-foreground"
          >
            Current password
          </Label>
          <Input
            id="admin-profile-current-password"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Enter current password"
            className="mt-1.5 rounded-lg text-xs"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="admin-profile-new-password"
              className="text-xs font-bold text-foreground"
            >
              New password
            </Label>
            <Input
              id="admin-profile-new-password"
              type="password"
              required
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 12 characters"
              className="mt-1.5 rounded-lg text-xs"
            />
          </div>

          <div>
            <Label
              htmlFor="admin-profile-confirm-password"
              className="text-xs font-bold text-foreground"
            >
              Confirm new password
            </Label>
            <Input
              id="admin-profile-confirm-password"
              type="password"
              required
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Re-enter new password"
              className="mt-1.5 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <KeyRound className="size-4 text-primary-ink" />
            <span>Password requirements</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <RequirementItem met={hasLength} label="At least 12 characters" />
            <RequirementItem met={hasUpper} label="Uppercase letter" />
            <RequirementItem met={hasLower} label="Lowercase letter" />
            <RequirementItem met={hasNumber} label="At least one number" />
            <RequirementItem met={hasSymbol} label="Special character or symbol" />
            <RequirementItem met={matches} label="Passwords match" />
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive-ink"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {success ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3.5 text-xs font-semibold text-primary-ink"
          >
            <CheckCircle2 className="size-4 shrink-0" />
            <span>
              Your password has been successfully updated. All other active
              sessions have been revoked for your security.
            </span>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={busy || !currentPassword || !password || !confirmation}
          className="h-9 rounded-lg px-5 text-xs font-bold shadow-2xs"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {busy ? "Updating password…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex size-4 items-center justify-center rounded-full text-[10px] ${
          met
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {met ? <Check className="size-2.5 stroke-[3]" /> : "•"}
      </span>
      <span className={met ? "font-semibold text-foreground" : ""}>
        {label}
      </span>
    </div>
  );
}

