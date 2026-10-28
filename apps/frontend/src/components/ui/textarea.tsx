import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-28 w-full min-w-0 resize-y rounded-s border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors',
        'placeholder:text-muted-foreground',
        'focus:border-primary/55 focus:ring-0 focus-visible:ring-0',
        'aria-invalid:border-destructive',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
