import type { AssessmentResponseValue } from '@/features/student/assessment/assessment-types'

interface AssessmentProgressPanelProps {
  questionIds: readonly string[]
  answers: Record<string, AssessmentResponseValue>
}

function AssessmentProgressPanel({
  questionIds,
  answers,
}: AssessmentProgressPanelProps) {
  const answeredCount = questionIds.filter((id) => answers[id]).length
  const progress = questionIds.length
    ? Math.round((answeredCount / questionIds.length) * 100)
    : 0

  return (
    <aside aria-labelledby="assessment-progress-title">
      <h2 id="assessment-progress-title" className="sr-only">Assessment progress</h2>
      <div
        role="progressbar"
        aria-label="Assessment completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="h-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-3" aria-label="Assessment stages">
        {['Interests', 'Questions', 'Review', 'Results'].map((label, index) => {
          const active = index === 0 || (index === 1 && answeredCount > 0) || (index === 2 && answeredCount === questionIds.length)
          return (
            <li key={label} className={index === 0 ? '' : index === 3 ? 'text-right' : 'text-center'}>
              <span className={`font-label text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
              <span aria-hidden="true" className={`mt-1.5 block size-1.5 rounded-full ${index === 0 ? '' : index === 3 ? 'ml-auto' : 'mx-auto'} ${active ? 'bg-primary' : 'bg-outline-variant'}`} />
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

export { AssessmentProgressPanel }
