import { ClipboardList, FilePenLine, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'

import { CollectionToolbar } from '@/components/shared/collection-toolbar'
import { Button } from '@/components/ui/button'
import { AssessmentSessionCard } from '@/features/admin/assessments/components/assessment-session-card'
import {
  assessmentSessionStates,
  mockAssessmentSessions,
  type AssessmentSessionState,
} from '@/features/admin/assessments/data/mock-assessments'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'

interface AssessmentManagementPageProps {
  onOpenAssessment: (assessmentId: string) => void
  onOpenQuestionnaires: () => void
}

function AssessmentManagementPage({
  onOpenAssessment,
  onOpenQuestionnaires,
}: AssessmentManagementPageProps) {
  const [searchValue, setSearchValue] = useState('')
  const [sessionState, setSessionState] = useState('all')

  const filteredSessions = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return mockAssessmentSessions.filter(
      (session) =>
        (sessionState === 'all' || session.state === sessionState) &&
        (!normalizedSearch ||
          `${session.applicantName} ${session.applicantId} ${session.id}`
            .toLowerCase()
            .includes(normalizedSearch)),
    )
  }, [searchValue, sessionState])

  function sessionsFor(state: AssessmentSessionState) {
    return filteredSessions.filter((session) => session.state === state)
  }

  function resetFilters() {
    setSearchValue('')
    setSessionState('all')
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <AdminPageHeader
        title="Assessments & questionnaires"
        description="Follow active assessment sessions through their workflow, then inspect submitted records and questionnaire versions."
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={onOpenQuestionnaires}
          >
            <FilePenLine aria-hidden="true" />
            Questionnaire versions
          </Button>
        }
      />

      <CollectionToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchLabel="Search assessment sessions"
        searchPlaceholder="Search applicant or session reference"
        className="mt-7 rounded-2xl p-4"
      >
        <label
          htmlFor="assessment-session-state"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-semibold"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <span className="sr-only">Filter by session state</span>
          <select
            id="assessment-session-state"
            value={sessionState}
            onChange={(event) => setSessionState(event.target.value)}
            className="min-h-11 bg-transparent outline-none"
          >
            <option value="all">All session states</option>
            {assessmentSessionStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
      </CollectionToolbar>

      {filteredSessions.length ? (
        <div className="mt-5 grid items-start gap-5 xl:grid-cols-2">
          {assessmentSessionStates.map((state) => {
            const sessions = sessionsFor(state)

            if (!sessions.length) {
              return null
            }

            return (
              <section key={state} aria-labelledby={`assessment-${state}`}>
                <div className="mb-3 flex items-end justify-between gap-3 px-1">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Workflow lane
                    </p>
                    <h2
                      id={`assessment-${state}`}
                      className="mt-1 text-lg font-extrabold"
                    >
                      {state}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {sessions.length}{' '}
                    {sessions.length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <AssessmentSessionCard
                      key={session.id}
                      session={session}
                      onOpen={onOpenAssessment}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-background p-10 text-center shadow-sm">
          <ClipboardList
            aria-hidden="true"
            className="mx-auto size-6 text-muted-foreground"
          />
          <h2 className="mt-4 text-lg font-extrabold">No sessions found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Clear the filters or try a different search.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={resetFilters}
            className="mt-5"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}

export { AssessmentManagementPage }
