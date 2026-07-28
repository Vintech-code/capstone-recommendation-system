import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'


describe('Admin recommendation workflows', () => {
  it('opens Recommendations from the Admin dashboard', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    await user.click(screen.getByRole('button', { name: 'Recommendations' }))

    expect(window.location.pathname).toBe('/admin/recommendations')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Recommendations' }),
    ).toBeVisible()
  })

  it('searches and filters mock recommendation runs', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/recommendations')

    await user.type(
      screen.getByRole('searchbox', { name: 'Search recommendations' }),
      'Jamie Cruz',
    )
    expect(screen.getByText('1 recommendation')).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    await user.clear(
      screen.getByRole('searchbox', { name: 'Search recommendations' }),
    )
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Filter by recommendation status',
      }),
      'Generated',
    )
    expect(screen.getByText('3 recommendations')).toBeVisible()
  })

  it('reviews and reruns synthetic algorithm validation cases', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/recommendations')

    await user.click(screen.getByRole('button', { name: 'Validation cases' }))

    expect(window.location.pathname).toBe('/admin/validation-cases')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Algorithm validation cases',
      }),
    ).toBeVisible()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by validation status' }),
      'Discrepancy',
    )
    expect(screen.getByText('2 cases')).toBeVisible()

    await user.click(screen.getByRole('button', { name: /VAL-002/ }))
    await user.click(screen.getByRole('button', { name: 'Run selected case' }))

    expect(
      screen.getByText(
        'VAL-002 reran against its current synthetic snapshots.',
      ),
    ).toBeVisible()
  })

  it('reviews student decisions and opens the source recommendation', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/recommendations')

    await user.click(screen.getByRole('button', { name: 'Student decisions' }))

    expect(window.location.pathname).toBe('/admin/decisions')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Student decision review',
      }),
    ).toBeVisible()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by student decision' }),
      'Declined',
    )
    expect(screen.getByText('2 records')).toBeVisible()

    await user.click(screen.getByRole('button', { name: /Sam Reyes/ }))
    await user.click(
      screen.getByRole('button', { name: 'Open recommendation' }),
    )

    expect(window.location.pathname).toBe('/admin/recommendations/REC-003')
    expect(
      screen.getByRole('heading', { level: 1, name: 'REC-003' }),
    ).toBeVisible()
  })

  it('opens recommendation details and links to the applicant', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/recommendations')

    await user.click(
      screen.getAllByRole('button', { name: 'Open review' })[0],
    )

    expect(window.location.pathname).toBe('/admin/recommendations/REC-001')
    expect(
      screen.getByRole('heading', { level: 1, name: 'REC-001' }),
    ).toBeVisible()
    expect(screen.getByText('Recommended courses')).toBeVisible()
    expect(screen.getByText('Input snapshot')).toBeVisible()
    expect(
      screen.getByRole('progressbar', {
        name: 'BS Information Technology match',
      }),
    ).toHaveAttribute('aria-valuenow', '92')

    await user.click(
      screen.getByRole('button', { name: 'Open applicant record' }),
    )
    expect(window.location.pathname).toBe('/admin/applicants/APP-001')
  })
})
