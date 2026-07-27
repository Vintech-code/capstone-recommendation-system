import {
  ArrowLeft,
  CheckCircle2,
  FileWarning,
  RefreshCw,
  Rows3,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState, ErrorState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { ImportRowStatusBadge } from '@/features/admin/official-results/components/import-row-status-badge'
import {
  importRowStatuses,
  mockImportBatch,
  type ImportRowStatus,
} from '@/features/admin/official-results/data/mock-result-imports'

interface ResultImportReconciliationPageProps {
  importId: string
  onBack: () => void
}

function ResultImportReconciliationPage({
  importId,
  onBack,
}: ResultImportReconciliationPageProps) {
  const [status, setStatus] = useState<'all' | ImportRowStatus>('all')
  const [refreshMessage, setRefreshMessage] = useState('')
  const batch = importId === mockImportBatch.id ? mockImportBatch : undefined

  const filteredRows = useMemo(
    () =>
      batch?.rows.filter((row) => status === 'all' || row.status === status) ??
      [],
    [batch, status],
  )

  if (!batch) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title="Import batch not found"
          description="Return to Official Results and choose another import batch."
          onRetry={onBack}
          retryLabel="Back to official results"
        />
      </div>
    )
  }

  const ready = batch.rows.filter((row) => row.status === 'Ready').length
  const review = batch.rows.filter(
    (row) => row.status === 'Needs review',
  ).length
  const duplicates = batch.rows.filter(
    (row) => row.status === 'Duplicate',
  ).length

  function refreshValidation() {
    setRefreshMessage('Validation refreshed using the current mock batch.')
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Official results
      </Button>

      <div className="mt-4">
        <AdminPageHeader
          title="Import reconciliation"
          description="Review ready rows, resolve incomplete records, and isolate duplicates before verification."
          actions={
            <Button type="button" variant="secondary" onClick={refreshValidation}>
              <RefreshCw aria-hidden="true" />
              Retry validation
            </Button>
          }
        />
      </div>

      {refreshMessage ? (
        <p
          role="status"
          className="mt-5 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800"
        >
          {refreshMessage}
        </p>
      ) : null}

      <section
        aria-label="Import batch summary"
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          icon={Rows3}
          label="Total rows"
          value={batch.rows.length}
          detail={batch.fileName}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Ready"
          value={ready}
          detail="Eligible for verification queue"
          tone="success"
        />
        <SummaryCard
          icon={FileWarning}
          label="Needs review"
          value={review}
          detail="Missing required source values"
          tone="warning"
        />
        <SummaryCard
          icon={FileWarning}
          label="Duplicates"
          value={duplicates}
          detail="Repeated applicant references"
          tone="danger"
        />
      </section>

      <section className="mt-6" aria-labelledby="reconciliation-rows-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {batch.id} · {batch.createdLabel}
            </p>
            <h2
              id="reconciliation-rows-title"
              className="mt-1 text-xl font-extrabold"
            >
              Row outcomes
            </h2>
          </div>
          <div
            role="group"
            aria-label="Filter import rows"
            className="flex flex-wrap gap-2"
          >
            {(['all', ...importRowStatuses] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={status === item}
                onClick={() => setStatus(item)}
                className={`min-h-10 rounded-full px-4 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ${
                  status === item
                    ? 'bg-foreground text-background'
                    : 'bg-background text-muted-foreground shadow-sm hover:text-foreground'
                }`}
              >
                {item === 'all' ? 'All rows' : item}
              </button>
            ))}
          </div>
        </div>

        {filteredRows.length ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {filteredRows.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl bg-background p-5 shadow-sm"
              >
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      CSV row {row.rowNumber}
                    </p>
                    <h3 className="mt-1 font-extrabold">
                      {row.applicantReference || 'Applicant reference missing'}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {row.examReference || 'Examination reference missing'}
                    </p>
                  </div>
                  <ImportRowStatusBadge status={row.status} />
                </header>

                <dl className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-secondary/65 p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Result
                    </dt>
                    <dd className="mt-1 text-sm font-bold">
                      {row.resultValue || '—'}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-secondary/65 p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Format
                    </dt>
                    <dd className="mt-1 truncate text-sm font-bold">
                      {row.scoreFormat || '—'}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-secondary/65 p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Date
                    </dt>
                    <dd className="mt-1 text-sm font-bold">
                      {row.examinationDate || '—'}
                    </dd>
                  </div>
                </dl>

                {row.issues.length ? (
                  <div className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-950">
                    <p className="text-xs font-extrabold">Review notes</p>
                    <ul className="mt-2 space-y-1 text-xs leading-5">
                      {row.issues.map((issue) => (
                        <li key={issue}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-xs font-semibold leading-5 text-emerald-800">
                    Required source values are present and ready for the next
                    verification step.
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No rows in this status"
            description="Choose another outcome filter to continue reviewing the batch."
            className="mt-4"
          />
        )}
      </section>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'default',
}: {
  icon: typeof Rows3
  label: string
  value: number
  detail: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const toneClasses = {
    default: 'bg-primary/8 text-primary',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
  }

  return (
    <article className="rounded-2xl bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-extrabold">{value}</p>
        </div>
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon aria-hidden="true" className="size-4.5" />
        </span>
      </div>
      <p className="mt-4 truncate text-xs text-muted-foreground">{detail}</p>
    </article>
  )
}

export { ResultImportReconciliationPage }
