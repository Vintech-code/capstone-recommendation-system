import { ArrowRight, FilePenLine, ListChecks } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { QuestionnaireStatusBadge } from '@/features/admin/assessments/components/questionnaire-status-badge'
import { mockQuestionnaires } from '@/features/admin/assessments/data/mock-questionnaires'

interface QuestionnaireVersionsPageProps {
  onOpenAssessments: () => void
  onOpenQuestionnaire: (questionnaireId: string) => void
}

function QuestionnaireVersionsPage({
  onOpenAssessments,
  onOpenQuestionnaire,
}: QuestionnaireVersionsPageProps) {
  return (
    <div className="w-full">
      <AdminPageHeader
        title="Questionnaire versions"
        description="Review the questionnaire lifecycle, response format, item count, and historical versions."
        actions={
          <Button type="button" variant="secondary" onClick={onOpenAssessments}>
            <ListChecks aria-hidden="true" />
            Assessment sessions
          </Button>
        }
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {mockQuestionnaires.map((questionnaire) => (
          <article
            key={questionnaire.id}
            className="flex flex-col rounded-2xl bg-background p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <FilePenLine aria-hidden="true" className="size-5" />
              </span>
              <QuestionnaireStatusBadge status={questionnaire.status} />
            </div>
            <p className="mt-7 font-mono text-xs font-bold text-muted-foreground">
              {questionnaire.id} · Version {questionnaire.version}
            </p>
            <h2 className="mt-2 text-lg font-extrabold">
              {questionnaire.name}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
              {questionnaire.description}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-secondary/70 p-4 text-xs">
              <div>
                <dt className="text-muted-foreground">Items</dt>
                <dd className="mt-1 font-bold">{questionnaire.itemCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Response format</dt>
                <dd className="mt-1 font-bold">
                  {questionnaire.responseFormat}
                </dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="secondary"
              className="mt-5 w-full"
              onClick={() => onOpenQuestionnaire(questionnaire.id)}
            >
              Open version
              <ArrowRight aria-hidden="true" />
            </Button>
          </article>
        ))}
      </div>
    </div>
  )
}

export { QuestionnaireVersionsPage }
