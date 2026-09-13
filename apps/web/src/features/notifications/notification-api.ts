interface PathwaysNotification {
  id: string
  eventType: string
  title: string
  message: string
  context: Record<string, string | number | null>
  readAt: string | null
  createdAt: string
}

async function getNotifications(signal?: AbortSignal): Promise<PathwaysNotification[]> {
  return apiDataRequest('/api/v1/notifications', { signal }, {
    fallbackMessage: 'Notifications could not be loaded.',
  })
}

async function markNotificationRead(notificationId: string): Promise<{ id: string; readAt: string }> {
  return apiDataRequest(
    `/api/v1/notifications/${notificationId}/read`,
    { method: 'POST' },
    { fallbackMessage: 'The notification could not be marked as read.' },
  )
}

export { getNotifications, markNotificationRead }
export type { PathwaysNotification }
import { apiDataRequest } from '@/services/api-client'
