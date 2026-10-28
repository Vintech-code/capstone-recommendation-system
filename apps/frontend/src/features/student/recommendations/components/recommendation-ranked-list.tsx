import { RecommendationMatchCard } from "@/features/student/recommendations/components/recommendation-match-card";
import type { StudentRecommendationSnapshot } from "@/features/student/recommendations/recommendation-types";

interface RecommendationRankedListProps {
  snapshot: StudentRecommendationSnapshot;
  onSelectCourse: (course: StudentRecommendationSnapshot["courses"][number]) => void;
}

function RecommendationRankedList({
  snapshot,
  onSelectCourse,
}: RecommendationRankedListProps) {
  return (
    <div className="mt-12 sm:mt-16">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            All ranked matches
          </h2>
          <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground sm:text-base">
            Ranked with the current provisional programme-matching rule.
          </p>
        </div>
        <span className="inline-flex min-h-9 items-center rounded-full bg-primary px-3.5 font-label text-sm font-bold text-primary-foreground">
          {snapshot.showingAll
            ? `${snapshot.courses.length} programmes`
            : `Top ${snapshot.courses.length}`}
        </span>
      </div>
      <ol className="space-y-4 sm:space-y-5">
        {snapshot.courses.map((course, index) => (
          <li key={course.id}>
            <RecommendationMatchCard
              course={course}
              position={index + 1}
              onViewDetails={() => onSelectCourse(course)}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

export { RecommendationRankedList };
