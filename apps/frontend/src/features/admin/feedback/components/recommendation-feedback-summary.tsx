import { MessageSquareText, ShieldCheck, Star } from "lucide-react";

import type { AdminRecommendationFeedback } from "@/features/admin/data/admin-api";
import { formatDate } from "@/features/admin/data/admin-formatters";

interface RecommendationFeedbackSummaryProps {
  feedback: AdminRecommendationFeedback;
}

const ratings = [5, 4, 3, 2, 1] as const;

function RecommendationFeedbackSummary({
  feedback,
}: RecommendationFeedbackSummaryProps) {
  return (
    <section
      aria-labelledby="recommendation-feedback-heading"
      className="border-y border-border py-6"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="font-label text-xs font-bold uppercase tracking-wider text-primary-ink">
            Student experience signal
          </p>
          <h2
            id="recommendation-feedback-heading"
            className="mt-1 font-display text-2xl font-black text-foreground"
          >
            Recommendation interest-match feedback
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Aggregates reflect how well recommendations matched Students&apos;
            stated interests. They do not validate outcomes or change programme
            rankings. Submitted comments are available below for authorized
            review.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 text-primary-ink" />
          <span>Available from the first Student response</span>
        </div>
      </div>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-xs border border-border bg-border sm:grid-cols-3">
        <FeedbackMetric
          label="Published responses"
          value={feedback.publishedResponseCount}
        />
        <FeedbackMetric
          label="Distinct Students"
          value={feedback.publishedRespondentCount}
        />
        <FeedbackMetric
          label="Programmes with feedback"
          value={feedback.eligibleProgrammeCount}
        />
      </dl>

      {feedback.programmes.length > 0 ? (
        <div className="mt-6 divide-y divide-border border-y border-border">
          {feedback.programmes.map((programme) => (
            <article
              key={programme.programmeId}
              className="grid gap-5 py-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(10rem,0.5fr)_minmax(18rem,1fr)] lg:items-center"
            >
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {programme.programmeName}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {programme.respondentCount} distinct Student
                  {programme.respondentCount === 1 ? " response" : " responses"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Average match
                </p>
                <p className="mt-1 flex items-center gap-2 font-display text-2xl font-black text-foreground">
                  <Star aria-hidden="true" className="size-5 fill-warning text-warning-ink" />
                  {programme.averageRating.toFixed(1)}
                  <span className="font-label text-xs font-semibold text-muted-foreground">
                    / 5
                  </span>
                </p>
              </div>

              <div aria-label={`Rating distribution for ${programme.programmeName}`}>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Rating distribution
                </p>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {ratings.map((rating) => {
                    const count = programme.ratingDistribution[String(rating) as keyof typeof programme.ratingDistribution];
                    return (
                      <div key={rating} className="text-center">
                        <div className="flex h-12 items-end rounded-sm bg-secondary p-1">
                          <div
                            className="w-full rounded-xs bg-primary"
                            style={{
                              height:
                                count === 0
                                  ? "0%"
                                  : `${Math.max(8, (count / programme.respondentCount) * 100)}%`,
                            }}
                          />
                        </div>
                        <p
                          aria-label={`${rating} star ratings`}
                          className="mt-1 flex items-center justify-center gap-0.5 text-xs font-bold text-foreground"
                        >
                          {rating}
                          <Star aria-hidden="true" className="size-3 fill-warning text-warning-ink" />
                        </p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {count}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 border-y border-border py-8 text-center">
          <p className="font-display text-lg font-bold text-foreground">
            No recommendation feedback yet
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            No Student feedback was saved in this date range.
          </p>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <MessageSquareText aria-hidden="true" className="size-5 text-primary-ink" />
              Student comments
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {feedback.commentCount.toLocaleString()} comment
              {feedback.commentCount === 1 ? "" : "s"} in this date range.
            </p>
          </div>
          <p className="max-w-xl text-xs leading-5 text-muted-foreground">
            Comments are shown without Student names or account identifiers.
            Students may include personal details in free text, so handle this
            content only for authorized recommendation review.
          </p>
        </div>

        {feedback.comments.length > 0 ? (
          <div className="mt-4 divide-y divide-border border-y border-border">
            {feedback.comments.map((comment, index) => (
              <article
                key={`${comment.programmeId}-${comment.updatedAt ?? "undated"}-${index}`}
                className="grid gap-3 py-5 lg:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.3fr)] lg:gap-8"
              >
                <div>
                  <h3 className="font-display font-bold text-foreground">
                    {comment.programmeName}
                  </h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs font-semibold text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star aria-hidden="true" className="size-3.5 fill-warning text-warning-ink" />
                      {comment.rating} of 5
                    </span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={comment.updatedAt ?? undefined}>
                      {formatDate(comment.updatedAt)}
                    </time>
                  </p>
                </div>
                <blockquote className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                  “{comment.comment}”
                </blockquote>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 border-y border-border py-6 text-sm text-muted-foreground">
            No comments were submitted in this date range.
          </p>
        )}
      </div>

    </section>
  );
}

function FeedbackMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card px-5 py-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl font-black text-foreground">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}

export { RecommendationFeedbackSummary };
