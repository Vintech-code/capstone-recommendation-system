import { SearchX } from 'lucide-react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/shared'
import { Button } from '@/components/ui/button'

type AdminPreviewState = 'loading' | 'empty' | 'error'

interface AdminRouteStateProps {
  state: AdminPreviewState
  onClear: () => void
}

function AdminRouteState({ state, onClear }: AdminRouteStateProps) {
  if (state === 'loading') {
    return (
      <LoadingState
        title="Loading workspace"
        description="Preparing the requested Admin records and controls."
      />
    )
  }

  if (state === 'empty') {
    return (
      <EmptyState
        icon={SearchX}
        title="No records in this view"
        description="There are no records matching the current workspace view."
        action={
          <Button type="button" variant="outline" onClick={onClear}>
            Clear view
          </Button>
        }
      />
    )
  }

  return (
    <ErrorState
      title="Workspace could not be loaded"
      description="The requested information is temporarily unavailable. Try loading this view again."
      onRetry={onClear}
    />
  )
}

export { AdminRouteState }
export type { AdminPreviewState }
