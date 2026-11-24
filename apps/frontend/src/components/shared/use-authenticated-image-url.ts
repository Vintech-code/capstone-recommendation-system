import { useEffect, useState } from "react";

import { apiBlobRequest, apiUrl } from "@/services/api-client";

interface AuthenticatedImageState {
  source: string;
  objectUrl: string | null;
  error: Error | null;
}

function requiresAuthenticatedLoad(source: string) {
  return source.startsWith("/api/");
}

export function useAuthenticatedImageUrl(source?: string | null) {
  const [state, setState] = useState<AuthenticatedImageState | null>(null);

  useEffect(() => {
    if (!source || !requiresAuthenticatedLoad(source)) return;

    let active = true;
    let createdObjectUrl: string | null = null;

    void apiBlobRequest(source, {
      fallbackMessage: "Your profile photo could not be loaded from the server.",
    })
      .then((blob) => {
        if (!active) return;
        createdObjectUrl = URL.createObjectURL(blob);
        setState({ source, objectUrl: createdObjectUrl, error: null });
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setState({
          source,
          objectUrl: null,
          error:
            reason instanceof Error
              ? reason
              : new Error("Your profile photo could not be loaded from the server."),
        });
      });

    return () => {
      active = false;
      if (createdObjectUrl) URL.revokeObjectURL(createdObjectUrl);
    };
  }, [source]);

  if (!source) {
    return { imageUrl: null, error: null, loading: false };
  }

  if (!requiresAuthenticatedLoad(source)) {
    return { imageUrl: apiUrl(source), error: null, loading: false };
  }

  const currentState = state?.source === source ? state : null;

  return {
    imageUrl: currentState?.objectUrl ?? null,
    error: currentState?.error ?? null,
    loading: currentState === null,
  };
}
