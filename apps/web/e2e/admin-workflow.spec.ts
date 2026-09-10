import { expect, test, type Page, type Route } from '@playwright/test'
import axe from 'axe-core'

const adminUser = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.test',
  roles: ['admin'],
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

async function installAdminApi(page: Page) {
  let authenticated = false
  await page.route('**/sanctum/csrf-cookie', (route) => route.fulfill({ status: 204 }))
  await page.route('**/api/v1/**', (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/v1/auth/me') return authenticated ? json(route, { user: adminUser }) : json(route, { message: 'Unauthenticated.' }, 401)
    if (path === '/api/v1/auth/login') { authenticated = true; return json(route, { user: adminUser }) }
    if (path === '/api/v1/auth/authorize/admin') return json(route, { authorized: true, portal: 'admin' })
    if (path === '/api/v1/admin/overview') return json(route, { data: { students: 1, assessments: 1, completed: 1, inProgress: 0, needsAttention: 0, recommendations: 1, funnel: { registered: 1, entranceDeclared: 1, assessmentStarted: 1, inProgress: 0, processing: 0, resultAvailable: 1 }, operationalAttention: { processingFailures: 0 }, recentActivity: [assessment] } })
    if (path === '/api/v1/admin/students') return json(route, { data: { items: [student], pagination: { currentPage: 1, lastPage: 1, perPage: 20, total: 1, from: 1, to: 1 } } })
    if (path === '/api/v1/admin/students/10') return json(route, { data: { id: 10, name: 'Ana Santos', email: 'ana@example.test', accountStatus: 'active', savedProgrammeCount: 1, profile: { lrn: '128490000011', birthDate: '2007-04-18', age: 19, phone: '+63 917 842 1928', addressLine: 'Zone 2', barangay: 'Poblacion', municipality: 'Tagoloan', province: 'Misamis Oriental', shsSchoolName: 'Tagoloan National High School', shsStrand: 'STEM', shsGraduationYear: 2026 }, attempts: [{ ...assessment, dimensions: [{ code: 'R', label: 'Realistic', value: 16 }, { code: 'I', label: 'Investigative', value: 23 }, { code: 'A', label: 'Artistic', value: 14 }, { code: 'S', label: 'Social', value: 12 }, { code: 'E', label: 'Enterprising', value: 10 }, { code: 'C', label: 'Conventional', value: 21 }], recommendations: [{ id: 'bs-information-technology', rank: 1, code: 'BSIT', name: 'BS Information Technology', match: 90 }, { id: 'bs-business-administration', rank: 2, code: 'BSBA', name: 'BS Business Administration', match: 82 }, { id: 'bachelor-library-information-science', rank: 3, code: 'BLIS', name: 'Bachelor of Library and Information Science', match: 76 }] }] } })
    if (path === '/api/v1/admin/appointments') return json(route, { data: [] })
    if (path === '/api/v1/admin/programmes') return json(route, { data: { academicYear: '2026-2027', catalogueVersion: 2, catalogueStatus: 'approved_current_scope', programmes: [{ id: 'bs-information-technology', code: 'BSIT', name: 'BS Information Technology', profile: ['I', 'R', 'C'], profileStatus: 'psg_informed_analytical_classification', profileVersion: 'PSG-MATRIX-2026-09-10', eligibilityGroup: 'board', majors: [], recommendedStrands: ['STEM', 'TVL-ICT'], description: 'Applies computing technologies to organisational needs.', learningAreas: ['Software development'], learningAreaDescriptions: { 'Software development': 'Design and maintain applications.' }, learningAreaTopics: { 'Software development': ['Programming'] }, careerDirections: ['Software development'], strandGuidance: 'STEM and TVL-ICT may be helpful preparation.', requirements: ['Meet published admission requirements.'], readinessPrompt: 'Discuss your interest in technology.', contentVersion: 'GUIDANCE-1', degreeType: "Bachelor's degree", duration: { status: 'ched_psg', display: '4 years', source_name: 'CHED source', source_url: 'https://ched.gov.ph/' }, salary: { status: 'not_published', display: 'Not published' }, jobGrowth: { status: 'not_published', display: 'Not published' }, outlookVersion: 'PH-1', coverImageUrl: null, logoImageUrl: null, monitoring: { savedByStudents: 1 } }] } })
    if (path === '/api/v1/admin/configurations/catalogue') return json(route, { data: { kind: 'catalogue', runtime: {}, versions: [] } })
    if (path === '/api/v1/admin/reports') return json(route, { data: { generatedAt: '2026-08-08T12:00:00+08:00', from: null, to: null, scope: 'institution', studentCount: 1, eligibilityDistribution: { board: 1, nonBoard: 0 }, completedAssessments: 1, assessmentCompletionRate: 100, assessmentFunnel: { started: 1, inProgress: 0, processing: 0, resultAvailable: 1 }, recommendationRuns: 1, programmeSaves: 0, assessmentCompletionsByMonth: [{ month: '2026-08', count: 1 }] } })
    if (path === '/api/v1/admin/activity') return json(route, { data: { items: [{ id: 1, actorId: 2, actor: 'Admin User', action: 'configuration.published', createdAt: '2026-08-08T12:00:00+08:00' }], pagination: { currentPage: 1, lastPage: 1, perPage: 25, total: 1, from: 1, to: 1 }, filters: { actors: [{ id: 2, name: 'Admin User' }], actions: ['configuration.published'] } } })
    return json(route, { data: [] })
  })
}

const assessment = { id: 1, reference: 'ASMT-000001', studentId: 10, studentName: 'Ana Santos', studentEmail: 'ana@example.test', attemptNumber: 1, instrumentCode: 'tcc-uhcc-riasec-42-v1', status: 'result_available', answerCount: 42, questionCount: 42, topCode: 'I-C-R', startedAt: '2026-08-08T08:00:00+08:00', savedAt: '2026-08-08T08:19:00+08:00', submittedAt: '2026-08-08T08:20:00+08:00', resultAvailableAt: '2026-08-08T08:20:01+08:00', processingErrorCode: null, processingFailedAt: null, entranceExamination: { resultId: 1, score: 2.5, eligibilityGroup: 'board', ruleReference: 'SELF-DECLARED-TCC-ENTRANCE-2026-01', source: 'student_self_declared', declaredAt: '2026-08-08T07:00:00+08:00' }, recommendationSnapshot: { catalogueReference: 'TCC-AY-2026-2027-V2', ruleReference: 'PROPOSED-RIASEC-3-PSG-MATRIX', methodologyStatus: 'Proposed methodology', generatedAt: '2026-08-08T08:20:01+08:00', totalEligible: 6 } }
const student = { id: 10, name: 'Ana Santos', email: 'ana@example.test', accountStatus: 'active', attemptCount: 1, latestResultAt: '2026-08-08T08:20:01+08:00', latestTopCode: 'I-C-R', declarationStatus: 'declared', selfDeclaredScore: 2.5, eligibilityGroup: 'board', currentAssessmentStatus: 'result_available', currentAssessmentReference: 'ASMT-000001', recommendationAvailable: true, savedProgrammeCount: 1, lastActivityAt: '2026-08-08T08:20:01+08:00' }

test('Admin workspace is responsive, accessible, and navigable', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await installAdminApi(page)
  await page.goto('/admin/login')
  await page.getByLabel('Email address').fill('admin@example.test')
  await page.getByRole('textbox', { name: 'Password' }).fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('heading', { name: 'System overview' })).toBeVisible()
  await expect(page.getByRole('contentinfo')).toHaveCount(0)
  consoleErrors.length = 0
  await expect(page.getByText('Recent assessment activity')).toBeVisible()
  const dashboardOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .slice(0, 8)
      .map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
  }))
  expect(dashboardOverflow.scrollWidth, JSON.stringify(dashboardOverflow.offenders)).toBeLessThanOrEqual(dashboardOverflow.clientWidth)

  if (testInfo.project.name.includes('mobile')) {
    await page.getByRole('button', { name: 'Open workspace navigation' }).click()
  } else {
    const navigationToggle = page.getByRole('button', { name: 'Collapse workspace navigation' })
    await navigationToggle.click()
    await expect(page.getByRole('button', { name: 'Expand workspace navigation' })).toBeVisible()
    await page.getByRole('button', { name: 'Expand workspace navigation' }).click()
  }
  await page.getByRole('button', { name: 'Students', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Student records' })).toBeVisible()
  if (testInfo.project.name.includes('mobile')) {
    await expect(page.locator('[data-student-records] ul').getByText('Result available')).toBeVisible()
  } else {
    await expect(page.getByRole('grid').getByText('Result available')).toBeVisible()
  }
  await page.screenshot({ path: testInfo.outputPath('compact-admin-student-ledger.png') })
  await expect(page.getByRole('button', { name: 'Assessments' })).toHaveCount(0)
  const studentOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    tableContainer: (() => {
      const table = document.querySelector('table')
      const container = table?.parentElement
      return container ? { className: container.className, clientWidth: container.clientWidth, scrollWidth: container.scrollWidth, overflowX: getComputedStyle(container).overflowX } : null
    })(),
    offenders: Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .slice(0, 8)
      .map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
  }))
  expect(studentOverflow.scrollWidth, JSON.stringify({ tableContainer: studentOverflow.tableContainer, offenders: studentOverflow.offenders })).toBeLessThanOrEqual(studentOverflow.clientWidth)
  if (testInfo.project.name.includes('mobile')) {
    await expect(page.getByRole('button', { name: 'Open student evidence', exact: true })).toBeVisible()
    await page.goto('/admin/students/10')
  } else {
    await page.getByRole('button', { name: 'Open', exact: true }).click()
  }
  await expect(page.getByRole('heading', { name: 'Ana Santos', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Psychometric dimension matrix' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Academic programme pathways' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Assessment history and evidence' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Assessment context' })).toHaveCount(0)
  await expect(page.getByTestId('student-resume-card')).toHaveCount(1)
  const detailOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .slice(0, 8)
      .map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
  }))
  expect(detailOverflow.scrollWidth, JSON.stringify(detailOverflow.offenders)).toBeLessThanOrEqual(detailOverflow.clientWidth)
  for (const [path, heading] of [
    ['/admin/students', 'Student records'],
    ['/admin/programmes', 'Programme monitoring'],
    ['/admin/reports', 'System reports'],
    ['/admin/activity', 'Admin activity'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      offenders: Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 8)
        .map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
    }))
    expect(overflow.scrollWidth, JSON.stringify(overflow.offenders)).toBeLessThanOrEqual(overflow.clientWidth)
  }

  const accessibility = await page.evaluate(async (source) => {
    eval(source)
    return window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
  }, axe.source)
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  expect(consoleErrors).toEqual([])
})

test('Admin Student detail follows the evidence dossier layout', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await installAdminApi(page)
  await page.goto('/admin/login')
  await page.getByLabel('Email address').fill('admin@example.test')
  await page.getByRole('textbox', { name: 'Password' }).fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  consoleErrors.length = 0
  await page.goto('/admin/students/10')

  await expect(page.getByRole('heading', { name: 'Ana Santos', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Psychometric dimension matrix' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Academic programme pathways' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Assessment history and evidence' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Assessment context' })).toHaveCount(0)
  await expect(page.getByTestId('student-resume-card')).toHaveCount(1)
  await expect(page.getByText('R · Realistic')).toBeVisible()
  await expect(page.getByText('C · Conventional')).toBeVisible()

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .slice(0, 8)
      .map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
  }))
  expect(overflow.scrollWidth, JSON.stringify(overflow.offenders)).toBeLessThanOrEqual(overflow.clientWidth)

  const accessibility = await page.evaluate(async (source) => {
    eval(source)
    return window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
  }, axe.source)
  const seriousViolations = accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
  expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([])
  expect(consoleErrors).toEqual([])
})
