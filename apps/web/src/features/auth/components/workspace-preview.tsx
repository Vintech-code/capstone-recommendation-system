import {
  ChevronDown,
  LogOut,
  Menu,
  Search,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
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
import type { AccessRole } from '@/features/auth/access-types'
import { roleOptions } from '@/features/auth/access-types'
import {
  DashboardOverview,
  ModuleView,
} from '@/features/auth/components/dashboard-overview'
import { WorkspaceBreadcrumb } from '@/features/auth/components/workspace-breadcrumb'
import { WorkspaceNavigation } from '@/features/auth/components/workspace-navigation'
import {
  dashboards,
  type DashboardModule,
} from '@/features/auth/workspace-definitions'

interface WorkspacePreviewProps {
  role: AccessRole
  onExit: () => void
  activeModuleId?: string
  onSelectModule?: (id: string) => void
  pageLabel?: string
  children?: ReactNode
  renderOverview?: (context: {
    modules: DashboardModule[]
    query: string
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
  renderOverview,
}: WorkspacePreviewProps) {
  const definition = dashboards[role]
  const currentRole = roleOptions.find((option) => option.value === role)!
  const [internalActiveId, setInternalActiveId] = useState('overview')
  const [query, setQuery] = useState('')
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
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

  return (
    <div className="min-h-svh bg-secondary/70 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside
        aria-label="Workspace sidebar"
        className="hidden h-svh shadow-sm bg-background p-4 lg:sticky lg:top-0 lg:flex lg:flex-col"
      >
        <div className="flex h-14 items-center gap-3 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-dark">
            <span className="size-3 rotate-45 rounded-[0.2rem] bg-brand-soft" />
          </span>
          <div>
            <p className="text-sm font-extrabold tracking-[-0.02em]">
              TCC Guidance
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {currentRole.shortLabel} portal
            </p>
          </div>
        </div>

        <div className="mt-6">
          <WorkspaceNavigation
            modules={definition.modules}
            activeId={activeId}
            onSelect={selectModule}
          />
        </div>

        <div className="mt-auto border-t pt-4">
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
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 shadow-sm bg-background/92 backdrop-blur-xl">
          <div className="flex h-18 items-center gap-3 px-4 sm:px-6 lg:px-8">
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

            <div className="relative max-w-md flex-1">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open user menu"
                  className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
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

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <WorkspaceBreadcrumb
            activeModule={activeModule}
            activeId={activeId}
            pageLabel={pageLabel}
            onSelect={selectModule}
          />
          {children ?? (activeModule ? (
            <ModuleView
              module={activeModule}
              onBack={() => selectModule('overview')}
            />
          ) : renderOverview ? (
            renderOverview({
              modules: filteredModules,
              query,
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
        </main>
      </div>
    </div>
  )
}

export { WorkspacePreview }
