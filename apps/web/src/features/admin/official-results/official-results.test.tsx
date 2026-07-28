import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'


describe('Admin official-result workflows', () => {
  it(
    'opens Official Results from the Admin dashboard',
    async () => {
      const user = userEvent.setup()
      await renderAppAt('/admin')

      await user.click(
        screen.getByRole('button', { name: 'Official results' }),
      )

      expect(window.location.pathname).toBe('/admin/official-results')
      expect(
        screen.getByRole('heading', { level: 1, name: 'Official results' }),
      ).toBeVisible()
    },
    10_000,
  )

  it('opens the manual result-entry workflow from Official Results', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/official-results')

    await user.click(screen.getByRole('button', { name: 'Encode result' }))

    expect(window.location.pathname).toBe('/admin/exam-results/new')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Encode official result',
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('form', { name: 'Result details' }),
    ).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('validates, reviews, and queues a manually encoded result', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/exam-results/new')

    await user.click(screen.getByRole('button', { name: 'Review result' }))

    expect(screen.getByText('Select an applicant.')).toBeVisible()
    expect(screen.getByText('Enter the examination reference.')).toBeVisible()
    expect(screen.getByText('Enter the recorded result value.')).toBeVisible()
    expect(screen.getByText('Describe the score format or scale.')).toBeVisible()
    expect(screen.getByText('Select the examination date.')).toBeVisible()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Applicant' }),
      'APP-002',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Examination reference' }),
      'EXAM-MOCK-001',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Recorded result value' }),
      '91.0',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Score format or scale' }),
      '100-point scale',
    )
    await user.type(screen.getByLabelText('Examination date'), '2026-07-28')

    await user.click(screen.getByRole('button', { name: 'Review result' }))

    expect(
      screen.getByRole('heading', { name: 'Confirm result details' }),
    ).toBeVisible()
    expect(screen.getByText('Jamie Cruz')).toBeVisible()
    expect(screen.getByText('EXAM-MOCK-001')).toBeVisible()

    await user.click(
      screen.getByRole('button', { name: 'Add to review queue' }),
    )
    expect(
      screen.getByRole('heading', {
        name: 'Add result to the verification queue?',
      }),
    ).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Add result' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Result record ready for review',
      }),
    ).toBeVisible()
  })

  it('previews a sample CSV and opens import reconciliation', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/imports/new')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Import official results' }),
    ).toBeVisible()
    expect(screen.getByText('No CSV selected')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Use sample CSV' }))

    expect(
      within(screen.getByRole('table')).getAllByRole('row'),
    ).toHaveLength(7)
    expect(screen.getByText('3 ready')).toBeVisible()
    expect(screen.getByText('2 review')).toBeVisible()
    expect(screen.getByText('1 duplicate')).toBeVisible()

    await user.click(
      screen.getByRole('button', { name: 'Start import review' }),
    )
    expect(
      screen.getByRole('heading', { name: 'Start import reconciliation?' }),
    ).toBeVisible()

    await user.click(
      screen.getByRole('button', { name: 'Start reconciliation' }),
    )

    expect(window.location.pathname).toBe('/admin/imports/IMP-001')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Import reconciliation',
      }),
    ).toBeVisible()
  })

  it('filters import errors and retries mock validation', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/imports/IMP-001')

    await user.click(screen.getByRole('button', { name: 'Needs review' }))

    expect(screen.getAllByText('Review notes')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Retry validation' }))
    expect(
      screen.getByText('Validation refreshed using the current mock batch.'),
    ).toBeVisible()
  })

  it('searches and filters mock official result records', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/official-results')

    await user.type(
      screen.getByRole('searchbox', { name: 'Search official results' }),
      'Jamie Cruz',
    )

    expect(screen.getByText('Showing 1 of 1 matching records')).toBeVisible()
    expect(
      within(screen.getByRole('table')).getAllByRole('row'),
    ).toHaveLength(2)

    await user.clear(
      screen.getByRole('searchbox', { name: 'Search official results' }),
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by review state' }),
      'Correction review',
    )

    expect(screen.getByText('Showing 3 of 3 matching records')).toBeVisible()
  })

  it('paginates results and links result history to its applicant', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/official-results')

    expect(screen.getByText('Showing 5 of 9 matching records')).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Next official result page' }),
    )
    expect(screen.getByText('Showing 4 of 9 matching records')).toBeVisible()

    await user.click(
      screen.getByRole('button', { name: 'Previous official result page' }),
    )
    await user.click(
      within(screen.getByRole('table')).getAllByRole('button', {
        name: 'Open result',
      })[0],
    )

    expect(window.location.pathname).toBe('/admin/official-results/RES-001')
    expect(
      screen.getByRole('heading', { level: 1, name: 'RES-001' }),
    ).toBeVisible()
    expect(screen.getByText('Recorded score')).toBeVisible()
    expect(screen.getByText('Version history')).toBeVisible()

    await user.click(
      screen.getByRole('button', { name: 'Open applicant record' }),
    )
    expect(window.location.pathname).toBe('/admin/applicants/APP-001')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Alex Rivera' }),
    ).toBeVisible()
  })

  it('has no automatically detectable result-entry accessibility violations', async () => {
    const { container } = await renderAppAt('/admin/exam-results/new')

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })
})
