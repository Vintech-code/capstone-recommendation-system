import { ArrowDownUp } from 'lucide-react'

interface TableSortButtonProps {
  label: string
  onClick: () => void
}

function TableSortButton({ label, onClick }: TableSortButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      {label}
      <ArrowDownUp aria-hidden="true" className="size-3.5" />
    </button>
  )
}

export { TableSortButton }
