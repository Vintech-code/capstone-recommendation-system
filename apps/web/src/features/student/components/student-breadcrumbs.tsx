import { ChevronRight } from 'lucide-react'

interface StudentBreadcrumbsProps {
  parentLabel: string
  currentLabel: string
  onParentSelect: () => void
}

function StudentBreadcrumbs({
  parentLabel,
  currentLabel,
  onParentSelect,
}: StudentBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="student-page py-4">
      <ol className="flex min-w-0 items-center gap-2 font-label text-sm">
        <li>
          <button
            type="button"
            onClick={onParentSelect}
            className="min-h-11 rounded px-2 font-medium text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            {parentLabel}
          </button>
        </li>
        <li aria-hidden="true" className="text-muted-foreground">
          <ChevronRight className="size-4" />
        </li>
        <li aria-current="page" className="truncate font-semibold text-foreground">
          {currentLabel}
        </li>
      </ol>
    </nav>
  )
}

export { StudentBreadcrumbs }
