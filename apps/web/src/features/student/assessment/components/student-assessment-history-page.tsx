import { useEffect, useState } from 'react'

import { ErrorState, LoadingState } from '@/components/shared'
import {
  getAssessmentHistory,
  getCurrentAssessment,
  startAssessment,
  type AssessmentHistoryResponse,
  type AssessmentLifecycle,
} from '@/features/student/assessment/assessment-api'
import { StudentPageHeader } from '@/features/student/components/student-page-header'
import { AssessmentHistorySummary } from '@/features/student/dashboard/components/student-dashboard-page'
import { getRecommendationForAttempt } from '@/features/student/recommendations/recommendation-api'
import type { StudentRecommendationState } from '@/features/student/recommendations/recommendation-types'

interface StudentAssessmentHistoryPageProps {
  onBack: () => void
  onOpenAssessment: () => void
}

function StudentAssessmentHistoryPage({ onBack, onOpenAssessment }: StudentAssessmentHistoryPageProps) {
  const [lifecycle, setLifecycle] = useState<AssessmentLifecycle | null>(null)
  const [history, setHistory] = useState<AssessmentHistoryResponse | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [historyError, setHistoryError] = useState(false)
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState<StudentRecommendationState | null>(null)
  const [selectedRecommendationState, setSelectedRecommendationState] = useState<'idle' | 'loading' | 'error'>('idle')

  async function loadHistory() {
    setHistoryError(false)
    const attempts = await getAssessmentHistory()
    setHistory(attempts)
    return attempts
  }

  useEffect(() => {
    let active = true
    Promise.all([getCurrentAssessment(), getAssessmentHistory()])
      .then(([current, attempts]) => {
        if (!active) return
        setLifecycle(current)
        setHistory(attempts)
        setLoadState('ready')
      })
      .catch(() => active && setLoadState('error'))
    return () => { active = false }
  }, [])

  async function selectAttempt(assessmentSessionId: number) {
    setSelectedAttemptId(assessmentSessionId)
    setSelectedRecommendation(null)
    setSelectedRecommendationState('loading')
    try {
      setSelectedRecommendation(await getRecommendationForAttempt(assessmentSessionId))
      setSelectedRecommendationState('idle')
    } catch {
      setSelectedRecommendationState('error')
    }
  }

  if (loadState === 'loading') {
    return <div className="student-page py-8"><LoadingState variant="dashboard" title="Loading assessment history" description="Restoring your recorded attempts." /></div>
  }

  if (loadState === 'error' || !lifecycle) {
    return <div className="student-page py-8"><ErrorState title="Assessment history could not be loaded" description="Your assessment records were not changed. Check your connection and try again." onRetry={() => window.location.reload()} /></div>
  }

  return (
    <div className="student-grid-page min-h-[calc(100vh-5rem)] py-4 sm:py-6">
      <div className="student-page">
        <StudentPageHeader
          title="Assessment history"
          description="Review your completed assessment attempts."
          onBack={onBack}
        />
        <div className="mt-4 sm:mt-6">
          <AssessmentHistorySummary
            history={history}
            historyError={historyError}
            lifecycle={lifecycle}
            selectedAttemptId={selectedAttemptId}
            selectedRecommendation={selectedRecommendation}
            selectedRecommendationState={selectedRecommendationState}
            onSelectAttempt={selectAttempt}
            onRetryHistory={() => {
              void loadHistory().catch(() => setHistoryError(true))
            }}
            onStartRetake={async (reason) => {
              const next = await startAssessment(reason)
              setLifecycle(next)
              await loadHistory()
              onOpenAssessment()
            }}
          />
        </div>
      </div>
    </div>
  )
}

export { StudentAssessmentHistoryPage }
