import {
  ArrowLeft,
  BookOpenCheck,
  ClipboardCheck,
  FileClock,
  FileText,
  Mail,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { mockApplicants } from '@/features/admin/applicants/data/mock-applicants'

interface ApplicantDetailPageProps {
  applicantId: string
  onBack: () => void
}

const recordSections = [
  {
    title: 'Application profile',
    description: 'Applicant information and application review workspace.',
    icon: FileText,
  },
  {
    title: 'Official result',
    description: 'Official result record and version history.',
    icon: ClipboardCheck,
  },
  {
    title: 'Assessment',
    description: 'Approved questionnaire and assessment review workspace.',
    icon: FileClock,
  },
  {
    title: 'Recommendation',
    description: 'Explainable recommendation and decision review workspace.',
    icon: BookOpenCheck,
  },
]

function ApplicantDetailPage({
  applicantId,
  onBack,
}: ApplicantDetailPageProps) {
  const applicant = mockApplicants.find((record) => record.id === applicantId)

  if (!applicant) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-background p-8 text-center shadow-sm">
          <UserRound
            aria-hidden="true"
            className="mx-auto size-7 text-muted-foreground"
          />
          <h1 className="mt-5 text-2xl font-extrabold">
            Applicant not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Return to the applicant list and select another record.
          </p>
          <Button type="button" onClick={onBack} className="mt-6">
            <ArrowLeft aria-hidden="true" />
            Back to applicants
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Applicants
      </Button>

      <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-background p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <UserRound aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Applicant record
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">
              {applicant.name}
            </h1>
            <p className="mt-2 font-mono text-xs font-semibold text-muted-foreground">
              {applicant.id}
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit rounded-full bg-secondary px-4 py-2 text-xs font-bold">
          {applicant.reviewArea}
        </span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)]">
        <section
          aria-labelledby="record-overview-title"
          className="rounded-2xl bg-background p-6 shadow-sm"
        >
          <h2 id="record-overview-title" className="text-lg font-extrabold">
            Record overview
          </h2>
          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Mail aria-hidden="true" className="size-4" />
                Email address
              </dt>
              <dd className="mt-2 break-all font-semibold">
                {applicant.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">
                Current review area
              </dt>
              <dd className="mt-2 font-semibold">{applicant.reviewArea}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">
                Last updated
              </dt>
              <dd className="mt-2 font-semibold">
                <time dateTime={applicant.updatedAt}>
                  {applicant.updatedLabel}
                </time>
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="record-sections-title">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Review workspace
            </p>
            <h2
              id="record-sections-title"
              className="mt-1 text-lg font-extrabold"
            >
              Record sections
            </h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {recordSections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl bg-background p-5 shadow-sm"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <section.icon aria-hidden="true" className="size-4.5" />
                </span>
                <h3 className="mt-6 font-extrabold">{section.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {section.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export { ApplicantDetailPage }
