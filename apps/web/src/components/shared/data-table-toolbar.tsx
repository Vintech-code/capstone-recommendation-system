import {
  CollectionToolbar,
  type CollectionToolbarProps,
} from '@/components/shared/collection-toolbar'

type DataTableToolbarProps = CollectionToolbarProps

function DataTableToolbar(props: DataTableToolbarProps) {
  return (
    <CollectionToolbar
      searchLabel="Search table"
      searchPlaceholder="Search…"
      clearSearchLabel="Clear table search"
      {...props}
    />
  )
}

export { DataTableToolbar }
export type { DataTableToolbarProps }
