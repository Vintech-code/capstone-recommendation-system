import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'

import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { DashboardModule } from '@/features/auth/workspace-definitions'
import { cn } from '@/lib/utils'

interface WorkspaceBreadcrumbProps {
  activeModule?: DashboardModule
  activeId: string
  className?: string
  pageLabel?: string
  onSelect: (id: string) => void
}

const WorkspaceBreadcrumbContext = createContext<ReactNode>(null)

function WorkspaceBreadcrumb({
  activeModule,
  activeId,
  className,
  pageLabel,
  onSelect,
}: WorkspaceBreadcrumbProps) {
  return (
    <Breadcrumb className={cn('w-full', className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          {activeId === 'overview' ? (
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          ) : (
            <BreadcrumbButton
              aria-label="Go to dashboard"
              onClick={() => onSelect('overview')}
            >
              Dashboard
            </BreadcrumbButton>
          )}
        </BreadcrumbItem>
        {activeModule ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {pageLabel ? (
                <BreadcrumbButton
                  aria-label={`Go to ${activeModule.title}`}
                  onClick={() => onSelect(activeModule.id)}
                >
                  {activeModule.title}
                </BreadcrumbButton>
              ) : (
                <BreadcrumbPage>{activeModule.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        ) : null}
        {pageLabel ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function WorkspaceBreadcrumbProvider({
  breadcrumb,
  children,
}: {
  breadcrumb: ReactNode
  children: ReactNode
}) {
  return (
    <WorkspaceBreadcrumbContext.Provider value={breadcrumb}>
      {children}
    </WorkspaceBreadcrumbContext.Provider>
  )
}

function WorkspaceBreadcrumbSlot() {
  return useContext(WorkspaceBreadcrumbContext)
}

export {
  WorkspaceBreadcrumb,
  WorkspaceBreadcrumbProvider,
  WorkspaceBreadcrumbSlot,
}
