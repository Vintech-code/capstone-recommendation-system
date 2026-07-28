import { LayoutDashboard } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { DashboardModule } from '@/features/auth/workspace-definitions'
import { cn } from '@/lib/utils'

interface WorkspaceNavigationProps {
  modules: DashboardModule[]
  activeId: string
  onSelect: (id: string) => void
  collapsed?: boolean
}

function WorkspaceNavigation({
  modules,
  activeId,
  onSelect,
  collapsed = false,
}: WorkspaceNavigationProps) {
  const items = [
    { id: 'overview', title: 'Dashboard', icon: LayoutDashboard },
    ...modules,
  ]

  return (
    <nav aria-label="Workspace navigation">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={activeId === item.id ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
                    collapsed && 'justify-center px-0',
                    activeId === item.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <item.icon aria-hidden="true" className="size-4 shrink-0" />
                  <span className={cn(collapsed && 'sr-only')}>
                    {item.title}
                  </span>
                </button>
              </TooltipTrigger>
              {collapsed ? (
                <TooltipContent side="right" sideOffset={12}>
                  {item.title}
                </TooltipContent>
              ) : null}
            </Tooltip>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { WorkspaceNavigation }
