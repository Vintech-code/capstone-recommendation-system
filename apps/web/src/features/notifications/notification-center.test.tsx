import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NotificationCenter } from '@/features/notifications/components/notification-center'

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
  })

  it.each(['Student', 'Administrator', 'Counselor'] as const)('loads persistent notifications for the %s workspace', async (workspaceLabel) => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ data: [] }))
    const user = userEvent.setup()
    render(<NotificationCenter workspaceLabel={workspaceLabel} />)

    await user.click(screen.getByRole('button', { name: new RegExp(`Open ${workspaceLabel.toLowerCase()} notifications`, 'i') }))

    expect(await screen.findByRole('heading', { name: 'Notifications' })).toBeVisible()
    expect(screen.getByLabelText(`${workspaceLabel} notifications`)).toBeVisible()
    expect(await screen.findByText('You’re all caught up')).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/notifications', expect.objectContaining({ credentials: 'include' }))
  })

  it('shows real unread records and marks one as read through the API', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(Response.json({ data: [{ id: 'notice-1', eventType: 'guidance_request_accepted', title: 'Guidance request accepted', message: 'A counselor is reviewing your concern.', context: { guidanceRequestId: 8 }, readAt: null, createdAt: '2026-08-11T08:30:00+08:00' }] }))
      .mockResolvedValueOnce(Response.json({ data: { id: 'notice-1', readAt: '2026-08-11T09:00:00+08:00' } }))
    const user = userEvent.setup()
    render(<NotificationCenter workspaceLabel="Student" />)

    await user.click(screen.getByRole('button', { name: /Open student notifications/i }))
    expect(await screen.findByText('Guidance request accepted')).toBeVisible()
    expect(screen.getByText('1 new')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Mark notification as read: Guidance request accepted' }))

    await user.click(screen.getByRole('tab', { name: 'Unread' }))
    expect(await screen.findByText('No unread notifications')).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/notifications/notice-1/read', expect.objectContaining({ method: 'POST', credentials: 'include' }))
  })

  it('uses an honest retryable error state', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(Response.json({ message: 'Unavailable' }, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ data: [] }))
    const user = userEvent.setup()
    render(<NotificationCenter workspaceLabel="Counselor" />)

    await user.click(screen.getByRole('button', { name: /Open counselor notifications/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Notifications could not be loaded.')
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('You’re all caught up')).toBeVisible()
  })

  it('filters the anchored notification feed without inventing additional records', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ data: [
      { id: 'notice-1', eventType: 'programme_updated', title: 'Programme information updated', message: 'BSIT has new published information.', context: { programmeId: 'bsit' }, readAt: null, createdAt: '2026-08-11T08:30:00+08:00' },
      { id: 'notice-2', eventType: 'assessment_result_ready', title: 'Assessment ready', message: 'Your result is ready.', context: {}, readAt: '2026-08-11T08:00:00+08:00', createdAt: '2026-08-11T07:30:00+08:00' },
    ] }))
    const user = userEvent.setup()
    render(<NotificationCenter workspaceLabel="Student" />)

    await user.click(screen.getByRole('button', { name: /Open student notifications/i }))
    expect(await screen.findByText('Programme information updated')).toBeVisible()
    expect(screen.getByText('Assessment ready')).toBeVisible()

    await user.click(screen.getByRole('tab', { name: 'Unread 1' }))
    expect(screen.getByText('Programme information updated')).toBeVisible()
    expect(screen.queryByText('Assessment ready')).not.toBeInTheDocument()
  })

  it('marks a valid student notification as read before opening its authorized module', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(Response.json({ data: [{ id: 'notice-1', eventType: 'programme_updated', title: 'Programme information updated', message: 'BSIT has new published information.', context: { programmeId: 'bs-information-technology' }, readAt: null, createdAt: '2026-08-11T08:30:00+08:00' }] }))
      .mockResolvedValueOnce(Response.json({ data: { id: 'notice-1', readAt: '2026-08-11T09:00:00+08:00' } }))
    const onNavigate = vi.fn()
    const user = userEvent.setup()
    render(<NotificationCenter workspaceLabel="Student" onNavigate={onNavigate} />)

    await user.click(screen.getByRole('button', { name: /Open student notifications/i }))
    await user.click(await screen.findByRole('button', { name: 'Open notification: Programme information updated' }))

    expect(fetch).toHaveBeenCalledWith('/api/v1/notifications/notice-1/read', expect.objectContaining({ method: 'POST' }))
    expect(onNavigate).toHaveBeenCalledWith('programmes')
  })

  it('keeps an invalid notification safely non-navigating while allowing it to be marked read', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(Response.json({ data: [{ id: 'notice-3', eventType: 'programme_updated', title: 'Programme information updated', message: 'Published information changed.', context: { programmeId: '' }, readAt: null, createdAt: '2026-08-11T08:30:00+08:00' }] }))
      .mockResolvedValueOnce(Response.json({ data: { id: 'notice-3', readAt: '2026-08-11T09:00:00+08:00' } }))
    const onNavigate = vi.fn()
    const user = userEvent.setup()
    render(<NotificationCenter workspaceLabel="Student" onNavigate={onNavigate} />)

    await user.click(screen.getByRole('button', { name: /Open student notifications/i }))
    await user.click(await screen.findByRole('button', { name: 'Mark notification as read: Programme information updated' }))

    expect(onNavigate).not.toHaveBeenCalled()
  })
})
