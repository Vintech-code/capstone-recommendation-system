import { ArrowRight, CalendarDays, RefreshCw } from "lucide-react";

import resultIllustration from "@/assets/student-interest-result-v1.webp";
import { Button } from "@/components/ui/button";
import type { AssessmentDisplayResult } from "@/features/student/assessment/assessment-types";
import { formatAssessmentDate } from "@/features/student/assessment/assessment-result-mapper";
import {
  formatRiasecProfileDescription,
  getRiasecProfileCopy,
} from "@/features/student/assessment/riasec-profile-copy";
import type {
  StudentRecommendationProfile,
  StudentRecommendationSnapshot,
} from "@/features/student/recommendations/recommendation-types";
import { getLeadingDimensions } from "@/features/student/recommendations/utils/recommendation-result-utils";
import { formatAreaList } from "@/features/student/utils/format-area-list";

type ResultProfile = StudentRecommendationProfile | AssessmentDisplayResult;

interface RecommendationResultsSummaryProps {
  profile: ResultProfile | null;
  snapshot: StudentRecommendationSnapshot;
  canRetake: boolean;
  canShare?: boolean;
  resultCardLoading?: boolean;
  resultCardError?: string;
  onRetake: () => void;
  onExploreProgrammes: () => void;
  onShareResult?: () => void;
}

function RecommendationResultsSummary({
  profile,
  snapshot,
  canRetake,
  onRetake,
  onExploreProgrammes,
}: RecommendationResultsSummaryProps) {
  const leadingDimensions = profile ? getLeadingDimensions(profile) : [];
  const profileCopy = profile ? getRiasecProfileCopy(profile.topCode) : null;

  return (
    <section
      className="flex min-w-0 flex-col"
      aria-labelledby="recommendation-result-title"
    >
      <div className="relative mx-auto aspect-square w-52 overflow-hidden rounded-[2rem] border-2 border-primary/20 bg-primary-fixed/30 p-3 shadow-sm sm:w-60">
        <div
          aria-hidden="true"
          className="absolute inset-x-4 bottom-2 h-10 rounded-full bg-primary-fixed/60 blur-lg"
        />
        <img
          src={resultIllustration}
          alt=""
          className="relative size-full object-contain"
        />
      </div>

      {profile ? (
        <>
          <h1
            id="recommendation-result-title"
            className="mt-5 max-w-2xl font-display text-3xl font-black leading-[0.98] tracking-[-0.045em] text-primary-ink sm:text-4xl lg:text-5xl"
          >
            {profileCopy?.name ?? formatAreaList(profile.topLabels)}
          </h1>
          <p className="mt-3 font-label text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm">
            {leadingDimensions
              .map((dimension) => dimension.label.toUpperCase())
              .join(" AND ")}{" "}
            · {profile.topCode}
          </p>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-foreground/90 sm:text-lg sm:leading-8">
            {profileCopy
              ? formatRiasecProfileDescription(profileCopy)
              : leadingDimensions.length === 3
              ? `Your three leading recorded areas are ${leadingDimensions[0].label.toLowerCase()}, ${leadingDimensions[1].label.toLowerCase()}, and ${leadingDimensions[2].label.toLowerCase()}. Programme matches compare all six recorded scores with each programme's three-area profile.`
              : "These are the interest areas with the highest recorded counts in your completed assessment."}
          </p>
          {leadingDimensions.length > 0 ? (
            <div className="mt-6">
              <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm">
                Your leading areas
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {leadingDimensions.map((dimension) => (
                  <span
                    key={dimension.code}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary-fixed px-4 py-1.5 font-label text-sm font-semibold text-on-primary-fixed sm:text-base"
                  >
                    {dimension.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <h1
            id="recommendation-result-title"
            className="mt-5 font-display text-3xl font-black leading-[0.98] tracking-[-0.045em] text-primary-ink sm:text-4xl lg:text-5xl"
          >
            Your academic matches
          </h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Compare the programmes generated from your completed assessment.
          </p>
        </>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground sm:text-base">
        <span className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" className="size-4" />
          Generated {formatAssessmentDate(snapshot.generatedAt)}
        </span>
        {snapshot.entranceExamination ? (
          <span>
            Programme group:{" "}
            <strong className="font-semibold text-foreground">
              {snapshot.entranceExamination.eligibilityGroup === "board"
                ? "Board programmes"
                : "Non-board programmes"}
            </strong>
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {canRetake ? (
          <Button
            type="button"
            variant="outline"
            onClick={onRetake}
            className="gap-2"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Retake assessment
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={onExploreProgrammes}
          className="gap-2"
        >
          Explore all programmes
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </section>
  );
}

export { RecommendationResultsSummary };
export type { ResultProfile };
