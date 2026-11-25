import { Compass } from "lucide-react";

interface RecommendationCareerPathsProps {
  profileCode: string;
  profileCount?: number;
  careerPaths: string[];
}

function RecommendationCareerPaths({
  profileCode,
  profileCount = 1,
  careerPaths,
}: RecommendationCareerPathsProps) {
  return (
    <section
      aria-labelledby="recommended-career-paths-title"
      className="rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-7 sm:py-7 lg:col-span-2"
    >
      <div className="flex items-start gap-3 text-primary-ink">
        <Compass aria-hidden="true" className="mt-1 size-6 shrink-0" />
        <div>
          <h2
            id="recommended-career-paths-title"
            className="font-display text-2xl font-extrabold leading-tight sm:text-3xl sm:leading-tight"
          >
            Recommended career paths
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground sm:text-base">
            {profileCount > 1
              ? `Built from ${profileCount} generated tied-score results.`
              : `Built from your recorded pattern: ${profileCode}`}
          </p>
        </div>
      </div>

      {careerPaths.length > 0 ? (
        <div className="mt-7">
          <p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-primary-ink sm:text-sm">
            Career directions
          </p>
          <p className="mt-2 max-w-6xl font-display text-lg font-extrabold leading-7 text-primary-ink sm:text-xl sm:leading-8">
            {careerPaths.join(", ")}
          </p>
        </div>
      ) : (
        <p className="mt-7 text-sm font-medium leading-6 text-muted-foreground sm:text-base">
          No catalogue career directions are available for the displayed programmes.
        </p>
      )}
    </section>
  );
}

export { RecommendationCareerPaths };
