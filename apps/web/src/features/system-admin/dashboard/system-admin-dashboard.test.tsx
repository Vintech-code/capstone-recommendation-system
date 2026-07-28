import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'

describe('System Administrator dashboard', () => {
  it('presents technical operations without guidance-domain controls', async () => {
    await renderAppAt('/system-admin')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /secure access, visible operations/i,
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', {
        name: 'System administration summaries',
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Items requiring review' }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Service status' }),
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Recent audit activity' }),
    ).toBeVisible()
    expect(
      screen.getByText('Technical responsibility only'),
    ).toBeVisible()

    expect(screen.queryByText('Applicants')).not.toBeInTheDocument()
    expect(screen.queryByText('Official results')).not.toBeInTheDocument()
    expect(screen.queryByText('Recommendations')).not.toBeInTheDocument()
    expect(screen.queryByText('Assessment queue')).not.toBeInTheDocument()
  })

  it('changes the summary period and updates the visible counts', async () => {
    const user = userEvent.setup()
    await renderAppAt('/system-admin')

    const period = screen.getByRole('group', {
      name: 'System activity period',
    })
    const day = within(period).getByRole('button', { name: '24 hours' })
    const week = within(period).getByRole('button', { name: '7 days' })
    const summaries = screen.getByRole('region', {
      name: 'System administration summaries',
    })

    expect(day).toHaveAttribute('aria-pressed', 'true')
    expect(within(summaries).getByText('18')).toBeVisible()

    await user.click(week)

    expect(week).toHaveAttribute('aria-pressed', 'true')
    expect(day).toHaveAttribute('aria-pressed', 'false')
    expect(within(summaries).getByText('21')).toBeVisible()
  })

  it('opens technical modules from dashboard actions', async () => {
    const user = userEvent.setup()
    await renderAppAt('/system-admin')

    await user.click(
      screen.getByRole('button', { name: 'Review user access' }),
    )

    expect(
      within(screen.getByRole('main')).getByRole('heading', {
        level: 1,
        name: 'User access',
      }),
    ).toBeVisible()

    await user.click(
      within(screen.getByRole('main')).getByRole('button', {
        name: 'Dashboard',
      }),
    )
    const audit = screen.getByRole('region', {
      name: 'Recent audit activity',
    })
    await user.click(
      within(audit).getByRole('button', { name: /view audit/i }),
    )

    expect(
      within(screen.getByRole('main')).getByRole('heading', {
        level: 1,
        name: 'Audit activity',
      }),
    ).toBeVisible()
  })

  it('keeps module search functional for the technical workspace', async () => {
    const user = userEvent.setup()
    await renderAppAt('/system-admin')

    await user.type(
      screen.getByRole('searchbox', { name: 'Search modules' }),
      'role',
    )

    const modules = screen.getByRole('region', { name: 'Matching modules' })
    expect(within(modules).getByText('Role assignments')).toBeVisible()
    expect(within(modules).queryByText('User access')).not.toBeInTheDocument()
    expect(within(modules).getByText('1 result')).toBeVisible()
  })

  it('has no automatically detectable accessibility violations', async () => {
    const { container } = await renderAppAt('/system-admin')
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })
})
