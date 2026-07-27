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

  it('provides a keyboard-accessible workspace user menu', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }))

    expect(window.location.pathname).toBe('/admin/login')
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
