import {
  ArrowLeft,
  CalendarClock,
  Check,
  Circle,
  FilePenLine,
  History,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { QuestionnaireStatusBadge } from '@/features/admin/assessments/components/questionnaire-status-badge'
import {
  getMockQuestionnaire,
  mockQuestionnaires,
} from '@/features/admin/assessments/data/mock-questionnaires'

interface QuestionnaireDetailPageProps {
  questionnaireId: string
  onBack: () => void
}

function QuestionnaireDetailPage({
  questionnaireId,
  onBack,
}: QuestionnaireDetailPageProps) {
  const questionnaire = getMockQuestionnaire(questionnaireId)

  if (!questionnaire) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-background p-8 text-center shadow-sm">
          <FilePenLine
            aria-hidden="true"
            className="mx-auto size-7 text-muted-foreground"
          />
          <h1 className="mt-5 text-2xl font-extrabold">
            Questionnaire not found
          </h1>
          <Button type="button" onClick={onBack} className="mt-6">
            <ArrowLeft aria-hidden="true" />
            Back to questionnaire versions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Questionnaire versions
      </Button>

      <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-background p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <FilePenLine aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {questionnaire.id} · Version {questionnaire.version}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">
              {questionnaire.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {questionnaire.itemCount} items ·{' '}
              {questionnaire.responseFormat}
            </p>
          </div>
        </div>
        <QuestionnaireStatusBadge status={questionnaire.status} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)]">
        <section className="rounded-2xl bg-background p-6 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Questionnaire preview
            </p>
            <h2 className="mt-1 text-lg font-extrabold">Questionnaire items</h2>
          </div>

          <ol className="mt-6 space-y-4">
            {questionnaire.sampleItems.map((item, index) => (
              <li key={item} className="rounded-2xl bg-secondary/65 p-5">
                <div className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-xs font-extrabold">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{item}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {['Yes', 'No'].map((option) => (
                        <span
                          key={option}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-background px-4 text-sm font-semibold"
                        >
                          <Circle aria-hidden="true" className="size-3.5" />
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <h2 className="font-extrabold">Version details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="mt-2">
                  <QuestionnaireStatusBadge status={questionnaire.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Last updated</dt>
                <dd className="mt-2 flex items-center gap-2 font-semibold">
                  <CalendarClock aria-hidden="true" className="size-4" />
                  <time dateTime={questionnaire.updatedAt}>
                    {questionnaire.updatedLabel}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Response format
                </dt>
                <dd className="mt-2 font-semibold">
                  {questionnaire.responseFormat}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <History aria-hidden="true" className="size-4.5 text-primary" />
              <h2 className="font-extrabold">Version history</h2>
            </div>
            <ol className="mt-5 space-y-3">
              {mockQuestionnaires.map((version) => (
                <li
                  key={version.id}
                  className="flex items-center gap-3 rounded-xl bg-secondary/65 p-3"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-background">
                    {version.id === questionnaire.id ? (
                      <Check aria-hidden="true" className="size-3.5" />
                    ) : (
                      <Circle aria-hidden="true" className="size-3" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-bold">Version {version.version}</p>
                    <p className="text-xs text-muted-foreground">
                      {version.status}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  )
}

export { QuestionnaireDetailPage }
