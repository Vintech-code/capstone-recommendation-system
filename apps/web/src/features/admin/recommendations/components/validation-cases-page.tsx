import {
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  Play,
  SlidersHorizontal,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { CollectionToolbar, EmptyState, StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import {
  mockValidationCases,
  validationCaseStatuses,
  type MockValidationCase,
  type ValidationCaseStatus,
} from '@/features/admin/recommendations/data/mock-validation-cases'

function ValidationCasesPage({
  onBack,
}: {
  onBack: () => void
}) {
  const [searchValue, setSearchValue] = useState('')
  const [status, setStatus] = useState<'all' | ValidationCaseStatus>('all')
  const [selectedId, setSelectedId] = useState(mockValidationCases[0].id)
  const [runMessage, setRunMessage] = useState('')

  const filteredCases = useMemo(() => {
    const search = searchValue.trim().toLowerCase()
    return mockValidationCases.filter(
      (validationCase) =>
        (status === 'all' || validationCase.status === status) &&
        (!search ||
          `${validationCase.id} ${validationCase.title} ${validationCase.applicantProfile}`
            .toLowerCase()
            .includes(search)),
    )
  }, [searchValue, status])

  const selectedCase =
    filteredCases.find((validationCase) => validationCase.id === selectedId) ??
    filteredCases[0]

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
          title="Algorithm validation cases"
          description="Compare expert-expected outcomes with deterministic recommendation snapshots."
        />
      </div>

      <CollectionToolbar
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          setRunMessage('')
        }}
        searchLabel="Search validation cases"
        searchPlaceholder="Search case, profile, or reference"
        className="mt-7 rounded-2xl p-4"
      >
        <label
          htmlFor="validation-case-status"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-semibold"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <span className="sr-only">Filter by validation status</span>
          <select
            id="validation-case-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as 'all' | ValidationCaseStatus)
            }
            className="min-h-11 bg-transparent outline-none"
          >
            <option value="all">All outcomes</option>
            {validationCaseStatuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </CollectionToolbar>

      {filteredCases.length && selectedCase ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(19rem,.72fr)_minmax(0,1.28fr)]">
          <section aria-labelledby="case-list-title">
            <div className="flex items-center justify-between gap-3 px-1">
              <h2 id="case-list-title" className="text-lg font-extrabold">
                Case library
              </h2>
              <span className="text-xs font-bold text-muted-foreground">
                {filteredCases.length} cases
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {filteredCases.map((validationCase) => (
                <ValidationCaseButton
                  key={validationCase.id}
                  validationCase={validationCase}
                  selected={validationCase.id === selectedCase.id}
                  onSelect={() => {
                    setSelectedId(validationCase.id)
                    setRunMessage('')
                  }}
                />
              ))}
            </div>
          </section>

          <ValidationCaseDetail
            validationCase={selectedCase}
            runMessage={runMessage}
            onRun={() =>
              setRunMessage(
                `${selectedCase.id} reran against its current synthetic snapshots.`,
              )
            }
          />
        </div>
      ) : (
        <EmptyState
          title="No validation cases found"
          description="Clear the filters or try another case search."
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

function ValidationCaseButton({
  validationCase,
  selected,
  onSelect,
}: {
  validationCase: MockValidationCase
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-2xl bg-background p-5 text-left shadow-sm transition-transform focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ${
        selected ? 'ring-2 ring-primary/35' : 'hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-xs text-muted-foreground">
          {validationCase.id}
        </span>
        <ValidationStatus status={validationCase.status} />
      </div>
      <h3 className="mt-4 font-extrabold">{validationCase.title}</h3>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {validationCase.applicantProfile}
      </p>
    </button>
  )
}

function ValidationCaseDetail({
  validationCase,
  runMessage,
  onRun,
}: {
  validationCase: MockValidationCase
  runMessage: string
  onRun: () => void
}) {
  return (
    <article className="rounded-2xl bg-background p-6 shadow-sm sm:p-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold text-primary">
            {validationCase.id}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">
            {validationCase.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {validationCase.applicantProfile}
          </p>
        </div>
        <Button type="button" onClick={onRun}>
          <Play aria-hidden="true" />
          Run selected case
        </Button>
      </header>

      {runMessage ? (
        <p
          role="status"
          className="mt-5 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800"
        >
          {runMessage}
        </p>
      ) : null}

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <OutcomePanel
          label="Expert-expected snapshot"
          course={validationCase.expectedTopCourse}
          eligibility={validationCase.expectedEligibility}
          icon={FlaskConical}
        />
        <OutcomePanel
          label="Deterministic output snapshot"
          course={validationCase.actualTopCourse}
          eligibility={validationCase.actualEligibility}
          icon={CheckCircle2}
        />
      </div>

      <section className="mt-5 rounded-2xl bg-secondary/65 p-5">
        <h3 className="font-extrabold">Review rationale</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {validationCase.rationale}
        </p>
      </section>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <Snapshot label="Assessment version" value={validationCase.assessmentVersion} />
        <Snapshot label="Rule version" value={validationCase.ruleVersion} />
        <Snapshot label="Last run" value={validationCase.lastRunLabel} />
      </dl>
    </article>
  )
}

function OutcomePanel({
  label,
  course,
  eligibility,
  icon: Icon,
}: {
  label: string
  course: string
  eligibility: string
  icon: typeof FlaskConical
}) {
  return (
    <section className="rounded-2xl bg-secondary/65 p-5">
      <Icon aria-hidden="true" className="size-5 text-primary" />
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <h3 className="mt-2 font-extrabold">{course}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{eligibility}</p>
    </section>
  )
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/65 p-4">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-xs font-bold">{value}</dd>
    </div>
  )
}

function ValidationStatus({ status }: { status: ValidationCaseStatus }) {
  const tone =
    status === 'Match'
      ? 'success'
      : status === 'Discrepancy'
        ? 'danger'
        : 'warning'
  return <StatusBadge label={status} tone={tone} />
}

export { ValidationCasesPage }
