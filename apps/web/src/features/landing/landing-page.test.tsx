import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderAppAt } from '@/test/render-app'

describe('public landing page', () => {
  it('presents the project journey with the supplied landing artwork', async () => {
    await renderAppAt('/')

    expect(screen.getByRole('heading', { level: 1, name: /discover your interests/i })).toBeVisible()
    expect(screen.getByAltText(/students discovering career interests/i)).toHaveAttribute(
      'src',
      expect.stringMatching(/landing-image-home\.png$/),
    )
    expect(screen.getByTestId('landing-hero-background')).toHaveAttribute(
      'src',
      expect.stringMatching(/landing-image-bg\.png$/),
    )
    expect(screen.getByAltText(/confident students ready/i)).toHaveAttribute(
      'src',
      expect.stringMatching(/landing-image2\.png$/),
    )
    expect(screen.getByAltText(/student thoughtfully considering/i)).toHaveAttribute(
      'src',
      expect.stringMatching(/landing-image-question\.png$/),
    )
    expect(screen.getByAltText(/smiling students welcoming/i)).toHaveAttribute(
      'src',
      expect.stringMatching(/landing-image-footer\.png$/),
    )
    expect(screen.getByRole('heading', { name: 'Six ways interests can show up' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'What is RIASEC?' })).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(10)
    expect(screen.getByText('Realistic')).toBeVisible()
    expect(screen.getByText('Conventional')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Three clear stages, with evidence at each step' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Guidance you can understand and revisit' })).toBeVisible()
    expect(screen.getByRole('contentinfo', { name: 'Public site footer' })).toBeVisible()
    expect(screen.getByTestId('riasec-grid')).toHaveClass('grid-cols-2', 'lg:grid-cols-3')
  })

  it('provides an accessible mobile menu and keeps sign-in and unsupported footer copy out', async () => {
    const user = userEvent.setup()
    await renderAppAt('/')

    const header = screen.getByRole('banner')
    expect(within(header).queryByRole('link', { name: 'Student portal' })).not.toBeInTheDocument()
    expect(within(header).queryByRole('link', { name: 'Admin portal' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Student sign in' })).not.toBeInTheDocument()

    const menuButton = within(header).getByRole('button', { name: 'Open navigation menu' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(within(header).queryByRole('navigation', { name: 'Mobile landing navigation' })).not.toBeInTheDocument()
    await user.click(menuButton)
    expect(within(header).getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(within(header).getByRole('navigation', { name: 'Mobile landing navigation' })).toBeVisible()

    screen.getAllByRole('link', { name: /start assessment/i }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/student/login')
      expect(link).toHaveClass('rounded-full')
    })
    expect(screen.getByRole('link', { name: 'Get started now' })).toHaveAttribute('href', '/student/register')
    expect(screen.getByText('Guidance principles')).toBeVisible()
    expect(screen.getByTestId('footer-logo-watermark')).toHaveAttribute('alt', '')
    expect(screen.queryByText('Access Portals')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Administrator sign in' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Pathways Capstone Project/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Exclusively built for TCC applicants/i)).not.toBeInTheDocument()
    expect(screen.getByText(/do not guarantee admission or programme success/i)).toBeVisible()
    expect(screen.queryByText(/perfect course|scientifically valid|research-backed/i)).not.toBeInTheDocument()
  })
})
