import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  ChevronRight,
  ClipboardCheck,
  Plus,
  SlidersHorizontal,
  Upload,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { DataTableToolbar } from '@/components/shared/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { TablePagination } from '@/features/admin/components/table-pagination'
import { TableSortButton } from '@/features/admin/components/table-sort-button'
import { ResultStateBadge } from '@/features/admin/official-results/components/result-state-badge'
import {
  mockOfficialResults,
  officialResultReviewStates,
  officialResultSources,
  type MockOfficialResult,
} from '@/features/admin/official-results/data/mock-official-results'

interface OfficialResultsPageProps {
  onCreateResult: () => void
  onImportResults: () => void
  onOpenResult: (resultId: string) => void
}

function OfficialResultsPage({
  onCreateResult,
  onImportResults,
  onOpenResult,
}: OfficialResultsPageProps) {
  const [searchValue, setSearchValue] = useState('')
  const [reviewState, setReviewState] = useState('all')
  const [source, setSource] = useState('all')
  const [sorting, setSorting] = useState<SortingState>([])

  const filteredResults = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return mockOfficialResults.filter((result) => {
      const matchesState =
        reviewState === 'all' || result.reviewState === reviewState
      const matchesSource = source === 'all' || result.source === source
      const matchesSearch =
        !normalizedSearch ||
        `${result.applicantName} ${result.applicantId} ${result.id}`
          .toLowerCase()
          .includes(normalizedSearch)

      return matchesState && matchesSource && matchesSearch
    })
  }, [reviewState, searchValue, source])

  const columns = useMemo<ColumnDef<MockOfficialResult>[]>(
    () => [
      {
        accessorKey: 'applicantName',
        header: ({ column }) => (
          <TableSortButton
            label="Applicant"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-bold">{row.original.applicantName}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {row.original.applicantId}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <TableSortButton
            label="Result reference"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold">
            {row.original.id}
          </span>
        ),
      },
      {
        accessorKey: 'source',
        header: ({ column }) => (
          <TableSortButton
            label="Source"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        ),
      },
      {
        accessorKey: 'reviewState',
        header: ({ column }) => (
          <TableSortButton
            label="Review state"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        ),
        cell: ({ row }) => (
          <ResultStateBadge state={row.original.reviewState} />
        ),
      },
      {
        accessorKey: 'version',
        header: ({ column }) => (
          <TableSortButton
            label="Version"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-semibold">
            v{row.original.version}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => (
          <TableSortButton
            label="Updated"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        ),
        cell: ({ row }) => (
          <time
            dateTime={row.original.updatedAt}
            className="text-sm text-muted-foreground"
          >
            {row.original.updatedLabel}
          </time>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenResult(row.original.id)}
          >
            Open result
            <ChevronRight aria-hidden="true" />
          </Button>
        ),
      },
    ],
    [onOpenResult],
  )

  // TanStack Table intentionally returns a mutable table instance.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredResults,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
  })

  const resetFilters = () => {
    setSearchValue('')
    setReviewState('all')
    setSource('all')
    table.setPageIndex(0)
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <AdminPageHeader
        title="Official results"
        description="Review result provenance, verification state, and version history without assuming an unapproved score format."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={onImportResults}>
              <Upload aria-hidden="true" />
              Import CSV
            </Button>
            <Button type="button" onClick={onCreateResult}>
              <Plus aria-hidden="true" />
              Encode result
            </Button>
          </div>
        }
      />

      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          table.setPageIndex(0)
        }}
        searchLabel="Search official results"
        searchPlaceholder="Search applicant or result reference"
        className="mt-7 rounded-2xl p-4"
      >
        <ResultFilter
          id="result-review-state"
          label="Filter by review state"
          value={reviewState}
          onChange={(value) => {
            setReviewState(value)
            table.setPageIndex(0)
          }}
          allLabel="All review states"
          options={officialResultReviewStates}
        />
        <ResultFilter
          id="result-source"
          label="Filter by result source"
          value={source}
          onChange={(value) => {
            setSource(value)
            table.setPageIndex(0)
          }}
          allLabel="All sources"
          options={officialResultSources}
        />
      </DataTableToolbar>

      {table.getRowModel().rows.length ? (
        <>
          <div className="mt-5 hidden overflow-hidden rounded-2xl bg-background shadow-sm lg:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Official result records matching the current filters
              </caption>
              <thead className="bg-secondary/80">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-4 py-4 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/60 last:border-b-0 hover:bg-secondary/45"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:hidden">
            {table.getRowModel().rows.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl bg-background p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <ClipboardCheck aria-hidden="true" className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-extrabold">
                      {row.original.applicantName}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {row.original.id}
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Source</dt>
                    <dd className="mt-1 font-semibold">
                      {row.original.source}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Version</dt>
                    <dd className="mt-1 font-semibold">
                      v{row.original.version}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Review state</dt>
                    <dd className="mt-2">
                      <ResultStateBadge state={row.original.reviewState} />
                    </dd>
                  </div>
                </dl>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenResult(row.original.id)}
                  className="mt-5 w-full"
                >
                  Open result
                  <ChevronRight aria-hidden="true" />
                </Button>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl bg-background p-10 text-center shadow-sm">
          <ClipboardCheck
            aria-hidden="true"
            className="mx-auto size-6 text-muted-foreground"
          />
          <h2 className="mt-4 text-lg font-extrabold">No results found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Clear the filters or try a different search.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={resetFilters}
            className="mt-5"
          >
            Clear filters
          </Button>
        </div>
      )}

      <TablePagination
        itemLabel="official result"
        visibleCount={table.getRowModel().rows.length}
        totalCount={filteredResults.length}
        pageIndex={table.getState().pagination.pageIndex}
        pageCount={table.getPageCount()}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
        onPreviousPage={() => table.previousPage()}
        onNextPage={() => table.nextPage()}
      />
    </div>
  )
}

interface ResultFilterProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  allLabel: string
  options: readonly string[]
}

function ResultFilter({
  id,
  label,
  value,
  onChange,
  allLabel,
  options,
}: ResultFilterProps) {
  return (
    <label
      htmlFor={id}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-semibold"
    >
      <SlidersHorizontal aria-hidden="true" className="size-4" />
      <span className="sr-only">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 bg-transparent outline-none"
      >
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export { OfficialResultsPage }
