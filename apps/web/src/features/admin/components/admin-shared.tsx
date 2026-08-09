import { AlertCircle, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="grid gap-4 py-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        <div className="flex items-center gap-3"><span className="h-7 w-1 rounded-full bg-secondary-container" aria-hidden="true" /><p className="font-label text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p></div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  )
}

function AdminPageSkeleton() {
  return (
    <div role="status" aria-label="Loading guidance workspace" className="space-y-5">
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 rounded-lg" />)}
      </div>
      <Skeleton className="h-80 rounded-lg" />
      <span className="sr-only">Loading guidance workspace</span>
    </div>
  )
}

function AdminPageError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section role="alert" className="flex min-h-72 flex-col items-center justify-center bg-card px-6 text-center shadow-sm">
      <span className="flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertCircle aria-hidden="true" /></span>
      <h1 className="mt-4 font-display text-2xl font-semibold">Unable to load this workspace</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">{message}</p>
      <Button className="mt-5 rounded" onClick={onRetry}><RotateCcw aria-hidden="true" /> Try again</Button>
    </section>
  )
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center bg-card px-6 text-center shadow-sm">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export { AdminPageError, AdminPageHeader, AdminPageSkeleton, EmptyPanel }
