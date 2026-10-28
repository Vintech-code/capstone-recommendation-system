import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { GraduationCap, ShieldCheck } from "lucide-react";

import { ErrorState, LoadingState } from "@/components/shared";
import {
  getSharedResult,
  type ResultCardData,
} from "@/features/student/assessment/assessment-api";
import { StudentResultCard } from "@/features/student/assessment/components/student-result-card";

function SharedResultPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [card, setCard] = useState<ResultCardData | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    () => (shareToken ? "loading" : "error"),
  );
  const [errorMessage, setErrorMessage] = useState(() =>
    shareToken ? "" : "Missing or invalid share token.",
  );

  useEffect(() => {
    if (!shareToken) return;

    let active = true;

    getSharedResult(shareToken)
      .then((data) => {
        if (!active) return;
        setCard(data);
        setLoadState("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "This shared assessment result could not be found or is unavailable.",
        );
        setLoadState("error");
      });

    return () => {
      active = false;
    };
  }, [shareToken]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Public Branding Header */}
      <header
        data-print-hidden
        className="border-b border-border/80 bg-card/80 backdrop-blur-md sticky top-0 z-30"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-base font-black text-foreground hover:opacity-90 transition"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-black leading-tight tracking-tight">
                Tanauan City College
              </span>
              <span className="text-[10px] font-bold text-primary-ink">
                Career Directions & Recommendation
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 text-xs font-bold text-foreground">
              <ShieldCheck
                className="size-3.5 text-primary"
                aria-hidden="true"
              />
              Public Verification
            </span>
            <Link
              to="/"
              className="hidden sm:inline-flex rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-bold hover:bg-secondary transition"
            >
              Explore Programs
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10 sm:px-6">
        {loadState === "loading" ? (
          <div className="py-16">
            <LoadingState
              title="Verifying shared assessment result"
              description="Loading the verified Holland RIASEC interest profile..."
            />
          </div>
        ) : null}

        {loadState === "error" || !card ? (
          <div className="py-12">
            <ErrorState
              title="Assessment Result Unavailable"
              description={
                errorMessage ||
                "This shared assessment result link may have expired or is invalid. Please request an updated share link from the student."
              }
              onRetry={() => window.location.reload()}
            />
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground shadow-sm hover:opacity-95"
              >
                Return to Tanauan City College
              </Link>
            </div>
          </div>
        ) : null}

        {loadState === "ready" && card ? (
          <div className="space-y-6">
            <div data-print-hidden className="text-center sm:text-left">
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-primary-ink">
                Verified Candidate Profile
              </span>
              <h1 className="mt-1 font-display text-2xl font-black sm:text-3xl">
                {card.studentName}’s Assessment Result
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Public Holland interest code assessment record verified by
                Tanauan City College course recommendation platform.
              </p>
            </div>

            <StudentResultCard card={card} isPublic={true} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export { SharedResultPage };
