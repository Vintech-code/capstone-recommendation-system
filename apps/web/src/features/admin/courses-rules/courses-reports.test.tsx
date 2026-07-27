import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderAppAt } from '@/test/render-app'


describe('Admin course, rule, and report workflows', () => {
  it('opens the course catalogue from the Admin dashboard', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const modules = screen.getByRole('region', { name: 'Admin modules' })
    await user.click(
      within(modules).getByRole('button', {
        name: /courses & rules.*open module/i,
      }),
    )

    expect(window.location.pathname).toBe('/admin/courses-rules')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Course catalogue' }),
    ).toBeVisible()
  })

  it('searches, filters, and opens a course', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/courses')

    await user.type(
      screen.getByRole('searchbox', { name: 'Search course catalogue' }),
      'Information Technology',
    )
    expect(screen.getAllByText('BS Information Technology').length).toBe(1)
    expect(screen.queryByText('BS Business Administration')).not.toBeInTheDocument()

    await user.clear(
      screen.getByRole('searchbox', { name: 'Search course catalogue' }),
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by course status' }),
      'Draft',
    )
    expect(screen.getAllByRole('button', { name: 'Open course' })).toHaveLength(
      2,
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by course status' }),
      'Active',
    )
    await user.click(screen.getAllByRole('button', { name: 'Open course' })[0])
    expect(window.location.pathname).toBe('/admin/courses/CRS-001')
    expect(screen.getByText('Program overview')).toBeVisible()
  })

  it('opens admission rules and previews rule conditions and history', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/courses')

    await user.click(screen.getByRole('button', { name: 'Admission rules' }))
    expect(window.location.pathname).toBe('/admin/rules')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Admission rules' }),
    ).toBeVisible()

    await user.click(screen.getAllByRole('button', { name: 'Open rule' })[0])
    expect(window.location.pathname).toBe('/admin/rules/RULE-01')
    expect(screen.getByText('Eligibility conditions')).toBeVisible()
    expect(screen.getByText('Version history')).toBeVisible()
  })

  it('opens Reports from the Admin dashboard', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin')

    const modules = screen.getByRole('region', { name: 'Admin modules' })
    await user.click(
      within(modules).getByRole('button', {
        name: /reports.*open module/i,
      }),
    )

    expect(window.location.pathname).toBe('/admin/reports')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Reports' }),
    ).toBeVisible()
  })

  it('searches, filters, and opens a report preview', async () => {
    const user = userEvent.setup()
    await renderAppAt('/admin/reports')

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by report type' }),
      'Programme overview',
    )
    expect(
      screen.getAllByText('Programme interest overview').length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByText('Assessment activity overview'),
    ).not.toBeInTheDocument()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search reports' }),
      'RPT-003',
    )
    expect(screen.getByText('Featured report')).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open report' }))

    expect(window.location.pathname).toBe('/admin/reports/RPT-003')
    expect(screen.getByText('Report overview')).toBeVisible()
    expect(screen.getByText('Included sections')).toBeVisible()
    expect(screen.getByText('Source versions')).toBeVisible()
  })

  it('prints an individual report and opens its linked applicant', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    await renderAppAt('/admin/reports/RPT-001')

    await user.click(screen.getByRole('button', { name: 'Print report' }))
    expect(printSpy).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Open applicant' }))
    expect(window.location.pathname).toBe('/admin/applicants/APP-001')
    printSpy.mockRestore()
  })
})
