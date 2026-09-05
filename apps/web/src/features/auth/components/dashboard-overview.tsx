import {
  Activity,
  ArrowLeft,
  ChevronRight,
  FileText,
  Search,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type {
  DashboardDefinition,
  DashboardModule,
} from '@/features/auth/workspace-definitions'

interface DashboardOverviewProps {
  definition: DashboardDefinition
  modules: DashboardModule[]
  query: string
  onSelect: (id: string) => void
}

function DashboardOverview({
  definition,
  modules,
  query,
  onSelect,
}: DashboardOverviewProps) {
  return (
    <div className="w-full">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.045em]">
          {definition.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {definition.subtitle}
        </p>
      </div>

      <div className="mt-7 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(17rem,.7fr)]">
        <section
          aria-labelledby="workflow-title"
          className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                Core workflow
              </p>
              <h2 id="workflow-title" className="mt-2 text-xl font-extrabold">
                {definition.workflowTitle}
              </h2>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Activity aria-hidden="true" className="size-4.5" />
            </span>
          </div>

          <ol className="mt-10 grid gap-3 md:grid-cols-4">
            {definition.workflow.map((step, index) => (
              <li key={step} className="relative">
                <div className="rounded-xl bg-secondary/60 p-4">
                  <span className="text-[10px] font-extrabold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-8 text-sm font-bold leading-5">{step}</p>
                </div>
                {index < definition.workflow.length - 1 ? (
                  <ChevronRight
                    aria-hidden="true"
                    className="absolute -right-2.5 top-1/2 z-10 hidden size-4 -translate-y-1/2 rounded-full bg-background text-muted-foreground md:block"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="access-title"
          className="rounded-2xl bg-brand-dark p-5 text-white shadow-sm sm:p-6"
        >
          <ShieldCheck aria-hidden="true" className="size-5 text-brand-soft" />
          <h2 id="access-title" className="mt-8 text-lg font-extrabold">
            Access & responsibility
          </h2>
          <ul className="mt-5 space-y-3">
            {definition.accessFacts.map((fact) => (
              <li
                key={fact}
                className="flex items-start gap-3 text-xs leading-5 text-white/65"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-soft" />
                {fact}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ModuleGrid modules={modules} query={query} onSelect={onSelect} />

      <section className="mt-4 flex items-start gap-4 rounded-2xl bg-background p-5 shadow-sm">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas-sun">
          <ShieldCheck aria-hidden="true" className="size-4.5" />
        </span>
        <div>
          <h2 className="text-sm font-extrabold">System boundary</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {definition.boundary}
          </p>
        </div>
      </section>
    </div>
  )
}

function ModuleGrid({
  modules,
  query,
  onSelect,
  label = 'Workspace modules',
}: {
  modules: DashboardModule[]
  query: string
  onSelect: (id: string) => void
  label?: string
}) {
  return (
    <section aria-labelledby="modules-title" className="mt-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Quick access
          </p>
          <h2 id="modules-title" className="mt-1 text-lg font-extrabold">
            {query ? 'Matching modules' : label}
          </h2>
        </div>
        {query ? (
          <p className="text-xs text-muted-foreground">
            {modules.length} {modules.length === 1 ? 'result' : 'results'}
          </p>
        ) : null}
      </div>

      {modules.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => onSelect(module.id)}
              className="group min-h-48 rounded-2xl bg-background p-5 text-left shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <module.icon aria-hidden="true" className="size-4.5" />
              </span>
              <h3 className="mt-8 font-extrabold">{module.title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {module.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-primary">
                Open module
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-background p-10 text-center shadow-sm">
          <Search
            aria-hidden="true"
            className="mx-auto size-5 text-muted-foreground"
          />
          <h3 className="mt-4 font-bold">No matching modules</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different module name.
          </p>
        </div>
      )}
    </section>
  )
}

function ModuleView({
  module,
  onBack,
}: {
  module: DashboardModule
  onBack: () => void
}) {
  return (
    <div className="w-full">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Dashboard
      </Button>

      <div className="mt-6 rounded-2xl bg-background p-6 shadow-sm sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <module.icon aria-hidden="true" className="size-5" />
        </span>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Workspace module
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">
          {module.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {module.description}
        </p>

        <div className="mt-10 rounded-2xl bg-secondary/40 p-8 text-center shadow-inner sm:p-12">
          <FileText
            aria-hidden="true"
            className="mx-auto size-6 text-muted-foreground"
          />
          <h2 className="mt-4 font-bold">Module workspace</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Forms, actions, and data states for this module will be added in its
            approved development slice.
          </p>
        </div>
      </div>
    </div>
  )
}

export { DashboardOverview, ModuleGrid, ModuleView }
