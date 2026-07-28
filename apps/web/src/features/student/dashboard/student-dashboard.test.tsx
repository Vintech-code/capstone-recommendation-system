import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'

describe('Student dashboard', () => {
  it('presents a task-oriented Student Applicant overview', async () => {
    await renderAppAt('/student')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /your guidance journey, one step at a time/i,
      }),
    ).toBeVisible()
    expect(
      screen.getAllByText('Profile & application').length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('Available to view')).toBeVisible()
    expect(screen.getByText('Ready to continue')).toBeVisible()
    expect(screen.getByText('Available to review')).toBeVisible()
    expect(screen.getByText('Still deciding')).toBeVisible()
    expect(screen.getByText('Guidance, not enrolment')).toBeVisible()
    expect(screen.queryByText('Applicants')).not.toBeInTheDocument()
    expect(screen.queryByText('Courses & rules')).not.toBeInTheDocument()
  })

  it('opens the next available course-guidance workspace', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student')

    const hero = screen.getByRole('region', {
      name: /your guidance journey, one step at a time/i,
    })
    await user.click(
      within(hero).getByRole('button', { name: 'Review course guidance' }),
    )

    expect(
      within(screen.getByRole('main')).getByRole('heading', {
        level: 1,
        name: 'Course guidance',
      }),
    ).toBeVisible()
  })

  it('opens the read-only official-result workspace from quick access', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student')

    const actions = screen.getByRole('region', { name: 'Available actions' })
    await user.click(
      within(actions).getByRole('button', { name: /view official result/i }),
    )

    expect(
      within(screen.getByRole('main')).getByRole('heading', {
        level: 1,
        name: 'Official result',
      }),
    ).toBeVisible()
  })

  it('has no automatically detectable accessibility violations', async () => {
    const { container } = await renderAppAt('/student')
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })
})
