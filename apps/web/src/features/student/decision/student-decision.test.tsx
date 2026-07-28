import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { StudentDecisionPage } from '@/features/student/decision/components/student-decision-page'
import { renderAppAt } from '@/test/render-app'

async function openStudentDecision() {
  const user = userEvent.setup()
  await renderAppAt('/student')
  const navigation = screen.getByRole('navigation', {
    name: 'Workspace navigation',
  })
  await user.click(
    within(navigation).getByRole('button', { name: 'My decision' }),
  )
  return user
}

const pageCallbacks = {
  onBack: vi.fn(),
  onOpenGuidance: vi.fn(),
  onOpenReport: vi.fn(),
}

describe('Student decision', () => {
  it('shows the recorded preference, history, and non-enrolment boundary', async () => {
    await openStudentDecision()

    expect(
      screen.getByRole('heading', { level: 1, name: 'My decision' }),
    ).toBeVisible()
    expect(
      screen.getByText('Your preference stays separate from enrolment.'),
    ).toBeVisible()
    expect(screen.getByText('DEC-STU-001')).toBeVisible()
    expect(screen.getByText('REC-STU-001')).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Decision history' }),
    ).toBeVisible()
  })

  it('validates and records a revised course preference', async () => {
    const user = await openStudentDecision()
    await user.click(screen.getByRole('button', { name: 'Edit decision' }))
    await user.selectOptions(
      screen.getByLabelText('Course under review'),
      'CRS-002',
    )
    await user.click(
      screen.getByRole('radio', { name: /^Prefer this course/i }),
    )
    const note = screen.getByLabelText('Decision note')
    await user.clear(note)
    await user.click(screen.getByRole('button', { name: 'Review decision' }))
    expect(
      screen.getByText('Add a short note about your decision.'),
    ).toBeVisible()

    await user.type(note, 'This option currently matches my learning goals.')
    await user.click(screen.getByRole('button', { name: 'Review decision' }))
    expect(
      screen.getByRole('heading', { name: 'Record this decision?' }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Record decision' }))

    expect(
      await screen.findByRole('button', { name: 'Edit decision' }),
    ).toBeVisible()
    expect(screen.getAllByText('Preferred course').length).toBeGreaterThan(0)
    expect(screen.getAllByText('BS Computer Science').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Just now').length).toBeGreaterThan(0)
  })

  it('opens guidance and report through functional Student actions', async () => {
    const user = await openStudentDecision()
    await user.click(
      screen.getByRole('button', { name: 'Review course guidance' }),
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Course guidance' }),
    ).toBeVisible()

    const navigation = screen.getByRole('navigation', {
      name: 'Workspace navigation',
    })
    await user.click(
      within(navigation).getByRole('button', { name: 'My decision' }),
    )
    await user.click(screen.getByRole('button', { name: 'Open my report' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'My report' }),
    ).toBeVisible()
  })

  it('defines loading, empty, and retryable error states', async () => {
    const loading = render(
      <StudentDecisionPage
        {...pageCallbacks}
        initialLoadState="loading"
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading your decision')
    loading.unmount()

    const empty = render(
      <StudentDecisionPage {...pageCallbacks} initialLoadState="empty" />,
    )
    expect(
      screen.getByRole('heading', {
        name: 'No recommendation is available for a decision',
      }),
    ).toBeVisible()
    empty.unmount()

    render(<StudentDecisionPage {...pageCallbacks} initialLoadState="error" />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'We could not load your decision',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'My decision' }),
    ).toBeVisible()
  })

  it('does not expose admission or administrative actions', async () => {
    await openStudentDecision()
    expect(
      screen.queryByRole('button', { name: /admit|enrol|approve/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('System Administrator')).not.toBeInTheDocument()
  })

  it('has no automatically detectable accessibility violations', async () => {
    render(
      <main>
        <StudentDecisionPage {...pageCallbacks} />
      </main>,
    )
    const results = await axe.run(document.body, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
