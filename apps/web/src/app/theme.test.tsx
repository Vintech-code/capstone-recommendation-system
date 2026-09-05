import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import stylesheet from '@/index.css?raw'
import { renderAppAt } from '@/test/render-app'

function relativeLuminance(hex: string) {
  const channels = hex
    .replace('#', '')
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    )

  if (!channels || channels.length !== 3) throw new Error(`Invalid color: ${hex}`)

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrastRatio(first: string, second: string) {
  const firstLuminance = relativeLuminance(first)
  const secondLuminance = relativeLuminance(second)
  const lightest = Math.max(firstLuminance, secondLuminance)
  const darkest = Math.min(firstLuminance, secondLuminance)

  return (lightest + 0.05) / (darkest + 0.05)
}

describe('application visual system', () => {
  it('uses the approved navy, teal, and learning-accent palette with Nunito Sans headings and Montserrat body type', () => {
    const rootTheme = stylesheet.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1]

    expect(rootTheme).toBeDefined()
    expect(rootTheme).toContain('--background: #f8fbf7;')
    expect(rootTheme).toContain('--foreground: #123b5d;')
    expect(rootTheme).toContain('--primary: #087f6a;')
    expect(rootTheme).toContain('--secondary-container: #f2c94c;')
    expect(rootTheme).toContain('--border: #d8e8de;')
    expect(stylesheet).toContain('--font-sans: "Montserrat Variable", Montserrat')
    expect(stylesheet).toContain('--font-display: "Nunito Sans Variable", "Nunito Sans"')
    expect(stylesheet).toContain('--font-label: "Montserrat Variable", Montserrat')
  })

  it('keeps core text and solid semantic controls at WCAG AA contrast', () => {
    const colorPairs = [
      ['#123b5d', '#f8fbf7'],
      ['#536b80', '#f8fbf7'],
      ['#ffffff', '#087f6a'],
      ['#ffffff', '#2f855a'],
      ['#ffffff', '#32759f'],
      ['#ffffff', '#b54550'],
      ['#123b5d', '#f2c94c'],
    ]

    for (const [foreground, background] of colorPairs) {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('does not expose an appearance switch on recovery screens', async () => {
    await renderAppAt('/not-found')

    expect(
      screen.queryByRole('button', { name: /dark mode|light mode|appearance/i }),
    ).not.toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('dark')
  })
})
