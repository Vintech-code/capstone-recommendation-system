import { expect, test } from '@playwright/test'
import axe from 'axe-core'

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/auth/session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: null }),
    }),
  )
})

test('guest bootstrap avoids a protected current-user request', async ({ page }) => {
  const authRequests: string[] = []
  const authResponses: Array<{ path: string; status: number }> = []
  const consoleErrors: string[] = []
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname
    if (path.startsWith('/api/v1/auth/')) authRequests.push(path)
  })
  page.on('response', (response) => {
    const path = new URL(response.url()).pathname
    if (path.startsWith('/api/v1/auth/')) authResponses.push({ path, status: response.status() })
  })
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: /discover your interests/i })).toBeVisible()

  expect(authRequests).toEqual(['/api/v1/auth/session'])
  expect(authResponses).toEqual([{ path: '/api/v1/auth/session', status: 200 }])
  expect(consoleErrors).toEqual([])
})

test('public landing is compact, responsive, and uses transition-only motion', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('/')
  const header = page.getByRole('banner')
  const hero = page.getByTestId('landing-hero')
  const title = page.getByRole('heading', { level: 1, name: /discover your interests/i })

  await expect(title).toBeVisible()
  consoleErrors.length = 0
  await expect(page.getByTestId('landing-hero-background')).toHaveAttribute('src', /landing-image-bg/)
  await expect(header.getByRole('link', { name: 'Student portal' })).toHaveCount(0)
  await expect(header.getByRole('link', { name: 'Admin portal' })).toHaveCount(0)
  if (testInfo.project.name === 'mobile-chrome') {
    await expect(header.getByRole('link', { name: /start assessment/i })).toBeHidden()
  } else {
    await expect(header.getByRole('link', { name: /start assessment/i })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: 'Student sign in' })).toHaveCount(0)
  await expect(page.getByText('Guidance principles')).toBeVisible()
  await expect(page.getByText('Access Portals')).toHaveCount(0)
  await expect(page.getByText(/Capstone Project/i)).toHaveCount(0)
  await expect(page.getByText(/Exclusively built for TCC applicants/i)).toHaveCount(0)
  await expect(page.getByTestId('footer-wordmark')).toHaveText('TCCHOICE')
  await expect(page.getByTestId('footer-logo-watermark')).toHaveCount(0)

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

  // Measure final colours, not opacity-composited colours while an offscreen
  // section begins its intersection-triggered reveal during the Axe scan.
  await page.addStyleTag({
    content: '[data-landing-reveal], [data-landing-reveal] [data-motion] { opacity: 1 !important; transform: none !important; filter: none !important; clip-path: none !important; transition: none !important; }',
  })
  const accessibility = await page.evaluate(async (source) => {
    eval(source)
    return window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
  }, axe.source)
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  expect(consoleErrors).toEqual([])

  await hero.screenshot({ path: testInfo.outputPath('landing-hero.png') })
})

test('mobile landing uses a burger menu, two RIASEC columns, and no header assessment action', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const header = page.getByRole('banner')
  const hero = page.getByTestId('landing-hero')
  const menuButton = header.getByRole('button', { name: 'Open navigation menu' })
  await expect(menuButton).toBeVisible()
  await expect(header.getByRole('link', { name: /start assessment/i })).toBeHidden()
  await expect(header.getByRole('navigation', { name: 'Mobile landing navigation' })).toBeHidden()

  const initialLayout = await page.evaluate(() => ({
    headerTop: document.querySelector('header')?.getBoundingClientRect().top,
    heroTop: document.querySelector('[data-testid="landing-hero"]')?.getBoundingClientRect().top,
  }))
  expect(initialLayout.headerTop).toBe(0)

  await menuButton.click()
  const mobileNavigation = header.getByRole('navigation', { name: 'Mobile landing navigation' })
  await expect(mobileNavigation).toBeVisible()
  await expect(mobileNavigation.getByRole('link', { name: 'RIASEC' })).toBeVisible()
  await expect(mobileNavigation.getByRole('link', { name: /start assessment/i })).toHaveCount(0)
  await expect.poll(() => hero.evaluate((element) => element.getBoundingClientRect().top)).toBe(initialLayout.heroTop)

  const menuTransition = await mobileNavigation.evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(menuTransition).not.toBe('0s')
  await header.getByRole('button', { name: 'Close navigation menu' }).click()
  await expect(mobileNavigation).toBeHidden()

  const riasecColumns = await page.getByTestId('riasec-grid').evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(' ').length,
  )
  expect(riasecColumns).toBe(2)

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)

  const guidanceSection = page.locator('#why-guidance')
  await guidanceSection.scrollIntoViewIfNeeded()
  await expect(
    guidanceSection.getByRole('heading', {
      name: 'Guidance you can understand and revisit',
    }),
  ).toBeVisible()
  const guidanceReveal = guidanceSection.locator('[data-landing-reveal]')
  await expect(guidanceReveal).toHaveAttribute('data-landing-reveal', 'guidance')
  await expect(guidanceReveal).toHaveAttribute('data-reveal-duration', '460')
  await expect(guidanceReveal).toHaveAttribute('data-reveal-fade', 'false')
  await expect(guidanceSection.locator('.landing-stagger')).toHaveCount(0)
  await expect(guidanceSection.locator('[data-motion="item"]')).toHaveCount(4)
  await expect(guidanceSection.locator('[data-motion="art"]')).toHaveCount(4)
  await expect(guidanceSection.locator('article img')).toHaveCount(4)

  const guidanceColumns = await page.getByTestId('guidance-grid').evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(' ').length,
  )
  expect(guidanceColumns).toBe(2)
  await guidanceSection.screenshot({ path: testInfo.outputPath('landing-guidance-mobile.png') })

  const firstFaq = page.locator('#faq details').first()
  await firstFaq.locator('summary').click()
  await expect(firstFaq).toHaveAttribute('open', '')
  const faqTransition = await firstFaq.locator(':scope > div').evaluate((element) =>
    getComputedStyle(element).transitionDuration,
  )
  expect(faqTransition).not.toBe('0s')
})

test('ready CTA is image-free and responsive', async ({ page }, testInfo) => {
  await page.goto('/')

  const readyCta = page.getByTestId('landing-ready-cta')
  await readyCta.scrollIntoViewIfNeeded()
  await expect(
    readyCta.getByRole('heading', {
      name: 'Start building your recorded interest profile',
    }),
  ).toBeVisible()
  await expect(readyCta.locator('img')).toHaveCount(0)
  await expect(readyCta.getByRole('link', { name: 'Start assessment' })).toBeVisible()
  await expect(readyCta.getByRole('link', { name: 'Get started now' })).toBeVisible()

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
  await readyCta.screenshot({ path: testInfo.outputPath('landing-ready-cta.png') })
})

test('footer uses the TCCHOICE display wordmark', async ({ page }, testInfo) => {
  await page.goto('/')

  const footer = page.getByRole('contentinfo', { name: 'Public site footer' })
  await footer.scrollIntoViewIfNeeded()
  await expect(footer.getByTestId('footer-wordmark')).toHaveText('TCCHOICE')
  await expect(footer.getByTestId('footer-logo-watermark')).toHaveCount(0)
  await expect(footer.getByText('Guidance principles')).toBeVisible()
  await expect(footer.getByRole('navigation', { name: 'Footer navigation' })).toBeVisible()

  const layout = await footer.getByTestId('footer-wordmark').evaluate((element) => ({
    fontWeight: getComputedStyle(element).fontWeight,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    wordmarkOverflow: element.scrollWidth - element.clientWidth,
  }))
  expect(Number(layout.fontWeight)).toBeGreaterThanOrEqual(700)
  expect(layout.overflow).toBeLessThanOrEqual(0)
  expect(layout.wordmarkOverflow).toBeLessThanOrEqual(0)
  await footer.screenshot({ path: testInfo.outputPath('landing-footer.png') })
})

test('home through FAQ use distinct paced section reveals', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-landing-reveal]')).toHaveCount(6)

  const expectedReveals = [
    { section: 'landing-hero', variant: 'hero', duration: '420' },
    { section: 'why-guidance', variant: 'guidance', duration: '460' },
    { section: 'journey', variant: 'journey', duration: '500' },
    { section: 'riasec', variant: 'riasec', duration: '540' },
    { section: 'faq', variant: 'faq', duration: '480' },
  ]

  const reveals = await page.evaluate((expected) =>
    expected.map(({ section }) => {
      const element = document.querySelector<HTMLElement>(`#${section} [data-landing-reveal]`)
      const motionChild = element?.querySelector<HTMLElement>('[data-motion]')
      return {
        section,
        variant: element?.getAttribute('data-landing-reveal'),
        duration: element?.getAttribute('data-reveal-duration'),
        fade: element?.getAttribute('data-reveal-fade'),
        computedDuration: element ? getComputedStyle(element).transitionDuration : null,
        childTransitionProperty: motionChild
          ? getComputedStyle(motionChild).transitionProperty
          : null,
      }
    }), expectedReveals)

  expect(reveals.map(({ variant }) => variant)).toEqual(expectedReveals.map(({ variant }) => variant))
  expect(reveals.map(({ duration }) => duration)).toEqual(expectedReveals.map(({ duration }) => duration))
  expect(new Set(reveals.map(({ variant }) => variant)).size).toBe(expectedReveals.length)
  expect(new Set(reveals.map(({ computedDuration }) => computedDuration)).size).toBe(expectedReveals.length)
  expect(reveals.every(({ fade }) => fade === 'false')).toBe(true)
  expect(reveals.every(({ childTransitionProperty }) => childTransitionProperty === 'transform')).toBe(true)
  await expect(page.locator('.landing-stagger')).toHaveCount(0)
  await expect(page.locator('[data-motion="art"]')).toHaveCount(13)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('public landing removes decorative motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const motion = await page.locator('[data-motion]').first().evaluate((element) => ({
    duration: getComputedStyle(element).transitionDuration,
    transform: getComputedStyle(element).transform,
    opacity: getComputedStyle(element).opacity,
    clipPath: getComputedStyle(element).clipPath,
  }))

  expect(motion).toEqual({ duration: '0s', transform: 'none', opacity: '1', clipPath: 'none' })
})
