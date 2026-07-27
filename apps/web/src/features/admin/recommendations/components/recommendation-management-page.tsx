import {
  FlaskConical,
  ListChecks,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { CollectionToolbar } from '@/components/shared/collection-toolbar'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { RecommendationReviewCard } from '@/features/admin/recommendations/components/recommendation-review-card'
import {
  mockRecommendationRuns,
  recommendationStatuses,
} from '@/features/admin/recommendations/data/mock-recommendations'

function RecommendationManagementPage({
  onOpenDecisions,
  onOpenRecommendation,
  onOpenValidationCases,
}: {
  onOpenDecisions: () => void
  onOpenRecommendation: (id: string) => void
  onOpenValidationCases: () => void
}) {
  const [searchValue, setSearchValue] = useState('')
  const [status, setStatus] = useState('all')

  const filteredRuns = useMemo(() => {
    const search = searchValue.trim().toLowerCase()
    return mockRecommendationRuns.filter(
      (run) =>
        (status === 'all' || run.status === status) &&
        (!search ||
          `${run.id} ${run.applicantId} ${run.applicantName} ${run.matches[0].name}`
            .toLowerCase()
            .includes(search)),
    )
  }, [searchValue, status])

  function resetFilters() {
    setSearchValue('')
    setStatus('all')
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <AdminPageHeader
        title="Recommendations"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onOpenValidationCases}
            >
              <FlaskConical aria-hidden="true" />
              Validation cases
            </Button>
            <Button type="button" onClick={onOpenDecisions}>
              <ListChecks aria-hidden="true" />
              Student decisions
            </Button>
          </div>
        }
        description="Review each applicant’s ranked guidance as a complete decision-support snapshot."
      />

      <CollectionToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchLabel="Search recommendations"
        searchPlaceholder="Search applicant, run, or course"
        className="mt-7 rounded-2xl p-4"
      >
        <label
          htmlFor="recommendation-status"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-semibold"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <span className="sr-only">Filter by recommendation status</span>
          <select
            id="recommendation-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="min-h-11 bg-transparent outline-none"
          >
            <option value="all">All statuses</option>
            {recommendationStatuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </CollectionToolbar>

      <div className="mt-4 flex items-center justify-between gap-3 px-1">
        <h2 className="text-lg font-extrabold">Review queue</h2>
        <p className="text-xs font-bold text-muted-foreground">
          {filteredRuns.length}{' '}
          {filteredRuns.length === 1 ? 'recommendation' : 'recommendations'}
        </p>
      </div>

      {filteredRuns.length ? (
        <div className="mt-3 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredRuns.map((run) => (
            <RecommendationReviewCard
              key={run.id}
              run={run}
              onOpen={onOpenRecommendation}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-background p-10 text-center shadow-sm">
          <Sparkles className="mx-auto size-6 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-extrabold">
            No recommendations found
          </h2>
          <Button
            type="button"
            variant="secondary"
            className="mt-5"
            onClick={resetFilters}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}

export { RecommendationManagementPage }
