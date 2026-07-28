import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ServerCog,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { ModuleGrid } from '@/features/auth/components/dashboard-overview'
import type { DashboardModule } from '@/features/auth/workspace-definitions'
import {
  accessTasks,
  auditEvents,
  serviceStatuses,
  systemAdminMetrics,
  type SystemAdminRange,
} from '@/features/system-admin/dashboard/data/mock-system-admin-dashboard'
import { cn } from '@/lib/utils'

interface SystemAdminDashboardPageProps {
  modules: DashboardModule[]
  query: string
  onSelectModule: (moduleId: string) => void
}

const metricToneClasses = {
  primary: 'bg-primary/10 text-primary',
  blue: 'bg-chart-blue/10 text-chart-blue',
  teal: 'bg-chart-teal/10 text-chart-teal',
  amber: 'bg-canvas-cream text-warning',
}

function SystemAdminDashboardPage({
  modules,
  query,
  onSelectModule,
}: SystemAdminDashboardPageProps) {
  const [range, setRange] = useState<SystemAdminRange>('24h')

  if (query) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-extrabold tracking-[-0.045em]">
          Search system administration
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open a matching technical or access-control area.
        </p>
        <ModuleGrid
          modules={modules}
          query={query}
          onSelect={onSelectModule}
          label="System administration modules"
        />
      </div>
    )
  }

  return (
    <div className="w-full">
      <section
        aria-labelledby="system-admin-dashboard-title"
        className="relative min-h-56 overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-primary/10 p-6 shadow-sm sm:p-8"
      >
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-28 size-80 rounded-full bg-primary/8 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute right-10 top-8 size-32 rounded-full ring-1 ring-primary/15 sm:right-24 sm:size-44"
        />
        <div
          aria-hidden="true"
          className="absolute right-20 top-16 size-16 rounded-full ring-1 ring-primary/20 sm:right-32 sm:size-24"
        />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold text-primary">
              System Administrator workspace
            </p>
            <h1
              id="system-admin-dashboard-title"
              className="mt-3 text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl"
            >
              Secure access,{' '}
              <span className="text-primary">visible operations.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Review account access, technical service status, and auditable
              configuration activity from one focused workspace.
            </p>
            <Button
              type="button"
              onClick={() => onSelectModule('users')}
              className="mt-6"
            >
              Review user access
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>

          <div
            role="group"
            aria-label="System activity period"
            className="flex w-fit items-center gap-1 rounded-xl bg-background/90 p-1 shadow-sm backdrop-blur"
          >
            <CalendarDays
              aria-hidden="true"
              className="ml-2 size-4 text-muted-foreground"
            />
            {(
              [
                ['24h', '24 hours'],
                ['7d', '7 days'],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={range === value ? 'default' : 'ghost'}
                aria-pressed={range === value}
                onClick={() => setRange(value)}
                className="h-8"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <span className="absolute bottom-6 right-7 hidden size-12 items-center justify-center rounded-2xl bg-brand-dark text-white shadow-sm sm:flex">
          <ServerCog aria-hidden="true" className="size-5" />
        </span>
      </section>

      <section aria-label="System administration summaries" className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {systemAdminMetrics.map((metric) => (
            <button
              key={metric.id}
              type="button"
              onClick={() => onSelectModule(metric.moduleId)}
              className="group min-w-0 rounded-2xl bg-background p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                    metricToneClasses[metric.tone],
                  )}
                >
                  <metric.icon aria-hidden="true" className="size-4.5" />
                </span>
                <strong className="text-2xl font-extrabold tracking-[-0.04em]">
                  {metric.values[range]}
                </strong>
              </div>
              <h2 className="mt-5 text-sm font-extrabold">{metric.label}</h2>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                {metric.helper}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                Open workspace
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)]">
        <section
          aria-labelledby="access-review-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Access operations
              </p>
              <h2 id="access-review-title" className="mt-1 text-lg font-extrabold">
                Items requiring review
              </h2>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Ordered by recent activity
            </p>
          </div>

          <ol className="mt-5 space-y-3">
            {accessTasks.map((task, index) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onSelectModule(task.moduleId)}
                  className="group flex w-full flex-col gap-4 rounded-xl bg-secondary/60 p-4 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:flex-row sm:items-center"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-[10px] font-extrabold text-primary shadow-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold">{task.title}</span>
                      <StatusBadge label={task.status} tone={task.tone} />
                    </span>
                    <span className="mt-1 block text-[11px] leading-5 text-muted-foreground">
                      {task.detail}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center justify-between gap-4 sm:block sm:text-right">
                    <span className="block text-[10px] text-muted-foreground">
                      {task.timestamp}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                      Review
                      <ArrowRight
                        aria-hidden="true"
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="service-status-title"
          className="rounded-2xl bg-brand-dark p-5 text-white shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/55">
                Technical overview
              </p>
              <h2 id="service-status-title" className="mt-1 text-lg font-extrabold">
                Service status
              </h2>
            </div>
            <Sparkles aria-hidden="true" className="size-5 text-brand-soft" />
          </div>
          <ul className="mt-5 space-y-2">
            {serviceStatuses.map((service) => (
              <li
                key={service.id}
                className="flex items-start gap-3 rounded-xl bg-white/7 p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-soft">
                  <service.icon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-extrabold">
                    {service.label}
                  </span>
                  <span className="mt-1 block text-[10px] leading-4 text-white/55">
                    {service.detail}
                  </span>
                </span>
                <StatusBadge
                  label={service.status}
                  tone={service.tone}
                  className="shrink-0 bg-white text-brand-dark"
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,.55fr)]">
        <section
          aria-labelledby="audit-activity-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Traceability
              </p>
              <h2 id="audit-activity-title" className="mt-1 text-lg font-extrabold">
                Recent audit activity
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectModule('audit')}
            >
              View audit
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
          <ol className="mt-5 grid gap-3 md:grid-cols-3">
            {auditEvents.map((event) => (
              <li key={event.id} className="rounded-xl bg-secondary/60 p-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <event.icon aria-hidden="true" className="size-4" />
                </span>
                <p className="mt-4 text-xs font-extrabold">{event.title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {event.actor} · {event.id}
                </p>
                <p className="mt-3 text-[10px] font-bold text-primary">
                  {event.timestamp}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <aside className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
          <h2 className="mt-5 text-sm font-extrabold">
            Technical responsibility only
          </h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            This workspace manages approved access and technical operations. It
            does not interpret assessments, decide admission, or alter
            completed guidance records.
          </p>
        </aside>
      </div>
    </div>
  )
}

export { SystemAdminDashboardPage }
