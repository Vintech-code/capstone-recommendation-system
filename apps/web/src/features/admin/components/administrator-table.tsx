import { ArrowDown, MoreVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AccountAction } from '@/features/admin/components/administrator-dialogs'
import {
  AccessBadges,
  StatusBadge,
} from '@/features/admin/components/administrator-table-parts'
import { getAvatarColor } from '@/features/admin/data/administrator-helpers'
import { formatDate } from '@/features/admin/data/admin-formatters'
import type { ManagedAdministrator } from '@/features/admin/data/admin-api'
import { WorkspaceAvatar } from '@/components/shared/workspace-avatar'

interface AdministratorsTableProps {
  administrators: ManagedAdministrator[]
  currentUserId?: number
  onAction: (action: AccountAction) => void
}

export function AdministratorsTable({
  administrators,
  currentUserId,
  onAction,
}: AdministratorsTableProps) {
  return (
    <div className="overflow-hidden border-y border-border/70 bg-card">
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
                <span className="inline-flex items-center gap-1">
                  Last active <ArrowDown className="size-3 text-muted-foreground" />
                </span>
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Date added
              </th>
              <th scope="col" className="w-12 px-4 py-3 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {administrators.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-xs text-muted-foreground"
                >
                  No administrators found matching your criteria.
                </td>
              </tr>
            ) : (
              administrators.map((administrator) => {
                const isSelf = administrator.id === currentUserId
                const avatarColor = getAvatarColor(administrator.name)

                return (
                  <tr
                    key={administrator.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <WorkspaceAvatar
                          photoUrl={administrator.photoUrl}
                          name={administrator.name}
                          className="size-10 shrink-0"
                          fallbackClassName={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${avatarColor}`}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {administrator.name}
                            {isSelf ? (
                              <span className="ml-1.5 text-[10px] font-semibold text-muted-foreground">
                                (you)
                              </span>
                            ) : null}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {administrator.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <AccessBadges canManage={administrator.canManageAdministrators} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={administrator.accountStatus} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(administrator.lastActiveAt)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(administrator.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <AdministratorRowMenu
                        administrator={administrator}
                        isSelf={isSelf}
                        onAction={onAction}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdministratorRowMenu({
  administrator,
  isSelf,
  onAction,
}: {
  administrator: ManagedAdministrator
  isSelf: boolean
  onAction: (action: AccountAction) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Open menu for ${administrator.name}`}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
        <DropdownMenuItem
          disabled={isSelf}
          onClick={() => onAction({ kind: 'status', administrator })}
          className="cursor-pointer rounded-lg text-xs font-semibold"
        >
          {administrator.accountStatus === 'active'
            ? 'Suspend access'
            : 'Reactivate access'}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isSelf}
          onClick={() => onAction({ kind: 'permission', administrator })}
          className="cursor-pointer rounded-lg text-xs font-semibold"
        >
          {administrator.canManageAdministrators
            ? 'Revoke manager role'
            : 'Grant manager role'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onAction({ kind: 'sessions', administrator })}
          className="cursor-pointer rounded-lg text-xs font-semibold text-destructive focus:text-destructive"
        >
          Revoke active sessions
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
