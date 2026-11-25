import { useRef, useState } from "react";
import {
  Calendar,
  Check,
  Download,
  Hash,
  LoaderCircle,
  Share2,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import { appToast } from "@/components/ui/app-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  shareAssessmentResult,
  type ResultCardData,
} from "@/features/student/assessment/assessment-api";
import { formatAssessmentDate } from "@/features/student/assessment/assessment-result-mapper";
import {
  formatRiasecProfileDescription,
  getRiasecProfileCopy,
} from "@/features/student/assessment/riasec-profile-copy";
import { RiasecProfileVariants } from "@/features/student/assessment/components/riasec-profile-variants";

interface StudentResultCardProps {
  card: ResultCardData;
  onShare?: () => Promise<{ shareToken: string; shareUrl: string }> | void;
  isPublic?: boolean;
  onClose?: () => void;
  className?: string;
}

const dimensionMeta: Record<
  string,
  { surface: string; bar: string; label: string }
> = {
  R: {
    label: "Realistic",
    surface: "bg-riasec-r/15",
    bar: "bg-riasec-r",
  },
  I: {
    label: "Investigative",
    surface: "bg-riasec-i/15",
    bar: "bg-riasec-i",
  },
  A: {
    label: "Artistic",
    surface: "bg-riasec-a/15",
    bar: "bg-riasec-a",
  },
  S: {
    label: "Social",
    surface: "bg-riasec-s/15",
    bar: "bg-riasec-s",
  },
  E: {
    label: "Enterprising",
    surface: "bg-riasec-e/15",
    bar: "bg-riasec-e",
  },
  C: {
    label: "Conventional",
    surface: "bg-riasec-c/15",
    bar: "bg-riasec-c",
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
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const dateLabel = formatAssessmentDate(
    card.resultAvailableAt ?? card.submittedAt ?? card.startedAt,
  );
  const profileCopy = getRiasecProfileCopy(card.topCode);

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
            title: `RIASEC Result - ${card.studentName}`,
            text: `View my RIASEC interest assessment result (${card.topCode}).`,
            url: shareUrl,
          });
          return;
        } catch (shareErr) {
          if ((shareErr as Error).name === "AbortError") return;
        }
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        appToast.success(
          "Share link copied to clipboard!",
          "Anyone with this link can view this recorded result card.",
        );
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      appToast.error(
        "Could not generate share link",
        "Please check your network connection and try again.",
      );
    } finally {
      setSharing(false);
    }
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      if (document.fonts) await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const node = cardRef.current;
      const dataUrl = await toPng(node, {
        backgroundColor: "#FBFFF7",
        cacheBust: true,
        height: node.scrollHeight,
        pixelRatio: 2,
        skipFonts: true,
        width: node.scrollWidth,
        style: {
          maxHeight: "none",
          overflow: "visible",
        },
        filter: (element) =>
          !(element instanceof HTMLElement && element.hasAttribute("data-card-action")),
      });
      const link = document.createElement("a");
      link.download = `assessment-result-${card.reference}-attempt-${card.attemptNumber}.png`;
      link.href = dataUrl;
      document.body.append(link);
      link.click();
      link.remove();
      appToast.success(
        "Result card downloaded",
        "The complete assessment card was saved as a PNG image.",
      );
    } catch {
      appToast.error(
        "Could not download the result card",
        "Please try again after the card finishes loading.",
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      ref={cardRef}
      data-assessment-result-card
      className={cn(
        "mx-auto w-full max-w-4xl rounded-3xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div
        className="sticky top-0 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-t-3xl border-b border-border/80 bg-card/95 px-4 py-3 backdrop-blur-sm sm:flex sm:justify-start sm:px-7 sm:py-3.5"
      >
        <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-2 sm:mr-auto">
          <span className="inline-flex size-2 rounded-full bg-primary" />
          <span className="truncate text-xs font-semibold text-muted-foreground">
            {isPublic
              ? "Shared Assessment Result"
              : "Recorded Assessment Result Card"}
          </span>
        </div>
        <div data-card-action className="col-span-2 row-start-2 grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={sharing || downloading}
            className="h-9 gap-1.5 rounded-full px-4 text-xs font-bold"
          >
            {copied ? (
              <>
                <Check data-icon="inline-start" aria-hidden="true" />
                Copied!
              </>
            ) : (
              <>
                <Share2 data-icon="inline-start" aria-hidden="true" />
                {sharing ? "Generating…" : "Share Result"}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleDownload()}
            disabled={sharing || downloading}
            className="h-9 gap-1.5 rounded-full px-4 text-xs font-bold"
          >
            {downloading ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
              <Download data-icon="inline-start" aria-hidden="true" />
            )}
            {downloading ? "Preparing card…" : "Download card"}
          </Button>

        </div>
        {onClose ? (
          <Button
            data-card-action
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="col-start-2 row-start-1 size-9 rounded-full"
            aria-label="Close result card"
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {/* Main Printable Card Body */}
      <div className="p-6 sm:p-9">
        {/* Card Header */}
        <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-black text-foreground sm:text-3xl">
              RIASEC Interest Profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Recorded RIASEC interest assessment result
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
            <Badge variant="success">
              <ShieldCheck aria-hidden="true" />
              Attempt {card.attemptNumber}
            </Badge>
            {card.isCurrent ? (
              <Badge variant="success">
                Current Record
              </Badge>
            ) : (
              <Badge variant="secondary">
                Historical Retake
              </Badge>
            )}
          </div>
        </div>

        {/* Candidate & Metadata Summary */}
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
        </div>

        {/* Prominent RIASEC Code Section */}
        <div className="mt-5 flex flex-col gap-5 rounded-2xl border border-primary/20 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.14em] text-primary-ink">
              Recorded interest pattern
            </span>
            {profileCopy && (card.profileVariants?.length ?? 0) <= 1 ? (
              <h3 className="mt-1 font-display text-2xl font-black text-foreground sm:text-3xl">
                {profileCopy.name}
              </h3>
            ) : null}
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-display text-4xl font-black tracking-wider text-foreground sm:text-5xl">
                {card.topCode}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                ({card.formattedTopCode})
              </span>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              {(card.profileVariants?.length ?? 0) > 1
                ? `${card.profileVariants?.length} result variants were generated from the tied score tiers.`
                : profileCopy
                  ? formatRiasecProfileDescription(profileCopy)
                : "Your highest reported interest alignment in order of statement agreement."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            {card.topDimensions.map((dim, idx) => {
              const meta = dimensionMeta[dim.code];
              const rankLabels = ["Primary", "Secondary", "Tertiary"];
              const position = dim.rank ?? idx + 1;
              const rankLabel = rankLabels[position - 1] ?? `#${position}`;
              return (
                <div
                  key={dim.code}
                    className="flex min-w-56 items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 shadow-xs"
                >
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {dim.isTied ? `Shared ${rankLabel.toLowerCase()}` : rankLabel}:
                  </span>
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-xs font-black text-foreground",
                      meta?.surface ?? "bg-muted",
                    )}
                  >
                    {dim.code}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {dim.label}
                  </span>
                  <span className="ml-auto text-xs font-extrabold text-foreground">
                    {dim.value}/7
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <RiasecProfileVariants
          variants={card.profileVariants ?? []}
          className="mt-3"
        />

        {/* 6 Dimensions Breakdown */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
              Complete RIASEC Dimension Breakdown
            </h3>
            <span className="text-xs text-muted-foreground">Max score: 7</span>
          </div>

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
                        className={cn(
                          "inline-flex size-8 items-center justify-center rounded-lg text-xs font-black text-foreground",
                          meta?.surface ?? "bg-muted",
                        )}
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

                  <Progress
                    value={pct}
                    aria-label={`${dim.label}: ${dim.value} out of 7`}
                    className="mt-2.5"
                    indicatorClassName={meta?.bar ?? "bg-primary"}
                  />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export { StudentResultCard };
export type { StudentResultCardProps };
