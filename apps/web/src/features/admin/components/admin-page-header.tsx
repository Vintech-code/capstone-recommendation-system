import type { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  description: string
  actions?: ReactNode
}

function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Admin workspace
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.045em]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}

export { AdminPageHeader }
