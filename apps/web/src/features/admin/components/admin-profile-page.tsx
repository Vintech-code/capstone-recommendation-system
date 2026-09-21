import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/admin-shared";
import { AdminProfilePasswordCard } from "@/features/admin/components/admin-profile-password-card";
import { AdminProfileAppearanceCard } from "@/features/admin/components/admin-profile-appearance-card";
import {
  removeAdminProfilePhoto,
  uploadAdminProfilePhoto,
} from "@/features/auth/auth-api";
import { useAuth } from "@/features/auth/auth-context";

export function AdminProfilePage() {
  const { user, refreshSession } = useAuth();

  return (
    <div className="mx-auto w-full min-w-0 max-w-300 space-y-6 pb-12">
      <AdminPageHeader title="Profile settings" />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Avatar & Account Details */}
        <div className="space-y-6 lg:col-span-6 xl:col-span-5">
          <ProfilePhotoCard
            userName={user?.name ?? "Administrator"}
            currentPhotoUrl={user?.photoUrl ?? null}
            onUpdated={refreshSession}
          />

          <AccountIdentityCard user={user} />
        </div>

        {/* Right Column: Security & Password Management */}
        <div className="space-y-6 lg:col-span-6 xl:col-span-7">
          <AdminProfileAppearanceCard />
          <AdminProfilePasswordCard />
        </div>
      </div>
    </div>
  );
}

function ProfilePhotoCard({
  userName,
  currentPhotoUrl,
  onUpdated,
}: {
  userName: string;
  currentPhotoUrl: string | null;
  onUpdated: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const initials = userName.slice(0, 2).toUpperCase();
  const showImage = Boolean(currentPhotoUrl && !imageError);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFeedback({
        type: "error",
        message: "Please select a JPEG, PNG, or WebP image file.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: "The selected image must be smaller than 5 MB.",
      });
      return;
    }

    setUploading(true);
    setFeedback(null);
    setImageError(false);

    try {
      await uploadAdminProfilePhoto(file);
      onUpdated();
      setFeedback({
        type: "success",
        message: "Profile photo updated successfully.",
      });
    } catch (reason) {
      setFeedback({
        type: "error",
        message:
          reason instanceof Error
            ? reason.message
            : "The photo could not be uploaded.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setRemoving(true);
    setFeedback(null);
    try {
      await removeAdminProfilePhoto();
      setImageError(false);
      onUpdated();
      setFeedback({
        type: "success",
        message: "Custom photo removed. Restored account default avatar.",
      });
    } catch (reason) {
      setFeedback({
        type: "error",
        message:
          reason instanceof Error
            ? reason.message
            : "The photo could not be removed.",
      });
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
      <div className="border-b border-border/60 pb-4">
        <h2 className="font-display text-lg font-extrabold text-foreground">
          Profile photo
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Your avatar will reflect in the top navigation bar and sidebar menu.
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {/* Avatar Display */}
        <div className="relative shrink-0">
          {showImage ? (
            <img
              src={currentPhotoUrl!}
              alt={userName}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="size-24 rounded-full border-2 border-primary/20 object-cover shadow-sm ring-4 ring-primary/5"
            />
          ) : (
            <span className="flex size-24 items-center justify-center rounded-full bg-primary font-display text-2xl font-black text-primary-foreground shadow-sm ring-4 ring-primary/10">
              {initials}
            </span>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <span className="font-display text-base font-bold text-foreground">
              {userName}
            </span>
            <p className="text-xs text-muted-foreground">
              {showImage
                ? "Custom or Google-linked avatar is active."
                : "Displaying standard initials avatar."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading || removing}
              className="gap-2 rounded-lg text-xs font-bold shadow-2xs hover:bg-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin text-primary-ink" />
              ) : (
                <Camera className="size-3.5 text-primary-ink" />
              )}
              {uploading ? "Uploading…" : "Upload new photo"}
            </Button>

            {currentPhotoUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={uploading || removing}
                className="gap-1.5 rounded-lg text-xs font-semibold text-destructive-ink hover:bg-destructive/10"
                onClick={() => void handleRemove()}
              >
                {removing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Remove
              </Button>
            ) : null}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Supports JPEG, PNG, or WebP. Maximum size 5 MB. Minimum 160×160 px.
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />

      {feedback ? (
        <div
          role="alert"
          className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "border border-primary/30 bg-primary/10 text-primary-ink"
              : "border border-destructive/30 bg-destructive/10 text-destructive-ink"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      ) : null}
    </div>
  );
}

function AccountIdentityCard({
  user,
}: {
  user: ReturnType<typeof useAuth>["user"];
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
      <div className="border-b border-border/60 pb-4">
        <h2 className="font-display text-lg font-extrabold text-foreground">
          Account details
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Your registered administrator account profile and system role.
        </p>
      </div>

      <div className="mt-5 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <span className="flex items-center gap-2 font-semibold text-muted-foreground">
            <User className="size-3.5 text-primary-ink" /> Full name
          </span>
          <span className="font-bold text-foreground">{user?.name ?? "—"}</span>
        </div>

        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <span className="flex items-center gap-2 font-semibold text-muted-foreground">
            <Mail className="size-3.5 text-primary-ink" /> Email address
          </span>
          <span className="font-bold text-foreground">
            {user?.email ?? "—"}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <span className="flex items-center gap-2 font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary-ink" /> System role
          </span>
          <Badge
            variant="outline"
            className="rounded-sm font-bold text-primary-ink"
          >
            Administrator
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-muted-foreground">
            Governance authority
          </span>
          <span className="font-semibold text-foreground">
            {user?.canManageAdministrators
              ? "All Administrator privileges"
              : "Standard Administrator access"}
          </span>
        </div>
      </div>
    </div>
  );
}
