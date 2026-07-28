import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { StudentOfficialResultPage } from '@/features/student/official-result/components/student-official-result-page'
import { renderAppAt } from '@/test/render-app'

async function openOfficialResult() {
  const user = userEvent.setup()
  await renderAppAt('/student')

  const navigation = screen.getByRole('navigation', {
    name: 'Workspace navigation',
  })
  await user.click(
    within(navigation).getByRole('button', { name: 'Official result' }),
  )

  return user
}

describe('Student official result', () => {
  it('shows a read-only verified record with provenance', async () => {
    await openOfficialResult()

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Official result',
    })
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })

    expect(heading).toBeVisible()
    expect(
      heading.compareDocumentPosition(breadcrumb) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getByText('Recorded result: 84')).toBeVisible()
    expect(screen.getByText('Read-only record')).toBeVisible()
    expect(screen.getByText('RES-2026-004')).toBeVisible()
    expect(screen.getByText('Authorized manual record')).toBeVisible()
    expect(screen.getByText('Authorized Admin')).toBeVisible()
  })

  it('does not expose Student write or Admin verification controls', async () => {
    await openOfficialResult()

    expect(
      screen.queryByRole('button', { name: /edit result/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /verify result/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /replace result/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('returns to the Student dashboard through the aligned breadcrumb', async () => {
    const user = await openOfficialResult()
    await user.click(
      screen.getByRole('button', { name: 'Go to Student dashboard' }),
    )

    expect(
      await screen.findByRole('heading', {
        name: /your guidance journey, one step at a time/i,
      }),
    ).toBeVisible()
  })

  it('defines loading, empty, and retryable error states', async () => {
    const onBack = vi.fn()
    const loading = render(
      <StudentOfficialResultPage
        onBack={onBack}
        initialLoadState="loading"
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading your official result',
    )
    loading.unmount()

    const empty = render(
      <StudentOfficialResultPage onBack={onBack} initialLoadState="empty" />,
    )
    expect(
      screen.getByRole('heading', {
        name: 'No verified result is available',
      }),
    ).toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Return to dashboard' }),
    )
    expect(onBack).toHaveBeenCalledOnce()
    empty.unmount()

    render(
      <StudentOfficialResultPage onBack={onBack} initialLoadState="error" />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'We could not load your result',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      screen.getByRole('heading', { name: 'Official result' }),
    ).toBeVisible()
  })

  it('has no automatically detectable accessibility violations', async () => {
    await openOfficialResult()
    const results = await axe.run(screen.getByRole('main'), {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })
})
