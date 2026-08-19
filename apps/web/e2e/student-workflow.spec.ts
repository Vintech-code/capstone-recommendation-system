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
    topCode: 'I-C',
    topLabels: ['Investigative', 'Conventional'],
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

    if (path === '/api/v1/auth/me') {
      return authenticated ? json(route, { user }) : json(route, { message: 'Unauthenticated.' }, 401)
    }
    if (path === '/api/v1/auth/login' && method === 'POST') {
      authenticated = true
      return json(route, { user })
    }
    if (path === '/api/v1/auth/authorize/student') return json(route, { authorized: true, portal: 'student' })
    if (path === '/api/v1/auth/logout') return json(route, { message: 'Signed out.' })

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
    if (path === '/api/v1/student/guidance-appointments') {
      return json(route, { data: [] })
    }
    if (path === '/api/v1/student/guidance-requests') {
      return json(route, { data: [] })
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
    instrument_code: 'tcc-riasec-42-v1',
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
    instrument_code: 'tcc-riasec-42-v1',
    status: 'result_available',
    answers: Object.fromEntries(Array.from({ length: 6 }, (_, index) => [String(index + 1), 1])),
    answer_count: 6,
    question_count: 6,
    current_question: 6,
    attempt_number: 1,
    is_current: true,
    result_available_at: '2026-08-08T00:00:00Z',
    can_retake: false,
    result: { instrument_code: 'tcc-riasec-42-v1', answer_count: 6, result: resultEntries },
  }
}

function questionPayload() {
  return {
    instrument: { code: 'tcc-riasec-42-v1', name: 'TCC RIASEC Interest Questionnaire', question_count: 6, content_version: 'researcher-questionnaire-v1', status: 'proposed', instructions: 'Answer honestly.' },
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
    catalogueVersion: 1,
    programmes: [{
      id: 'bs-information-technology',
      name: 'BS Information Technology',
      code: 'BSIT',
      majors: [],
      riasecProfile: ['I', 'C', 'R'],
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

test('completes the student assessment and opens a recommendation detail', async ({ page }) => {
  const consoleErrors: string[] = []
  await installStudentApi(page)
  await signIn(page)
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.getByRole('button', { name: /^(Interest assessment|Assessment)$/ }).click()
  await expect(page.getByRole('heading', { name: 'Assessment session' })).toBeVisible()

  for (let index = 1; index <= 6; index += 1) {
    await expect(page.getByText(`Question ${index} of 6`).first()).toBeVisible()
    await page.getByText('Agree', { exact: true }).click()
  }

  await expect(page.getByRole('heading', { name: 'All questions are answered' })).toBeVisible()
  await page.getByRole('button', { name: 'Submit assessment' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Submit assessment' }).click()
  await expect(page.getByRole('heading', { name: 'Your academic matches' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Your profile breakdown' })).toBeVisible()
  await page.getByRole('button', { name: 'View programme' }).click()
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1, name: 'BS Information Technology' })).toBeVisible()

  await expectNoHorizontalOverflow(page)
  expect(consoleErrors).toEqual([])
})

test('passes responsive, keyboard, contrast, and print smoke checks', async ({ page }) => {
  await installStudentApi(page, true)
  await signIn(page)
  await expect(page.getByTestId('student-guidance-summary')).toBeVisible()
  await expectNoHorizontalOverflow(page)

  const viewportWidth = page.viewportSize()?.width ?? 0
  const primaryNavigation = page.getByRole('navigation', {
    name: viewportWidth < 768 ? 'Mobile workspace navigation' : 'Workspace navigation',
  })
  const dashboardNavigation = primaryNavigation.getByRole('button', { name: 'Dashboard' })
  await expect(dashboardNavigation).toHaveAttribute('aria-current', 'page')
  await primaryNavigation.getByRole('button', { name: 'Explore Programs' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Explore TCC programmes' })).toBeVisible()
  await dashboardNavigation.click()
  await expect(page.getByTestId('student-guidance-summary')).toBeVisible()

  await page.getByRole('button', { name: 'Assessment history' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Assessment history' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Your assessment timeline' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await page.getByRole('button', { name: 'Go to Student dashboard' }).click()
  await expect(page.getByTestId('student-guidance-summary')).toBeVisible()

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
  await expect(page.locator('[data-print-hidden]').first()).toBeHidden()
  await expect(page.locator('[data-print-only]')).toBeVisible()
  const printColumns = await page.locator('[data-print-profile] dl').evaluate((element) =>
    window.getComputedStyle(element).gridTemplateColumns,
  )
  expect(printColumns.split(' ')).toHaveLength(3)
  const printPdf = await page.pdf({ format: 'A4', printBackground: true })
  expect(printPdf.byteLength).toBeGreaterThan(10_000)
})
