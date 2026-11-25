import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  formatRiasecProfileDescription,
  getRiasecProfileCopy,
} from "@/features/student/assessment/riasec-profile-copy";
import type { RiasecProfileVariant } from "@/features/student/assessment/assessment-types";
import { cn } from "@/lib/utils";

interface RiasecProfileVariantsProps {
  variants: RiasecProfileVariant[];
  className?: string;
}

function RiasecProfileVariants({
  variants,
  className,
}: RiasecProfileVariantsProps) {
  const [expanded, setExpanded] = useState(false);

  if (variants.length <= 1) return null;

  return (
    <section
      className={cn("overflow-hidden rounded-2xl border border-border", className)}
      aria-labelledby="profile-variants-title"
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="profile-variants-list"
        onClick={() => setExpanded((current) => !current)}
        className="flex min-h-14 w-full items-center gap-3 bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35 sm:px-5"
      >
        <span className="min-w-0 flex-1">
          <span
            id="profile-variants-title"
            className="block font-display text-sm font-bold text-foreground sm:text-base"
          >
            View all {variants.length} tied-score results
          </span>
          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground sm:text-sm">
            Each result follows the recorded tie-expansion rule.
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      <div
        id="profile-variants-list"
        role="region"
        aria-label="Tied-score result explanations"
        hidden={!expanded}
        className="max-h-[32rem] overflow-y-auto border-t border-border bg-secondary/20"
      >
        <ul className="divide-y divide-border">
          {variants.map((variant) => {
            const copy = getRiasecProfileCopy(variant.code);

            return (
              <li key={variant.code} className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{variant.code}</Badge>
                  <p className="font-display text-sm font-bold text-foreground sm:text-base">
                    {copy?.name ?? variant.labels.join(" · ")}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/90">
                  {copy
                    ? formatRiasecProfileDescription(copy)
                    : `${variant.labels.join(", ")} form one generated RIASEC result from your recorded score tiers.`}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export { RiasecProfileVariants };
