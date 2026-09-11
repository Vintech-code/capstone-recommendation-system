import { expect, test } from '@playwright/test'
import axe from 'axe-core'

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthenticated.' }),
    }),
  )
})

test('public landing is compact, responsive, and uses transition-only motion', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('/')
  const header = page.getByRole('banner')
  const hero = page.getByTestId('landing-hero')
  const title = page.getByRole('heading', { level: 1, name: /explore your interests/i })

  await expect(title).toBeVisible()
  consoleErrors.length = 0
  await expect(page.getByTestId('landing-hero-background')).toHaveAttribute('src', /landing-image-bg/)
  await expect(header.getByRole('link', { name: 'Student portal' })).toHaveCount(0)
  await expect(header.getByRole('link', { name: 'Admin portal' })).toHaveCount(0)
  await expect(header.getByRole('link', { name: /start assessment/i })).toBeVisible()
  await expect(page.getByText('Guidance principles')).toBeVisible()
  await expect(page.getByText('Access Portals')).toHaveCount(0)

  const layout = await page.evaluate(() => {
    const headerElement = document.querySelector('header')
    const titleElement = document.querySelector('#landing-title')
    const heroImage = document.querySelector<HTMLImageElement>('img[alt="Students discovering career interests with laptops"]')
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-landing-reveal]'))

    return {
      gap: titleElement && headerElement
        ? Math.round(titleElement.getBoundingClientRect().top - headerElement.getBoundingClientRect().bottom)
        : null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      heroAnimation: heroImage ? getComputedStyle(heroImage).animationName : null,
      revealCount: revealElements.length,
      transitionDurations: revealElements.map((element) => getComputedStyle(element).transitionDuration),
    }
  })

  expect(layout.gap).not.toBeNull()
  expect(layout.gap ?? 999).toBeLessThanOrEqual(40)
  expect(layout.overflow).toBeLessThanOrEqual(0)
  expect(layout.heroAnimation).toBe('none')
  expect(layout.revealCount).toBeGreaterThan(1)
  expect(layout.transitionDurations.some((duration) => duration !== '0s')).toBe(true)

  const accessibility = await page.evaluate(async (source) => {
    eval(source)
    return window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
  }, axe.source)
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  expect(consoleErrors).toEqual([])

  await hero.screenshot({ path: testInfo.outputPath('landing-hero.png') })
})

test('public landing removes decorative motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const motion = await page.locator('[data-landing-reveal]').first().evaluate((element) => ({
    duration: getComputedStyle(element).transitionDuration,
    transform: getComputedStyle(element).transform,
    opacity: getComputedStyle(element).opacity,
  }))

  expect(motion).toEqual({ duration: '0s', transform: 'none', opacity: '1' })
})
