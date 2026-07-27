import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock3,
  ListFilter,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { ModuleGrid } from '@/features/auth/components/dashboard-overview'
import type { DashboardModule } from '@/features/auth/workspace-definitions'
import {
  activities,
  priorities,
  quickActions,
  tasks,
  workflowStages,
  type WorkArea,
} from '@/features/admin/dashboard/data/mock-admin-dashboard'
import { cn } from '@/lib/utils'

interface AdminDashboardPageProps {
  modules: DashboardModule[]
  query: string
  onSelectModule: (id: string) => void
  onNavigate: (route: string) => void
}

const taskFilters: Array<{ value: WorkArea; label: string }> = [
  { value: 'all', label: 'All work' },
  { value: 'official-results', label: 'Results' },
  { value: 'imports', label: 'Imports' },
  { value: 'assessments', label: 'Assessments' },
  { value: 'recommendations', label: 'Recommendations' },
]

function AdminDashboardPage({
  modules,
  query,
  onSelectModule,
  onNavigate,
}: AdminDashboardPageProps) {
  const [taskFilter, setTaskFilter] = useState<WorkArea>('all')
  const [showAllActivity, setShowAllActivity] = useState(false)
  const filteredTasks = useMemo(
    () =>
      taskFilter === 'all'
        ? tasks
        : tasks.filter((task) => task.area === taskFilter),
    [taskFilter],
  )
  const visibleActivities = showAllActivity ? activities : activities.slice(0, 3)

  return (
    <div className="mx-auto max-w-[90rem]">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Admin workspace
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.045em]">
            Operational overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review current workflow activity and continue the next authorized
            task from one place.
          </p>
        </div>
        <Button type="button" onClick={() => onNavigate('/admin/exam-results/new')}>
          Encode result
          <ArrowRight aria-hidden="true" />
        </Button>
      </header>

      <section aria-labelledby="priority-title" className="mt-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
              Priority overview
            </p>
            <h2 id="priority-title" className="mt-1 text-xl font-extrabold">
              Work requiring attention
            </h2>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Select a card to open its workspace
          </p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {priorities.map((priority) => (
            <button
              key={priority.id}
              type="button"
              onClick={() => onNavigate(priority.route)}
              className="group rounded-2xl bg-background p-5 text-left shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <priority.icon aria-hidden="true" className="size-4.5" />
                </span>
                <span className="text-3xl font-extrabold tracking-[-0.05em]">
                  {priority.count}
                </span>
              </div>
              <h3 className="mt-7 text-sm font-extrabold">{priority.label}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {priority.helper}
              </p>
              <StatusBadge
                label="Open workspace"
                tone={priority.tone}
                className="mt-4"
              />
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,.75fr)]">
        <section
          aria-labelledby="attention-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Needs attention
              </p>
              <h2 id="attention-title" className="mt-1 text-xl font-extrabold">
                Current work queue
              </h2>
            </div>
            <div
              role="group"
              aria-label="Filter current work"
              className="flex max-w-full gap-2 overflow-x-auto pb-1"
            >
              {taskFilters.map((filter) => (
                <Button
                  key={filter.value}
                  type="button"
                  size="sm"
                  variant={taskFilter === filter.value ? 'default' : 'outline'}
                  aria-pressed={taskFilter === filter.value}
                  onClick={() => setTaskFilter(filter.value)}
                >
                  {filter.value === 'all' ? (
                    <ListFilter aria-hidden="true" />
                  ) : null}
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3" aria-live="polite">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onNavigate(task.route)}
                className="group flex w-full flex-col gap-4 rounded-xl bg-secondary/55 p-4 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold">{task.title}</h3>
                    <StatusBadge label={task.status} tone={task.tone} />
                  </div>
                  <p className="mt-2 text-xs font-bold">{task.subject}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {task.context}
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock3 aria-hidden="true" className="size-3.5" />
                    {task.timestamp}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                    Open task
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </button>
            ))}
            {!filteredTasks.length ? (
              <div className="rounded-xl bg-secondary/55 p-8 text-center">
                <p className="text-sm font-bold">No work in this view</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose another queue filter.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section
          aria-labelledby="quick-actions-title"
          className="rounded-2xl bg-brand-dark p-5 text-white shadow-sm sm:p-6"
        >
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-soft">
            Continue work
          </p>
          <h2 id="quick-actions-title" className="mt-1 text-xl font-extrabold">
            Quick actions
          </h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onNavigate(action.route)}
                className="group flex min-h-16 items-center gap-3 rounded-xl bg-white/8 px-3 py-2.5 text-left transition-colors hover:bg-white/13 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/50"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-soft">
                  <action.icon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-extrabold">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-4 text-white/60">
                    {action.description}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 text-white/55 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(21rem,.85fr)]">
        <section
          aria-labelledby="workflow-status-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Workflow status
            </p>
            <h2 id="workflow-status-title" className="mt-1 text-xl font-extrabold">
              Applicant guidance flow
            </h2>
          </div>
          <ol className="mt-5 grid gap-3 md:grid-cols-5">
            {workflowStages.map((stage, index) => (
              <li key={stage.label}>
                <button
                  type="button"
                  onClick={() => onNavigate(stage.route)}
                  className="h-full w-full rounded-xl bg-secondary/55 p-4 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <span className="text-[10px] font-extrabold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-6 text-xs font-extrabold">{stage.label}</h3>
                  <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                    {stage.helper}
                  </p>
                  <StatusBadge
                    label={stage.status}
                    tone={stage.tone}
                    className="mt-4 max-w-full"
                  />
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-canvas-cream p-4">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p className="text-xs leading-5 text-muted-foreground">
              A recorded student preference supports guidance review. It is not
              an admission decision or enrolment action.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="activity-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Workspace history
              </p>
              <h2 id="activity-title" className="mt-1 text-xl font-extrabold">
                Recent activity
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={showAllActivity}
              onClick={() => setShowAllActivity((current) => !current)}
            >
              {showAllActivity ? 'Show less' : 'View all'}
              {showAllActivity ? (
                <ChevronUp aria-hidden="true" />
              ) : (
                <ChevronDown aria-hidden="true" />
              )}
            </Button>
          </div>
          <ol className="mt-5 space-y-2">
            {visibleActivities.map((activity) => (
              <li key={activity.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(activity.route)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                    <activity.icon aria-hidden="true" className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-extrabold">
                      {activity.title}
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                      {activity.detail}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {activity.timestamp}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <ModuleGrid
        modules={modules}
        query={query}
        onSelect={onSelectModule}
        label="Admin modules"
      />
    </div>
  )
}

export { AdminDashboardPage }
