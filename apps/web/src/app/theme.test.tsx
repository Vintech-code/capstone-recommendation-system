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
  it('uses the approved light-green-primary pastel palette with Nunito Sans headings and Montserrat body type', () => {
    const rootTheme = stylesheet.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1]
    const normalizedRootTheme = rootTheme?.toLowerCase()

    expect(rootTheme).toBeDefined()
    expect(normalizedRootTheme).toContain('--background: rgb(255, 254, 249);')
    expect(normalizedRootTheme).toContain('--foreground: #40534a;')
    expect(normalizedRootTheme).toContain('--primary: #51b885;')
    expect(normalizedRootTheme).toContain('--primary-ink: #3f7d57;')
    expect(normalizedRootTheme).toContain('--brand-green: #8ad3a2;')
    expect(normalizedRootTheme).toContain('--chart-coral: #e58b91;')
    expect(normalizedRootTheme).toContain('--riasec-s: #69b98a;')
    expect(normalizedRootTheme).toContain('--riasec-c: #79b4dc;')
    expect(normalizedRootTheme).toContain('--secondary-container: #f4b740;')
    expect(normalizedRootTheme).toContain('--border: #dce7df;')
    expect(normalizedRootTheme).not.toContain('#2563eb')
    expect(normalizedRootTheme).not.toContain('#2e7d4f')
    expect(normalizedRootTheme).not.toContain('#9a6700')
    expect(stylesheet).toContain('--font-sans: "Montserrat Variable", Montserrat')
    expect(stylesheet).toContain('--font-display: "Nunito Sans Variable", "Nunito Sans"')
    expect(stylesheet).toContain('--font-label: "Montserrat Variable", Montserrat')
  })

  it('keeps core text and solid semantic controls at WCAG AA contrast', () => {
    const colorPairs = [
      ['#40534a', '#fffef9'],
      ['#5f7369', '#fffef9'],
      ['#1f392b', '#51b885'],
      ['#3f7d57', '#fffef9'],
      ['#1f3d2c', '#69b98a'],
      ['#203b4d', '#79b4dc'],
      ['#51272b', '#e58b91'],
      ['#4b3a12', '#e2b34f'],
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
