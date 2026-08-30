import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderAppAt } from '@/test/render-app'

describe('Administration workspace', () => {
  it('shows the system dashboard without removed staff workflows', async () => {
    await renderAppAt('/admin')

    expect(await screen.findByRole('heading', { name: /Welcome back, Admin/i })).toBeVisible()
    expect(screen.getByText('Results ready')).toBeVisible()
    expect(screen.getByText('Generate reports')).toBeVisible()
    expect(screen.getByText('Recent assessment activity')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Operational attention' })).toBeVisible()
  })

  it('opens a student record with immutable results and recommendations', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/students')

    const row = (await screen.findAllByText('ana@example.test'))
      .map((match) => match.closest('tr')).find(Boolean)
    expect(row).toBeDefined()
    await user.click(within(row as HTMLTableRowElement).getByRole('button', { name: 'Open student record' }))

    expect(window.location.pathname).toBe('/admin/students/10')
    expect(await screen.findByRole('heading', { name: 'Ana Santos' })).toBeVisible()
    expect(screen.getByText('Problem-solving')).toBeVisible()
    expect(screen.getAllByText('BS Information Technology').length).toBeGreaterThan(0)
  })

  it('provides programme monitoring and configuration', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/programmes')

    expect(await screen.findByRole('heading', { name: 'Programme monitoring' })).toBeVisible()
    expect(screen.getByText('BS Information Technology')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'View details' }))
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Possible career directions' })).toBeVisible()
  })

  it('combines students and assessments in one searchable ledger', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/students')

    expect(await screen.findByRole('heading', { name: 'Student records' })).toBeVisible()
    await user.type(screen.getByRole('searchbox', { name: 'Search student records' }), 'Ana')
    expect(screen.getAllByRole('button', { name: /Open student record/i }).length).toBeGreaterThan(0)
  })

  it('shows a retryable error when an Admin endpoint fails', async () => {
    const defaultImplementation = vi.mocked(fetch).getMockImplementation()
    vi.mocked(fetch).mockImplementation((input, init) => {
      if (input.toString() === '/api/v1/admin/overview') {
        return Promise.resolve(Response.json({ message: 'Service unavailable.' }, { status: 503 }))
      }
      return defaultImplementation!(input, init)
    })
    await renderAppAt('/admin')

    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable.')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible()
  })
})
