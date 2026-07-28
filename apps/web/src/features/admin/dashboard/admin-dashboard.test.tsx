import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'

describe('Admin dashboard', () => {
  it('matches the focused reference hierarchy without duplicate dashboard sections', async () => {
    await renderAppAt('/admin')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /insights today, guidance tomorrow/i,
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Dashboard summaries' }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Operational activity' }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Assessment queue' }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Recommendation review' }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Recent applicants' }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Latest activity' }),
    ).toBeVisible()

    for (const removedLabel of [
      'Search modules',
      'Work requiring attention',
      'Current work queue',
      'Quick actions',
      'Applicant guidance flow',
      'Admin modules',
    ]) {
      expect(screen.queryByText(removedLabel)).not.toBeInTheDocument()
    }
    expect(
      screen.queryByRole('navigation', { name: 'Breadcrumb' }),
    ).not.toBeInTheDocument()
  })

  it('switches the dashboard activity period', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const period = screen.getByRole('group', {
      name: 'Dashboard activity period',
    })
    const sevenDays = within(period).getByRole('button', { name: '7 days' })
    const thirtyDays = within(period).getByRole('button', { name: '30 days' })

    expect(sevenDays).toHaveAttribute('aria-pressed', 'true')
    await user.click(thirtyDays)
    expect(thirtyDays).toHaveAttribute('aria-pressed', 'true')
    expect(sevenDays).toHaveAttribute('aria-pressed', 'false')
  })

  it('opens existing modules from summary cards and the hero action', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const summaries = screen.getByRole('region', {
      name: 'Dashboard summaries',
    })
    await user.click(
      within(summaries).getByRole('button', {
        name: /official results.*12.*4 awaiting verification/i,
      }),
    )

    expect(window.location.pathname).toBe('/admin/official-results')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Official results' }),
    ).toBeVisible()
  })

  it('opens a recent applicant from the compact overview', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const applicants = screen.getByRole('region', {
      name: 'Recent applicants',
    })
    await user.click(
      within(applicants).getByRole('button', { name: 'Open Taylor Santos' }),
    )

    expect(window.location.pathname).toBe('/admin/applicants/APP-004')
    expect(screen.getByText('Applicant record')).toBeVisible()
  })

  it('opens linked workflow records from latest activity', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const activity = screen.getByRole('region', { name: 'Latest activity' })
    await user.click(
      within(activity).getByRole('button', { name: /report generated/i }),
    )

    expect(window.location.pathname).toBe('/admin/reports/RPT-001')
    expect(screen.getByText('Report overview')).toBeVisible()
  })
})
