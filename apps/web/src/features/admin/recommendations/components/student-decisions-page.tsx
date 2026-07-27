import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { CollectionToolbar, EmptyState, StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import {
  mockStudentDecisions,
  studentDecisionStatuses,
  type MockStudentDecision,
  type StudentDecisionStatus,
} from '@/features/admin/recommendations/data/mock-student-decisions'

interface StudentDecisionsPageProps {
  onBack: () => void
  onOpenRecommendation: (recommendationId: string) => void
}

function StudentDecisionsPage({
  onBack,
  onOpenRecommendation,
}: StudentDecisionsPageProps) {
  const [searchValue, setSearchValue] = useState('')
  const [status, setStatus] = useState<'all' | StudentDecisionStatus>('all')
  const [selectedId, setSelectedId] = useState(mockStudentDecisions[0].id)

  const filteredDecisions = useMemo(() => {
    const search = searchValue.trim().toLowerCase()
    return mockStudentDecisions.filter(
      (decision) =>
        (status === 'all' || decision.status === status) &&
        (!search ||
          `${decision.id} ${decision.applicantId} ${decision.applicantName} ${decision.recommendedCourse}`
            .toLowerCase()
            .includes(search)),
    )
  }, [searchValue, status])

  const selectedDecision =
    filteredDecisions.find((decision) => decision.id === selectedId) ??
    filteredDecisions[0]

  function resetFilters() {
    setSearchValue('')
    setStatus('all')
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Recommendations
      </Button>

      <div className="mt-4">
        <AdminPageHeader
          title="Student decision review"
          description="Review recorded course preferences without treating them as admission or enrolment."
        />
      </div>

      <CollectionToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchLabel="Search student decisions"
        searchPlaceholder="Search applicant, decision, or course"
        className="mt-7 rounded-2xl p-4"
      >
        <label
          htmlFor="student-decision-status"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-semibold"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <span className="sr-only">Filter by student decision</span>
          <select
            id="student-decision-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as 'all' | StudentDecisionStatus)
            }
            className="min-h-11 bg-transparent outline-none"
          >
            <option value="all">All decisions</option>
            {studentDecisionStatuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </CollectionToolbar>

      {filteredDecisions.length && selectedDecision ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <section aria-labelledby="decision-records-title">
            <div className="flex items-center justify-between gap-3 px-1">
              <h2 id="decision-records-title" className="text-lg font-extrabold">
                Decision records
              </h2>
              <p className="text-xs font-bold text-muted-foreground">
                {filteredDecisions.length}{' '}
                {filteredDecisions.length === 1 ? 'record' : 'records'}
              </p>
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {filteredDecisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  selected={decision.id === selectedDecision.id}
                  onSelect={() => setSelectedId(decision.id)}
                />
              ))}
            </div>
          </section>

          <DecisionDetail
            decision={selectedDecision}
            onOpenRecommendation={onOpenRecommendation}
          />
        </div>
      ) : (
        <EmptyState
          title="No decision records found"
          description="Clear the filters or try another applicant search."
          action={
            <Button type="button" variant="secondary" onClick={resetFilters}>
              Clear filters
            </Button>
          }
          className="mt-5"
        />
      )}
    </div>
  )
}

function DecisionCard({
  decision,
  selected,
  onSelect,
}: {
  decision: MockStudentDecision
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-2xl bg-background p-5 text-left shadow-sm transition-transform focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ${
        selected ? 'ring-2 ring-primary/35' : 'hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <UserRound aria-hidden="true" className="size-4.5" />
        </span>
        <DecisionStatus status={decision.status} />
      </div>
      <h3 className="mt-6 font-extrabold">{decision.applicantName}</h3>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {decision.id} / {decision.applicantId}
      </p>
      <div className="mt-5 rounded-xl bg-secondary/65 p-4">
        <p className="text-xs text-muted-foreground">Recorded preference</p>
        <p className="mt-1 text-sm font-bold">{decision.selectedCourse}</p>
      </div>
    </button>
  )
}

function DecisionDetail({
  decision,
  onOpenRecommendation,
}: {
  decision: MockStudentDecision
  onOpenRecommendation: (recommendationId: string) => void
}) {
  return (
    <aside
      aria-labelledby="decision-detail-title"
      className="h-fit rounded-2xl bg-background p-6 shadow-sm xl:sticky xl:top-24"
    >
      <BookOpenCheck aria-hidden="true" className="size-5 text-primary" />
      <p className="mt-6 font-mono text-xs font-semibold text-primary">
        {decision.id}
      </p>
      <h2 id="decision-detail-title" className="mt-2 text-xl font-extrabold">
        {decision.applicantName}
      </h2>
      <div className="mt-3">
        <DecisionStatus status={decision.status} />
      </div>

      <dl className="mt-6 space-y-5 text-sm">
        <DetailItem
          label="Recommended course"
          value={decision.recommendedCourse}
        />
        <DetailItem label="Recorded preference" value={decision.selectedCourse} />
        <DetailItem label="Applicant note" value={decision.note} />
        <div>
          <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-4" />
            Recorded
          </dt>
          <dd className="mt-2 font-bold">
            <time dateTime={decision.recordedAt}>{decision.recordedLabel}</time>
          </dd>
        </div>
      </dl>

      <div className="mt-6 rounded-xl bg-canvas-cream p-4">
        <p className="text-xs font-semibold leading-5">
          This preference record is not an admission decision, enrolment, or
          course assignment.
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => onOpenRecommendation(decision.recommendationId)}
        className="mt-5 w-full"
      >
        Open recommendation
        <ChevronRight aria-hidden="true" />
      </Button>
    </aside>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-bold leading-6">{value}</dd>
    </div>
  )
}

function DecisionStatus({ status }: { status: StudentDecisionStatus }) {
  const tone =
    status === 'Accepted'
      ? 'success'
      : status === 'Declined'
        ? 'danger'
        : 'warning'
  return <StatusBadge label={status} tone={tone} />
}

export { StudentDecisionsPage }
