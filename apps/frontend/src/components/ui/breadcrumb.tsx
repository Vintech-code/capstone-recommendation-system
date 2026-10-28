import { ChevronRight } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Breadcrumb({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function BreadcrumbList({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li className={cn('inline-flex items-center gap-2', className)} {...props} />
  )
}

function BreadcrumbButton({
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-sm font-semibold transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      aria-current="page"
      className={cn('font-bold text-foreground', className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ className }: { className?: string }) {
  return (
    <ChevronRight
      aria-hidden="true"
      className={cn('size-3.5 text-muted-foreground/70', className)}
    />
  )
}

export {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
