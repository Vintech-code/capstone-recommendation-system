import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  AdminDashboardCharts,
  MetricSparkline,
  type ActivityRange,
} from '@/features/admin/dashboard/components/admin-dashboard-charts'
import {
  activities,
  dashboardMetrics,
  recentApplicants,
} from '@/features/admin/dashboard/data/mock-admin-dashboard'
import { cn } from '@/lib/utils'

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void
}

const metricToneClasses = {
  primary: 'bg-primary/10 text-primary',
  blue: 'bg-chart-blue/10 text-chart-blue',
  teal: 'bg-chart-teal/10 text-chart-teal',
  amber: 'bg-canvas-cream text-warning',
  navy: 'bg-brand-dark/8 text-brand-dark',
}

const metricChartColors = {
  primary: 'var(--primary)',
  blue: 'var(--chart-blue)',
  teal: 'var(--chart-teal)',
  amber: 'var(--warning)',
  navy: 'var(--brand-dark)',
}

function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const [activityRange, setActivityRange] = useState<ActivityRange>('7d')

  return (
    <div className="w-full">
      <section
        aria-labelledby="dashboard-hero-title"
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
          <div className="max-w-xl">
            <p className="text-xs font-extrabold text-primary">
              Good day, Admin
            </p>
            <h1
              id="dashboard-hero-title"
              className="mt-3 text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl"
            >
              Insights today,{' '}
              <span className="text-primary">guidance tomorrow.</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Monitor applicant workflows, assessment activity, and guidance
              review from one organized workspace.
            </p>
            <Button
              type="button"
              onClick={() => onNavigate('/admin/applicants')}
              className="mt-6"
            >
              Review applicants
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>

          <div
            role="group"
            aria-label="Dashboard activity period"
            className="flex w-fit items-center gap-1 rounded-xl bg-background/90 p-1 shadow-sm backdrop-blur"
          >
            <CalendarDays
              aria-hidden="true"
              className="ml-2 size-4 text-muted-foreground"
            />
            {(
              [
                ['7d', '7 days'],
                ['30d', '30 days'],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={activityRange === value ? 'default' : 'ghost'}
                aria-pressed={activityRange === value}
                onClick={() => setActivityRange(value)}
                className="h-8"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <span className="absolute bottom-6 right-7 hidden size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm sm:flex">
          <Sparkles aria-hidden="true" className="size-5" />
        </span>
      </section>

      <section aria-label="Dashboard summaries" className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {dashboardMetrics.map((metric) => (
            <button
              key={metric.id}
              type="button"
              onClick={() => onNavigate(metric.route)}
              className="group min-w-0 rounded-2xl bg-background p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                    metricToneClasses[metric.tone],
                  )}
                >
                  <metric.icon aria-hidden="true" className="size-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-muted-foreground">
                    {metric.label}
                  </span>
                  <strong className="mt-1 block text-2xl font-extrabold tracking-[-0.04em]">
                    {metric.value}
                  </strong>
                </span>
              </div>
              <p className="mt-3 text-[11px] font-bold text-muted-foreground">
                {metric.helper}
              </p>
              <MetricSparkline
                data={metric.trend}
                color={metricChartColors[metric.tone]}
              />
            </button>
          ))}
        </div>
      </section>

      <AdminDashboardCharts range={activityRange} />

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <section
          aria-labelledby="recent-applicants-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Applicant overview
              </p>
              <h2
                id="recent-applicants-title"
                className="mt-1 text-lg font-extrabold"
              >
                Recent applicants
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/admin/applicants')}
            >
              View all
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full min-w-160 text-left text-xs">
              <thead className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th scope="col" className="pb-3 font-bold">
                    Applicant
                  </th>
                  <th scope="col" className="pb-3 font-bold">
                    Current area
                  </th>
                  <th scope="col" className="pb-3 font-bold">
                    Status
                  </th>
                  <th scope="col" className="pb-3 font-bold">
                    Updated
                  </th>
                  <th scope="col" className="pb-3 text-right font-bold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentApplicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="border-t border-border/70"
                  >
                    <td className="py-3">
                      <p className="font-extrabold">{applicant.name}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {applicant.id}
                      </p>
                    </td>
                    <td className="py-3 font-semibold">
                      {applicant.currentArea}
                    </td>
                    <td className="py-3">
                      <StatusBadge
                        label={applicant.status}
                        tone={applicant.tone}
                      />
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {applicant.updatedAt}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Open ${applicant.name}`}
                        onClick={() => onNavigate(applicant.route)}
                      >
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-5 space-y-3 md:hidden">
            {recentApplicants.map((applicant) => (
              <li key={applicant.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(applicant.route)}
                  className="flex w-full items-center gap-3 rounded-xl bg-secondary/60 p-3 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-extrabold text-primary">
                    {applicant.id.slice(-3)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-extrabold">
                      {applicant.name}
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                      {applicant.currentArea}
                    </span>
                  </span>
                  <StatusBadge
                    label={applicant.status}
                    tone={applicant.tone}
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="activity-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Workspace history
          </p>
          <h2 id="activity-title" className="mt-1 text-lg font-extrabold">
            Latest activity
          </h2>
          <ol className="mt-5 space-y-2">
            {activities.map((activity) => (
              <li key={activity.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(activity.route)}
                  className="group flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
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
    </div>
  )
}

export { AdminDashboardPage }
