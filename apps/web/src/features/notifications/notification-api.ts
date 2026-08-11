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
  const response = await fetch('/api/v1/notifications', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) throw new Error('Notifications could not be loaded.')
  const payload = await response.json() as { data: PathwaysNotification[] }
  return payload.data
}

async function markNotificationRead(notificationId: string): Promise<{ id: string; readAt: string }> {
  const token = csrfToken()
  const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', ...(token ? { 'X-XSRF-TOKEN': token } : {}) },
  })
  const payload = await response.json().catch(() => ({})) as { data?: { id: string; readAt: string }; message?: string }
  if (!response.ok || !payload.data) throw new Error(payload.message ?? 'The notification could not be marked as read.')
  return payload.data
}

function csrfToken() {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='))
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

export { getNotifications, markNotificationRead }
export type { PathwaysNotification }
