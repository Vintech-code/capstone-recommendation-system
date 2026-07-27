import { RotateCcw, TriangleAlert } from 'lucide-react'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className={cn('items-center', className)}>
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{description}</p>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 border-destructive/30 bg-background text-foreground hover:bg-destructive/10"
            onClick={onRetry}
          >
            <RotateCcw aria-hidden="true" />
            {retryLabel}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}

export { ErrorState }
export type { ErrorStateProps }
