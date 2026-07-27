import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'

describe('Admin operational dashboard', () => {
  it('presents actionable priority, workflow, activity, and module areas', async () => {
    await renderAppAt('/admin')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Operational overview' }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Work requiring attention' }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Current work queue' }),
    ).toBeVisible()
    expect(screen.getByRole('region', { name: 'Quick actions' })).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Applicant guidance flow' }),
    ).toBeVisible()
    expect(screen.getByRole('region', { name: 'Recent activity' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Admin modules' })).toBeVisible()
  })

  it('filters the attention queue without hiding status text', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const queue = screen.getByRole('region', { name: 'Current work queue' })
    await user.click(within(queue).getByRole('button', { name: 'Imports' }))

    expect(
      within(queue).getByText('Resolve CSV reconciliation issues'),
    ).toBeVisible()
    expect(within(queue).getAllByText('Needs attention').length).toBeGreaterThan(
      0,
    )
    expect(
      within(queue).queryByText('Verify encoded examination result'),
    ).not.toBeInTheDocument()
  })

  it('opens existing workflows from quick actions and priority cards', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const actions = screen.getByRole('region', { name: 'Quick actions' })
    await user.click(
      within(actions).getByRole('button', { name: /encode result/i }),
    )

    expect(window.location.pathname).toBe('/admin/exam-results/new')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Encode official result' }),
    ).toBeVisible()
  })

  it('expands recent activity and opens its linked record', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const activity = screen.getByRole('region', { name: 'Recent activity' })
    expect(within(activity).queryByText('Report prepared')).not.toBeInTheDocument()

    await user.click(within(activity).getByRole('button', { name: /view all/i }))
    const reportActivity = within(activity).getByRole('button', {
      name: /report prepared/i,
    })
    expect(reportActivity).toBeVisible()

    await user.click(reportActivity)
    expect(window.location.pathname).toBe('/admin/reports/RPT-001')
    expect(screen.getByText('Report overview')).toBeVisible()
  })

  it('searches only the Admin module catalogue', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    await user.type(
      screen.getByRole('searchbox', { name: 'Search modules' }),
      'reports',
    )

    const modules = screen.getByRole('region', { name: 'Matching modules' })
    expect(within(modules).getByText('Reports')).toBeVisible()
    expect(within(modules).queryByText('Applicants')).not.toBeInTheDocument()
    expect(within(modules).getByText('1 result')).toBeVisible()
  })
})
