import { Eye, MessageSquareText, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AdminRecommendationFeedback } from "@/features/admin/data/admin-api";
import { formatDate } from "@/features/admin/data/admin-formatters";
import { cn } from "@/lib/utils";

interface RecommendationFeedbackSummaryProps {
  feedback: AdminRecommendationFeedback;
}

type AnonymousRespondent = AdminRecommendationFeedback["respondents"][number];

function RecommendationFeedbackSummary({ feedback }: RecommendationFeedbackSummaryProps) {
  const [selectedRespondent, setSelectedRespondent] = useState<AnonymousRespondent | null>(null);

  return (
    <section aria-labelledby="anonymous-feedback-heading" className="border-y border-border py-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="font-label text-xs font-bold uppercase tracking-wider text-primary-ink">
            Anonymous Student responses
          </p>
          <h2 id="anonymous-feedback-heading" className="mt-1 font-display text-2xl font-black text-foreground">
            Feedback respondents
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 text-primary-ink" />
          <span>No Student identity is included</span>
        </div>
      </div>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-xs border border-border bg-border sm:grid-cols-4">
        <FeedbackMetric label="Anonymous respondents" value={feedback.publishedRespondentCount} />
        <FeedbackMetric label="Feedback entries" value={feedback.publishedResponseCount} />
        <FeedbackMetric label="Programmes reviewed" value={feedback.eligibleProgrammeCount} />
        <FeedbackMetric label="Comments" value={feedback.commentCount} />
      </dl>

      <p className="mt-5 text-xs leading-5 text-muted-foreground">
        Anonymous numbers are generated only for this filtered view. They are not Student numbers or account identifiers.
      </p>

      {feedback.respondents.length > 0 ? (
        <div className="mt-4 overflow-x-auto border-y border-border">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <caption className="sr-only">Anonymous Students who submitted recommendation feedback</caption>
            <thead>
              <tr className="border-b border-border bg-secondary/45 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-4 py-3">No.</th>
                <th scope="col" className="px-4 py-3">Respondent</th>
                <th scope="col" className="px-4 py-3">Programme feedback</th>
                <th scope="col" className="px-4 py-3">Average match</th>
                <th scope="col" className="px-4 py-3">Latest feedback</th>
                <th scope="col" className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {feedback.respondents.map((respondent) => (
                <tr key={respondent.respondentNumber} className="transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-4 font-display text-lg font-black tabular-nums text-primary-ink">
                    {String(respondent.respondentNumber).padStart(2, "0")}
                  </td>
                  <th scope="row" className="px-4 py-4">
                    <span className="font-display font-bold text-foreground">
                      Student Applicant
                    </span>
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {respondent.commentCount} comment{respondent.commentCount === 1 ? "" : "s"} submitted
                    </span>
                  </th>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {respondent.responseCount} programme{respondent.responseCount === 1 ? "" : "s"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
                      <Star aria-hidden="true" className="size-4 fill-warning text-warning-ink" />
                      {respondent.averageRating.toFixed(1)} / 5
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <time dateTime={respondent.latestUpdatedAt ?? undefined}>
                      {formatDate(respondent.latestUpdatedAt)}
                    </time>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRespondent(respondent)}>
                      <Eye aria-hidden="true" data-icon="inline-start" />
                      View feedback
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 border-y border-border py-8 text-center">
          <p className="font-display text-lg font-bold text-foreground">No recommendation feedback yet</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            No Student feedback was saved in this date range.
          </p>
        </div>
      )}

      <Sheet open={selectedRespondent !== null} onOpenChange={(open) => { if (!open) setSelectedRespondent(null); }}>
        <SheetContent
          className="w-[min(42rem,94vw)] gap-0 overflow-y-auto sm:w-[min(42rem,94vw)]"
          closeLabel="Close feedback details"
        >
          {selectedRespondent ? <AnonymousRespondentDetails respondent={selectedRespondent} /> : null}
        </SheetContent>
      </Sheet>
    </section>
  );
}

function AnonymousRespondentDetails({ respondent }: { respondent: AnonymousRespondent }) {
  return (
    <>
      <SheetHeader className="border-b border-border pb-5">
        <p className="font-label text-xs font-bold uppercase tracking-wider text-primary-ink">Anonymous feedback record</p>
        <SheetTitle className="font-display text-2xl font-black">
          Student Applicant #{respondent.respondentNumber}
        </SheetTitle>
        <SheetDescription>
          Review each complete recorded recommendation ranking and the latest published feedback attached to its
          programmes. Student identity is not included.
        </SheetDescription>
      </SheetHeader>

      <dl className="grid grid-cols-2 gap-px border-b border-border bg-border sm:grid-cols-3">
        <DetailMetric label="Average match" value={`${respondent.averageRating.toFixed(1)} / 5`} />
        <DetailMetric label="Recorded results" value={respondent.resultSets.length} />
        <DetailMetric label="Latest feedback" value={formatDate(respondent.latestUpdatedAt)} className="col-span-2 sm:col-span-1" />
      </dl>

      <div className="divide-y divide-border">
        {respondent.resultSets.map((resultSet) => (
          <section key={resultSet.resultSetNumber} className="py-6" aria-labelledby={`result-set-${resultSet.resultSetNumber}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-label text-xs font-bold uppercase tracking-wider text-primary-ink">
                  Recorded result {resultSet.resultSetNumber}
                </p>
                <h3 id={`result-set-${resultSet.resultSetNumber}`} className="mt-1 font-display text-lg font-bold text-foreground">
                  Complete programme ranking
                </h3>
                <time dateTime={resultSet.resultDate ?? undefined} className="mt-1 block text-xs text-muted-foreground">
                  Generated {formatDate(resultSet.resultDate)}
                </time>
              </div>
              <Badge variant="secondary">
                {resultSet.feedbackCount} of {resultSet.recommendationCount} rated
              </Badge>
            </div>

            <ol className="mt-5 divide-y divide-border border-y border-border">
              {resultSet.recommendations.map((recommendation) => (
                <li
                  key={recommendation.programmeId}
                  className="grid gap-4 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)_6rem]"
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rank</p>
                    <p className="mt-1 font-display text-xl font-black tabular-nums text-primary-ink">
                      #{recommendation.rank}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {recommendation.programmeCode || "Programme"}
                    </p>
                    <h4 className="mt-1 font-display font-bold text-foreground">{recommendation.programmeName}</h4>

                    <div className="mt-4 border-l-2 border-primary pl-4">
                      {recommendation.feedback ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="success">Feedback submitted</Badge>
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
                              <Star aria-hidden="true" className="size-4 fill-warning text-warning-ink" />
                              {recommendation.feedback.rating} of 5
                            </span>
                            <time
                              dateTime={recommendation.feedback.updatedAt ?? undefined}
                              className="text-xs text-muted-foreground"
                            >
                              {formatDate(recommendation.feedback.updatedAt)}
                            </time>
                          </div>
                          <p className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <MessageSquareText aria-hidden="true" className="size-4" />
                            Student comment
                          </p>
                          {recommendation.feedback.comment ? (
                            <blockquote className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                              “{recommendation.feedback.comment}”
                            </blockquote>
                          ) : (
                            <p className="mt-2 text-sm italic text-muted-foreground">No comment submitted.</p>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline">No feedback submitted</Badge>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recorded match</p>
                    <p className="mt-1 font-display text-lg font-black tabular-nums text-foreground">
                      {formatMatch(recommendation.match)}%
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <p className="border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
        This anonymous number applies only to the current filtered view. Free text can still contain details entered by
        the Student and must be handled only by authorized Administrators.
      </p>
    </>
  );
}

function FeedbackMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card px-5 py-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-foreground">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-black text-foreground">{value.toLocaleString()}</dd>
    </div>
  );
}

function DetailMetric({ label, value, className = "" }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={cn("bg-background px-4 py-4", className)}>
      <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-foreground">{value}</dd>
    </div>
  );
}

function formatMatch(match: number) {
  return Number.isInteger(match) ? match.toFixed(0) : match.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export { RecommendationFeedbackSummary };
