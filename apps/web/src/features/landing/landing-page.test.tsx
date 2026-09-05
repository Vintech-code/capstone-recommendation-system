import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'

describe('public landing page', () => {
  it('presents the project journey with the supplied landing artwork', async () => {
    await renderAppAt('/')

    expect(screen.getByRole('heading', { level: 1, name: /explore your interests/i })).toBeVisible()
    expect(document.querySelector('img[alt=""]')).toHaveAttribute(
      'src',
      expect.stringMatching(/bg-landing\.png$/),
    )
    expect(screen.getByRole('heading', { name: 'Six ways interests can show up' })).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(10)
    expect(screen.getByText('Realistic')).toBeVisible()
    expect(screen.getByText('Conventional')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Three clear stages, with evidence at each step' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Guidance you can understand and revisit' })).toBeVisible()
    expect(screen.getByRole('contentinfo', { name: 'Public site footer' })).toBeVisible()
  })

  it('uses functional portal links and avoids unsupported promises', async () => {
    await renderAppAt('/')

    screen.getAllByRole('link', { name: /start assessment/i }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/student/login')
      expect(link).toHaveClass('rounded-full')
    })
    expect(screen.getByRole('link', { name: 'Administrator sign in' })).toHaveAttribute('href', '/admin/login')
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute('href', '/student/register')
    expect(screen.getByText(/do not guarantee admission or programme success/i)).toBeVisible()
    expect(screen.queryByText(/perfect course|scientifically valid|research-backed/i)).not.toBeInTheDocument()
  })
})
