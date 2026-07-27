import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface TablePaginationProps {
  itemLabel: string
  visibleCount: number
  totalCount: number
  pageIndex: number
  pageCount: number
  canPreviousPage: boolean
  canNextPage: boolean
  onPreviousPage: () => void
  onNextPage: () => void
}

function TablePagination({
  itemLabel,
  visibleCount,
  totalCount,
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
}: TablePaginationProps) {
  return (
    <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {visibleCount} of {totalCount} matching records
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Previous ${itemLabel} page`}
          disabled={!canPreviousPage}
          onClick={onPreviousPage}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <span className="min-w-24 text-center text-sm font-semibold">
          Page {pageIndex + 1} of {Math.max(pageCount, 1)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Next ${itemLabel} page`}
          disabled={!canNextPage}
          onClick={onNextPage}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

export { TablePagination }
