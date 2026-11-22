import { expect, test, type Page, type Route } from '@playwright/test'
import axe from 'axe-core'

const user = {
  id: 1,
  name: 'Browser Test Student',
  firstName: 'Browser Test',
  lastName: 'Student',
  email: 'student@example.test',
  roles: ['student'],
}

const resultEntries = [
  { area: 'Realistic', score: 4 },
  { area: 'Investigative', score: 6 },
  { area: 'Artistic', score: 2 },
  { area: 'Social', score: 5 },
  { area: 'Enterprising', score: 3 },
  { area: 'Conventional', score: 7 },
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
    topCode: 'C-I-S',
    topLabels: ['Conventional', 'Investigative', 'Social'],
    dimensions: resultEntries.map((entry) => ({
      code: entry.area[0],
      label: entry.area,
      value: entry.score,
      minimum: 0,
      maximum: 7,
    })),
    guidance: {
      status: 'proposed',
      version: 'TEST-GUIDANCE-V1',
      notice: 'Proposed guidance for browser testing.',
      explanations: {
        R: 'You may enjoy practical activities and producing visible results.',
        I: 'You may enjoy exploring questions, analysing information, and solving problems.',
        A: 'You may enjoy creating and expressing ideas.',
        S: 'You may enjoy helping, teaching, and supporting other people.',
        E: 'You may enjoy leading, persuading, and organising initiatives.',
        C: 'You may enjoy organising information and following clear procedures.',
      },
    },
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
    feedback: null,
    explanation: {
      assessmentReference: 'ASMT-000001',
      recordedProfileCode: 'C-I-S',
      programmeInterestAreas: ['I', 'R', 'C'],
      sharedTopAreas: [{ code: 'I', label: 'Investigative', score: 6 }, { code: 'C', label: 'Conventional', score: 7 }],
      recordedProgrammeAreas: [{ code: 'I', label: 'Investigative', score: 6 }, { code: 'R', label: 'Realistic', score: 4 }, { code: 'C', label: 'Conventional', score: 7 }],
      learningAreas: ['Software development', 'Information management'],
    },
  }],
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

async function installStudentApi(
  page: Page,
  initiallyComplete = false,
  delayedPaths: string[] = [],
  initialAnswers: Record<string, number> = {},
) {
  let authenticated = false
  let currentUser = { ...user }
  let submitted = initiallyComplete
  let answers: Record<string, number> = initialAnswers

  await page.route('**/sanctum/csrf-cookie', (route) => route.fulfill({ status: 204 }))
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()

    if (path === '/api/v1/auth/session') {
      return json(route, { user: authenticated ? currentUser : null })
    }
    if (path === '/api/v1/auth/login' && method === 'POST') {
      authenticated = true
      return json(route, { user: currentUser })
    }
    if (path === '/api/v1/auth/authorize/student') return json(route, { authorized: true, portal: 'student' })
    if (path === '/api/v1/auth/logout') return json(route, { message: 'Signed out.' })
    if (delayedPaths.includes(path)) {
      await new Promise((resolve) => setTimeout(resolve, 15_000))
    }
    if (path.startsWith('/api/v1/locations/')) {
      const data = path.endsWith('/regions') ? [{ id: 1, code: '0100000000', name: 'Test region' }, { id: 9, code: '0900000000', name: 'Another region' }]
        : path.endsWith('/provinces') ? { items: [{ id: 2, code: '0100100000', name: 'Test province' }], hasIndependentCities: true }
        : path.endsWith('/barangays') ? [{ id: 4, code: '0100101001', name: 'Test barangay' }]
        : [{ id: 3, code: '0100101000', name: 'Test city' }]
      return json(route, { data })
    }
    if (path === '/api/v1/student/profile') {
      if (method === 'PUT') {
        const body = request.postDataJSON() as { firstName: string; lastName: string }
        currentUser = {
          ...currentUser,
          firstName: body.firstName,
          lastName: body.lastName,
          name: `${body.firstName} ${body.lastName}`,
        }
      }
      return json(route, { data: {
        student: { ...currentUser, photoUrl: null },
        personalAcademic: { location: { regionId: 1, provinceId: 2, cityMunicipalityId: 3, barangayId: 4 }, complete: true, idNumber: '12345678', birthDate: '2007-04-18', age: 19, phone: '+63 917 842 1928', addressLine: 'Zone 2', barangay: 'Poblacion', municipality: 'Tagoloan', province: 'Misamis Oriental', updatedAt: '2026-09-07T10:00:00+08:00' },
        riasec: null,
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
    if (path === '/api/v1/student/assessments/riasec/sessions/1/card') {
      return json(route, { data: resultCardPayload() })
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
    if (path === '/api/v1/student/recommendations/REC-000001/programmes/bs-information-technology/feedback' && method === 'PUT') {
      const body = request.postDataJSON() as { rating: number; comment?: string }
      return json(route, {
        data: {
          rating: body.rating,
          comment: body.comment?.trim() || null,
          updatedAt: '2026-11-23T09:00:00+08:00',
        },
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

  return {
    authenticateWithGoogle() {
      authenticated = true
    },
  }
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

function resultCardPayload() {
  return {
    id: 1,
    reference: 'ASMT-000001',
    studentName: 'Browser Test Student',
    attemptNumber: 1,
    isCurrent: true,
    instrumentCode: 'tcc-uhcc-riasec-42-v1',
    status: 'result_available',
    resultAvailableAt: '2026-08-08T00:00:00Z',
    topCode: 'ICR',
    formattedTopCode: 'I-C-R',
    topDimensions: [{ code: 'I', label: 'Investigative', value: 7 }, { code: 'C', label: 'Conventional', value: 6 }, { code: 'R', label: 'Realistic', value: 5 }],
    dimensions: [{ code: 'R', label: 'Realistic', value: 5 }, { code: 'I', label: 'Investigative', value: 7 }, { code: 'A', label: 'Artistic', value: 2 }, { code: 'S', label: 'Social', value: 3 }, { code: 'E', label: 'Enterprising', value: 4 }, { code: 'C', label: 'Conventional', value: 6 }],
    scoringVersion: 'RIASEC-OQ42-2026-01',
    guidanceVersion: 'PSG-PROFILE-NAMES-2026-09-21',
    disclaimer: 'This result reflects self-reported vocational interests.',
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

      requirements: [],
      readinessPrompt: 'Discuss your interest in technology.',
      contentVersion: 'GUIDANCE-1',
    }],
  }
}

async function signIn(page: Page) {
  await page.goto('/student/login', { waitUntil: 'domcontentloaded' })
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

test('keeps Google OAuth out of the main tab browser history', async ({ page }) => {
  const auth = await installStudentApi(page, true)
  await page.context().route('**/auth/google/redirect?**', async (route) => {
    const authorizationUrl = new URL(route.request().url())
    const flow = authorizationUrl.searchParams.get('flow')
    expect(authorizationUrl.searchParams.get('popup')).toBe('1')
    expect(flow).toBeTruthy()
    auth.authenticateWithGoogle()
    await route.fulfill({
      status: 302,
      headers: {
        location: `/google-auth/complete?${new URLSearchParams({
          flow: flow!,
          portal: 'student',
          status: 'success',
        })}`,
      },
    })
  })
  await page.goto('/student/login')

  const googleButton = page.getByRole('button', { name: 'Continue with Google' })
  await expect(googleButton).toBeVisible()
  const popupPromise = page.waitForEvent('popup')
  await googleButton.click({ force: true })
  const popup = await popupPromise

  await expect(page).toHaveURL(/\/student$/)
  await expect(page.getByRole('button', { name: 'My Matches' }).first()).toBeVisible()
  await expect.poll(() => popup.isClosed()).toBe(true)
  expect(page.url()).not.toContain('accounts.google.com')
})

test('matches loading skeletons to the Student page geometry', async ({ page }, testInfo) => {
  await installStudentApi(page, true, [
    '/api/v1/student/recommendations/latest',
    '/api/v1/student/programmes',
    '/api/v1/student/saved-programmes',
    '/api/v1/student/profile',
  ])
  await signIn(page)

  await page.getByRole('button', { name: 'My Matches' }).first().click()
  const recommendations = page.locator('[data-loading-layout="recommendations"]')
  await expect(recommendations).toBeVisible()
  await expect(recommendations.locator('[data-loading-region="recommendation-summary"]')).toBeVisible()
  await expect(recommendations.locator('[data-loading-region="recommendation-scores"]')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('recommendations-loading.png'), fullPage: true })

  await page.getByRole('button', { name: 'Explore Programs' }).first().click()
  const catalogue = page.locator('[data-loading-layout="catalogue"]')
  await expect(catalogue).toBeVisible()
  await expect(catalogue.locator('[data-loading-region="catalogue-hero"]')).toBeVisible()
  await expect(catalogue.locator('[data-loading-region="catalogue-filters"]')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('catalogue-loading.png'), fullPage: true })

  await page.getByRole('button', { name: 'My Profile' }).first().click()
  const profile = page.locator('[data-loading-layout="profile"]')
  await expect(profile).toBeVisible()
  await expect(profile.locator('[data-loading-region="profile-identity"]')).toBeVisible()
  await expect(profile.locator('[data-loading-region="profile-details"]')).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('profile-loading.png'), fullPage: true })
})

test('restores My Matches and its matching skeleton after a refresh', async ({ page }) => {
  await installStudentApi(page, true, [
    '/api/v1/student/recommendations/latest',
  ])
  await signIn(page)

  await page.getByRole('button', { name: 'My Matches' }).first().click()
  await expect(page).toHaveURL(/\/student\/matches$/)
  await expect(page.locator('[data-loading-layout="recommendations"]')).toBeVisible()

  await page.reload()

  await expect(page.getByRole('button', { name: 'My Matches' }).first()).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('[data-loading-layout="recommendations"]')).toBeVisible()
  await expect(page.locator('[data-loading-layout="recommendations"] [data-loading-region="recommendation-scores"]')).toBeVisible()
})

test('uses protected Student routes for browser Back without signing out', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(new URL(request.url()).pathname))
  await installStudentApi(page, true)
  await signIn(page)

  await page.getByRole('button', { name: 'My Matches' }).first().click()
  await expect(page).toHaveURL(/\/student\/matches$/)
  await expect(page.getByRole('heading', { name: 'RIASEC scores' })).toBeVisible()

  await page.getByRole('button', { name: 'Explore Programs' }).first().click()
  await expect(page).toHaveURL(/\/student\/programmes$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Explore TCC programmes' })).toBeVisible()

  await page.goBack()

  await expect(page).toHaveURL(/\/student\/matches$/)
  await expect(page.getByRole('heading', { name: 'RIASEC scores' })).toBeVisible()
  expect(requests).not.toContain('/api/v1/auth/logout')
  expect(page.url()).not.toContain('accounts.google.com')
})

test('lets the Student manage personal profile information without SHS or GWA fields', async ({ page }, testInfo) => {
  await installStudentApi(page)
  await signIn(page)
  await page.getByRole('button', { name: 'Go to dashboard' }).click()
  await page.getByRole('button', { name: 'My Profile' }).first().click()

  await expect(page.getByText('Edit Profile', { exact: true })).toBeVisible()
  await expect(page.getByLabel('ID number *')).toHaveValue('12345678')
  await expect(page.getByLabel('First Name *')).toHaveValue('Browser Test')
  await expect(page.getByLabel('Last Name *')).toHaveValue('Student')
  await expect(page.getByLabel(/Mobile number/)).toHaveValue('+63 917 842 1928')
  await expect(page.getByLabel(/Senior high school/)).toHaveCount(0)
  await expect(page.getByLabel(/GWA/i)).toHaveCount(0)
  const identityColumn = page.locator('[data-profile-column="identity"]')
  const detailsColumn = page.locator('[data-profile-column="details"]')
  await expect(identityColumn).toBeVisible()
  await expect(detailsColumn).toBeVisible()
  await expect(detailsColumn.getByLabel(/Date of birth/)).toBeVisible()
  await expect(detailsColumn.getByLabel(/House, street, or zone/)).toBeVisible()
  await expect(detailsColumn.getByLabel(/Region/)).toBeVisible()

  const identityBox = await identityColumn.boundingBox()
  const detailsBox = await detailsColumn.boundingBox()
  expect(identityBox).not.toBeNull()
  expect(detailsBox).not.toBeNull()
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    expect(detailsBox!.x).toBeGreaterThan(identityBox!.x)
    expect(Math.abs(detailsBox!.y - identityBox!.y)).toBeLessThanOrEqual(2)
    expect(Math.abs(detailsBox!.height - identityBox!.height)).toBeLessThan(180)
    const editorBox = await page.locator('section[aria-labelledby="profile-editor-title"]').boundingBox()
    expect(editorBox).not.toBeNull()
    expect(editorBox!.y + editorBox!.height).toBeLessThanOrEqual(page.viewportSize()!.height)
  } else {
    expect(detailsBox!.y).toBeGreaterThan(identityBox!.y)
  }
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('student-profile-balanced-form.png'), fullPage: true })

  await expect(page.getByText('Learning Profile & Strengths')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Learning profile & preferences' })).toHaveCount(0)
  await expect(page.getByLabel(/GWA/i)).toHaveCount(0)
  await page.getByLabel('First Name *').fill('Clark')
  await page.getByLabel('Last Name *').fill('Cabatuan')
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.getByText('Profile updated')).toBeVisible()
  await expect(page.getByText('Your name and profile details have been saved.')).toBeVisible()
  await expect(page.locator('[data-sonner-toast]')).toHaveCSS('background-color', 'rgb(251, 255, 247)')
  await expect(page.getByRole('heading', { name: 'Clark Cabatuan' })).toBeVisible()
  const headerName = page.locator('header').getByText('Clark Cabatuan', { exact: true })
  const headerAvatar = page.locator('header [data-profile-avatar]')
  await expect(headerName).toBeVisible()
  await expect(headerAvatar).toBeVisible()
  const headerNameBox = await headerName.boundingBox()
  const headerAvatarBox = await headerAvatar.boundingBox()
  expect(headerNameBox).not.toBeNull()
  expect(headerAvatarBox).not.toBeNull()
  expect(headerNameBox!.x + headerNameBox!.width).toBeLessThanOrEqual(headerAvatarBox!.x)
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
  await expect(page.getByRole('img', { name: 'Illustration for question 1' })).toBeVisible()
  await page.getByRole('img', { name: 'Illustration for question 1' }).evaluate((image: HTMLImageElement) => {
    if (image.complete) return
    return new Promise<void>((resolve) => image.addEventListener('load', () => resolve(), { once: true }))
  })
  const questionNavigation = page.getByRole('navigation', { name: 'Question navigation' })
  await questionNavigation.scrollIntoViewIfNeeded()
  await expect(questionNavigation).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('assessment-progress-desktop-or-mobile.png') })

  for (let index = 1; index <= 6; index += 1) {
    const responseGroup = page.getByRole('group', { name: `Response for question ${index}` })
    await expect(responseGroup).toBeVisible()
    const agreeChoice = responseGroup.locator('label:has(input[value="1"])')
    await agreeChoice.click({ position: { x: 8, y: 8 } })
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
  const programmeFeedback = page.getByRole('region', { name: 'Feedback for BS Information Technology' })
  await programmeFeedback.getByRole('radio', { name: '4 stars for BS Information Technology' }).click()
  await programmeFeedback.getByRole('textbox', { name: /Comment/ }).fill('This reflects the technology work I enjoy.')
  await programmeFeedback.getByRole('button', { name: 'Save feedback' }).click()
  await expect(programmeFeedback.getByText('Saved rating: 4 of 5.')).toBeVisible()
  await expect(page.getByText('Feedback saved')).toBeVisible()
  const resultSummary = page.getByRole('heading', { level: 1 }).locator('xpath=ancestor::section[1]')
  const careerPaths = page.getByRole('heading', { name: 'Recommended career paths' }).locator('xpath=ancestor::section[1]')
  await expect(resultSummary.getByText('Why it fits you')).toBeVisible()
  await expect(careerPaths.getByText('Why it fits you')).toHaveCount(0)
  await expect(careerPaths.getByText(/do not predict employment/i)).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('recommendation-result-layout.png') })
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
  const investigativeExplanation = page.getByRole('button', { name: 'Explain Investigative result' })
  await expect(investigativeExplanation).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByText('Recorded score: 6 of 7')).toBeVisible()
  await investigativeExplanation.focus()
  await expect(investigativeExplanation).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(investigativeExplanation).toHaveAttribute('aria-expanded', 'true')
  const investigativeDetails = page.getByRole('region', { name: 'Investigative result explanation' })
  await expect(investigativeDetails.getByText(/selected Agree on 6 of the 7 assessment statements/)).toBeVisible()
  await expect(investigativeDetails.getByText(/exploring questions, analysing information/)).toBeVisible()
  await expect(investigativeDetails.getByText(/contributes to the programme match/)).toBeVisible()
  await page.addScriptTag({ content: axe.source })
  const fitExplanationAccessibility = await page.evaluate(async () => {
    const runner = (window as typeof window & { axe: typeof axe }).axe
    const results = await runner.run('section[aria-labelledby="fit-reasons-title"]', {
      runOnly: ['color-contrast', 'aria-valid-attr', 'button-name'],
    })
    return results.violations
  })
  expect(fitExplanationAccessibility).toEqual([])
  await page.screenshot({ path: testInfo.outputPath('recommendation-fit-explanation.png'), fullPage: true })
  await expect(page.getByRole('heading', { name: 'Possible career directions' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'software developer' })).toBeVisible()
  await expect(page.getByText('analyse software specifications')).toBeVisible()

  await expectNoHorizontalOverflow(page)
  expect(consoleErrors).toEqual([])
})

test('uses the Student header canvas across the assessment', async ({ page }, testInfo) => {
  await installStudentApi(page)
  await signIn(page)

  const heading = page.getByRole('heading', { name: 'Interest assessment' })
  await expect(heading).toBeVisible()

  const assessmentCanvas = heading.locator('xpath=ancestor::main[1]')
  const progressRegion = page
    .getByRole('progressbar', { name: 'Assessment completion' })
    .locator('xpath=ancestor::div[contains(@class, "sticky")][1]')
  const navigation = page.getByRole('navigation', { name: 'Question navigation' })
  const header = page.locator('header').first()
  const backgrounds = await Promise.all(
    [header, assessmentCanvas, progressRegion, navigation].map((locator) =>
      locator.evaluate((element) => window.getComputedStyle(element).backgroundColor),
    ),
  )

  await expect(header).toHaveClass(/bg-background/)
  await expect(assessmentCanvas).toHaveClass(/bg-background/)
  expect(new Set(backgrounds.slice(1)).size).toBe(1)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('assessment-matched-canvas.png') })
})

test('lets the Student scroll through the same complete result card', async ({ page }, testInfo) => {
  await installStudentApi(page, true)
  await signIn(page)

  await page.getByRole('button', { name: 'Share result' }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'RIASEC Interest Profile' })).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Download card' })).toBeVisible()
  const scrollState = await dialog.evaluate((element) => ({
    clientHeight: element.clientHeight,
    overflowY: getComputedStyle(element).overflowY,
    scrollHeight: element.scrollHeight,
  }))
  expect(scrollState.overflowY).toBe('auto')
  expect(scrollState.scrollHeight).toBeGreaterThan(scrollState.clientHeight)
  await dialog.getByText('Conventional').last().scrollIntoViewIfNeeded()
  await expect(dialog.getByRole('progressbar', { name: 'Conventional: 6 out of 7' })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('student-result-card-scroll.png') })
})

test('finds a skipped assessment question and prevents stacked rapid-tap advances', async ({ page }) => {
  await installStudentApi(page, false, [], { '1': 1, '3': 1, '4': 1, '5': 1, '6': 1 })
  await signIn(page)

  await expect(page.getByText('You skipped 1 question')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Review 1 unanswered' })).toBeVisible()
  await page.getByRole('button', { name: 'Go to unanswered question 2' }).click()
  await expect(page.getByRole('group', { name: 'Response for question 2' })).toBeVisible()

  await page.getByText('Agree', { exact: true }).click()
  await page.getByText('Do not agree', { exact: true }).click()
  await expect(page.getByRole('group', { name: 'Response for question 3' })).toBeVisible()
  await page.waitForTimeout(400)
  await expect(page.getByRole('group', { name: 'Response for question 3' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Response for question 4' })).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
})

test('shows multiple programme career directions and published ESCO details', async ({ page }) => {
  await installStudentApi(page, true)
  await signIn(page)

  await page.getByRole('button', { name: 'My Matches' }).first().click()
  await expect(page.getByRole('heading', { name: 'All ranked matches' })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.getByRole('button', { name: 'View programme' }).click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

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
