import { Mail, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AccessBadges,
  StatusBadge,
} from "@/features/admin/components/administrator-table-parts";
import type { AccountAction } from "@/features/admin/components/administrator-dialogs";
import { formatDate } from "@/features/admin/data/admin-formatters";
import type { AdministratorInvitation } from "@/features/admin/data/admin-api";

interface AdministratorInvitationsTableProps {
  invitations: AdministratorInvitation[];
  canManage: boolean;
  onAction: (action: AccountAction) => void;
}

export function AdministratorInvitationsTable({
  invitations,
  canManage,
  onAction,
}: AdministratorInvitationsTableProps) {
  return (
    <div className="border-y border-border/70 overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/70 bg-muted/40 text-xs font-medium text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                User name
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Access
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Invited by
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Date sent
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {invitations.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-xs text-muted-foreground"
                >
                  No administrator invitations have been recorded yet.
                </td>
              </tr>
            ) : (
              invitations.map((invitation) => (
                <tr
                  key={invitation.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground border border-border/60">
                        <Mail className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {invitation.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {invitation.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <AccessBadges
                      canManage={invitation.canManageAdministrators}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={invitation.status} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                    {invitation.invitedBy || "Administrator"}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(invitation.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {canManage && invitation.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 rounded-md px-2.5 text-xs font-semibold border-border/80"
                          onClick={() =>
                            onAction({ kind: "resend", invitation })
                          }
                        >
                          <RotateCcw className="size-3 mr-1" />
                          Resend
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 rounded-md px-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            onAction({ kind: "revoke-invitation", invitation })
                          }
                        >
                          <Trash2 className="size-3 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
