import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { ModuleGrid } from '@/features/auth/components/dashboard-overview'
import type { DashboardModule } from '@/features/auth/workspace-definitions'
import {
  studentAvailableActions,
  studentJourney,
} from '@/features/student/dashboard/data/mock-student-dashboard'

interface StudentDashboardPageProps {
  modules: DashboardModule[]
  query: string
  onSelectModule: (moduleId: string) => void
}

function StudentDashboardPage({
  modules,
  query,
  onSelectModule,
}: StudentDashboardPageProps) {
  if (query) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-extrabold tracking-[-0.045em]">
          Search student workspace
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open a matching area from your Student Applicant workspace.
        </p>
        <ModuleGrid
          modules={modules}
          query={query}
          onSelect={onSelectModule}
          label="Student modules"
        />
      </div>
    )
  }

  return (
    <div className="w-full">
      <section
        aria-labelledby="student-dashboard-title"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-primary/10 p-6 shadow-sm sm:p-8 lg:min-h-64"
      >
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-28 size-80 rounded-full bg-primary/8 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute right-12 top-9 hidden size-40 rounded-full ring-1 ring-primary/15 sm:block"
        />
        <div
          aria-hidden="true"
          className="absolute right-24 top-20 hidden size-20 rounded-full ring-1 ring-primary/20 sm:block"
        />

        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-extrabold text-primary">
            Welcome back
          </p>
          <h1
            id="student-dashboard-title"
            className="mt-3 text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl"
          >
            Your guidance journey,{' '}
            <span className="text-primary">one step at a time.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Review your current application stages and continue the next
            available task from one organized workspace.
          </p>
          <Button
            type="button"
            onClick={() => onSelectModule('guidance')}
            className="mt-6"
          >
            Review course guidance
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>

        <span className="absolute bottom-7 right-8 hidden size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm sm:flex">
          <Sparkles aria-hidden="true" className="size-5" />
        </span>
      </section>

      <section aria-labelledby="journey-status-title" className="mt-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Current status
            </p>
            <h2
              id="journey-status-title"
              className="mt-1 text-xl font-extrabold"
            >
              Your application journey
            </h2>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Select a stage to open its workspace
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {studentJourney.map((stage, index) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectModule(stage.moduleId)}
              className="group min-w-0 rounded-2xl bg-background p-5 text-left shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <stage.icon aria-hidden="true" className="size-4.5" />
                </span>
                <span className="text-[10px] font-extrabold text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-6 text-sm font-extrabold">{stage.label}</h3>
              <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">
                {stage.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <StatusBadge label={stage.status} tone={stage.tone} />
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                  {stage.actionLabel}
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <section
          aria-labelledby="next-step-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-canvas-cream text-warning">
                <Compass aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                  Recommended next step
                </p>
                <h2 id="next-step-title" className="mt-1 text-lg font-extrabold">
                  Review your course guidance
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Your ranked course options, explanations, comparison, and
                  decision tools are available for review.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => onSelectModule('guidance')}
              className="shrink-0"
            >
              Review guidance
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-secondary/65 p-4">
              <CheckCircle2
                aria-hidden="true"
                className="size-4 text-success"
              />
              <p className="mt-3 text-xs font-extrabold">Progress is preserved</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                Return to the saved assessment workspace.
              </p>
            </div>
            <div className="rounded-xl bg-secondary/65 p-4">
              <ShieldCheck
                aria-hidden="true"
                className="size-4 text-primary"
              />
              <p className="mt-3 text-xs font-extrabold">Your records only</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                Student access remains scoped to your account.
              </p>
            </div>
            <div className="rounded-xl bg-secondary/65 p-4">
              <LockKeyhole
                aria-hidden="true"
                className="size-4 text-brand-dark"
              />
              <p className="mt-3 text-xs font-extrabold">Official data is read-only</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                Examination information cannot be edited here.
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section
            aria-labelledby="available-actions-title"
            className="rounded-2xl bg-background p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Quick access
            </p>
            <h2
              id="available-actions-title"
              className="mt-1 text-lg font-extrabold"
            >
              Available actions
            </h2>
            <ul className="mt-4 space-y-2">
              {studentAvailableActions.map((action) => (
                <li key={action.id}>
                  <button
                    type="button"
                    onClick={() => onSelectModule(action.moduleId)}
                    className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                      <action.icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-extrabold">
                        {action.label}
                      </span>
                      <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">
                        {action.description}
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-brand-dark p-5 text-white shadow-sm">
            <BookOpenBoundary />
          </section>
        </aside>
      </div>
    </div>
  )
}

function BookOpenBoundary() {
  return (
    <>
      <ShieldCheck aria-hidden="true" className="size-5 text-brand-soft" />
      <h2 className="mt-5 text-sm font-extrabold">Guidance, not enrolment</h2>
      <p className="mt-2 text-xs leading-5 text-white/65">
        Course guidance supports your decision. It does not guarantee
        admission, reserve a slot, or enrol you in a program.
      </p>
    </>
  )
}

export { StudentDashboardPage }
