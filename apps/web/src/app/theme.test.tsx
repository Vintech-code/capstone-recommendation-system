import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import stylesheet from '@/index.css?raw'
import { renderAppAt } from '@/test/render-app'

function relativeLuminance(hex: string) {
  const channels = hex
    .replace('#', '')
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    ?.map((channel) =>
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
  it('uses the approved no-blue minimalist clay palette', () => {
    const rootTheme = stylesheet.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1]
    const normalizedRootTheme = rootTheme?.toLowerCase()

    expect(rootTheme).toBeDefined()
    expect(normalizedRootTheme).toContain('--background: #f7faf2;')
    expect(normalizedRootTheme).toContain('--foreground: #34402d;')
    expect(normalizedRootTheme).toContain('--primary: #7ed321;')
    expect(normalizedRootTheme).toContain('--primary-ink: #3b700b;')
    expect(normalizedRootTheme).toContain('--brand-green: #7ed321;')
    expect(normalizedRootTheme).toContain('--chart-coral: #e58b91;')
    expect(normalizedRootTheme).toContain('--riasec-s: #7ed321;')
    expect(normalizedRootTheme).toContain('--riasec-i: #9b86d4;')
    expect(normalizedRootTheme).toContain('--riasec-c: #8e9a73;')
    expect(normalizedRootTheme).toContain('--secondary-container: #f4b740;')
    expect(normalizedRootTheme).toContain('--border: #dce7d4;')
    expect(normalizedRootTheme).not.toContain('--chart-blue:')
    expect(normalizedRootTheme).not.toContain('#79b4dc')
    expect(normalizedRootTheme).not.toContain('#82a7e8')
    expect(normalizedRootTheme).not.toContain('#2563eb')
    expect(normalizedRootTheme).not.toContain('#2e7d4f')
    expect(normalizedRootTheme).not.toContain('#9a6700')
  })

  it('uses Open Runde headings and locally bundled Montserrat Alternates body type', () => {
    expect(stylesheet).toContain('@import "@fontsource/open-runde/400.css"')
    expect(stylesheet).toContain('@import "@fontsource/open-runde/700.css"')
    expect(stylesheet).toContain('@import "@fontsource/montserrat-alternates/latin-400.css"')
    expect(stylesheet).toContain('@import "@fontsource/montserrat-alternates/latin-700.css"')
    expect(stylesheet).toContain('--font-sans: "Montserrat Alternates"')
    expect(stylesheet).toMatch(/--font-display:\s*"Open Runde"/)
    expect(stylesheet).toContain('--font-label: "Montserrat Alternates"')
    expect(stylesheet).not.toContain('"Montserrat Variable"')
    expect(stylesheet).not.toContain('"Nunito Sans Variable"')
  })

  it('keeps core text and solid semantic controls at WCAG AA contrast', () => {
    const colorPairs = [
      ['#34402d', '#f7faf2'],
      ['#65705f', '#f7faf2'],
      ['#20340f', '#7ed321'],
      ['#3b700b', '#f7faf2'],
      ['#20340f', '#7ed321'],
      ['#4b2539', '#d889ae'],
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
