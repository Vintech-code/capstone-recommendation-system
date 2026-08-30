import {
  ChartNoAxesCombined,
  ChevronDown,
  LogOut,
  Menu,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import logo from '@/assets/logo.png'
import tccBanner from '@/assets/tccbanner.jpg'
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
import { prefetchStudentWorkspace } from '@/features/student/student-workspace-prefetch'
import { NotificationCenter } from '@/features/notifications/components/notification-center'
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
  const isStaff = role === 'admin'
  const [internalActiveId, setInternalActiveId] = useState(role === 'student' ? 'assessment' : 'overview')
  const [query, setQuery] = useState('')
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [desktopNavigationExpanded, setDesktopNavigationExpanded] =
    useState(true)
  const activeId = activeModuleId ?? internalActiveId

  useEffect(() => {
    if (role !== 'student') return
    void prefetchStudentWorkspace()
  }, [role])

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
        studentName={user?.name}
        studentPhotoUrl={user?.photoUrl}
      >
        <div key={activeId} className="student-page-enter">
          {workspaceContent}
        </div>
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
          isStaff && 'border-r border-border',
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

        {isStaff && desktopNavigationExpanded ? <div className="relative mt-auto overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary-fixed via-card to-success/10 p-5 shadow-[var(--shadow-card)]"><img src={tccBanner} alt="" className="absolute inset-x-0 top-0 h-24 w-full object-cover opacity-[0.06]" /><span className="relative flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-sm"><ChartNoAxesCombined className="size-6" aria-hidden="true" /></span><p className="relative mt-5 text-sm font-bold text-foreground">Accurate records.<br />Better decisions.</p><p className="relative mt-2 text-xs leading-5 text-muted-foreground">Keep programme, assessment, and student records current.</p></div> : null}

        <div className={cn('border-t pt-4', isStaff && desktopNavigationExpanded ? 'mt-4 border-border' : 'mt-auto')}>
          {desktopNavigationExpanded ? (
            <>
              <div className="mb-3 rounded-2xl bg-secondary p-3">
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
        <header className={cn('sticky top-0 z-30 border-b bg-background/92 backdrop-blur-xl', isStaff ? 'border-border' : 'border-transparent shadow-sm')}>
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
                  placeholder={isStaff ? 'Search students, assessments, programmes…' : 'Search modules'}
                  className={cn('h-11 rounded-xl pl-9 shadow-none', isStaff ? 'border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:bg-background' : 'border-transparent bg-secondary focus-visible:bg-background')}
                />
              </div>
            ) : null}

            {isStaff ? <NotificationCenter workspaceLabel="Administrator" className="rounded-xl" onNavigate={selectModule} /> : null}
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
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
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
