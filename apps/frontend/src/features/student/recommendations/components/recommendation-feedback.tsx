import { MessageSquareText, Star } from "lucide-react";
import { useState, type FormEvent } from "react";

import { appToast } from "@/components/ui/app-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveRecommendationFeedback } from "@/features/student/recommendations/recommendation-api";
import type { StudentRecommendationFeedback } from "@/features/student/recommendations/recommendation-types";

interface RecommendationFeedbackProps {
  recommendationId: string;
  programmeId: string;
  programmeName: string;
  initialFeedback?: StudentRecommendationFeedback | null;
}

const commentLimit = 1000;
const ratingLabels = {
  1: "Does not match",
  2: "Matches slightly",
  3: "Somewhat matches",
  4: "Matches well",
  5: "Matches very well",
} as const;

function RecommendationFeedback({
  recommendationId,
  programmeId,
  programmeName,
  initialFeedback = null,
}: RecommendationFeedbackProps) {
  const [savedFeedback, setSavedFeedback] =
    useState<StudentRecommendationFeedback | null>(initialFeedback);
  const [rating, setRating] = useState(initialFeedback?.rating ?? 0);
  const [comment, setComment] = useState(initialFeedback?.comment ?? "");
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectRating = (value: number) => {
    setRating(value);
    setExpanded(true);
    setError("");
  };

  const cancel = () => {
    setRating(savedFeedback?.rating ?? 0);
    setComment(savedFeedback?.comment ?? "");
    setExpanded(false);
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Choose a rating from 1 to 5 stars before saving.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const feedback = await saveRecommendationFeedback(
        recommendationId,
        programmeId,
        rating,
        comment,
      );
      setSavedFeedback(feedback);
      setRating(feedback.rating);
      setComment(feedback.comment ?? "");
      setExpanded(false);
      appToast.success(
        "Feedback saved",
        `Your interest-match rating for ${programmeName} has been recorded.`,
      );
    } catch (feedbackError) {
      const message =
        feedbackError instanceof Error
          ? feedbackError.message
          : "Your recommendation feedback could not be saved.";
      setError(message);
      appToast.error("Feedback not saved", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-label={`Feedback for ${programmeName}`}
      className="relative border-t border-border bg-card/80 px-5 py-4 sm:px-7"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="min-w-52 flex-1">
          <p className="font-label text-sm font-bold text-foreground">
            How well does this recommendation match your interests?
          </p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Choose one to five stars based on your own experience.
          </p>
        </div>

        <fieldset>
          <legend className="sr-only">
            Interest-match rating for {programmeName}
          </legend>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <span key={value} className="relative size-11 shrink-0">
                <input
                  id={`recommendation-rating-${programmeId}-${value}`}
                  type="radio"
                  name={`recommendation-rating-${programmeId}`}
                  value={value}
                  checked={rating === value}
                  onChange={() => selectRating(value)}
                  className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                  aria-label={`${value} ${value === 1 ? "star" : "stars"} — ${ratingLabels[value as keyof typeof ratingLabels]} for ${programmeName}`}
                />
                <label
                  htmlFor={`recommendation-rating-${programmeId}-${value}`}
                  title={`${value} out of 5 — ${ratingLabels[value as keyof typeof ratingLabels]}`}
                  className="pointer-events-none flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors peer-hover:bg-warning/15 peer-hover:text-warning-ink peer-focus-visible:outline-none peer-focus-visible:ring-3 peer-focus-visible:ring-ring/40"
                >
                  <Star
                    aria-hidden="true"
                    className={`size-6 ${value <= rating ? "fill-warning text-warning-ink" : "text-border-strong"}`}
                  />
                </label>
              </span>
            ))}
          </div>
        </fieldset>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => ! current)}
          className="gap-2 text-primary-ink"
        >
          <MessageSquareText aria-hidden="true" className="size-4" />
          {savedFeedback?.comment ? "Edit comment" : "Add comment"}
        </Button>
      </div>

      {savedFeedback ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Saved interest match: {savedFeedback.rating} of 5 —{" "}
          {ratingLabels[savedFeedback.rating as keyof typeof ratingLabels]}.
        </p>
      ) : null}

      {expanded ? (
        <form
          onSubmit={submit}
          className="mt-4 rounded-2xl border border-border/70 bg-secondary/35 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`recommendation-comment-${programmeId}`}>
              Comment <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {comment.length}/{commentLimit}
            </span>
          </div>
          <Textarea
            id={`recommendation-comment-${programmeId}`}
            value={comment}
            maxLength={commentLimit}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Tell us whether this programme recommendation reflects your interests and experience."
            className="mt-2 min-h-24 bg-card"
          />
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Administrators can review your rating and comment without your name
            or account identifier. Do not include personal information. Your
            feedback does not change the recorded result or programme ranking.
          </p>
          {error ? (
            <p role="alert" className="mt-2 text-sm font-medium text-destructive-ink">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={cancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || rating === 0}>
              {saving ? "Saving feedback…" : "Save feedback"}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export { RecommendationFeedback };
