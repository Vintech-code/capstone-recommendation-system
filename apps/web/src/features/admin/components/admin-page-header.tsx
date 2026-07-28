import type { ReactNode } from 'react'

import { WorkspaceBreadcrumbSlot } from '@/features/auth/components/workspace-breadcrumb'

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
    <header>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-[-0.04em] sm:text-[1.75rem]">
            {title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      <WorkspaceBreadcrumbSlot />
    </header>
  )
}

export { AdminPageHeader }
