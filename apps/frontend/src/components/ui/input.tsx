import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-12 w-full min-w-0 rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-[border-color,box-shadow,background-color]',
        "placeholder:text-muted-foreground",
        'focus:border-primary focus:ring-0 focus-visible:ring-3 focus-visible:ring-ring/20',
        "aria-invalid:border-destructive",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
      {...props}
    />
  )
}

export { Input }
