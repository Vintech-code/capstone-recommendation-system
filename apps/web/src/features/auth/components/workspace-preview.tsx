import { ChevronDown, LogOut, Menu, Search, Settings, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import logo from "@/assets/logo/header-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AccessRole } from "@/features/auth/access-types";
import { useAuth } from "@/features/auth/auth-context";
import { roleOptions } from "@/features/auth/access-types";
import {
  DashboardOverview,
  ModuleView,
} from "@/features/auth/components/dashboard-overview";
import {
  WorkspaceBreadcrumb,
  WorkspaceBreadcrumbProvider,
} from "@/features/auth/components/workspace-breadcrumb";
import { WorkspaceNavigation } from "@/features/auth/components/workspace-navigation";
import {
  dashboards,
  type DashboardModule,
} from "@/features/auth/workspace-definitions";
import { StudentWorkspaceShell } from "@/features/student/components/student-workspace-shell";
import { prefetchStudentWorkspace } from "@/features/student/student-workspace-prefetch";
import { NotificationCenter } from "@/features/notifications/components/notification-center";
import { WorkspaceAvatar } from "@/features/auth/components/workspace-avatar";
import { AdminThemeDropdownItem, AdminThemeToggle } from "@/features/admin/theme/admin-theme-toggle";
import { cn } from "@/lib/utils";

interface WorkspacePreviewProps {
  role: AccessRole;
  onExit: () => void;
  activeModuleId?: string;
  onSelectModule?: (id: string) => void;
  pageLabel?: string;
  children?: ReactNode;
  embedBreadcrumbInPageHeader?: boolean;
  moduleSearchPlacement?: "topbar" | "overview";
  renderOverview?: (context: {
    modules: DashboardModule[];
    query: string;
    onQueryChange: (query: string) => void;
    onSelect: (id: string) => void;
  }) => ReactNode;
  renderModule?: (context: {
    module: DashboardModule;
    onBack: () => void;
    onSelect: (id: string) => void;
  }) => ReactNode;
}

function WorkspacePreview({
  role,
  onExit,
  activeModuleId,
  onSelectModule,
  pageLabel,
  children,
  embedBreadcrumbInPageHeader = false,
  moduleSearchPlacement = "topbar",
  renderOverview,
  renderModule,
}: WorkspacePreviewProps) {
  const definition = dashboards[role];
  const { user } = useAuth();
  const currentRole = roleOptions.find((option) => option.value === role)!;
  const isStaff = role === "admin";
  const [internalActiveId, setInternalActiveId] = useState(
    role === "student" ? "assessment" : "overview",
  );
  const [query, setQuery] = useState("");
  const [workspaceSearchOpen, setWorkspaceSearchOpen] = useState(false);
  const [desktopNavigationExpanded, setDesktopNavigationExpanded] =
    useState(true);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const activeId = activeModuleId ?? internalActiveId;

  const availableModules = useMemo(
    () =>
      definition.modules.filter(
        (module) =>
          module.id !== "administrators" || user?.canManageAdministrators,
      ),
    [definition.modules, user?.canManageAdministrators],
  );

  useEffect(() => {
    if (role !== "student") return;
    void prefetchStudentWorkspace();
  }, [role]);

  const activeModule = availableModules.find(
    (module) => module.id === activeId,
  );

  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return availableModules;
    return availableModules.filter((module) =>
      `${module.title} ${module.description}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [availableModules, query]);

  const selectModule = (id: string) => {
    if (onSelectModule) {
      onSelectModule(id);
    } else {
      setInternalActiveId(id);
    }
    setQuery("");
  };

  const customModuleView =
    activeModule && renderModule
      ? renderModule({
          module: activeModule,
          onBack: () => selectModule("overview"),
          onSelect: selectModule,
        })
      : undefined;

  const breadcrumbIsEmbedded =
    embedBreadcrumbInPageHeader &&
    (activeId === "overview" || Boolean(children ?? customModuleView));
  const showWorkspaceBreadcrumb = role === "student";

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    if (activeId !== "overview") {
      if (onSelectModule) onSelectModule("overview");
      else setInternalActiveId("overview");
    }
  };

  const workspaceContent = (
    <WorkspaceBreadcrumbProvider
      breadcrumb={
        showWorkspaceBreadcrumb ? (
          <WorkspaceBreadcrumb
            activeModule={activeModule}
            activeId={activeId}
            className={breadcrumbIsEmbedded ? "mt-2" : "mx-auto mb-3"}
            pageLabel={pageLabel}
            onSelect={selectModule}
          />
        ) : null
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
      {children ??
        (activeModule ? (
          (customModuleView ?? (
            <ModuleView
              module={activeModule}
              onBack={() => selectModule("overview")}
            />
          ))
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
  );

  if (role === "student") {
    return (
      <StudentWorkspaceShell
        modules={availableModules}
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
    );
  }

  return (
    <div
      className={cn(
        "min-h-svh lg:grid lg:transition-[grid-template-columns] lg:duration-300",
        isStaff
          ? "staff-workspace-theme bg-background text-foreground"
          : "bg-secondary/70",
        desktopNavigationExpanded
          ? "lg:grid-cols-[15rem_minmax(0,1fr)]"
          : "lg:grid-cols-[5rem_minmax(0,1fr)]",
      )}
    >
      <aside
        aria-label="Workspace sidebar"
        data-collapsed={!desktopNavigationExpanded}
        className={cn(
          "relative hidden h-svh overflow-hidden lg:sticky lg:top-0 lg:flex lg:flex-col lg:transition-[padding] lg:duration-300",
          isStaff
            ? "border-r border-[#262f21] bg-[#34402d] text-white dark:bg-[#10170f] dark:border-[#202c1d]"
            : "border-r border-border bg-card",
          desktopNavigationExpanded
            ? isStaff
              ? "py-3 px-0"
              : "p-3"
            : isStaff
              ? "py-2.5 px-0"
              : "p-2.5",
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 grid h-1 grid-cols-4"
        >
          <span className="bg-primary" />
          <span className="bg-riasec-i" />
          <span className="bg-warning" />
          <span className="bg-info" />
        </div>
        <div
          className={cn(
            "flex h-12 items-center gap-2.5",
            desktopNavigationExpanded
              ? isStaff
                ? "px-4"
                : "px-2"
              : "justify-center",
          )}
        >
          <img
            src={logo}
            alt="Academic guidance system"
            className={cn(
              "h-8 object-contain",
              desktopNavigationExpanded ? "w-auto max-w-32" : "w-11",
            )}
          />
          {desktopNavigationExpanded ? (
            <p
              className={cn(
                "text-[9px] font-bold uppercase tracking-[0.14em]",
                isStaff ? "text-emerald-100/70" : "text-muted-foreground",
              )}
            >
              {currentRole.shortLabel} portal
            </p>
          ) : null}
        </div>

        <div className="mt-4">
          <WorkspaceNavigation
            modules={availableModules}
            activeId={activeId}
            onSelect={selectModule}
            collapsed={!desktopNavigationExpanded}
            tone={isStaff ? "staff" : "default"}
          />
        </div>

        <div
          className={cn(
            "mt-auto border-t pt-4",
            isStaff ? "border-white/10" : "border-border",
          )}
        >
          {desktopNavigationExpanded ? (
            <div className={cn("mb-3 flex items-center gap-3", isStaff ? "px-4 py-2" : "px-3 py-2")}>
              <WorkspaceAvatar
                photoUrl={user?.photoUrl}
                name={user?.name ?? currentRole.shortLabel}
                className="size-8 shrink-0 border border-white/20"
                fallbackClassName="size-8 shrink-0 text-xs"
              />
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-xs font-bold", isStaff ? "text-white" : "text-foreground")}>
                  {user?.name ?? currentRole.shortLabel}
                </p>
                <p className={cn("mt-0.5 truncate text-[11px]", isStaff ? "text-emerald-100/60" : "text-muted-foreground")}>
                  {user?.email ?? "Authorized account"}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-3 flex justify-center">
              <WorkspaceAvatar
                photoUrl={user?.photoUrl}
                name={user?.name ?? currentRole.shortLabel}
                className="size-7 border border-white/20"
                fallbackClassName="size-7 text-[10px]"
              />
            </div>
          )}
          {desktopNavigationExpanded ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onExit}
              className={cn(
                "w-full justify-start",
                isStaff
                  ? "rounded-none px-4 text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground",
              )}
            >
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onExit}
                  aria-label="Sign out"
                  className={cn(
                    "mx-auto",
                    isStaff
                      ? "text-white/70 hover:bg-white/10 hover:text-white"
                      : "text-muted-foreground",
                  )}
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
        <header
          className={cn(
            "sticky top-0 z-30 border-b bg-background/95 backdrop-blur-xl",
            isStaff
              ? "border-border bg-card/95"
              : "border-transparent shadow-sm",
          )}
        >
          <div className="flex h-14 items-center gap-2.5 px-4 sm:px-5 lg:px-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                desktopNavigationExpanded
                  ? "Collapse workspace navigation"
                  : "Expand workspace navigation"
              }
              aria-expanded={desktopNavigationExpanded}
              onClick={() =>
                setDesktopNavigationExpanded((isExpanded) => !isExpanded)
              }
              className="hidden rounded-xs lg:inline-flex"
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
              <SheetContent
                className={cn(
                  "left-0 right-auto w-72 border-l-0 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
                  isStaff
                    ? "border-r border-[#262f21] bg-[#34402d] text-white px-0 py-6 dark:bg-[#10170f] dark:border-[#202c1d]"
                    : "border-r",
                )}
              >
                <SheetHeader className={isStaff ? "px-4" : undefined}>
                  <SheetTitle>
                    <img
                      src={logo}
                      alt="Academic guidance system"
                      className="h-9 w-auto object-contain"
                    />
                  </SheetTitle>
                  <SheetDescription
                    className={isStaff ? "text-emerald-100/70" : undefined}
                  >
                    {currentRole.label}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-7">
                  <WorkspaceNavigation
                    modules={availableModules}
                    activeId={activeId}
                    onSelect={(id) => {
                      selectModule(id);
                      setMobileNavigationOpen(false);
                    }}
                    tone={isStaff ? "staff" : "default"}
                  />
                </div>
                <div
                  className={cn(
                    "mt-auto border-t pt-4",
                    isStaff ? "border-white/10" : "border-border",
                  )}
                >
                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onExit}
                      className={cn(
                        "w-full justify-start",
                        isStaff
                          ? "rounded-none px-4 text-white/70 hover:bg-white/10 hover:text-white"
                          : "",
                      )}
                    >
                      <LogOut aria-hidden="true" />
                      Sign out
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            <div
              aria-label="Workspace actions"
              className="ml-auto flex items-center gap-2"
            >
              {moduleSearchPlacement === "topbar" ? (
                isStaff ? (
                  workspaceSearchOpen ? (
                    <div className="relative flex min-w-0 items-center justify-center gap-2">
                      <div className="relative w-full max-w-md">
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
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && filteredModules[0]) {
                              selectModule(filteredModules[0].id);
                            }
                          }}
                          placeholder="Search students, assessments, programmes…"
                          className="h-11 w-full rounded-xs border-border bg-background pl-9 text-xs text-foreground shadow-none placeholder:text-muted-foreground focus-visible:bg-background"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Close workspace search"
                        onClick={() => {
                          setQuery("");
                          setWorkspaceSearchOpen(false);
                        }}
                        className="shrink-0 rounded-xs text-muted-foreground hover:text-foreground"
                      >
                        <X aria-hidden="true" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Open workspace search"
                      onClick={() => setWorkspaceSearchOpen(true)}
                      className="rounded-xs text-muted-foreground hover:text-foreground"
                    >
                      <Search aria-hidden="true" />
                    </Button>
                  )
                ) : (
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
                      onChange={(event) => changeQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && filteredModules[0]) {
                          selectModule(filteredModules[0].id);
                        }
                      }}
                      placeholder="Search modules"
                      className="h-11 rounded-xl border-transparent bg-secondary pl-9 text-xs shadow-none focus-visible:bg-background"
                    />
                  </div>
                )
              ) : null}

              {isStaff ? (
                <>
                  <NotificationCenter workspaceLabel="Administrator" onNavigate={selectModule} />
                  <AdminThemeToggle />
                </>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open user menu"
                    className="flex h-10 shrink-0 items-center gap-1.5 rounded-full p-1 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    <WorkspaceAvatar
                      photoUrl={user?.photoUrl}
                      name={user?.name ?? currentRole.shortLabel}
                      className="size-9 border border-border/80"
                      fallbackClassName="size-9 text-xs"
                    />
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-center gap-3">
                      <WorkspaceAvatar
                        photoUrl={user?.photoUrl}
                        name={user?.name ?? currentRole.shortLabel}
                        className="size-10 shrink-0 border border-border/80"
                        fallbackClassName="size-10 shrink-0 text-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-foreground">
                          {user?.name ?? currentRole.shortLabel}
                        </span>
                        <span className="block truncate text-xs font-normal text-muted-foreground">
                          {user?.email ?? "Authorized account"}
                        </span>
                        <span className="mt-1 inline-block rounded-xs bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {currentRole.label}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isStaff ? (
                    <>
                      <DropdownMenuItem
                        onSelect={() => selectModule("profile")}
                        className="cursor-pointer gap-2"
                      >
                        <Settings aria-hidden="true" className="size-4" />
                        Profile settings
                      </DropdownMenuItem>
                      <AdminThemeDropdownItem />
                    </>
                  ) : null}
                  <DropdownMenuItem
                    onSelect={onExit}
                    className="cursor-pointer gap-2"
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main
          className={cn(
            "px-4 py-4 sm:px-5 lg:px-6 lg:py-5",
            isStaff && "staff-dashboard-canvas",
          )}
        >
          {workspaceContent}
        </main>
      </div>
    </div>
  );
}

export { WorkspacePreview };
