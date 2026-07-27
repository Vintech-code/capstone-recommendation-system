import type { AdminPreviewState } from '@/features/admin/components/admin-route-state'

function isAdminPreviewState(
  value: string | null,
): value is AdminPreviewState {
  return value === 'loading' || value === 'empty' || value === 'error'
}

export { isAdminPreviewState }
