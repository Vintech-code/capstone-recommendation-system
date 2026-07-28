import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-12 w-full min-w-0 rounded-s border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors',
        "placeholder:text-muted-foreground",
        'focus:border-primary/55 focus:ring-0 focus-visible:ring-0',
        "aria-invalid:border-destructive",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
      {...props}
    />
  )
}

export { Input }
