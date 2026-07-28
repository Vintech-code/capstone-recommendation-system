import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { StudentReportPage } from '@/features/student/report/components/student-report-page'
import { renderAppAt } from '@/test/render-app'

async function openStudentReport() {
  const user = userEvent.setup()
  await renderAppAt('/student')
  const navigation = screen.getByRole('navigation', {
    name: 'Workspace navigation',
  })
  await user.click(within(navigation).getByRole('button', { name: 'My report' }))
  return user
}

const pageCallbacks = {
  onBack: vi.fn(),
  onOpenGuidance: vi.fn(),
}

describe('Student report', () => {
  it('shows an own-record guidance report with source references', async () => {
    await openStudentReport()

    expect(
      screen.getByRole('heading', { level: 1, name: 'My report' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Course Guidance Summary' }),
    ).toBeVisible()
    expect(screen.getAllByText('RPT-STU-001').length).toBeGreaterThan(0)
    expect(screen.getByText('RIA-RES-001')).toBeVisible()
    expect(screen.getByText('REC-STU-001')).toBeVisible()
    expect(screen.getByText('DEC-STU-001')).toBeVisible()
    expect(screen.getByText('Own-record report')).toBeVisible()
  })

  it('provides functional print and download controls', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    const user = await openStudentReport()

    await user.click(screen.getByRole('button', { name: 'Print report' }))
    expect(print).toHaveBeenCalledOnce()

    const download = screen.getByRole('link', {
      name: 'Download course guidance summary',
    })
    expect(download).toHaveAttribute('download', 'course-guidance-summary.txt')
    expect(download.getAttribute('href')).toMatch(/^data:text\/plain/)
    print.mockRestore()
  })

  it('keeps report language separate from admission and enrolment', async () => {
    await openStudentReport()
    expect(screen.getByText('Important limitations')).toBeVisible()
    expect(
      screen.getByText(/does not guarantee admission, reserve a slot/i),
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /approve|admit|enrol/i }),
    ).not.toBeInTheDocument()
  })

  it('defines loading, preparing, empty, and retryable error states', async () => {
    const loading = render(
      <StudentReportPage {...pageCallbacks} initialLoadState="loading" />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading your report')
    loading.unmount()

    const preparing = render(
      <StudentReportPage {...pageCallbacks} initialLoadState="preparing" />,
    )
    expect(
      screen.getByRole('heading', { name: 'Your report is being prepared' }),
    ).toBeVisible()
    preparing.unmount()

    const empty = render(
      <StudentReportPage {...pageCallbacks} initialLoadState="empty" />,
    )
    expect(
      screen.getByRole('heading', { name: 'No report is available' }),
    ).toBeVisible()
    empty.unmount()

    render(<StudentReportPage {...pageCallbacks} initialLoadState="error" />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'We could not load your report',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'My report' }),
    ).toBeVisible()
  })

  it('returns to course guidance from the empty state', async () => {
    const onOpenGuidance = vi.fn()
    render(
      <StudentReportPage
        onBack={vi.fn()}
        onOpenGuidance={onOpenGuidance}
        initialLoadState="empty"
      />,
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Open course guidance' }),
    )
    expect(onOpenGuidance).toHaveBeenCalledOnce()
  })

  it('has no automatically detectable accessibility violations', async () => {
    render(
      <main>
        <StudentReportPage {...pageCallbacks} />
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
