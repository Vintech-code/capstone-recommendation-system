import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Menu,
  Search,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
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
  const currentRole = roleOptions.find((option) => option.value === role)!
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

  return (
    <div
      className={cn(
        'min-h-svh bg-secondary/70 lg:grid lg:transition-[grid-template-columns] lg:duration-300',
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
          desktopNavigationExpanded ? 'p-4' : 'p-3',
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={
            desktopNavigationExpanded
              ? 'Collapse desktop sidebar'
              : 'Expand desktop sidebar'
          }
          aria-expanded={desktopNavigationExpanded}
          onClick={() =>
            setDesktopNavigationExpanded((isExpanded) => !isExpanded)
          }
          className="absolute right-0 top-16 z-20 hidden size-8 translate-x-1/2 rounded-full bg-background shadow-sm lg:inline-flex"
        >
          {desktopNavigationExpanded ? (
            <ChevronLeft aria-hidden="true" />
          ) : (
            <ChevronRight aria-hidden="true" />
          )}
        </Button>

        <div
          className={cn(
            'flex h-14 items-center gap-3',
            desktopNavigationExpanded ? 'px-2' : 'justify-center',
          )}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-dark">
            <span className="size-3 rotate-45 rounded-[0.2rem] bg-brand-soft" />
          </span>
          {desktopNavigationExpanded ? (
            <div>
              <p className="text-sm font-extrabold tracking-[-0.02em]">
                TCC Guidance
              </p>
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
          />
        </div>

        <div className="mt-auto border-t pt-4">
          {desktopNavigationExpanded ? (
            <>
              <div className="mb-3 rounded-xl bg-secondary p-3">
                <p className="text-xs font-bold">{currentRole.shortLabel}</p>
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
        <header className="sticky top-0 z-30 shadow-sm bg-background/92 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
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
                  <SheetTitle>TCC Guidance</SheetTitle>
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
              <div className="relative max-w-sm flex-1">
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
                  onChange={(event) => {
                    setQuery(event.target.value)
                    if (activeId !== 'overview') {
                      if (onSelectModule) {
                        onSelectModule('overview')
                      } else {
                        setInternalActiveId('overview')
                      }
                    }
                  }}
                  placeholder="Search modules"
                  className="h-10 rounded-xl border-transparent bg-secondary pl-9 shadow-none focus-visible:bg-background"
                />
              </div>
            ) : null}

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
                      {currentRole.shortLabel}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      Authorized account
                    </span>
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-full bg-brand-dark text-xs font-bold text-white">
                    {currentRole.shortLabel.slice(0, 2).toUpperCase()}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="hidden size-3.5 text-muted-foreground sm:block"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <span className="block">{currentRole.shortLabel}</span>
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

        <main className="px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <WorkspaceBreadcrumbProvider
            breadcrumb={
              <WorkspaceBreadcrumb
                activeModule={activeModule}
                activeId={activeId}
                className={breadcrumbIsEmbedded ? 'mt-2' : 'mx-auto mb-3'}
                pageLabel={pageLabel}
                onSelect={selectModule}
              />
            }
          >
            {!breadcrumbIsEmbedded ? (
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
        </main>
      </div>
    </div>
  )
}

export { WorkspacePreview }
