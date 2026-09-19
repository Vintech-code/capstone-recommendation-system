import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'
import type { StudentProgramme } from '@/features/student/programmes/programme-types'

interface ProgrammeComparisonDockProps {
  comparisonIds: Set<string>
  comparisonProgrammes?: StudentProgramme[]
  onClear: () => void
  onToggleComparison?: (id: string) => void
  onCompareNow: () => void
}

export function ProgrammeComparisonDock({
  comparisonIds,
  onClear,
  onCompareNow,
}: ProgrammeComparisonDockProps) {
  if (comparisonIds.size === 0) return null

  const count = comparisonIds.size
  const isReady = count >= 2

  const content = (
    <div
      data-print-hidden
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 mx-auto flex w-[calc(100vw-2rem)] max-w-xl items-center justify-between gap-4 rounded-xl bg-primary px-5 py-4 text-primary-foreground shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
    >
      <div>
        <p className="font-semibold">{count} of 3 selected</p>
        <p className="text-xs text-primary-foreground/75">
          {!isReady
            ? 'Select one more programme to compare.'
            : 'Ready for side-by-side comparison.'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
          onClick={onClear}
        >
          Clear
        </Button>
        <Button
          type="button"
          className="bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim"
          disabled={!isReady}
          onClick={onCompareNow}
        >
          Compare now
        </Button>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return content
  return createPortal(content, document.body)
}
