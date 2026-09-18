import { expect, test, type Page, type Route } from '@playwright/test'
import axe from 'axe-core'

const user = {
  id: 1,
  name: 'Browser Test Student',
  email: 'student@example.test',
  roles: ['student'],
}

const resultEntries = [
  { area: 'Realistic', score: 15 },
  { area: 'Investigative', score: 19 },
  { area: 'Artistic', score: 15 },
  { area: 'Social', score: 18 },
  { area: 'Enterprising', score: 17 },
  { area: 'Conventional', score: 19 },
]

const recommendation = {
  id: 'REC-000001',
  generatedAt: '2026-08-08T00:00:00Z',
  assessmentResultReference: 'ASMT-000001',
  catalogueReference: 'TCC-AY-2026-2027-V1',
  ruleReference: 'PROPOSED-RIASEC-1',
  status: 'Available',
  defaultCount: 3,
  totalEligible: 1,
  canViewAll: false,
  showingAll: false,
  profile: {
    sessionReference: 'ASMT-000001',
    availableAt: '2026-08-08T00:00:00Z',
    topCode: 'I-C-S',
    topLabels: ['Investigative', 'Conventional', 'Social'],
    dimensions: resultEntries.map((entry) => ({
      code: entry.area[0],
      label: entry.area,
      value: entry.score,
    })),
  },
  courses: [{
    id: 'bs-information-technology',
    rank: 1,
    code: 'BSIT',
    name: 'BS Information Technology',
    department: '',
    duration: '4 years',
    level: 'Undergraduate',
    match: 90,
    eligibility: 'Provisional',
    summary: 'Focuses on applying computing, software, data, and network technologies to organisational needs.',
    factors: ['Profile includes I', 'Profile includes C'],
    interestAreas: ['I', 'C', 'R'],
    learningAreas: ['Software development', 'Information management'],
    careerDirections: ['Software development', 'Systems administration'],
    careerOpportunities: [{
      label: 'software developer',
      description: 'Builds software systems from specifications and designs.',
      escoUri: 'http://data.europa.eu/esco/occupation/software-developer',
      escoCode: '2512.3',
      iscoCode: '2512',
      skills: ['analyse software specifications'],
      source: 'esco',
      sourceLanguage: 'en',
      sourceVersion: 'v1.2.0',
      retrievedAt: '2026-09-06T12:00:00+08:00',
      reviewStatus: 'proposed',
    }],
    reviewNotes: [],
  }],
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

async function installStudentApi(page: Page, initiallyComplete = false) {
  let authenticated = false
  let submitted = initiallyComplete
  let answers: Record<string, number> = {}

  await page.route('**/sanctum/csrf-cookie', (route) => route.fulfill({ status: 204 }))
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()

    if (path === '/api/v1/auth/session') {
      return json(route, { user: authenticated ? user : null })
    }
    if (path === '/api/v1/auth/login' && method === 'POST') {
      authenticated = true
      return json(route, { user })
    }
    if (path === '/api/v1/auth/authorize/student') return json(route, { authorized: true, portal: 'student' })
    if (path === '/api/v1/auth/logout') return json(route, { message: 'Signed out.' })
    if (path === '/api/v1/notifications') return json(route, { data: [] })
    if (path.startsWith('/api/v1/locations/')) {
      const data = path.endsWith('/regions') ? [{ id: 1, code: '0100000000', name: 'Test region' }, { id: 9, code: '0900000000', name: 'Another region' }]
        : path.endsWith('/provinces') ? { items: [{ id: 2, code: '0100100000', name: 'Test province' }], hasIndependentCities: true }
        : path.endsWith('/barangays') ? [{ id: 4, code: '0100101001', name: 'Test barangay' }]
        : [{ id: 3, code: '0100101000', name: 'Test city' }]
      return json(route, { data })
    }
    if (path === '/api/v1/student/profile') {
      return json(route, { data: {
        student: { ...user, photoUrl: null },
        personalAcademic: { location: { regionId: 1, provinceId: 2, cityMunicipalityId: 3, barangayId: 4 }, complete: true, lrn: '128490000001', birthDate: '2007-04-18', age: 19, phone: '+63 917 842 1928', addressLine: 'Zone 2', barangay: 'Poblacion', municipality: 'Tagoloan', province: 'Misamis Oriental', shsSchoolName: 'Tagoloan National High School', shsStrand: 'STEM', shsGraduationYear: 2026, updatedAt: '2026-09-07T10:00:00+08:00' },
        questionnaire: { complete: true, strengths: ['Problem-solving'], growthAreas: ['Time management'], learningPreferences: ['Reading'], updatedAt: '2026-09-07T10:00:00+08:00' },
        options: { strengths: ['Problem-solving', 'Creativity'], growthAreas: ['Time management', 'Public speaking'], learningPreferences: ['Reading', 'Hands-on activities'] },
        riasec: null,
        careerInterests: [],
        about: 'The Student profile contains self-reported information.',
      } })
    }
    if (path === '/api/v1/student/entrance-examination') {
      return json(route, { data: { status: 'declared', result: { id: 1, score: 2.5, eligibilityGroup: 'board', ruleReference: 'SELF-DECLARED-TCC-ENTRANCE-2026-01', source: 'student_self_declared', declaredAt: '2026-08-08T07:00:00+08:00' } } })
    }

    if (path === '/api/v1/student/assessments/riasec/session') {
      return json(route, { data: submitted ? completedAssessment() : currentAssessment(answers) })
    }
    if (path === '/api/v1/student/assessments/riasec/questions') {
      return json(route, { data: questionPayload() })
    }
    if (path === '/api/v1/student/assessments/riasec/sessions' && method === 'POST') {
      answers = {}
      return json(route, { data: currentAssessment(answers) }, 201)
    }
    if (/\/sessions\/1$/.test(path) && method === 'PATCH') {
      const body = request.postDataJSON() as { answers: Record<string, number> }
      answers = body.answers
      return json(route, { data: currentAssessment(answers) })
    }
    if (path.endsWith('/submit') && method === 'POST') {
      submitted = true
      return json(route, { data: completedAssessment() })
    }
    if (path === '/api/v1/student/assessments/riasec/history') {
      return json(route, {
        data: submitted ? [completedAssessment()] : [],
        policy: {
          status: 'proposed',
          version: 'RETAKE-PROPOSED-2026-01',
          minimum_days_between_completed_attempts: 30,
          completed_attempts_are_read_only: true,
        },
      })
    }
    if (path === '/api/v1/student/recommendations/latest') {
      return json(route, {
        data: submitted
          ? { status: 'available', recommendation }
          : { status: 'not_available', recommendation: null },
      })
    }
    if (path === '/api/v1/student/programmes') {
      return json(route, { data: programmeCatalogue() })
    }
    if (path === '/api/v1/student/saved-programmes') {
      return json(route, { data: { programmeIds: [] } })
    }

    return json(route, { message: `Unhandled browser-test endpoint: ${method} ${path}` }, 404)
  })
}

function currentAssessment(answers: Record<string, number>) {
  return {
    id: 1,
    reference: 'ASMT-000001',
    instrument_code: 'tcc-uhcc-riasec-42-v1',
    status: Object.keys(answers).length ? 'in_progress' : 'not_started',
    answers,
    answer_count: Object.keys(answers).length,
    question_count: 6,
    current_question: Math.min(6, Object.keys(answers).length + 1),
    attempt_number: 1,
    is_current: true,
  }
}

function completedAssessment() {
  return {
    id: 1,
    reference: 'ASMT-000001',
    instrument_code: 'tcc-uhcc-riasec-42-v1',
    status: 'result_available',
    answers: Object.fromEntries(Array.from({ length: 6 }, (_, index) => [String(index + 1), 1])),
    answer_count: 6,
    question_count: 6,
    current_question: 6,
    attempt_number: 1,
    is_current: true,
    result_available_at: '2026-08-08T00:00:00Z',
    can_retake: false,
    result: { instrument_code: 'tcc-uhcc-riasec-42-v1', answer_count: 6, result: resultEntries },
  }
}

function questionPayload() {
  return {
    instrument: { code: 'tcc-uhcc-riasec-42-v1', name: 'RIASEC Interest Checklist', question_count: 6, content_version: 'riasec-assessment-asset-v1', status: 'proposed', instructions: 'Answer honestly.' },
    answer_options: [
      { value: 1, name: 'Agree' },
      { value: 2, name: 'Do not agree' },
    ],
    questions: Array.from({ length: 6 }, (_, index) => ({ index: index + 1, text: `Browser assessment question ${index + 1}` })),

  }
}

function programmeCatalogue() {
  return {
    academicYear: '2026-2027',
    catalogueVersion: 2,
    programmes: [{
      id: 'bs-information-technology',
      name: 'BS Information Technology',
      code: 'BSIT',
      majors: [],
      riasecProfile: ['I', 'R', 'C'],
      description: 'Focuses on applying computing to organisational needs.',
      learningAreas: ['Software development'],
      learningAreaDescriptions: { 'Software development': 'Design, test, and maintain software applications.' },
      learningAreaTopics: { 'Software development': ['Programming', 'Testing', 'Maintenance'] },
      careerDirections: ['Software development'],
      recommendedStrands: ['STEM', 'TVL-ICT'],
      strandGuidance: 'These strands provide helpful preparation.',
      requirements: [],
      readinessPrompt: 'Discuss your interest in technology.',
      contentVersion: 'GUIDANCE-1',
    }],
  }
}

async function signIn(page: Page) {
  await page.goto('/student/login')
  await page.getByRole('textbox', { name: 'Email address' }).fill('student@example.test')
  await page.getByRole('textbox', { name: 'Password' }).fill('browser-test-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/student$/)
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}

test('shows the simplified Student authentication modal', async ({ page }, testInfo) => {
  await installStudentApi(page)
  await page.goto('/student/login')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page.getByRole('tablist', { name: 'Authentication modes' })).toHaveCount(0)
  await expect(dialog).toHaveClass(/max-w-\[460px\]/)
  await expect(dialog).toHaveClass(/rounded-xs/)
  const heading = page.getByRole('heading', { name: 'Welcome back!' })
  await expect(heading).toBeVisible()
  await expect(heading).toHaveClass(/text-2xl/)
  await expectNoHorizontalOverflow(page)

  await page.getByRole('button', { name: 'Create an account' }).click()
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('student-auth-modal.png') })
})

test('lets the Student manage personal and academic profile information without GWA', async ({ page }) => {
  await installStudentApi(page)
  await signIn(page)
  await page.getByRole('button', { name: 'Go to dashboard' }).click()
  await page.getByRole('button', { name: 'My Profile' }).first().click()

  await expect(page.getByText('Edit Profile', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Learner reference numberOptional')).toHaveValue('128490000001')
  await expect(page.getByLabel(/Mobile number/)).toHaveValue('+63 917 842 1928')
  await expect(page.getByLabel(/Senior high school/)).toHaveValue('Tagoloan National High School')
  await expect(page.getByLabel(/GWA/i)).toHaveCount(0)
  await page.getByRole('button', { name: /Next/ }).click()
  await expect(page.getByRole('heading', { name: 'Learning profile & preferences' })).toBeVisible()
  await expect(page.getByLabel(/GWA/i)).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
})

test('completes the student assessment and opens a recommendation detail', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  await installStudentApi(page)
  await signIn(page)
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await expect(page.getByRole('heading', { name: 'Interest assessment' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Student working on a car' })).toBeVisible()
  await page.getByRole('img', { name: 'Student working on a car' }).evaluate((image: HTMLImageElement) => {
    if (image.complete) return
    return new Promise<void>((resolve) => image.addEventListener('load', () => resolve(), { once: true }))
  })
  await expect(page.getByRole('navigation', { name: 'Question navigation' })).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('assessment-progress-desktop-or-mobile.png') })

  for (let index = 1; index <= 6; index += 1) {
    await expect(page.getByRole('group', { name: `Response for question ${index}` })).toBeVisible()
    await page.getByText('Agree', { exact: true }).click()
    if (index === 6) {
      await page.getByRole('button', { name: 'Finish assessment' }).click()
    } else {
      await expect(page.getByRole('group', { name: `Response for question ${index + 1}` })).toBeVisible()
    }

    if (index === 2) {
      await page.getByRole('button', { name: 'Previous' }).click()
      await expect(page.getByRole('button', { name: 'Next' })).toBeVisible()
      await page.getByRole('button', { name: 'Next' }).click()
    }
  }

  await expect(page.getByRole('heading', { name: 'All ranked matches' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'RIASEC scores' })).toBeVisible()
  const topMatch = page.getByRole('heading', { level: 3, name: 'BS Information Technology' }).locator('xpath=ancestor::article')
  await expect(topMatch).toHaveClass(/rounded-3xl/)
  await expect(topMatch.getByText('Strong match')).toBeVisible()
  await expect(topMatch.getByRole('progressbar', { name: 'BS Information Technology strong match' })).toHaveAttribute('aria-valuenow', '90')
  const programmeSummary = topMatch.getByText(/Focuses on applying computing/)
  expect(await programmeSummary.evaluate((element) => window.getComputedStyle(element).fontFamily)).toContain('Montserrat Alternates')
  await topMatch.screenshot({ path: testInfo.outputPath('ranked-match.png') })
  await page.getByRole('button', { name: 'View programme' }).click()
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1, name: 'BS Information Technology' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Possible career directions' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'software developer' })).toBeVisible()
  await expect(page.getByText('analyse software specifications')).toBeVisible()

  await expectNoHorizontalOverflow(page)
  expect(consoleErrors).toEqual([])
})

test('shows multiple programme career directions and published ESCO details', async ({ page }) => {
  await installStudentApi(page, true)
  await signIn(page)

  await page.getByRole('button', { name: 'My Matches' }).first().click()
  await expect(page.getByRole('heading', { name: 'All ranked matches' })).toBeVisible()
  await page.getByRole('button', { name: 'View programme' }).click()

  await expect(page.getByText('2 to explore')).toBeVisible()
  const careerSection = page.getByRole('region', { name: 'Possible career directions' })
  await expect(careerSection.getByText('Software development')).toBeVisible()
  await expect(careerSection.getByText('Systems administration')).toBeVisible()
  await expect(careerSection.getByRole('heading', { name: 'software developer' })).toBeVisible()
  await expect(careerSection.getByText('analyse software specifications')).toBeVisible()
  await expect(careerSection.getByText('Taxonomy v1.2.0')).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

test('passes responsive, keyboard, contrast, and printable-page smoke checks', async ({ page }) => {
  await installStudentApi(page, true)
  await signIn(page)
  await expect(page.getByRole('heading', { name: 'RIASEC scores' })).toBeVisible()
  await expectNoHorizontalOverflow(page)

  const viewportWidth = page.viewportSize()?.width ?? 0
  const primaryNavigation = page.getByRole('navigation', {
    name: viewportWidth < 768 ? 'Mobile workspace navigation' : 'Workspace navigation',
  })
  const matchesNavigation = primaryNavigation.getByRole('button', { name: 'My Matches' })
  await expect(matchesNavigation).toHaveAttribute('aria-current', 'page')
  await primaryNavigation.getByRole('button', { name: 'Explore Programs' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Explore TCC programmes' })).toBeVisible()
  await matchesNavigation.click()
  await expect(page.getByRole('heading', { name: 'RIASEC scores' })).toBeVisible()

  const headerPosition = await page.locator('header').first().evaluate((element) =>
    window.getComputedStyle(element).position,
  )
  expect(headerPosition).toBe(viewportWidth < 768 ? 'relative' : 'sticky')

  await page.keyboard.press('Tab')
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
  expect(['A', 'BUTTON']).toContain(focusedTag)

  await page.addScriptTag({ content: axe.source })
  const lightViolations = await page.evaluate(async () => {
    const runner = (window as typeof window & { axe: typeof axe }).axe
    const results = await runner.run(document, { runOnly: ['color-contrast'] })
    return results.violations
  })
  expect(lightViolations).toEqual([])

  await page.evaluate(() => document.documentElement.classList.add('dark'))
  // Let the documented theme transition finish before measuring final colours.
  await page.waitForTimeout(250)
  const darkViolations = await page.evaluate(async () => {
    const runner = (window as typeof window & { axe: typeof axe }).axe
    const results = await runner.run(document, { runOnly: ['color-contrast'] })
    return results.violations
  })
  expect(darkViolations).toEqual([])

  await page.emulateMedia({ media: 'print' })
  const printPdf = await page.pdf({ format: 'A4', printBackground: true })
  expect(printPdf.byteLength).toBeGreaterThan(10_000)
})


test('cascades Philippine locations with keyboard, responsive layout, and accessible controls', async ({ page }) => {
  await installStudentApi(page)
  await signIn(page)
  await page.getByRole('button', { name: 'Go to dashboard' }).click()
  await page.getByRole('button', { name: 'My Profile' }).first().click()
  await expect(page.getByRole('combobox', { name: /Barangay/ })).toContainText('Test barangay')
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const region = page.getByRole('combobox', { name: /Region/ })
  await region.focus()
  await expect(region).toBeFocused()
  await page.keyboard.press('Space')
  await page.getByRole('option', { name: 'Another region' }).click()
  await expect(page.getByRole('combobox', { name: /City or municipality/ })).toBeDisabled()
  await expect(page.getByRole('combobox', { name: /Barangay/ })).toBeDisabled()
  await page.getByRole('combobox', { name: /Province/ }).click()
  await page.getByRole('option', { name: 'No province (independent city)' }).click()
  await page.getByRole('combobox', { name: /City or municipality/ }).click()
  await page.getByRole('option', { name: 'Test city' }).click()
  await page.getByRole('combobox', { name: /Barangay/ }).click()
  await page.getByRole('option', { name: 'Test barangay' }).click()
  await expectNoHorizontalOverflow(page)
  await page.addScriptTag({ content: axe.source })
  const accessibility = await page.evaluate(async () => window.axe.run('fieldset', { runOnly: ['color-contrast', 'label', 'aria-valid-attr', 'aria-required-attr'] }))
  expect(accessibility.violations).toEqual([])
  expect(errors).toEqual([])
  await page.screenshot({ path: `test-results/locations-${test.info().project.name}.png`, fullPage: true })
})
