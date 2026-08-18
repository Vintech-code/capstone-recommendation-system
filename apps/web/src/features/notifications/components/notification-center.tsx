import { Bell, BookOpenText, Check, ClipboardCheck, MessageSquareText, RefreshCw } from 'lucide-react'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getNotifications, markNotificationRead, type PathwaysNotification } from '@/features/notifications/notification-api'
import { cn } from '@/lib/utils'

interface NotificationCenterProps {
  workspaceLabel: 'Student' | 'Administrator' | 'Counselor'
  className?: string
  onNavigate?: (moduleId: string) => void
}

function NotificationCenter({ workspaceLabel, className, onNavigate }: NotificationCenterProps) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [notifications, setNotifications] = useState<PathwaysNotification[]>([])
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [interactionError, setInteractionError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const controllerRef = useRef<AbortController | null>(null)
  const unreadCount = useMemo(() => notifications.filter((item) => item.readAt === null).length, [notifications])
  const visibleNotifications = useMemo(
    () => filter === 'unread' ? notifications.filter((item) => item.readAt === null) : notifications,
    [filter, notifications],
  )

  const load = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setState('loading')
    setInteractionError(null)
    getNotifications(controller.signal)
      .then((items) => { setNotifications(items); setState('ready') })
      .catch(() => { if (!controller.signal.aborted) setState('error') })
  }, [])

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen && state === 'idle') load()
    if (!nextOpen) {
      controllerRef.current?.abort()
      if (state === 'loading') setState('idle')
    }
  }

  async function markRead(notification: PathwaysNotification) {
    if (notification.readAt !== null) return true
    if (markingId !== null) return false
    setMarkingId(notification.id)
    setInteractionError(null)
    try {
      const result = await markNotificationRead(notification.id)
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, readAt: result.readAt } : item))
      return true
    } catch (reason) {
      setInteractionError(reason instanceof Error ? reason.message : 'The notification could not be updated.')
      return false
    } finally {
      setMarkingId(null)
    }
  }

  async function selectNotification(notification: PathwaysNotification) {
    const destination = resolveNotificationDestination(workspaceLabel, notification)
    const wasMarkedRead = await markRead(notification)
    if (destination && wasMarkedRead && onNavigate) {
      setOpen(false)
      onNavigate(destination)
    }
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Open ${workspaceLabel.toLowerCase()} notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} className={cn('relative flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-foreground transition-all duration-200 hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 md:size-10', open && 'bg-primary text-primary-foreground hover:bg-primary', className)}>
          <Bell aria-hidden="true" className="size-5" />
          {unreadCount ? <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-5 text-destructive-foreground shadow-sm" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
        </button>
      </PopoverTrigger>
      <PopoverContent aria-label={`${workspaceLabel} notifications`} className="flex max-h-[min(42rem,calc(100vh-5rem))] w-[calc(100vw-1rem)] max-w-104 flex-col overflow-hidden p-0">
        <div className="px-5 pb-3 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="font-display text-2xl font-bold tracking-tight">Notifications</h2><p className="mt-1 text-xs text-muted-foreground">{workspaceLabel} activity and guidance updates</p></div>
            {unreadCount ? <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-on-primary-fixed">{unreadCount} new</span> : null}
          </div>
          <div className="mt-4 flex gap-2" role="tablist" aria-label="Notification filters">
            <FilterTab selected={filter === 'all'} onClick={() => setFilter('all')}>All</FilterTab>
            <FilterTab selected={filter === 'unread'} onClick={() => setFilter('unread')}>Unread{unreadCount ? ` ${unreadCount}` : ''}</FilterTab>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {state === 'loading' ? <NotificationLoading /> : null}
          {state === 'error' ? <div role="alert" className="m-2 rounded-xl bg-destructive/10 p-5"><p className="font-semibold text-destructive">Notifications could not be loaded.</p><p className="mt-2 text-sm text-muted-foreground">Your records were not changed. Try loading this list again.</p><Button type="button" variant="outline" size="sm" className="mt-4" onClick={load}><RefreshCw aria-hidden="true" />Try again</Button></div> : null}
          {state === 'ready' && notifications.length === 0 ? <NotificationEmpty title="You’re all caught up" description="Assessment, guidance, and programme updates will appear here." /> : null}
          {state === 'ready' && notifications.length > 0 && visibleNotifications.length === 0 ? <NotificationEmpty title="No unread notifications" description="New activity will appear here when it is recorded." /> : null}
          {state === 'ready' && visibleNotifications.length > 0 ? <ol>{visibleNotifications.map((notification) => {
            const navigable = Boolean(onNavigate && resolveNotificationDestination(workspaceLabel, notification))
            return <NotificationRow key={notification.id} notification={notification} busy={markingId === notification.id} navigable={navigable} onSelect={() => void selectNotification(notification)} />
          })}</ol> : null}
          {interactionError ? <p role="alert" className="m-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{interactionError}</p> : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationRow({ notification, busy, navigable, onSelect }: { notification: PathwaysNotification; busy: boolean; navigable: boolean; onSelect: () => void }) {
  const Icon = notification.eventType === 'assessment_result_ready' ? ClipboardCheck : notification.eventType === 'programme_updated' ? BookOpenText : MessageSquareText
  const unread = notification.readAt === null
  const content = <div className="flex min-w-0 items-start gap-3"><span className={cn('relative flex size-12 shrink-0 items-center justify-center rounded-full', unread ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary text-muted-foreground')}><Icon aria-hidden="true" className="size-5" /><span className={cn('absolute -bottom-0.5 -right-0.5 size-4 rounded-full ring-2 ring-background', notification.eventType === 'programme_updated' ? 'bg-success' : 'bg-primary')} /></span><span className="min-w-0 flex-1"><span className="block text-sm leading-5"><strong className="font-bold">{notification.title}</strong> <span className="text-muted-foreground">{notification.message}</span></span><time dateTime={notification.createdAt} className={cn('mt-1 block text-xs font-semibold', unread ? 'text-primary' : 'text-muted-foreground')}>{formatNotificationDate(notification.createdAt)}</time>{busy ? <span className="mt-1 block text-xs text-muted-foreground">Updating…</span> : null}</span>{unread ? <span className="mt-5 size-2.5 shrink-0 rounded-full bg-primary"><span className="sr-only">Unread</span></span> : null}</div>
  const interactive = unread || navigable
  return <li>{interactive ? <button type="button" disabled={busy} onClick={onSelect} aria-label={navigable ? `Open notification: ${notification.title}` : `Mark notification as read: ${notification.title}`} className="block w-full rounded-xl px-3 py-3 text-left transition-colors duration-150 hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/40">{content}</button> : <div className="rounded-xl px-3 py-3">{content}</div>}</li>
}

function resolveNotificationDestination(workspaceLabel: NotificationCenterProps['workspaceLabel'], notification: PathwaysNotification) {
  const { eventType, context } = notification

  if (workspaceLabel === 'Student') {
    if (eventType === 'assessment_result_ready' && hasRecordId(context.assessmentSessionId)) return 'recommendations'
    if (eventType === 'programme_updated' && hasTextId(context.programmeId)) return 'programmes'
    if (eventType === 'guidance_summary_published' && hasRecordId(context.guidanceSummaryId)) return 'overview'
    if (eventType.startsWith('guidance_request_') && hasRecordId(context.guidanceRequestId)) return 'overview'
    return null
  }

  if (workspaceLabel === 'Counselor') {
    if (eventType.startsWith('guidance_request_') && hasRecordId(context.guidanceRequestId)) return 'requests'
    return null
  }

  if (eventType === 'assessment_result_ready' && hasRecordId(context.assessmentSessionId)) return 'assessments'
  if (eventType === 'programme_updated' && hasTextId(context.programmeId)) return 'programmes'
  return null
}

function hasRecordId(value: string | number | null | undefined) {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0
  return typeof value === 'string' && /^\d+$/.test(value) && Number(value) > 0
}

function hasTextId(value: string | number | null | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

function NotificationLoading() {
  return <div role="status" aria-label="Loading notifications" className="space-y-1 p-2">{[1, 2, 3, 4].map((item) => <div key={item} className="flex animate-pulse gap-3 rounded-xl p-3 motion-reduce:animate-none"><div className="size-12 shrink-0 rounded-full bg-secondary" /><div className="flex-1 py-1"><div className="h-3 w-2/5 rounded bg-secondary" /><div className="mt-2 h-3 w-full rounded bg-secondary" /><div className="mt-2 h-3 w-1/3 rounded bg-secondary" /></div></div>)}</div>
}

function FilterTab({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" role="tab" aria-selected={selected} onClick={onClick} className={cn('min-h-9 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40', selected ? 'bg-primary-fixed text-on-primary-fixed' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}>{children}</button>
}

function NotificationEmpty({ title, description }: { title: string; description: string }) {
  return <div className="px-6 py-12 text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-primary"><Check aria-hidden="true" className="size-6" /></span><p className="mt-4 font-bold">{title}</p><p className="mx-auto mt-2 max-w-64 text-sm leading-6 text-muted-foreground">{description}</p></div>
}

function formatNotificationDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recorded update'
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(date)
}

export { NotificationCenter }
