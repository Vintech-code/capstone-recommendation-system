import { ArrowRight, BookOpen, Scale } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { LifecycleStatusBadge } from '@/features/admin/courses-rules/components/lifecycle-status-badge'
import { mockAdmissionRules } from '@/features/admin/courses-rules/data/mock-courses-rules'

function AdmissionRulesPage({
  onOpenCatalogue,
  onOpenRule,
}: {
  onOpenCatalogue: () => void
  onOpenRule: (id: string) => void
}) {
  return (
    <div className="w-full">
      <AdminPageHeader
        title="Admission rules"
        description="Review eligibility-rule versions, lifecycle status, scope, conditions, and effective periods."
        actions={
          <Button type="button" variant="secondary" onClick={onOpenCatalogue}>
            <BookOpen aria-hidden="true" />
            Course catalogue
          </Button>
        }
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {mockAdmissionRules.map((rule) => (
          <article
            key={rule.id}
            className="flex flex-col rounded-2xl bg-background p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <Scale aria-hidden="true" className="size-5" />
              </span>
              <LifecycleStatusBadge status={rule.status} />
            </div>
            <p className="mt-7 font-mono text-xs font-bold text-muted-foreground">
              {rule.id} · Version {rule.version}
            </p>
            <h2 className="mt-2 text-lg font-extrabold">{rule.name}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{rule.scope}</p>
            <p className="mt-5 flex-1 text-sm font-semibold">
              {rule.effectiveLabel}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-6 w-full"
              onClick={() => onOpenRule(rule.id)}
            >
              Open rule
              <ArrowRight aria-hidden="true" />
            </Button>
          </article>
        ))}
      </div>
    </div>
  )
}

export { AdmissionRulesPage }
