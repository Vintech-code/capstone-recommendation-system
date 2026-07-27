import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'


describe('Admin applicant workflows', () => {
  it('searches and filters the mock applicant records', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/applicants')

    await user.type(
      screen.getByRole('searchbox', { name: 'Search applicants' }),
      'Alex Rivera',
    )

    expect(screen.getByText('Showing 1 of 1 matching records')).toBeVisible()
    expect(
      within(screen.getByRole('table')).getAllByRole('row'),
    ).toHaveLength(2)

    await user.clear(
      screen.getByRole('searchbox', { name: 'Search applicants' }),
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by review area' }),
      'Assessment review',
    )

    expect(screen.getByText('Showing 2 of 2 matching records')).toBeVisible()
  })

  it('paginates applicants and opens a mock applicant record', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/applicants')

    expect(screen.getByText('Showing 5 of 9 matching records')).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Next applicant page' }),
    )
    expect(screen.getByText('Showing 4 of 9 matching records')).toBeVisible()

    await user.click(
      screen.getByRole('button', { name: 'Previous applicant page' }),
    )
    const table = screen.getByRole('table')
    await user.click(
      within(table).getAllByRole('button', { name: /open record/i })[0],
    )

    expect(window.location.pathname).toBe('/admin/applicants/APP-001')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Alex Rivera' }),
    ).toBeVisible()
    expect(screen.getByText('Application profile')).toBeVisible()
    expect(screen.getByText('Official result')).toBeVisible()

    await user.click(
      within(screen.getByRole('main')).getByRole('button', {
        name: 'Applicants',
      }),
    )
    expect(window.location.pathname).toBe('/admin/applicants')
  })
})
