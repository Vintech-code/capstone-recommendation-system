import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'


describe('Admin shell and accessibility', () => {
  it('has no automatically detectable accessibility violations', async () => {
    const { container } = await renderAppAt('/student/login')

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })

  it('uses functional breadcrumbs for nested Admin workflows', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/imports/IMP-001')

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(breadcrumb).getByText('IMP-001')).toHaveAttribute(
      'aria-current',
      'page',
    )

    await user.click(
      within(breadcrumb).getByRole('button', {
        name: 'Go to Official results',
      }),
    )

    expect(window.location.pathname).toBe('/admin/official-results')
  })

  it('places feature breadcrumbs below the heading and above local search', async () => {
    await renderAppAt('/admin/applicants')

    const main = screen.getByRole('main')
    const heading = within(main).getByRole('heading', {
      level: 1,
      name: 'Applicants',
    })
    const breadcrumb = within(main).getByRole('navigation', {
      name: 'Breadcrumb',
    })
    const search = within(main).getByRole('searchbox', {
      name: 'Search applicants',
    })

    expect(
      heading.compareDocumentPosition(breadcrumb) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      breadcrumb.compareDocumentPosition(search) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('provides a keyboard-accessible workspace user menu', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }))

    expect(window.location.pathname).toBe('/admin/login')
  })

  it('collapses the desktop sidebar to an icon rail and expands it again', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const sidebar = screen.getByLabelText('Workspace sidebar')
    expect(sidebar).toHaveAttribute('data-collapsed', 'false')

    await user.click(
      screen.getByRole('button', { name: 'Collapse desktop sidebar' }),
    )

    expect(sidebar).toHaveAttribute('data-collapsed', 'true')
    expect(
      within(sidebar).getByRole('button', { name: 'Dashboard' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Expand desktop sidebar' }),
    )

    expect(sidebar).toHaveAttribute('data-collapsed', 'false')
  })

  it('keeps every primary Admin feature surface fluid in the workspace', async () => {
    for (const path of [
      '/admin/applicants',
      '/admin/official-results',
      '/admin/assessments',
      '/admin/recommendations',
      '/admin/courses',
      '/admin/reports',
    ]) {
      const { unmount } = await renderAppAt(path)
      const pageSurface = screen.getByRole('main').firstElementChild

      expect(pageSurface).toHaveClass('w-full')
      expect(pageSurface?.className).not.toContain('max-w-[90rem]')
      unmount()
    }
  })

  it('has no automatically detectable new Admin workflow violations', async () => {
    for (const path of [
      '/admin/imports/new',
      '/admin/imports/IMP-001',
      '/admin/validation-cases',
      '/admin/decisions',
    ]) {
      const { container, unmount } = await renderAppAt(path)
      const results = await axe.run(container, {
        rules: {
          'color-contrast': { enabled: false },
        },
      })

      expect(results.violations).toEqual([])
      unmount()
    }
  })
})
