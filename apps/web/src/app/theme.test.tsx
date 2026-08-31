import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import stylesheet from '@/index.css?raw'
import { renderAppAt } from '@/test/render-app'

describe('application visual system', () => {
  it('uses the approved warm coastal palette with Nunito Sans headings and Montserrat body type', () => {
    const rootTheme = stylesheet.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1]

    expect(rootTheme).toBeDefined()
    expect(rootTheme).toContain('--background: #fbfaf5;')
    expect(rootTheme).toContain('--primary: #0f6b66;')
    expect(rootTheme).toContain('--secondary-container: #d96f52;')
    expect(rootTheme).toContain('--border: #d8e1dc;')
    expect(stylesheet).toContain('--font-sans: "Montserrat Variable", Montserrat')
    expect(stylesheet).toContain('--font-display: "Nunito Sans Variable", "Nunito Sans"')
    expect(stylesheet).toContain('--font-label: "Montserrat Variable", Montserrat')
  })

  it('does not expose an appearance switch on recovery screens', async () => {
    await renderAppAt('/not-found')

    expect(
      screen.queryByRole('button', { name: /dark mode|light mode|appearance/i }),
    ).not.toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('dark')
  })
})
