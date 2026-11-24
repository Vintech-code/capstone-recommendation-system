import { ChevronDown, Target } from "lucide-react";
import { useState } from "react";

import type { AssessmentDisplayResult } from "@/features/student/assessment/assessment-types";
import type {
  StudentRecommendationEvidenceArea,
  StudentRecommendationProfile,
} from "@/features/student/recommendations/recommendation-types";

type ResultProfile = StudentRecommendationProfile | AssessmentDisplayResult;

interface RecommendationFitExplanationsProps {
  courseName: string;
  areas: StudentRecommendationEvidenceArea[];
  profile: ResultProfile | null;
  courseInterestAreas?: string[];
}

const dimensionColors: Record<string, string> = {
  R: "var(--riasec-r)",
  I: "var(--riasec-i)",
  A: "var(--riasec-a)",
  S: "var(--riasec-s)",
  E: "var(--riasec-e)",
  C: "var(--riasec-c)",
};

function scoreExplanation(
  area: StudentRecommendationEvidenceArea,
  minimum?: number,
  maximum?: number,
) {
  if (minimum === 0 && maximum === 7) {
    return `You selected Agree on ${area.score} of the 7 assessment statements mapped to ${area.label}.`;
  }

  if (typeof maximum === "number") {
    return `This assessment version recorded ${area.score} out of ${maximum} for ${area.label}.`;
  }

  return `Your completed assessment recorded a score of ${area.score} for ${area.label}.`;
}

function RecommendationFitExplanations({
  courseName,
  areas,
  profile,
  courseInterestAreas,
}: RecommendationFitExplanationsProps) {
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());

  const toggleArea = (code: string) => {
    setExpandedCodes((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  return (
    <section aria-labelledby="fit-reasons-title" className="space-y-3.5">
      <div className="flex items-center gap-2.5">
        <Target aria-hidden="true" className="size-5 text-primary-ink" />
        <div>
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Assessment connection
          </p>
          <h2
            id="fit-reasons-title"
            className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl"
          >
            Why this fits you
          </h2>
        </div>
      </div>

      {areas.length > 0 ? (
        <>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Open an interest area to see how your recorded assessment result
            contributes to this programme match.
          </p>
          <ul className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-sm divide-y divide-border/60">
            {areas.map((area) => {
              const isExpanded = expandedCodes.has(area.code);
              const dimension = profile?.dimensions.find(
                (item) => item.code === area.code,
              );
              const guidance = profile?.guidance?.explanations[area.code as keyof typeof profile.guidance.explanations];
              const contentId = `fit-explanation-${area.code.toLowerCase()}`;

              return (
                <li key={area.code}>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                    aria-label={`Explain ${area.label} result`}
                    onClick={() => toggleArea(area.code)}
                    className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35 sm:px-5"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-label text-xs font-bold text-foreground"
                      style={{
                        boxShadow: `inset 0 0 0 2px ${dimensionColors[area.code] ?? "var(--primary)"}`,
                      }}
                    >
                      {area.code}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-bold text-foreground sm:text-base">
                        {area.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground sm:text-sm">
                        Recorded score: {area.score}
                        {typeof dimension?.maximum === "number"
                          ? ` of ${dimension.maximum}`
                          : ""}
                      </span>
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div
                    id={contentId}
                    role="region"
                    aria-label={`${area.label} result explanation`}
                    hidden={!isExpanded}
                    className="border-t border-border/60 bg-secondary/30 px-4 py-4 sm:px-5 sm:py-5"
                  >
                    <dl className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <dt className="font-label text-xs font-bold text-primary-ink">
                          How your score was formed
                        </dt>
                        <dd className="mt-1.5 text-sm leading-6 text-foreground/90">
                          {scoreExplanation(
                            area,
                            dimension?.minimum,
                            dimension?.maximum,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-label text-xs font-bold text-primary-ink">
                          What this area describes
                        </dt>
                        <dd className="mt-1.5 text-sm leading-6 text-foreground/90">
                          {guidance ??
                            "No category explanation was stored with this assessment version."}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-label text-xs font-bold text-primary-ink">
                          Why it affects this match
                        </dt>
                        <dd className="mt-1.5 text-sm leading-6 text-foreground/90">
                          {!courseInterestAreas ||
                          courseInterestAreas.length === 0 ||
                          courseInterestAreas.includes(area.code)
                            ? `${area.label} is one of ${courseName}'s configured RIASEC areas, so this recorded score contributes to the programme match.`
                            : `${area.label} is one of your leading assessment results. Although not one of ${courseName}'s primary configured areas, all recorded interest scores are compared across the programme catalogue.`}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
            These explanations summarize recorded interest responses. They do
            not measure ability or guarantee programme success.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No recorded interest-area evidence is available for this
          recommendation.
        </p>
      )}
    </section>
  );
}

export { RecommendationFitExplanations };
