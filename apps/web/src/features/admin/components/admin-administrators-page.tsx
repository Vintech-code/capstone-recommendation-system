import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AdminPageError,
  AdminPageSkeleton,
} from "@/features/admin/components/admin-shared";
import {
  AdministratorActionDialog,
  InviteAdministratorDialog,
  type AccountAction,
} from "@/features/admin/components/administrator-dialogs";
import { AdministratorInvitationsTable } from "@/features/admin/components/administrator-invitations-table";
import { AdministratorsTable } from "@/features/admin/components/administrator-table";
import {
  invalidateAdminResource,
  useAdminResource,
  type AdministratorManagement,
} from "@/features/admin/data/admin-api";
import { useAuth } from "@/features/auth/auth-context";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function AdminAdministratorsPage() {
  const { user } = useAuth();
  const { data, error, loading, retry } =
    useAdminResource<AdministratorManagement>("/administrators");
  const [activeTab, setActiveTab] = useState<"administrators" | "invitations">(
    "administrators",
  );
  const [inviteOpen, setInviteOpen] = useState(false);
  const [action, setAction] = useState<AccountAction | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<
    "all" | "managers" | "active" | "suspended"
  >("all");
  const [page, setPage] = useState(1);

  const administrators = useMemo(
    () => data?.administrators ?? [],
    [data?.administrators],
  );
  const invitations = useMemo(
    () => data?.invitations ?? [],
    [data?.invitations],
  );
  const canManage = Boolean(user?.canManageAdministrators);

  const filteredAdministrators = useMemo(() => {
    return administrators.filter((admin) => {
      const matchesSearch =
        search === "" ||
        admin.name.toLowerCase().includes(search.toLowerCase()) ||
        admin.email.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (filterRole === "managers") return admin.canManageAdministrators;
      if (filterRole === "active") return admin.accountStatus === "active";
      if (filterRole === "suspended")
        return admin.accountStatus === "suspended";
      return true;
    });
  }, [administrators, search, filterRole]);

  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      if (!search) return true;
      return (
        inv.name.toLowerCase().includes(search.toLowerCase()) ||
        inv.email.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [invitations, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAdministrators.length / PAGE_SIZE),
  );
  const paginatedAdministrators = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAdministrators.slice(start, start + PAGE_SIZE);
  }, [filteredAdministrators, page]);

  if (loading && !data) return <AdminPageSkeleton />;
  if (error || !data) {
    return (
      <AdminPageError
        message={error ?? "The administrator directory could not be loaded."}
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Administrators
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border/70 text-sm">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "administrators"}
          onClick={() => {
            setActiveTab("administrators");
            setPage(1);
          }}
          className={cn(
            "-mb-px flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-xs font-semibold transition-colors sm:text-sm",
            activeTab === "administrators"
              ? "border-foreground font-bold text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Users className="size-4" aria-hidden="true" />
          Administrators
          <span className="rounded-full border border-border/60 bg-muted/70 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {administrators.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "invitations"}
          onClick={() => {
            setActiveTab("invitations");
            setPage(1);
          }}
          className={cn(
            "-mb-px flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-xs font-semibold transition-colors sm:text-sm",
            activeTab === "invitations"
              ? "border-foreground font-bold text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Mail className="size-4" aria-hidden="true" />
          Invitations
          <span className="rounded-full border border-border/60 bg-muted/70 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {invitations.length}
          </span>
        </button>
      </div>

      {/* Search + Filters + Invite bar */}
      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            {activeTab === "administrators"
              ? "All administrators"
              : "All invitations"}
          </h2>
          <span className="rounded-full border border-border/60 bg-muted/70 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {activeTab === "administrators"
              ? filteredAdministrators.length
              : filteredInvitations.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-lg border-border/80 bg-background pl-9 text-xs shadow-2xs sm:w-60"
            />
          </div>

          {/* Filters (administrators tab only) */}
          {activeTab === "administrators" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-lg border-border/80 bg-background text-xs font-semibold shadow-2xs hover:bg-muted"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl p-1.5 text-xs"
              >
                {(["all", "managers", "active", "suspended"] as const).map(
                  (key) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setFilterRole(key)}
                      className={`cursor-pointer rounded-lg ${filterRole === key ? "font-bold" : ""}`}
                    >
                      {key === "all"
                        ? "All administrators"
                        : key === "managers"
                          ? "Account managers"
                          : key === "active"
                            ? "Active accounts"
                            : "Suspended accounts"}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {/* Invite button */}
          {canManage ? (
            <Button
              type="button"
              className="h-9 gap-1.5 rounded-lg bg-zinc-900 px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 dark:bg-primary dark:text-zinc-900"
              onClick={() => setInviteOpen(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Invite administrator
            </Button>
          ) : null}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "administrators" ? (
        <AdministratorsTable
          administrators={paginatedAdministrators}
          currentUserId={user?.id}
          onAction={setAction}
        />
      ) : (
        <AdministratorInvitationsTable
          invitations={filteredInvitations}
          canManage={canManage}
          onAction={setAction}
        />
      )}

      {/* Pagination (administrators tab only) */}
      {activeTab === "administrators" ? (
        <div className="flex items-center justify-between border-t border-border/70 bg-card py-3 text-xs">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 rounded-lg border-border/80 text-xs font-medium"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-3.5" /> Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "secondary" : "ghost"}
                  size="sm"
                  className={`size-8 rounded-lg p-0 text-xs font-semibold ${
                    page === pageNum
                      ? "border border-border/80 bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ),
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 rounded-lg border-border/80 text-xs font-medium"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight className="size-3.5" />
          </Button>
        </div>
      ) : null}

      <InviteAdministratorDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={() => {
          invalidateAdminResource("/administrators");
          retry();
        }}
      />

      {action ? (
        <AdministratorActionDialog
          action={action}
          onOpenChange={(open) => {
            if (!open) setAction(null);
          }}
          onSaved={() => {
            invalidateAdminResource("/administrators");
            retry();
          }}
        />
      ) : null}
    </div>
  );
}

export { AdminAdministratorsPage };
