import type { ReactNode } from 'react'

import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface StudentPageHeaderProps {
  title: string
  description: string
  onBack: () => void
  actions?: ReactNode
}

function StudentPageHeader({
  title,
  description,
  onBack,
  actions,
}: StudentPageHeaderProps) {
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

      <Breadcrumb className="mt-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbButton
              aria-label="Go to Student dashboard"
              onClick={onBack}
            >
              Dashboard
            </BreadcrumbButton>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

export { StudentPageHeader }
