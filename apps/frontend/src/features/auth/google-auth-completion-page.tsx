import { useEffect, useMemo, useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { useSearchParams } from "react-router";

import type { AccessRole } from "@/features/auth/access-types";
import {
  getGoogleAuthChannelName,
  type GoogleAuthMessage,
} from "@/features/auth/google-auth-navigation";

function GoogleAuthCompletionPage() {
  const [searchParams] = useSearchParams();
  const [closeFailed, setCloseFailed] = useState(false);
  const completion = useMemo(() => {
    const flow = searchParams.get("flow") ?? "";
    const portalValue = searchParams.get("portal");
    const statusValue = searchParams.get("status");
    const portal: AccessRole = portalValue === "admin" ? "admin" : "student";
    const status = statusValue === "success" ? "success" : "error";

    return {
      flow,
      message: {
        type: "google-auth-complete",
        flow,
        portal,
        status,
        error: searchParams.get("google_error") ?? undefined,
      } satisfies GoogleAuthMessage,
    };
  }, [searchParams]);
  const cannotNotifyOriginalTab =
    !completion.flow || typeof BroadcastChannel === "undefined";

  useEffect(() => {
    if (cannotNotifyOriginalTab) return;

    let channel: BroadcastChannel;
    try {
      channel = new BroadcastChannel(
        getGoogleAuthChannelName(completion.flow),
      );
      channel.postMessage(completion.message);
      channel.close();
    } catch {
      return;
    }

    const closeTimer = window.setTimeout(() => {
      window.close();
      setCloseFailed(true);
    }, 150);

    return () => window.clearTimeout(closeTimer);
  }, [cannotNotifyOriginalTab, completion]);

  const succeeded = completion.message.status === "success";

  return (
    <main className="grid min-h-svh place-items-center bg-background p-4">
      <section
        aria-labelledby="google-auth-completion-title"
        className="w-full max-w-md rounded-card border border-border bg-card p-8 text-center shadow-sm"
      >
        {succeeded ? (
          <CircleCheck
            aria-hidden="true"
            className="mx-auto size-10 text-primary-ink"
          />
        ) : (
          <CircleX
            aria-hidden="true"
            className="mx-auto size-10 text-destructive-ink"
          />
        )}
        <h1
          id="google-auth-completion-title"
          className="mt-4 text-2xl font-bold text-foreground"
        >
          {succeeded ? "Google sign-in complete" : "Google sign-in stopped"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {cannotNotifyOriginalTab || closeFailed
            ? "Return to the original TCC course-recommendation tab, then close this tab."
            : "Returning you to the TCC course-recommendation system."}
        </p>
      </section>
    </main>
  );
}

export { GoogleAuthCompletionPage };
