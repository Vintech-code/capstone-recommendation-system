import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/ui/button'
import { SiteFooter } from '@/components/shared/site-footer'
import {
  ConfirmActionDialog,
  DataTableToolbar,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from '@/components/shared'

describe('shared frontend foundation components', () => {
  it('renders the shared institutional footer with the uploaded brand mark', () => {
    render(<SiteFooter />)

    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('img', { name: 'Academic guidance system' })).toBeVisible()
    expect(
      within(footer).getByRole('heading', { name: 'Institutional' }),
    ).toBeVisible()
    expect(
      within(footer).getByRole('heading', { name: 'Support' }),
    ).toBeVisible()
    expect(footer).toHaveTextContent('2026 Tagoloan Community College')
  })

  it('renders the page header with semantic content and actions', () => {
    render(
      <PageHeader
        eyebrow="Applicants"
        title="Applicant records"
        description="Review submitted records."
        actions={<Button type="button">Export</Button>}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Applicant records' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Review submitted records.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })

  it('communicates status with both text and an icon', () => {
    const { container } = render(
      <StatusBadge label="Approved" tone="success" />,
    )

    expect(screen.getByText('Approved')).toBeVisible()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('announces loading information and renders skeleton placeholders without a spinner', () => {
    const { container } = render(
      <LoadingState
        title="Loading applicants"
        description="Fetching the current list."
      />,
    )

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Loading applicants')
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(4)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('renders page-shaped recommendation skeletons', () => {
    const { container } = render(
      <LoadingState
        variant="recommendations"
        title="Loading recommendations"
      />,
    )

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(10)
  })

  it('provides an actionable semantic empty state', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()

    render(
      <EmptyState
        title="No applicants found"
        description="Change the filters or add a record."
        action={
          <Button type="button" onClick={onCreate}>
            Add record
          </Button>
        }
      />,
    )

    expect(
      screen.getByRole('region', { name: 'No applicants found' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add record' }))
    expect(onCreate).toHaveBeenCalledOnce()
  })

  it('announces an error and supports retry', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(
      <ErrorState
        description="The applicant list could not be loaded."
        onRetry={onRetry}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The applicant list could not be loaded.',
    )
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('labels, updates and clears table search input', async () => {
    const user = userEvent.setup()

    function ToolbarHarness() {
      const [searchValue, setSearchValue] = useState('')
      return (
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchLabel="Search applicant records"
        />
      )
    }

    render(<ToolbarHarness />)

    const input = screen.getByRole('searchbox', {
      name: 'Search applicant records',
    })
    await user.tab()
    expect(input).toHaveFocus()
    await user.type(input, 'student')
    expect(input).toHaveValue('student')

    await user.click(
      screen.getByRole('button', { name: 'Clear table search' }),
    )
    expect(input).toHaveValue('')
  })

  it('provides an accessible confirmation dialog and confirms once', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    const onOpenChange = vi.fn()

    render(
      <ConfirmActionDialog
        open
        onOpenChange={onOpenChange}
        title="Archive applicant"
        description="The record will remain available in audit history."
        confirmLabel="Archive"
        onConfirm={onConfirm}
      />,
    )

    expect(
      screen.getByRole('alertdialog', { name: 'Archive applicant' }),
    ).toHaveAccessibleDescription(
      'The record will remain available in audit history.',
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    const confirmButton = screen.getByRole('button', { name: 'Archive' })

    await waitFor(() => expect(cancelButton).toHaveFocus())
    await user.tab()
    expect(confirmButton).toHaveFocus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
