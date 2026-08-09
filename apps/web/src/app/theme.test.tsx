import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { THEME_STORAGE_KEY } from '@/app/theme-context'
import { renderAppAt } from '@/test/render-app'
import stylesheet from '@/index.css?raw'

describe('application theme', () => {
  it('uses the Admin dark surface palette for every role surface alias', () => {
    const darkTheme = stylesheet.match(/\.dark\s*\{([\s\S]*?)\n\}/)?.[1]

    expect(darkTheme).toBeDefined()
    expect(darkTheme).toContain('--card: #121d2d;')
    expect(darkTheme).toContain('--brand-dark: #121d2d;')
    expect(darkTheme).toContain('--secondary: #172437;')
    expect(darkTheme).toContain('--canvas-cream: #172437;')
  })

  it('switches to dark mode and persists the preference', async () => {
    const user = userEvent.setup()
    await renderAppAt('/student/login')

    const toggle = screen.getByRole('button', {
      name: 'Switch to dark mode',
    })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await user.click(toggle)

    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('restores a saved dark theme in an authenticated workspace', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    await renderAppAt('/counselor')

    expect(document.documentElement).toHaveClass('dark')
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toBeVisible()
  })

  it('keeps the theme control available on recovery screens', async () => {
    await renderAppAt('/not-found')

    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' }),
    ).toBeVisible()
  })
})
