import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'


describe('Admin assessment workflows', () => {
  it('opens Assessments & questionnaires from the Admin dashboard', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const modules = screen.getByRole('region', { name: 'Admin modules' })
    await user.click(
      within(modules).getByRole('button', {
        name: /assessments & questionnaires.*open module/i,
      }),
    )

    expect(window.location.pathname).toBe('/admin/assessments')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Assessments & questionnaires',
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Questionnaire versions' }),
    ).toBeVisible()
  })

  it('searches and filters mock assessment sessions', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/assessments')

    await user.type(
      screen.getByRole('searchbox', { name: 'Search assessment sessions' }),
      'Jamie Cruz',
    )

    expect(screen.getByText('1 session')).toBeVisible()
    expect(screen.getByText('ASM-002 / APP-002')).toBeVisible()
    expect(
      screen.getByRole('progressbar', {
        name: 'Jamie Cruz response progress',
      }),
    ).toHaveAttribute('aria-valuenow', '100')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    await user.clear(
      screen.getByRole('searchbox', { name: 'Search assessment sessions' }),
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by session state' }),
      'In progress',
    )

    expect(screen.getByText('4 sessions')).toBeVisible()
  })

  it('opens assessment history and links to its applicant', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/assessments')

    await user.click(
      screen.getAllByRole('button', { name: 'Open session' })[0],
    )

    expect(window.location.pathname).toBe('/admin/assessments/ASM-001')
    expect(
      screen.getByRole('heading', { level: 1, name: 'ASM-001' }),
    ).toBeVisible()
    expect(
      screen.getByText('Response progress'),
    ).toBeVisible()
    expect(
      screen.getByRole('progressbar', {
        name: 'Assessment response progress',
      }),
    ).toHaveAttribute('aria-valuenow', '18')
    expect(screen.getByText('Session history')).toBeVisible()

    await user.click(
      screen.getByRole('button', { name: 'Open applicant record' }),
    )
    expect(window.location.pathname).toBe('/admin/applicants/APP-001')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Alex Rivera' }),
    ).toBeVisible()
  })

  it('opens questionnaire versions and previews a mock questionnaire', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/assessments')

    await user.click(
      screen.getByRole('button', { name: 'Questionnaire versions' }),
    )

    expect(window.location.pathname).toBe('/admin/questionnaires')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Questionnaire versions',
      }),
    ).toBeVisible()
    expect(screen.getAllByText('Student Interest Inventory')).toHaveLength(3)

    await user.click(
      screen.getAllByRole('button', { name: 'Open version' })[0],
    )

    expect(window.location.pathname).toBe('/admin/questionnaires/QNR-01')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Student Interest Inventory',
      }),
    ).toBeVisible()
    expect(screen.getByText('Questionnaire items')).toBeVisible()
    expect(screen.getAllByText('Yes').length).toBeGreaterThan(0)
    expect(screen.queryByText(/pending approval/i)).not.toBeInTheDocument()
  })
})
