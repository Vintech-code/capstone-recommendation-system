import { ArrowLeft, CalendarClock, CheckCircle2, History, Scale } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LifecycleStatusBadge } from '@/features/admin/courses-rules/components/lifecycle-status-badge'
import { mockAdmissionRules } from '@/features/admin/courses-rules/data/mock-courses-rules'

function AdmissionRuleDetailPage({
  ruleId,
  onBack,
}: {
  ruleId: string
  onBack: () => void
}) {
  const rule = mockAdmissionRules.find((item) => item.id === ruleId)

  if (!rule) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-background p-8 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold">Rule not found</h1>
        <Button type="button" className="mt-6" onClick={onBack}>
          Back to admission rules
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Admission rules
      </Button>
      <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-background p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <Scale aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-mono text-xs font-bold text-muted-foreground">
              {rule.id} · Version {rule.version}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">
              {rule.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{rule.scope}</p>
          </div>
        </div>
        <LifecycleStatusBadge status={rule.status} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-2xl bg-background p-6 shadow-sm">
          <h2 className="text-lg font-extrabold">Eligibility conditions</h2>
          <ol className="mt-6 space-y-3">
            {rule.conditions.map((condition, index) => (
              <li
                key={condition}
                className="flex gap-4 rounded-xl bg-secondary/70 p-4"
              >
                <CheckCircle2 className="size-5 shrink-0 text-success" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    Condition {index + 1}
                  </p>
                  <p className="mt-1 font-semibold">{condition}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <div className="space-y-5">
          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarClock className="size-5 text-primary" />
              <h2 className="font-extrabold">Effective period</h2>
            </div>
            <p className="mt-5 font-bold">{rule.effectiveLabel}</p>
          </section>
          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <History className="size-5 text-primary" />
              <h2 className="font-extrabold">Version history</h2>
            </div>
            <ul className="mt-5 space-y-3">
              {mockAdmissionRules.map((version) => (
                <li
                  key={version.id}
                  className="rounded-xl bg-secondary/70 p-4 text-sm"
                >
                  <p className="font-bold">Version {version.version}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {version.status} · {version.effectiveLabel}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

export { AdmissionRuleDetailPage }
