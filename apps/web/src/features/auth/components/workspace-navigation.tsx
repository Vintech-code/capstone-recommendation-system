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
  tone?: 'default' | 'staff'
}

function WorkspaceNavigation({
  modules,
  activeId,
  onSelect,
  collapsed = false,
  tone = 'default',
}: WorkspaceNavigationProps) {
  const items = [
    { id: 'overview', title: 'Dashboard', icon: LayoutDashboard },
    ...modules,
  ]
  const staffIconTones = [
    'bg-primary-fixed text-primary-ink',
    'bg-[color-mix(in_srgb,var(--riasec-i)_16%,var(--background))] text-foreground',
    'bg-[var(--canvas-sun)] text-warning-ink',
    'bg-[color-mix(in_srgb,var(--info)_16%,var(--background))] text-info-ink',
    'bg-[color-mix(in_srgb,var(--chart-coral)_16%,var(--background))] text-destructive-ink',
  ]

  return (
    <nav aria-label="Workspace navigation">
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={activeId === item.id ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 w-full items-center gap-2.5 px-3 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
                    tone === 'staff' ? 'rounded-xs' : 'rounded-xl',
                    collapsed && 'justify-center px-0',
                    activeId === item.id
                      ? tone === 'staff'
                        ? 'bg-primary-fixed text-foreground ring-1 ring-primary/10'
                        : 'bg-foreground text-background'
                      : tone === 'staff'
                        ? 'text-muted-foreground hover:bg-primary-fixed/70 hover:text-primary-ink'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-xs',
                      tone === 'staff' ? staffIconTones[index % staffIconTones.length] : undefined,
                    )}
                  >
                    <item.icon className="size-4" />
                  </span>
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
