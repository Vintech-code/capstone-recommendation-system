import { FileText, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'

import { CollectionToolbar } from '@/components/shared/collection-toolbar'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { ReportLibraryCard } from '@/features/admin/reports/components/report-library-card'
import {
  mockReports,
  reportStatuses,
  reportTypes,
} from '@/features/admin/reports/data/mock-reports'

function ReportManagementPage({
  onOpenReport,
}: {
  onOpenReport: (id: string) => void
}) {
  const [searchValue, setSearchValue] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')

  const filteredReports = useMemo(() => {
    const search = searchValue.trim().toLowerCase()
    return mockReports.filter(
      (report) =>
        (status === 'all' || report.status === status) &&
        (type === 'all' || report.type === type) &&
        (!search ||
          `${report.id} ${report.title} ${report.applicantId ?? ''} ${report.applicantName ?? ''}`
            .toLowerCase()
            .includes(search)),
    )
  }, [searchValue, status, type])

  const [featuredReport, ...libraryReports] = filteredReports

  function resetFilters() {
    setSearchValue('')
    setStatus('all')
    setType('all')
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <AdminPageHeader
        title="Reports"
        description="Browse prepared guidance documents by purpose, coverage, and lifecycle, then open a print-ready preview."
      />

      <CollectionToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchLabel="Search reports"
        searchPlaceholder="Search report, reference, or applicant"
        className="mt-7 rounded-2xl p-4"
      >
        <label
          htmlFor="report-type"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-semibold"
        >
          <FileText aria-hidden="true" className="size-4" />
          <span className="sr-only">Filter by report type</span>
          <select
            id="report-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="min-h-11 bg-transparent outline-none"
          >
            <option value="all">All report types</option>
            {reportTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label
          htmlFor="report-status"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-semibold"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <span className="sr-only">Filter by report status</span>
          <select
            id="report-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="min-h-11 bg-transparent outline-none"
          >
            <option value="all">All statuses</option>
            {reportStatuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </CollectionToolbar>

      {featuredReport ? (
        <>
          <section className="mt-6" aria-labelledby="featured-report-heading">
            <div className="mb-3 flex items-end justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  First in current view
                </p>
                <h2
                  id="featured-report-heading"
                  className="mt-1 text-lg font-extrabold"
                >
                  Featured report
                </h2>
              </div>
              <p className="text-xs font-bold text-muted-foreground">
                {filteredReports.length}{' '}
                {filteredReports.length === 1 ? 'report' : 'reports'}
              </p>
            </div>
            <ReportLibraryCard
              report={featuredReport}
              featured
              onOpen={onOpenReport}
            />
          </section>

          {libraryReports.length ? (
            <section className="mt-7" aria-labelledby="report-library-heading">
              <h2
                id="report-library-heading"
                className="px-1 text-lg font-extrabold"
              >
                Report library
              </h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {libraryReports.map((report) => (
                  <ReportLibraryCard
                    key={report.id}
                    report={report}
                    onOpen={onOpenReport}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <div className="mt-5 rounded-2xl bg-background p-10 text-center shadow-sm">
          <FileText className="mx-auto size-6 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-extrabold">No reports found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Adjust the search or report filters to view another record.
          </p>
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

export { ReportManagementPage }
