import { Search, X } from 'lucide-react'
import { useId, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CollectionToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchLabel?: string
  searchPlaceholder?: string
  clearSearchLabel?: string
  children?: ReactNode
  className?: string
}

function CollectionToolbar({
  searchValue,
  onSearchChange,
  searchLabel = 'Search collection',
  searchPlaceholder = 'Search…',
  clearSearchLabel = 'Clear search',
  children,
  className,
}: CollectionToolbarProps) {
  const searchId = useId()

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="relative w-full sm:max-w-sm">
        <Label htmlFor={searchId} className="sr-only">
          {searchLabel}
        </Label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={searchId}
          type="search"
          value={searchValue}
          placeholder={searchPlaceholder}
          className="px-9"
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {searchValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={clearSearchLabel}
            className="absolute right-0 top-1/2 size-9 -translate-y-1/2"
            onClick={() => onSearchChange('')}
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  )
}

export { CollectionToolbar }
export type { CollectionToolbarProps }
