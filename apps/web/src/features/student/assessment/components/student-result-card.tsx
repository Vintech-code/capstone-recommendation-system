import { useState } from "react";
import {
  Award,
  Calendar,
  Check,
  Download,
  Hash,
  Share2,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  shareAssessmentResult,
  type ResultCardData,
} from "@/features/student/assessment/assessment-api";
import { formatAssessmentDate } from "@/features/student/assessment/assessment-result-mapper";

interface StudentResultCardProps {
  card: ResultCardData;
  onShare?: () => Promise<{ shareToken: string; shareUrl: string }> | void;
  isPublic?: boolean;
  onClose?: () => void;
  className?: string;
}

const dimensionMeta: Record<
  string,
  { bg: string; text: string; bar: string; label: string }
> = {
  R: {
    label: "Realistic",
    bg: "bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
    bar: "bg-orange-500",
  },
  I: {
    label: "Investigative",
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400",
    bar: "bg-sky-500",
  },
  A: {
    label: "Artistic",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    bar: "bg-rose-500",
  },
  S: {
    label: "Social",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  E: {
    label: "Enterprising",
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    bar: "bg-purple-500",
  },
  C: {
    label: "Conventional",
    bg: "bg-teal-500/10",
    text: "text-teal-700 dark:text-teal-400",
    bar: "bg-teal-500",
  },
};

function StudentResultCard({
  card,
  onShare,
  isPublic = false,
  onClose,
  className = "",
}: StudentResultCardProps) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const dateLabel = formatAssessmentDate(
    card.resultAvailableAt ?? card.submittedAt ?? card.startedAt,
  );

  async function handleShare() {
    setSharing(true);
    try {
      let shareUrl = "";
      if (onShare) {
        const res = await onShare();
        if (res?.shareUrl) shareUrl = res.shareUrl;
      } else if (card.shareToken) {
        shareUrl = `${window.location.origin}/results/shared/${card.shareToken}`;
      } else {
        const res = await shareAssessmentResult(card.id);
        shareUrl =
          res.shareUrl ||
          `${window.location.origin}/results/shared/${res.shareToken}`;
      }

      if (!shareUrl && card.shareToken) {
        shareUrl = `${window.location.origin}/results/shared/${card.shareToken}`;
      }

      if (
        navigator.share &&
        /mobile|android|iphone|ipad/i.test(navigator.userAgent)
      ) {
        try {
          await navigator.share({
            title: `TCC RIASEC Result - ${card.studentName}`,
            text: `View my RIASEC interest assessment result (${card.topCode}) at Tanauan City College.`,
            url: shareUrl,
          });
          return;
        } catch (shareErr) {
          // If user aborted or not supported, continue to clipboard
          if ((shareErr as Error).name === "AbortError") return;
        }
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Share link copied to clipboard!", {
          description:
            "Anyone with this link can view this verified result card.",
        });
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      toast.error("Could not generate share link", {
        description: "Please check your network connection and try again.",
      });
    } finally {
      setSharing(false);
    }
  }

  function handleDownload() {
    const prevTitle = document.title;
    document.title = `tccense-result-${card.reference}-attempt-${card.attemptNumber}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  }

  return (
    <div
      className={`mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm print:m-0 print:w-full print:max-w-none print:rounded-none print:border-none print:shadow-none ${className}`}
    >
      {/* Top action bar - Hidden during print */}
      <div
        data-print-hidden
        className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-secondary/40 px-5 py-3.5 sm:px-7"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex size-2 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-muted-foreground">
            {isPublic
              ? "Public Shared Result"
              : "Official Assessment Result Card"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={sharing}
            className="h-9 gap-1.5 rounded-full px-4 text-xs font-bold"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-primary" aria-hidden="true" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="size-3.5" aria-hidden="true" />
                {sharing ? "Generating…" : "Share Result"}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-9 gap-1.5 rounded-full px-4 text-xs font-bold"
          >
            <Download className="size-3.5" aria-hidden="true" />
            Download (PDF)
          </Button>

          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-9 rounded-full"
              aria-label="Close result card"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Main Printable Card Body */}
      <div className="p-6 sm:p-9">
        {/* Institutional Header */}
        <div className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Card Header */}
        <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-primary-ink">
              Tanauan City College · Course Recommendation System
            </p>
            <h2 className="mt-1 font-display text-2xl font-black text-foreground sm:text-3xl">
            <h2 className="font-display text-2xl font-black text-foreground sm:text-3xl">
              RIASEC Interest Profile
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Self-reported vocational preference alignment and programme
              matching evidence
              Official vocational preference and career interest assessment
              record
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary-ink">
              <ShieldCheck
                className="size-3.5 text-primary"
                aria-hidden="true"
              />
              Attempt {card.attemptNumber}
            </span>
            {card.isCurrent ? (
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-foreground">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                Current Record
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground border border-border/60">
                Historical Retake
              </span>
            )}
          </div>
        </div>

        {/* Candidate & Metadata Summary */}
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-secondary/35 p-4 sm:grid-cols-4 sm:gap-4 sm:p-5">
        <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-secondary/30 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5 border border-border/60">
          <div className="flex items-start gap-2.5">
            <User
              className="mt-0.5 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Student Name
              </span>
              <span className="mt-0.5 block text-xs font-extrabold text-foreground sm:text-sm">
                {card.studentName}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Hash
              className="mt-0.5 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Reference
              </span>
              <span className="mt-0.5 block font-mono text-xs font-bold text-foreground sm:text-sm">
                {card.reference}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar
              className="mt-0.5 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Completed Date
              </span>
              <span className="mt-0.5 block text-xs font-bold text-foreground sm:text-sm">
                {dateLabel}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Award
              className="mt-0.5 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Methodology
              </span>
              <span className="mt-0.5 block text-xs font-bold text-foreground sm:text-sm">
                {card.guidanceVersion}
              </span>
            </div>
          </div>
        </div>

        {/* Prominent RIASEC Code Section */}
        <div className="mt-6 flex flex-col gap-6 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-accent/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="mt-5 flex flex-col gap-5 rounded-2xl border border-primary/20 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.14em] text-primary-ink">
              Primary Holland Code
              Dominant Holland Code
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-display text-4xl font-black tracking-wider text-primary-ink sm:text-5xl">
              <span className="font-display text-4xl font-black tracking-wider text-foreground sm:text-5xl">
                {card.topCode}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                ({card.formattedTopCode})
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Your highest reported interest alignment in order of statement
              agreement:
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            {card.topDimensions.map((dim, idx) => {
              const meta = dimensionMeta[dim.code];
              const rankLabels = ["Primary", "Secondary", "Tertiary"];
              return (
                <div
                  key={dim.code}
                  className="flex items-center gap-2 rounded-xl bg-card/90 px-3.5 py-1.5 shadow-sm ring-1 ring-border/60"
                  className="flex items-center gap-2 rounded-xl bg-card px-3 py-1.5 shadow-2xs border border-border/70"
                >
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {rankLabels[idx] ?? `#${idx + 1}`}:
                  </span>
                  <span
                    className={`inline-flex size-5 items-center justify-center rounded-full text-xs font-black ${meta?.bg ?? "bg-muted"} ${meta?.text ?? "text-foreground"}`}
                  >
                    {dim.code}
                  </span>
                  <span className="text-xs font-extrabold text-foreground">
                  <span className="text-xs font-bold text-foreground">
                    {dim.label}
                  </span>
                  <span className="text-xs font-bold text-primary-ink">
                  <span className="text-xs font-extrabold text-foreground ml-1">
                    {dim.value}/7
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6 Dimensions Breakdown */}
        <div className="mt-7">
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
              Complete RIASEC Dimension Breakdown
            </h3>
            <span className="text-xs text-muted-foreground">Max score: 7</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="mt-3.5 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {card.dimensions.map((dim) => {
              const meta = dimensionMeta[dim.code];
              const pct = Math.min(100, Math.round((dim.value / 7) * 100));

              return (
                <div
                  key={dim.code}
                  className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs transition hover:border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex size-7 items-center justify-center rounded-lg text-xs font-black ${meta?.bg ?? "bg-muted"} ${meta?.text ?? "text-foreground"}`}
                      >
                        {dim.code}
                      </span>
                      <div>
                        <span className="block text-xs font-extrabold text-foreground">
                          {dim.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Dimension {dim.code}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-foreground">
                        {dim.value}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        / 7
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary/80">
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary/80">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${meta?.bar ?? "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Institutional & Methodology Footnote */}
        <div className="mt-7 rounded-2xl border border-border/80 bg-secondary/25 p-4 sm:p-5">
        {/* Guidance Footnote */}
        <div className="mt-6 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-primary-ink"
              aria-hidden="true"
            />
            <div className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
              <p className="font-bold text-foreground">
                Institutional Guidance Disclaimer
                Assessment Guidance Note
              </p>
              <p>{card.disclaimer}</p>
              <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground/85 border-t border-border/60">
                <span>Instrument: {card.scoringVersion}</span>
                <span>Guidance Snapshot: {card.guidanceVersion}</span>
                {card.sharedAt ? (
                  <span>Shared: {formatAssessmentDate(card.sharedAt)}</span>
                ) : null}
              </div>
              {card.sharedAt ? (
                <p className="pt-1.5 text-[11px] text-muted-foreground/80 border-t border-border/50">
                  Shared on: {formatAssessmentDate(card.sharedAt)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { StudentResultCard };
export type { StudentResultCardProps };
