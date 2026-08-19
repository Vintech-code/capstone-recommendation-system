import { expect, test, type Page, type Route } from '@playwright/test'
import axe from 'axe-core'

const adminUser = {
  id: 2,
  name: 'Guidance Counselor',
  email: 'guidance@example.test',
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
    if (path === '/api/v1/admin/overview') return json(route, { data: { students: 1, assessments: 1, completed: 1, inProgress: 0, needsAttention: 0, recommendations: 1, pendingGuidanceRequests: 0, operationalAttention: { processingFailures: 0, unverifiedSources: 0, unpublishedDrafts: 0, suspendedCounselors: 0, pendingGuidanceRequests: 0 }, recentActivity: [assessment] } })
    if (path === '/api/v1/admin/students') return json(route, { data: [student] })
    if (path === '/api/v1/admin/students/10') return json(route, { data: { id: 10, name: 'Ana Santos', email: 'ana@example.test', accountStatus: 'active', profile: { student: { id: 10, name: 'Ana Santos', email: 'ana@example.test', photoUrl: null }, questionnaire: { complete: false, strengths: [], growthAreas: [], learningPreferences: [], updatedAt: null }, options: { strengths: [], growthAreas: [], learningPreferences: [] }, riasec: null, careerInterests: [], about: 'No student profile selections have been recorded.' }, guidanceCase: null, attempts: [{ ...assessment, dimensions: [{ code: 'I', label: 'Investigative', value: 23 }, { code: 'C', label: 'Conventional', value: 21 }], recommendations: [{ id: 'bs-information-technology', rank: 1, code: 'BSIT', name: 'BS Information Technology', match: 90 }] }] } })
    if (path === '/api/v1/admin/assessments') return json(route, { data: [assessment] })
    if (path === '/api/v1/admin/counselors') return json(route, { data: [{ id: 2, name: 'Guidance Counselor', email: 'guidance@example.test', accountStatus: 'active', assignedCaseCount: 1, activeCaseCount: 1, followUpCount: 1, overdueCount: 0, assignments: [{ caseId: 1, studentId: 10, studentName: 'Ana Santos', studentEmail: 'ana@example.test', status: 'follow_up', followUpOn: '2026-08-20' }] }] })
    if (path === '/api/v1/admin/appointments') return json(route, { data: [] })
    if (path === '/api/v1/admin/programmes') return json(route, { data: { academicYear: '2026-2027', catalogueVersion: 1, catalogueStatus: 'approved_current_scope', programmes: [{ id: 'bs-information-technology', code: 'BSIT', name: 'BS Information Technology', profile: ['I', 'C', 'R'], profileStatus: 'researcher_proposed_temporary', profileVersion: 'TEMP-2026-01', majors: [], recommendedStrands: ['STEM', 'TVL-ICT'], description: 'Applies computing technologies to organisational needs.', learningAreas: ['Software development'], learningAreaDescriptions: { 'Software development': 'Design and maintain applications.' }, learningAreaTopics: { 'Software development': ['Programming'] }, careerDirections: ['Software development'], strandGuidance: 'STEM and TVL-ICT may be helpful preparation.', requirements: ['Meet published admission requirements.'], readinessPrompt: 'Discuss your interest in technology.', contentVersion: 'GUIDANCE-1', degreeType: "Bachelor's degree", duration: { status: 'ched_psg', display: '4 years', source_name: 'CHED source', source_url: 'https://ched.gov.ph/' }, salary: { status: 'not_published', display: 'Not published' }, jobGrowth: { status: 'not_published', display: 'Not published' }, outlookVersion: 'PH-1', coverImageUrl: null, logoImageUrl: null, monitoring: { savedByStudents: 1, recommendationAppearances: 1, topThreeAppearances: 1, pendingGuidanceRequests: 0 } }] } })
    if (path === '/api/v1/admin/configurations/catalogue') return json(route, { data: { kind: 'catalogue', runtime: {}, versions: [] } })
    if (path === '/api/v1/admin/reports') return json(route, { data: { generatedAt: '2026-08-08T12:00:00+08:00', from: null, to: null, scope: 'institution', studentCount: 1, assessmentActivity: 1, completedAssessments: 1, assessmentCompletionRate: 100, recommendationRuns: 1, programmeSaves: 0, guidanceRequestStatuses: { pending: 0, accepted: 0, closed: 0, declined: 0, cancelled: 0 }, openFollowUps: 0, overdueFollowUps: 0, closedGuidanceCases: 0, assessmentCompletionsByMonth: [{ month: '2026-08', count: 1 }] } })
    if (path === '/api/v1/admin/activity') return json(route, { data: [{ id: 1, actor: 'Guidance Counselor', action: 'guidance_note_created', subjectType: 'student', subjectReference: '10', metadata: null, createdAt: '2026-08-08T12:00:00+08:00' }] })
    return json(route, { data: [] })
  })
}

const assessment = { id: 1, reference: 'ASMT-000001', studentId: 10, studentName: 'Ana Santos', studentEmail: 'ana@example.test', attemptNumber: 1, status: 'result_available', topCode: 'I-C', startedAt: '2026-08-08T08:00:00+08:00', submittedAt: '2026-08-08T08:20:00+08:00', resultAvailableAt: '2026-08-08T08:20:01+08:00', processingErrorCode: null }
const student = { id: 10, name: 'Ana Santos', email: 'ana@example.test', accountStatus: 'active', attemptCount: 1, latestResultAt: '2026-08-08T08:20:01+08:00', latestTopCode: 'I-C' }

test('Admin guidance workspace is responsive, accessible, and navigable', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await installAdminApi(page)
  await page.goto('/admin/login')
  await page.getByLabel('Email address').fill('guidance@example.test')
  await page.getByRole('textbox', { name: 'Password' }).fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('heading', { name: /Welcome back, Admin/i })).toBeVisible()
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
  await page.getByRole('button', { name: 'Students' }).click()
  await expect(page.getByRole('heading', { name: 'Student records' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Student and assessment records' })).toBeVisible()
  await expect(page.getByText('Results available')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Assessments' })).toHaveCount(0)
  await page.goto('/admin/assessments')
  await expect(page).toHaveURL('/admin/students')
  await expect(page.getByRole('heading', { name: 'Student and assessment records' })).toBeVisible()
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
    await expect(page.getByRole('button', { name: 'Open student record' })).toBeVisible()
    await page.goto('/admin/students/10')
  } else {
    await page.getByRole('button', { name: 'Open student record' }).click()
  }
  await expect(page.getByRole('heading', { name: 'Ana Santos', exact: true })).toBeVisible()
  await expect(page.getByText('I-C interest profile')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

  for (const [path, heading] of [
    ['/admin/students', 'Student records'],
    ['/admin/counselors', 'Counselor accounts'],
    ['/admin/programmes', 'Programme monitoring'],
    ['/admin/reports', 'Guidance reports'],
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

  await page.goto('/admin/counselors')
  await page.getByLabel('Full name').fill('New Counselor')
  await page.getByLabel('Email address').fill('new@example.test')
  await page.getByLabel('Initial temporary password', { exact: true }).fill('Initial!Counsel2026')
  await page.getByLabel('Confirm initial temporary password', { exact: true }).fill('Initial!Counsel2026')
  const createRequestPromise = page.waitForRequest((request) => request.url().endsWith('/api/v1/admin/counselors') && request.method() === 'POST')
  await page.getByRole('button', { name: 'Create counselor account' }).click()
  const createRequest = await createRequestPromise
  expect(createRequest.postDataJSON()).toMatchObject({ password: 'Initial!Counsel2026', password_confirmation: 'Initial!Counsel2026' })
  await expect(page.getByText(/Counselor account created/i)).toBeVisible()
  await expect(page.getByText('One-time temporary password')).toHaveCount(0)

  await page.getByRole('button', { name: 'Reset password' }).click()
  await expect(page.getByRole('dialog', { name: 'Set a new temporary password' })).toBeVisible()
  await page.getByLabel('New temporary password', { exact: true }).fill('Reset!Counselor2026')
  await page.getByLabel('Confirm new temporary password', { exact: true }).fill('Reset!Counselor2026')
  const resetRequestPromise = page.waitForRequest((request) => request.url().endsWith('/api/v1/admin/counselors/2/reset-password') && request.method() === 'POST')
  await page.getByRole('button', { name: 'Set temporary password' }).click()
  const resetRequest = await resetRequestPromise
  expect(resetRequest.postDataJSON()).toMatchObject({ password: 'Reset!Counselor2026', password_confirmation: 'Reset!Counselor2026' })
  await expect(page.getByText(/Temporary password set/i)).toBeVisible()

  const accessibility = await page.evaluate(async (source) => {
    eval(source)
    return window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
  }, axe.source)
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  expect(consoleErrors).toEqual([])
})
