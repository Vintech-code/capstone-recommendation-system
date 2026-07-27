import {
  ArrowLeft,
  FileSpreadsheet,
  Upload,
  WandSparkles,
} from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'

import {
  ConfirmActionDialog,
  ErrorState,
  LoadingState,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { ImportRowStatusBadge } from '@/features/admin/official-results/components/import-row-status-badge'
import {
  expectedImportHeaders,
  parseResultImport,
  sampleResultImportCsv,
  type ImportPreviewRow,
} from '@/features/admin/official-results/data/mock-result-imports'

interface ResultImportUploadPageProps {
  onBack: () => void
  onOpenImport: (importId: string) => void
}

function ResultImportUploadPage({
  onBack,
  onOpenImport,
}: ResultImportUploadPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ImportPreviewRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const readyCount = rows.filter((row) => row.status === 'Ready').length
  const reviewCount = rows.filter((row) => row.status === 'Needs review').length
  const duplicateCount = rows.filter((row) => row.status === 'Duplicate').length

  function loadContent(name: string, content: string) {
    try {
      setRows(parseResultImport(content))
      setFileName(name)
      setError('')
    } catch (reason) {
      setRows([])
      setFileName(name)
      setError(
        reason instanceof Error
          ? reason.message
          : 'The selected CSV could not be read.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      loadContent(file.name, await file.text())
    } catch {
      setLoading(false)
      setRows([])
      setFileName(file.name)
      setError('The selected CSV could not be read.')
    }
  }

  function loadSample() {
    setLoading(true)
    loadContent('results-july-2026.csv', sampleResultImportCsv)
  }

  function clearFile() {
    setFileName('')
    setRows([])
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Official results
      </Button>

      <div className="mt-4">
        <AdminPageHeader
          title="Import official results"
          description="Upload a CSV, review every row locally, and reconcile issues before any record enters verification."
        />
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <aside aria-label="Import controls" className="h-fit space-y-5">
          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <Upload aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-6 text-lg font-extrabold">Choose CSV file</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The file stays in this browser while the preview is prepared.
            </p>
            <label
              htmlFor="result-import-file"
              className="mt-5 flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-foreground px-4 text-sm font-bold text-background transition-colors hover:bg-foreground/88 focus-within:ring-3 focus-within:ring-ring/40"
            >
              Select CSV
              <input
                ref={fileInputRef}
                id="result-import-file"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            <Button
              type="button"
              variant="secondary"
              onClick={loadSample}
              className="mt-3 w-full"
            >
              <WandSparkles aria-hidden="true" />
              Use sample CSV
            </Button>
            {fileName ? (
              <div className="mt-5 rounded-xl bg-secondary/65 p-4">
                <p className="text-xs font-semibold text-muted-foreground">
                  Selected file
                </p>
                <p className="mt-1 break-all text-sm font-bold">{fileName}</p>
                <button
                  type="button"
                  onClick={clearFile}
                  className="mt-3 text-xs font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  Clear selection
                </button>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <h2 className="font-extrabold">Expected columns</h2>
            <ul className="mt-4 space-y-2">
              {expectedImportHeaders.map((header) => (
                <li
                  key={header}
                  className="rounded-lg bg-secondary/65 px-3 py-2 font-mono text-xs"
                >
                  {header}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <section aria-labelledby="import-preview-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Row validation
              </p>
              <h2 id="import-preview-title" className="mt-1 text-xl font-extrabold">
                Import preview
              </h2>
            </div>
            {rows.length ? (
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800">
                  {readyCount} ready
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">
                  {reviewCount} review
                </span>
                <span className="rounded-full bg-rose-100 px-3 py-1.5 text-rose-800">
                  {duplicateCount} duplicate
                </span>
              </div>
            ) : null}
          </div>

          {loading ? (
            <LoadingState
              title="Reading CSV"
              description="Preparing row-level validation results."
              className="mt-4"
            />
          ) : error ? (
            <ErrorState
              title="CSV could not be previewed"
              description={error}
              onRetry={() => fileInputRef.current?.click()}
              retryLabel="Choose another file"
              className="mt-4"
            />
          ) : rows.length ? (
            <ImportPreviewTable rows={rows} />
          ) : (
            <div className="mt-4 rounded-2xl bg-background p-10 text-center shadow-sm">
              <FileSpreadsheet
                aria-hidden="true"
                className="mx-auto size-7 text-muted-foreground"
              />
              <h3 className="mt-4 font-extrabold">No CSV selected</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Choose a file or load the sample to see row-level validation
                before starting the import.
              </p>
            </div>
          )}

          {rows.length ? (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-background p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-muted-foreground">
                Only ready rows continue. Review and duplicate rows remain in
                reconciliation.
              </p>
              <Button
                type="button"
                disabled={!readyCount}
                onClick={() => setConfirmOpen(true)}
                className="shrink-0"
              >
                Start import review
              </Button>
            </div>
          ) : null}
        </section>
      </div>

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Start import reconciliation?"
        description={`${readyCount} ready row${readyCount === 1 ? '' : 's'} will continue. Rows with issues will remain available for review.`}
        confirmLabel="Start reconciliation"
        onConfirm={() => onOpenImport('IMP-001')}
      />
    </div>
  )
}

function ImportPreviewTable({ rows }: { rows: ImportPreviewRow[] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[58rem] w-full border-collapse text-left">
          <caption className="sr-only">CSV import row validation preview</caption>
          <thead className="bg-secondary/80">
            <tr>
              {[
                'Row',
                'Applicant',
                'Examination reference',
                'Result',
                'Format',
                'Date',
                'Status',
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-4 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/60 last:border-b-0"
              >
                <td className="px-4 py-4 font-mono text-xs">{row.rowNumber}</td>
                <td className="px-4 py-4 text-sm font-semibold">
                  {row.applicantReference || 'Missing'}
                </td>
                <td className="px-4 py-4 font-mono text-xs">
                  {row.examReference || 'Missing'}
                </td>
                <td className="px-4 py-4 text-sm">{row.resultValue || '—'}</td>
                <td className="px-4 py-4 text-sm">{row.scoreFormat || '—'}</td>
                <td className="px-4 py-4 text-sm">
                  {row.examinationDate || '—'}
                </td>
                <td className="px-4 py-4">
                  <ImportRowStatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { ResultImportUploadPage }
