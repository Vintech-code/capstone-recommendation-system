import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronRight, SlidersHorizontal, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DataTableToolbar } from '@/components/shared/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { TablePagination } from '@/features/admin/components/table-pagination'
import { TableSortButton } from '@/features/admin/components/table-sort-button'
import {
  mockApplicants,
  reviewAreas,
  type MockApplicant,
} from '@/features/admin/applicants/data/mock-applicants'

interface ApplicantManagementPageProps {
  onOpenApplicant: (applicantId: string) => void
}

function ApplicantManagementPage({
  onOpenApplicant,
}: ApplicantManagementPageProps) {
  const [searchValue, setSearchValue] = useState('')
  const [reviewArea, setReviewArea] = useState('all')
  const [sorting, setSorting] = useState<SortingState>([])

  const filteredApplicants = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return mockApplicants.filter((applicant) => {
      const matchesArea =
        reviewArea === 'all' || applicant.reviewArea === reviewArea
      const matchesSearch =
        !normalizedSearch ||
        `${applicant.name} ${applicant.email} ${applicant.id}`
          .toLowerCase()
          .includes(normalizedSearch)

      return matchesArea && matchesSearch
    })
  }, [reviewArea, searchValue])

  const columns = useMemo<ColumnDef<MockApplicant>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <TableSortButton
            label="Applicant"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-bold">{row.original.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <TableSortButton
            label="Reference"
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
        accessorKey: 'reviewArea',
        header: ({ column }) => (
          <TableSortButton
            label="Review area"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        ),
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {row.original.reviewArea}
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
            onClick={() => onOpenApplicant(row.original.id)}
          >
            Open record
            <ChevronRight aria-hidden="true" />
          </Button>
        ),
      },
    ],
    [onOpenApplicant],
  )

  // TanStack Table intentionally returns a mutable table instance.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredApplicants,
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
    setReviewArea('all')
    table.setPageIndex(0)
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <AdminPageHeader
        title="Applicants"
        description="Search and review applicant records across the documented Admin workflow areas."
      />

      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          table.setPageIndex(0)
        }}
        searchLabel="Search applicants"
        searchPlaceholder="Search name, email, or reference"
        className="mt-7 rounded-2xl p-4"
      >
        <label
          htmlFor="review-area"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-semibold"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <span className="sr-only">Filter by review area</span>
          <select
            id="review-area"
            value={reviewArea}
            onChange={(event) => {
              setReviewArea(event.target.value)
              table.setPageIndex(0)
            }}
            className="min-h-11 bg-transparent outline-none"
          >
            <option value="all">All review areas</option>
            {reviewAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
      </DataTableToolbar>

      {table.getRowModel().rows.length ? (
        <>
          <div className="mt-5 hidden overflow-hidden rounded-2xl bg-background shadow-sm md:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Applicant records matching the current filters
              </caption>
              <thead className="bg-secondary/80">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground"
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
                      <td key={cell.id} className="px-5 py-4 align-middle">
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

          <div className="mt-5 grid gap-4 md:hidden">
            {table.getRowModel().rows.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl bg-background p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <UserRound aria-hidden="true" className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-extrabold">{row.original.name}</h2>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {row.original.email}
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Reference</dt>
                    <dd className="mt-1 font-mono font-semibold">
                      {row.original.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd className="mt-1 font-semibold">
                      {row.original.updatedLabel}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Review area</dt>
                    <dd className="mt-1 font-semibold">
                      {row.original.reviewArea}
                    </dd>
                  </div>
                </dl>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenApplicant(row.original.id)}
                  className="mt-5 w-full"
                >
                  Open record
                  <ChevronRight aria-hidden="true" />
                </Button>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl bg-background p-10 text-center shadow-sm">
          <UserRound
            aria-hidden="true"
            className="mx-auto size-6 text-muted-foreground"
          />
          <h2 className="mt-4 text-lg font-extrabold">No applicants found</h2>
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
        itemLabel="applicant"
        visibleCount={table.getRowModel().rows.length}
        totalCount={filteredApplicants.length}
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

export { ApplicantManagementPage }
