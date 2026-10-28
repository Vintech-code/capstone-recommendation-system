import { useState } from "react";
import { cn } from "@/lib/utils";

export interface WorkspaceAvatarProps {
  photoUrl?: string | null;
  name?: string;
  className?: string;
  fallbackClassName?: string;
}

export function WorkspaceAvatar({
  photoUrl,
  name,
  className = "size-9",
  fallbackClassName,
}: WorkspaceAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const initials = (name ?? "AD")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "AD";

  if (photoUrl && !hasError) {
    return (
      <img
        src={photoUrl}
        alt={name ?? "User avatar"}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full font-bold",
        fallbackClassName ?? cn("bg-primary text-primary-foreground", className),
      )}
    >
      {initials}
    </span>
  );
}

