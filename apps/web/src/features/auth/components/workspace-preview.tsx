import {
  Bell,
  ChartNoAxesCombined,
  ChevronDown,
  LogOut,
  Menu,
  Search,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import logo from '@/assets/logo.png'
import tccBanner from '@/assets/tccbanner.jpg'
import { ThemeToggle } from '@/components/shared'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { AccessRole } from '@/features/auth/access-types'
import { useAuth } from '@/features/auth/auth-context'
import { roleOptions } from '@/features/auth/access-types'
import {
  DashboardOverview,
  ModuleView,
} from '@/features/auth/components/dashboard-overview'
import {
  WorkspaceBreadcrumb,
  WorkspaceBreadcrumbProvider,
} from '@/features/auth/components/workspace-breadcrumb'
import { WorkspaceNavigation } from '@/features/auth/components/workspace-navigation'
import {
  dashboards,
  type DashboardModule,
} from '@/features/auth/workspace-definitions'
import { StudentWorkspaceShell } from '@/features/student/components/student-workspace-shell'
import { cn } from '@/lib/utils'

interface WorkspacePreviewProps {
  role: AccessRole
  onExit: () => void
  activeModuleId?: string
  onSelectModule?: (id: string) => void
  pageLabel?: string
  children?: ReactNode
  embedBreadcrumbInPageHeader?: boolean
  moduleSearchPlacement?: 'topbar' | 'overview'
  renderOverview?: (context: {
    modules: DashboardModule[]
    query: string
    onQueryChange: (query: string) => void
    onSelect: (id: string) => void
  }) => ReactNode
  renderModule?: (context: {
    module: DashboardModule
    onBack: () => void
    onSelect: (id: string) => void
  }) => ReactNode
}

function WorkspacePreview({
  role,
  onExit,
  activeModuleId,
  onSelectModule,
  pageLabel,
  children,
  embedBreadcrumbInPageHeader = false,
  moduleSearchPlacement = 'topbar',
  renderOverview,
  renderModule,
}: WorkspacePreviewProps) {
  const definition = dashboards[role]
  const { user } = useAuth()
  const currentRole = roleOptions.find((option) => option.value === role)!
  const isAdmin = role === 'admin'
  const isStaff = role === 'admin' || role === 'counselor'
  const [internalActiveId, setInternalActiveId] = useState('overview')
  const [query, setQuery] = useState('')
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [desktopNavigationExpanded, setDesktopNavigationExpanded] =
    useState(true)
  const activeId = activeModuleId ?? internalActiveId

  const activeModule = definition.modules.find(
    (module) => module.id === activeId,
  )
  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return definition.modules

    return definition.modules.filter((module) =>
      `${module.title} ${module.description}`
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [definition.modules, query])

  const selectModule = (id: string) => {
    if (onSelectModule) {
      onSelectModule(id)
    } else {
      setInternalActiveId(id)
    }
    setQuery('')
  }
  const customModuleView =
    activeModule && renderModule
      ? renderModule({
          module: activeModule,
          onBack: () => selectModule('overview'),
          onSelect: selectModule,
        })
      : undefined
  const breadcrumbIsEmbedded =
    embedBreadcrumbInPageHeader &&
    (activeId === 'overview' || Boolean(children ?? customModuleView))
  const showWorkspaceBreadcrumb = role === 'student'

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery)
    if (activeId !== 'overview') {
      if (onSelectModule) {
        onSelectModule('overview')
      } else {
        setInternalActiveId('overview')
      }
    }
  }

  const workspaceContent = (
    <WorkspaceBreadcrumbProvider
      breadcrumb={
        showWorkspaceBreadcrumb ? <WorkspaceBreadcrumb
          activeModule={activeModule}
          activeId={activeId}
          className={breadcrumbIsEmbedded ? 'mt-2' : 'mx-auto mb-3'}
          pageLabel={pageLabel}
          onSelect={selectModule}
        /> : null
      }
    >
      {showWorkspaceBreadcrumb && !breadcrumbIsEmbedded ? (
        <WorkspaceBreadcrumb
          activeModule={activeModule}
          activeId={activeId}
          className="mx-auto mb-3"
          pageLabel={pageLabel}
          onSelect={selectModule}
        />
      ) : null}
      {children ?? (activeModule ? (
        customModuleView ?? (
          <ModuleView
            module={activeModule}
            onBack={() => selectModule('overview')}
          />
        )
      ) : renderOverview ? (
        renderOverview({
          modules: filteredModules,
          query,
          onQueryChange: setQuery,
          onSelect: selectModule,
        })
      ) : (
        <DashboardOverview
          definition={definition}
          modules={filteredModules}
          query={query}
          onSelect={selectModule}
        />
      ))}
    </WorkspaceBreadcrumbProvider>
  )

  if (role === 'student') {
    return (
      <StudentWorkspaceShell
        modules={definition.modules}
        activeId={activeId}
        onSelect={selectModule}
        onExit={onExit}
      >
        {workspaceContent}
      </StudentWorkspaceShell>
    )
  }

  return (
    <div
      className={cn(
        'min-h-svh lg:grid lg:transition-[grid-template-columns] lg:duration-300',
        isStaff ? 'staff-workspace-theme bg-background text-foreground' : 'bg-secondary/70',
        desktopNavigationExpanded
          ? 'lg:grid-cols-[16rem_minmax(0,1fr)]'
          : 'lg:grid-cols-[5rem_minmax(0,1fr)]',
      )}
    >
      <aside
        aria-label="Workspace sidebar"
        data-collapsed={!desktopNavigationExpanded}
        className={cn(
          'relative hidden h-svh bg-background shadow-sm lg:sticky lg:top-0 lg:flex lg:flex-col lg:transition-[padding] lg:duration-300',
          isStaff && 'border-r border-border/70 dark:border-white/8',
          desktopNavigationExpanded ? 'p-4' : 'p-3',
        )}
      >
        <div
          className={cn(
            'flex h-14 items-center gap-3',
            desktopNavigationExpanded ? 'px-2' : 'justify-center',
          )}
        >
          <img src={logo} alt="Academic guidance system" className={cn('h-9 object-contain', desktopNavigationExpanded ? 'w-auto max-w-36' : 'w-12')} />
          {desktopNavigationExpanded ? (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {currentRole.shortLabel} portal
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <WorkspaceNavigation
            modules={definition.modules}
            activeId={activeId}
            onSelect={selectModule}
            collapsed={!desktopNavigationExpanded}
            tone={isStaff ? 'staff' : 'default'}
          />
        </div>

        {isStaff && desktopNavigationExpanded ? <div className="relative mt-auto overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-sm dark:border-violet-400/15 dark:from-violet-500/10 dark:via-cyan-400/5 dark:to-transparent dark:shadow-[inset_0_1px_0_rgba(255,255,255,.04)]"><img src={tccBanner} alt="" className="absolute inset-x-0 top-0 h-24 w-full object-cover opacity-15 dark:opacity-10" /><span className="relative flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-gradient-to-br dark:from-violet-500/25 dark:to-cyan-400/20 dark:text-cyan-300"><ChartNoAxesCombined className="size-6" aria-hidden="true" /></span><p className="relative mt-5 text-sm font-bold text-foreground">{isAdmin ? <>Smart guidance.<br />Better futures.</> : <>Guiding today,<br />empowering tomorrow.</>}</p><p className="relative mt-2 text-xs leading-5 text-muted-foreground">{isAdmin ? 'Keep programme and student records ready for guidance.' : 'Keep student concerns, schedules, and follow-ups moving.'}</p></div> : null}

        <div className={cn('border-t pt-4', isStaff && desktopNavigationExpanded ? 'mt-4 border-border/70 dark:border-white/8' : 'mt-auto')}>
          {desktopNavigationExpanded ? (
            <>
              <div className={cn('mb-3 rounded-xl p-3', isStaff ? 'bg-secondary dark:bg-white/5' : 'bg-secondary')}>
                <p className="text-xs font-bold">{user?.name ?? currentRole.shortLabel}</p>
                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                  Authorized account
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={onExit}
                className="w-full justify-start text-muted-foreground"
              >
                <LogOut aria-hidden="true" />
                Sign out
              </Button>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onExit}
                  aria-label="Sign out"
                  className="mx-auto text-muted-foreground"
                >
                  <LogOut aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                Sign out
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>

      <div className="min-w-0">
        <header className={cn('sticky top-0 z-30 border-b bg-background/88 backdrop-blur-xl', isStaff ? 'border-border/70 dark:border-white/8' : 'border-transparent shadow-sm')}>
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={desktopNavigationExpanded ? 'Collapse workspace navigation' : 'Expand workspace navigation'}
              aria-expanded={desktopNavigationExpanded}
              onClick={() => setDesktopNavigationExpanded((isExpanded) => !isExpanded)}
              className="hidden rounded lg:inline-flex"
            >
              <Menu aria-hidden="true" />
            </Button>
            <Sheet
              open={mobileNavigationOpen}
              onOpenChange={setMobileNavigationOpen}
            >
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open workspace navigation"
                >
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent className="left-0 right-auto w-72 border-l-0 border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0">
                <SheetHeader>
                  <SheetTitle><img src={logo} alt="Academic guidance system" className="h-9 w-auto object-contain" /></SheetTitle>
                  <SheetDescription>{currentRole.label}</SheetDescription>
                </SheetHeader>
                <div className="mt-7">
                  <WorkspaceNavigation
                    modules={definition.modules}
                    activeId={activeId}
                    onSelect={(id) => {
                      selectModule(id)
                      setMobileNavigationOpen(false)
                    }}
                    tone={isStaff ? 'staff' : 'default'}
                  />
                </div>
                <div className="mt-auto border-t pt-4">
                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onExit}
                      className="w-full justify-start"
                    >
                      <LogOut aria-hidden="true" />
                      Sign out
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            {moduleSearchPlacement === 'topbar' ? (
              <div className={cn('relative flex-1', isStaff ? 'mx-auto max-w-md' : 'max-w-sm')}>
                <label htmlFor="workspace-search" className="sr-only">
                  Search modules
                </label>
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="workspace-search"
                  type="search"
                  value={query}
                  onChange={(event) => changeQuery(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter' && filteredModules[0]) selectModule(filteredModules[0].id) }}
                  placeholder={isStaff ? `Search ${isAdmin ? 'students, assessments, programmes' : 'students, requests, appointments'}…` : 'Search modules'}
                  className={cn('h-10 rounded-xl pl-9 shadow-none', isStaff ? 'border-border/70 bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:bg-background dark:border-white/8 dark:bg-white/5 dark:focus-visible:bg-white/8' : 'border-transparent bg-secondary focus-visible:bg-background')}
                />
              </div>
            ) : null}

            {isStaff ? <Button type="button" variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground dark:hover:bg-white/8" aria-label={isAdmin ? 'Open recent activity' : 'Open guidance requests'} onClick={() => selectModule(isAdmin ? 'activity' : 'requests')}><Bell aria-hidden="true" /></Button> : null}
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open user menu"
                  className="ml-auto flex min-h-11 items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <span className="hidden text-right sm:block">
                    <span className="block text-xs font-bold">
                      {user?.name ?? currentRole.shortLabel}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      Authorized account
                    </span>
                  </span>
                  <span className={cn('flex size-9 items-center justify-center rounded-full text-xs font-bold text-white', isStaff ? 'bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-violet-500 dark:to-blue-600' : 'bg-brand-dark')}>
                    {(user?.name ?? currentRole.shortLabel).slice(0, 2).toUpperCase()}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="hidden size-3.5 text-muted-foreground sm:block"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <span className="block">{user?.name ?? currentRole.shortLabel}</span>
                  <span className="mt-1 block font-normal text-muted-foreground">
                    {currentRole.label}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onExit}>
                  <LogOut aria-hidden="true" className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className={cn('px-4 py-4 sm:px-6 lg:px-8 lg:py-7', isStaff && 'staff-dashboard-canvas')}>
          {workspaceContent}
        </main>
      </div>
    </div>
  )
}

export { WorkspacePreview }
