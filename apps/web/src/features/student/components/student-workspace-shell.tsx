import { ChevronDown, LogOut } from 'lucide-react'
import type { ReactNode } from 'react'

import logo from '@/assets/logo.png'
import mobileLogo from '@/assets/logo-optimized.png'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { DashboardModule } from '@/features/auth/workspace-definitions'
import { NotificationCenter } from '@/features/notifications/components/notification-center'
import { cn } from '@/lib/utils'

interface StudentWorkspaceShellProps {
  modules: DashboardModule[]
  activeId: string
  onSelect: (id: string) => void
  onExit: () => void
  studentName?: string
  studentPhotoUrl?: string | null
  children: ReactNode
}

function StudentWorkspaceShell({
  modules,
  activeId,
  onSelect,
  onExit,
  studentName = 'Student',
  studentPhotoUrl = null,
  children,
}: StudentWorkspaceShellProps) {
  const navigationItems = modules
    .filter((item) => item.id !== 'history' && item.id !== 'assessment' && item.id !== 'overview')
    .map(({ id, title, icon }) => ({ id, title, icon }))

  const visibleActiveId = activeId === 'overview' ? 'recommendations' : activeId
  const showNavigation = activeId !== 'assessment'
  const initials = studentName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ST'

  return (
    <div className="min-h-svh bg-background">
      <header className="relative z-30 border-b border-border bg-background md:sticky md:top-0 md:bg-background/95 md:backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-1 px-3 sm:gap-2 sm:px-4 md:h-[4.5rem] md:gap-3 md:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Go to dashboard"
            onClick={() => onSelect('recommendations')}
            className="flex min-h-11 shrink-0 items-center rounded px-0.5 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 md:px-1"
          >
            <img src={mobileLogo} alt="" className="h-8 w-auto object-contain sm:h-9 md:hidden" />
            <img src={logo} alt="" className="hidden h-10 w-auto object-contain md:block" />
          </button>

          {showNavigation ? (
            <nav
              aria-label="Mobile workspace navigation"
              className="min-w-0 flex-1 md:hidden"
            >
              <ul className="grid w-full grid-cols-2 items-stretch">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      aria-label={item.title}
                      title={item.title}
                      aria-current={visibleActiveId === item.id ? 'page' : undefined}
                      className={cn(
                        'relative flex min-h-12 w-full items-center justify-center rounded-xl px-0.5 text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/30 sm:px-1',
                        visibleActiveId === item.id && 'bg-primary-fixed font-semibold text-primary',
                      )}
                    >
                      <Icon aria-hidden="true" className="size-5" />
                      {visibleActiveId === item.id ? (
                        <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                      ) : null}
                    </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          ) : null}

          {showNavigation ? (
            <nav
              aria-label="Workspace navigation"
              data-layout="top-navigation"
              className="ml-auto hidden h-full min-w-0 flex-1 justify-center md:flex"
            >
              <ul className="flex h-full items-center justify-center gap-8 lg:gap-12">
                {navigationItems.map((item) => (
                  <li key={item.id} className="h-full">
                        <button
                          type="button"
                          onClick={() => onSelect(item.id)}
                          aria-label={item.title}
                          aria-current={visibleActiveId === item.id ? 'page' : undefined}
                          className={cn(
                            'relative flex h-full min-h-11 items-center justify-center px-1 font-label text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/30',
                            visibleActiveId === item.id && 'font-semibold text-primary',
                          )}
                        >
                          {item.title === 'Interest assessment' ? 'Assessment' : item.title}
                          {visibleActiveId === item.id ? (
                            <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-primary" />
                          ) : null}
                        </button>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="ml-auto flex-1" />
          )}

          {showNavigation ? (
            <>
              <NotificationCenter workspaceLabel="Student" onNavigate={onSelect} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open user menu"
                    className="flex min-h-11 shrink-0 items-center gap-2 rounded px-0.5 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 md:px-1"
                  >
                    <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary-fixed text-xs font-bold text-on-primary-fixed">
                      {studentPhotoUrl ? <img src={studentPhotoUrl} alt={`${studentName} profile`} className="size-full object-cover" /> : initials}
                    </span>
                    <span className="hidden text-xs font-bold xl:block">{studentName}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className="hidden size-3.5 text-muted-foreground sm:block"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <span className="block">{studentName}</span>
                    <span className="mt-1 block font-normal text-muted-foreground">
                      Student Applicant
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={onExit}>
                    <LogOut aria-hidden="true" className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}
        </div>

      </header>

      <main>{children}</main>

    </div>
  )
}

export { StudentWorkspaceShell }
