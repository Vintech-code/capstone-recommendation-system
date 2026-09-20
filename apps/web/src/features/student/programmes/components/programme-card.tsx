import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  ExternalLink,
  Eye,
  GitCompareArrows,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getProgrammeImages } from "@/features/student/programmes/programme-images";
import { programmeMediaStyle } from "@/features/student/programmes/programme-media-position";
import type {
  StudentProgramme,
  StudentProgrammeMatchContext,
} from "@/features/student/programmes/programme-types";
import { cn } from "@/lib/utils";

const RIASEC_META: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  R: {
    label: "Realistic",
    bg: "bg-[var(--riasec-r)]/15",
    text: "text-[var(--riasec-r)]",
    border: "border-[var(--riasec-r)]/30",
  },
  I: {
    label: "Investigative",
    bg: "bg-[var(--riasec-i)]/15",
    text: "text-[var(--riasec-i)]",
    border: "border-[var(--riasec-i)]/30",
  },
  A: {
    label: "Artistic",
    bg: "bg-[var(--riasec-a)]/15",
    text: "text-[var(--riasec-a)]",
    border: "border-[var(--riasec-a)]/30",
  },
  S: {
    label: "Social",
    bg: "bg-[var(--riasec-s)]/15",
    text: "text-[var(--riasec-s)]",
    border: "border-[var(--riasec-s)]/30",
  },
  E: {
    label: "Enterprising",
    bg: "bg-[var(--riasec-e)]/15",
    text: "text-[var(--riasec-e)]",
    border: "border-[var(--riasec-e)]/30",
  },
  C: {
    label: "Conventional",
    bg: "bg-[var(--riasec-c)]/15",
    text: "text-[var(--riasec-c)]",
    border: "border-[var(--riasec-c)]/30",
  },
};

function CardDatum({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon
          aria-hidden="true"
          className="size-3.5 shrink-0 text-primary-ink"
        />
        <span className="truncate">{label}</span>
      </dt>
      <dd
        className="mt-0.5 truncate font-semibold text-foreground"
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

interface ProgrammeCardProps {
  programme: StudentProgramme;
  matchContext?: StudentProgrammeMatchContext;
  saved: boolean;
  saving: boolean;
  selectedForComparison: boolean;
  comparisonDisabled: boolean;
  priority: boolean;
  onSelect: () => void;
  onToggleSaved: () => void;
  onToggleComparison: () => void;
}

function ProgrammeCard({
  programme,
  matchContext,
  saved,
  saving,
  selectedForComparison,
  comparisonDisabled,
  priority,
  onSelect,
  onToggleSaved,
  onToggleComparison,
}: ProgrammeCardProps) {
  const fallback = getProgrammeImages(programme.id);
  const cover = programme.coverImageUrl || fallback.cover;
  const coverStyle = programme.coverImageUrl
    ? programmeMediaStyle(programme.coverImagePosition)
    : undefined;
  const primaryCareer = programme.careerDirections[0] || "Various pathways";
  const programmeType =
    programme.eligibilityGroup === "non_board"
      ? "Non-board programme"
      : "Board programme";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xs transition-colors hover:border-primary/40">
      <div className="relative h-44 w-full overflow-hidden bg-surface-subtle sm:h-48">
        {cover ? (
          <img
            src={cover}
            alt={`${programme.name} programme`}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            style={coverStyle}
            className={cn(
              "size-full object-cover transition-transform duration-300",
              coverStyle ? "" : "object-top group-hover:scale-105",
            )}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/10">
            <BookOpen
              aria-hidden="true"
              className="size-12 text-primary-ink/25"
            />
          </div>
        )}
        <button
          type="button"
          disabled={saving}
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${programme.name} from saved programmes`
              : `Save ${programme.name}`
          }
          onClick={onToggleSaved}
          className="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-xs border border-white/80 bg-card/90 text-primary-ink shadow-xs backdrop-blur-xs transition hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {saved ? (
            <BookmarkCheck aria-hidden="true" className="size-4 text-primary" />
          ) : (
            <Bookmark aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
            {programme.code}
          </span>
          <div
            className="flex shrink-0 items-center gap-1"
            aria-label={`RIASEC profile ${programme.riasecProfile.slice(0, 3).join(", ")}`}
          >
            {programme.riasecProfile.slice(0, 3).map((code) => {
              const meta = RIASEC_META[code] ?? {
                label: code,
                bg: "bg-primary-fixed",
                text: "text-on-primary-fixed",
                border: "border-primary/20",
              };
              return (
                <span
                  key={code}
                  title={`${code} · ${meta.label}`}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-xs text-[11px] font-bold border",
                    meta.bg,
                    meta.text,
                    meta.border,
                  )}
                >
                  {code}
                </span>
              );
            })}
          </div>
        </div>

        <h3
          onClick={onSelect}
          className="mt-1 cursor-pointer font-display text-base font-bold leading-snug text-foreground line-clamp-1 group-hover:text-primary-ink transition-colors"
        >
          {programme.name}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {programme.description}
        </p>

        {matchContext ? (
          <div className="mt-2.5 rounded-xs bg-primary-fixed/65 px-2.5 py-1.5 text-xs text-on-primary-fixed">
            <strong>{matchContext.match}% match</strong>
            <span className="ml-1.5">
              Why this matches me:{" "}
              {matchContext.factors[0] ||
                "Aligned with your recorded RIASEC profile."}
            </span>
          </div>
        ) : null}

        <dl className="mt-3 grid grid-cols-2 gap-2 rounded-xs border border-border/70 bg-surface-subtle/50 p-2.5 text-xs">
          <CardDatum
            icon={Clock3}
            label="Duration"
            value={programme.duration?.display || "Not published"}
          />
          <CardDatum
            icon={GraduationCap}
            label="Degree type"
            value={programme.degreeType || "Not published"}
          />
          <CardDatum
            icon={ShieldCheck}
            label="Programme type"
            value={programmeType}
          />
          <CardDatum
            icon={BriefcaseBusiness}
            label="Career field"
            value={primaryCareer}
          />
        </dl>

        <div className="mt-auto pt-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
            {programme.duration?.source_url ? (
              <a
                href={programme.duration.source_url}
                target="_blank"
                rel="noreferrer"
                aria-label="CHED source"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-ink underline underline-offset-4 hover:text-primary"
              >
                <span className="truncate max-w-[110px]">
                  {programme.duration.source_name || "CHED source"}
                </span>
                <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">
                No duration source published
              </span>
            )}
            <div className="flex items-center gap-1.5 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-xs px-2.5 text-xs"
                onClick={onSelect}
                aria-label={`View programme details: ${programme.name}`}
              >
                <Eye aria-hidden="true" className="size-3.5" />
                View details
              </Button>
              <Button
                type="button"
                size="sm"
                variant={selectedForComparison ? "secondary" : "default"}
                disabled={comparisonDisabled}
                aria-pressed={selectedForComparison}
                onClick={onToggleComparison}
                className={cn(
                  "h-8 rounded-xs px-2.5 text-xs font-semibold shadow-xs",
                  !selectedForComparison &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <GitCompareArrows aria-hidden="true" className="size-3.5" />
                {selectedForComparison
                  ? "Selected to compare"
                  : "Add to comparison"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export { ProgrammeCard };
export type { ProgrammeCardProps };
