import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'

it('omits the removed history section while retaining the student result', async () => {
  await renderAppAt('/admin/students/10')

  expect(await screen.findByRole('heading', { name: 'Ana Santos' })).toBeVisible()
  expect(screen.queryByRole('heading', { name: 'Assessment history and evidence' })).not.toBeInTheDocument()
  expect(screen.queryByText('Versioned record')).not.toBeInTheDocument()
  expect(screen.queryByText('Preserved Recommendations')).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Assessment context' })).not.toBeInTheDocument()
  expect(screen.getAllByTestId('student-resume-card')).toHaveLength(1)
  expect(screen.getByText('ASMT-000001')).toBeVisible()
  expect(screen.getByText('LRN: 128490000011')).toBeVisible()
  expect(screen.getByText('Tagoloan National High School')).toBeVisible()
  expect(screen.queryByText(/GWA/i)).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Academic programme recommendations' })).toBeVisible()
})
