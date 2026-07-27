import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { DashboardModule } from '@/features/auth/workspace-definitions'

interface WorkspaceBreadcrumbProps {
  activeModule?: DashboardModule
  activeId: string
  pageLabel?: string
  onSelect: (id: string) => void
}

function WorkspaceBreadcrumb({
  activeModule,
  activeId,
  pageLabel,
  onSelect,
}: WorkspaceBreadcrumbProps) {
  return (
    <Breadcrumb className="mx-auto mb-5 max-w-[90rem]">
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

export { WorkspaceBreadcrumb }
