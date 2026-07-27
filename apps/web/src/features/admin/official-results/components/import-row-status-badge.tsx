import { StatusBadge, type StatusTone } from '@/components/shared/status-badge'
import type { ImportRowStatus } from '@/features/admin/official-results/data/mock-result-imports'

const toneByStatus: Record<ImportRowStatus, StatusTone> = {
  Ready: 'success',
  'Needs review': 'warning',
  Duplicate: 'danger',
}

function ImportRowStatusBadge({ status }: { status: ImportRowStatus }) {
  return <StatusBadge label={status} tone={toneByStatus[status]} />
}

export { ImportRowStatusBadge }
