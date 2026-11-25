import { expect, test, type Page, type Route } from '@playwright/test'
import axe from 'axe-core'

const adminUser = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.test',
  roles: ['admin'],
  canManageAdministrators: true,
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

async function installAdminApi(page: Page, initiallyAuthenticated = false) {
  let authenticated = initiallyAuthenticated
  let adminPhotoUrl: string | null = null
  await page.route('**/sanctum/csrf-cookie', (route) => route.fulfill({ status: 204 }))
  await page.route('**/api/v1/**', (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/v1/auth/session') return json(route, { user: authenticated ? { ...adminUser, photoUrl: adminPhotoUrl } : null })
    if (path === '/api/v1/auth/login') { authenticated = true; return json(route, { user: adminUser }) }
    if (path === '/api/v1/auth/authorize/admin') return json(route, { authorized: true, portal: 'admin' })
    if (path === '/api/v1/admin/profile/photo' && route.request().method() === 'POST') {
      adminPhotoUrl = '/api/v1/admin/profile/photo?v=replacement'
      return json(route, { data: { photoUrl: adminPhotoUrl } }, 201)
    }
    if (path === '/api/v1/admin/profile/photo' && route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#7ED321"/><circle cx="80" cy="62" r="30" fill="#34402D"/><path d="M32 150c8-38 88-38 96 0" fill="#34402D"/></svg>',
      })
    }
    if (path === '/api/v1/admin/profile/photo' && route.request().method() === 'DELETE') {
      adminPhotoUrl = null
      return json(route, { data: { photoUrl: null } })
    }
    if (path === '/api/v1/auth/admin-invitation/preview') return json(route, { data: { name: 'Invited Administrator', maskedEmail: 'i••••••@example.test', expiresAt: '2026-09-15T12:00:00Z' } })
    if (path === '/api/v1/auth/admin-invitation/accept') return json(route, { data: { accepted: true }, message: 'Your Administrator account is ready.' })
    if (path === '/api/v1/admin/overview') return json(route, { data: { students: 1, assessments: 1, completed: 1, inProgress: 0, needsAttention: 0, recommendations: 1, funnel: { registered: 1, entranceDeclared: 1, assessmentStarted: 1, inProgress: 0, processing: 0, resultAvailable: 1 }, operationalAttention: { processingFailures: 0 }, recentActivity: [assessment] } })
    if (path === '/api/v1/admin/students') return json(route, { data: { items: [student], pagination: { currentPage: 1, lastPage: 1, perPage: 20, total: 1, from: 1, to: 1 } } })
    if (path === '/api/v1/admin/students/10') return json(route, { data: { id: 10, name: 'Ana Santos', email: 'ana@example.test', accountStatus: 'active', savedProgrammeCount: 1, profile: { idNumber: '12345678', birthDate: '2007-04-18', age: 19, phone: '+63 917 842 1928', addressLine: 'Zone 2', barangay: 'Poblacion', municipality: 'Tagoloan', province: 'Misamis Oriental' }, attempts: [{ ...assessment, dimensions: [{ code: 'R', label: 'Realistic', value: 16 }, { code: 'I', label: 'Investigative', value: 23 }, { code: 'A', label: 'Artistic', value: 14 }, { code: 'S', label: 'Social', value: 12 }, { code: 'E', label: 'Enterprising', value: 10 }, { code: 'C', label: 'Conventional', value: 21 }], recommendations: [{ id: 'bs-information-technology', rank: 1, code: 'BSIT', name: 'BS Information Technology', match: 90 }, { id: 'bs-business-administration', rank: 2, code: 'BSBA', name: 'BS Business Administration', match: 82 }, { id: 'bachelor-library-information-science', rank: 3, code: 'BLIS', name: 'Bachelor of Library and Information Science', match: 76 }] }] } })
    if (path === '/api/v1/admin/students/10/attempts/1/card') return json(route, { data: resultCard })
    if (path === '/api/v1/admin/programmes') return json(route, { data: { academicYear: '2026-2027', catalogueVersion: 2, catalogueStatus: 'approved_current_scope', programmes: [{ id: 'bs-information-technology', code: 'BSIT', name: 'BS Information Technology', profile: ['I', 'R', 'C'], profileStatus: 'psg_informed_analytical_classification', profileVersion: 'PSG-MATRIX-2026-09-10', eligibilityGroup: 'board', majors: [], description: 'Applies computing technologies to organisational needs.', learningAreas: ['Software development'], learningAreaDescriptions: { 'Software development': 'Design and maintain applications.' }, learningAreaTopics: { 'Software development': ['Programming'] }, careerDirections: ['Software development'], requirements: ['Meet published admission requirements.'], readinessPrompt: 'Discuss your interest in technology.', contentVersion: 'GUIDANCE-1', degreeType: "Bachelor's degree", duration: { status: 'ched_psg', display: '4 years', source_name: 'CHED source', source_url: 'https://ched.gov.ph/' }, salary: { status: 'not_published', display: 'Not published' }, jobGrowth: { status: 'not_published', display: 'Not published' }, outlookVersion: 'PH-1', coverImageUrl: null, logoImageUrl: null, monitoring: { savedByStudents: 1 } }] } })
    if (path === '/api/v1/admin/configurations/catalogue') return json(route, { data: { kind: 'catalogue', runtime: { programmes: [catalogueProgramme] }, versions: [{ id: 7, kind: 'catalogue', version: 3, status: 'draft', academicYear: '2026-2027', payload: { programmes: [catalogueProgramme] }, createdBy: 'Admin User', publishedBy: null, createdAt: '2026-09-12T12:00:00+08:00', publishedAt: null }] } })
    if (path === '/api/v1/admin/reports') return json(route, { data: { generatedAt: '2026-08-08T12:00:00+08:00', from: null, to: null, scope: 'institution', enrollmentAlignment: { programs: [{ programmeId: 'bs-information-technology', programmeCode: 'BSIT', programmeName: 'BS Information Technology', recommended: 1, aligned: 1, notAligned: 0, unallocated: 0, alignmentRate: 100 }], overall: { recommended: 1, aligned: 1, notAligned: 0, unallocated: 0, alignmentRate: 100 } } } })
    if (path === '/api/v1/admin/feedback') return json(route, { data: { generatedAt: '2026-08-08T12:00:00+08:00', from: null, to: null, publishedResponseCount: 2, publishedRespondentCount: 1, eligibleProgrammeCount: 2, commentCount: 1, respondents: [{ respondentNumber: 1, responseCount: 2, commentCount: 1, averageRating: 4.5, latestUpdatedAt: '2026-08-08T11:00:00+08:00', programmeFeedback: [{ programmeId: 'bs-information-technology', programmeName: 'BS Information Technology', rating: 4, comment: 'This recommendation reflects my interests in technology.', updatedAt: '2026-08-08T11:00:00+08:00' }, { programmeId: 'bachelor-library-information-science', programmeName: 'Bachelor of Library and Information Science', rating: 5, comment: null, updatedAt: '2026-08-08T10:00:00+08:00' }], resultSets: [{ resultSetNumber: 1, resultDate: '2026-08-08T09:00:00+08:00', recommendationCount: 3, feedbackCount: 2, recommendations: [{ programmeId: 'bs-information-technology', programmeCode: 'BSIT', programmeName: 'BS Information Technology', rank: 1, match: 90, feedback: { rating: 4, comment: 'This recommendation reflects my interests in technology.', updatedAt: '2026-08-08T11:00:00+08:00' } }, { programmeId: 'bachelor-library-information-science', programmeCode: 'BLIS', programmeName: 'Bachelor of Library and Information Science', rank: 2, match: 88.57, feedback: { rating: 5, comment: null, updatedAt: '2026-08-08T10:00:00+08:00' } }, { programmeId: 'bs-business-administration-financial-management', programmeCode: 'BSBA-FM', programmeName: 'BS Business Administration - Financial Management', rank: 3, match: 82.86, feedback: null }] }] }], programmes: [{ programmeId: 'bs-information-technology', programmeName: 'BS Information Technology', respondentCount: 1, averageRating: 4, ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 0 } }, { programmeId: 'bachelor-library-information-science', programmeName: 'Bachelor of Library and Information Science', respondentCount: 1, averageRating: 5, ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 1 } }], comments: [{ programmeId: 'bs-information-technology', programmeName: 'BS Information Technology', rating: 4, comment: 'This recommendation reflects my interests in technology.', updatedAt: '2026-08-08T11:00:00+08:00' }] } })
    if (path === '/api/v1/admin/activity') return json(route, { data: { items: [{ id: 1, actorId: 2, actor: 'Admin User', action: 'configuration.published', createdAt: '2026-08-08T12:00:00+08:00' }], pagination: { currentPage: 1, lastPage: 1, perPage: 25, total: 1, from: 1, to: 1 }, filters: { actors: [{ id: 2, name: 'Admin User' }], actions: ['configuration.published'] } } })
    if (path === '/api/v1/admin/administrators') return json(route, { data: { administrators: [{ id: 2, name: 'Admin User', email: 'admin@example.test', accountStatus: 'active', canManageAdministrators: true, lastActiveAt: '2026-09-14T08:00:00Z', createdAt: '2026-09-01T08:00:00Z' }, { id: 3, name: 'Records Administrator', email: 'records@example.test', accountStatus: 'suspended', canManageAdministrators: false, lastActiveAt: null, createdAt: '2026-09-02T08:00:00Z' }], invitations: [{ id: 7, name: 'Pending Administrator', email: 'pending@example.test', status: 'pending', canManageAdministrators: false, invitedBy: 'Admin User', expiresAt: '2026-09-15T08:00:00Z', sentAt: '2026-09-14T08:00:00Z', createdAt: '2026-09-14T08:00:00Z' }] } })
    return json(route, { data: [] })
  })
}

const assessment = { id: 1, reference: 'ASMT-000001', studentId: 10, studentName: 'Ana Santos', studentEmail: 'ana@example.test', attemptNumber: 1, instrumentCode: 'tcc-uhcc-riasec-42-v1', status: 'result_available', answerCount: 42, questionCount: 42, topCode: 'I-C-R', startedAt: '2026-08-08T08:00:00+08:00', savedAt: '2026-08-08T08:19:00+08:00', submittedAt: '2026-08-08T08:20:00+08:00', resultAvailableAt: '2026-08-08T08:20:01+08:00', processingErrorCode: null, processingFailedAt: null, entranceExamination: { resultId: 1, score: 2.5, eligibilityGroup: 'board', ruleReference: 'SELF-DECLARED-TCC-ENTRANCE-2026-01', source: 'student_self_declared', declaredAt: '2026-08-08T07:00:00+08:00' }, recommendationSnapshot: { catalogueReference: 'TCC-AY-2026-2027-V2', ruleReference: 'PROPOSED-RIASEC-3-PSG-MATRIX', methodologyStatus: 'Proposed methodology', generatedAt: '2026-08-08T08:20:01+08:00', totalEligible: 6 } }
const resultCard = { id: 1, reference: 'ASMT-000001', studentName: 'Ana Santos', attemptNumber: 1, isCurrent: true, instrumentCode: 'tcc-uhcc-riasec-42-v1', status: 'result_available', resultAvailableAt: '2026-08-08T08:20:01+08:00', topCode: 'ICR', formattedTopCode: 'I-C-R', topDimensions: [{ code: 'I', label: 'Investigative', value: 7 }, { code: 'C', label: 'Conventional', value: 6 }, { code: 'R', label: 'Realistic', value: 5 }], dimensions: [{ code: 'R', label: 'Realistic', value: 5 }, { code: 'I', label: 'Investigative', value: 7 }, { code: 'A', label: 'Artistic', value: 2 }, { code: 'S', label: 'Social', value: 3 }, { code: 'E', label: 'Enterprising', value: 4 }, { code: 'C', label: 'Conventional', value: 6 }], scoringVersion: 'RIASEC-OQ42-2026-01', guidanceVersion: 'PSG-PROFILE-NAMES-2026-09-21', disclaimer: 'This result reflects self-reported vocational interests.' }
const student = { id: 10, name: 'Ana Santos', email: 'ana@example.test', accountStatus: 'active', attemptCount: 1, latestResultAt: '2026-08-08T08:20:01+08:00', latestTopCode: 'I-C-R', declarationStatus: 'declared', selfDeclaredScore: 2.5, eligibilityGroup: 'board', currentAssessmentStatus: 'result_available', currentAssessmentReference: 'ASMT-000001', recommendationAvailable: true, savedProgrammeCount: 1, lastActivityAt: '2026-08-08T08:20:01+08:00' }
const catalogueProgramme = { id: 'bs-information-technology', display_name: 'BS Information Technology', short_label: 'BSIT', majors: [], riasec_profile: ['I', 'R', 'C'], riasec_profile_status: 'psg_informed_analytical_classification', eligibility_group: 'non_board', description: 'Studies computing infrastructure and solutions for organisational needs.', learning_areas: ['IT infrastructure', 'Computing solutions'], learning_area_descriptions: {}, learning_area_topics: {}, career_directions: ['Web and applications developer'], career_opportunities: [], content_status: 'ched_psg_sourced', content_source: { source_name: 'CHED CMO No. 25, series of 2015', source_url: 'https://ched.gov.ph/', reference: 'Article IV, Sections 5 and 6' }, cover_image_url: null, logo_image_url: null }

test('shows an uploaded Administrator photo and uses the full profile canvas', async ({ page }, testInfo) => {
  await installAdminApi(page, true)
  await page.goto('/admin/profile')

  await expect(page.getByRole('heading', { name: 'Profile settings' })).toBeVisible()
  await page.locator('input[type="file"]').setInputFiles({
    name: 'profile.png',
    mimeType: 'image/png',
    buffer: Buffer.from('browser-test-profile'),
  })

  await expect(page.getByText('Profile photo updated successfully.')).toBeVisible()
  const profilePhoto = page.getByRole('img', { name: 'Admin User' }).last()
  await expect(profilePhoto).toBeVisible()
  await expect(profilePhoto).toHaveAttribute('src', /^blob:/)

  const profileCanvas = page.getByRole('heading', { name: 'Profile settings' }).locator('xpath=ancestor::div[contains(@class,"w-full")][1]')
  const canvasBox = await profileCanvas.boundingBox()
  const mainBox = await page.locator('main').boundingBox()
  expect(canvasBox).not.toBeNull()
  expect(mainBox).not.toBeNull()
  expect(canvasBox!.width).toBeGreaterThan(mainBox!.width * 0.9)
  await page.screenshot({ path: testInfo.outputPath('admin-profile-full-width.png'), fullPage: true })
})

test('scrolls and downloads the complete Administrator result card as an image', async ({ page }, testInfo) => {
  await installAdminApi(page, true)
  await page.goto('/admin/students/10', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'View Result Card' }).click()

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
  await page.screenshot({ path: testInfo.outputPath('admin-result-card-scroll.png') })

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Download card' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('assessment-result-ASMT-000001-attempt-1.png')
})

test('Programme governance protects sourced facts and declares full-draft publishing', async ({ page }) => {
  test.slow()
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await installAdminApi(page, true)
  await page.goto('/admin/programmes')

  await page.getByRole('button', { name: 'Manage programme' }).click()
  await expect(page.getByRole('heading', { name: 'Manage BS Information Technology' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'BS Information Technology', exact: true })).toBeVisible()
  await expect(page.getByText('Protected source-controlled facts')).toBeVisible()
  await expect(page.getByRole('link', { name: /CHED CMO No. 25/ })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Programme name' })).toHaveCount(0)
  await expect(page.getByRole('textbox', { name: 'RIASEC codes, one per line' })).toHaveCount(0)
  await expect(page.getByRole('textbox', { name: 'Recommended SHS strands, one per line' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Publish full catalogue' })).toBeDisabled()
  await expect(page.getByText(/publishing applies every pending programme change/i)).toBeVisible()

  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')?.contains(document.activeElement)))).toBe(true)

  const overflow = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)
  const accessibility = await page.evaluate(async (source) => {
    eval(source)
    return window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
  }, axe.source)
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  expect(consoleErrors).toEqual([])
})

test('Admin dashboard uses the semantic multicolor palette without overflow', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await installAdminApi(page)
  await page.goto('/admin/login')
  await page.getByLabel('Email address').fill('admin@example.test')
  await page.getByRole('textbox', { name: 'Password' }).fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  consoleErrors.length = 0

  await expect(page.getByRole('heading', { name: 'System overview' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Student journey' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Assessment Milestones' })).toBeVisible()
  await expect(
    page.getByLabel('Welcome and workspace overview').getByRole('button', { name: 'View all records' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'View all records' })).toHaveCount(2)

  const metricColors = await page.getByTestId('admin-operational-strip').locator(':scope > div > div > span:last-child').evaluateAll((indicators) =>
    indicators.map((indicator) => getComputedStyle(indicator).color),
  )
  expect(new Set(metricColors).size).toBeGreaterThanOrEqual(2)
  const metricCount = await page.getByTestId('admin-operational-strip').locator(':scope > div').count()
  expect(metricCount).toBe(3)

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)

  const accessibility = await page.evaluate(async (source) => {
    eval(source)
    return window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
  }, axe.source)
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  expect(consoleErrors).toEqual([])
  await page.screenshot({ path: testInfo.outputPath('admin-dashboard-remake.png'), fullPage: true })
})

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
  await expect(page.getByRole('heading', { name: 'Recent Students' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Student journey' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Assessment Milestones' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open student directory' })).toHaveCount(0)
  await expect(page.getByText('Needs attention', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Course Recommendations Delivered', { exact: true })).toBeVisible()
  await expect(page.getByText('Top Recommended Programmes')).toHaveCount(0)
  await expect(page.getByText('Matches by Track')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Current workload' })).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('admin-dashboard-remake.png'), fullPage: true })
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
  await expect(page.getByRole('heading', { name: 'Academic programme recommendations' })).toBeVisible()
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
    ['/admin/feedback', 'Student feedback'],
    ['/admin/activity', 'Admin activity'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    if (path === '/admin/programmes') {
      await expect(page.locator('[class*="bg-gradient"]')).toHaveCount(0)
      await page.screenshot({ path: testInfo.outputPath('admin-programmes-no-gradient.png'), fullPage: true })
    }
    if (path === '/admin/reports') {
      await expect(page.getByRole('heading', { name: 'Assessment and recommendation activity' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Completed results over time' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Current stage distribution' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Recommendation interest-match feedback' })).toHaveCount(0)
      await page.screenshot({ path: testInfo.outputPath('admin-report-redesign.png'), fullPage: true })
    }
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

test('Admin feedback page lists anonymous respondents and opens complete programme feedback', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await installAdminApi(page, true)
  await page.goto('/admin/feedback', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Student feedback' })).toBeVisible()

  const feedback = page.getByRole('region', { name: 'Feedback respondents' })
  await expect(feedback).toBeVisible()
  await expect(feedback.getByRole('table')).toBeVisible()
  await expect(feedback.getByText('Student Applicant')).toBeVisible()
  await expect(feedback.getByText(/not Student numbers or account identifiers/)).toBeVisible()

  await feedback.getByRole('button', { name: 'View feedback' }).click()
  const details = page.getByRole('dialog')
  await expect(details.getByRole('heading', { name: 'Student Applicant #1' })).toBeVisible()
  await expect(details.getByText('BS Information Technology')).toBeVisible()
  await expect(details.getByText('Bachelor of Library and Information Science')).toBeVisible()
  await expect(details.getByText('BS Business Administration - Financial Management')).toBeVisible()
  await expect(details.getByText('Complete programme ranking')).toBeVisible()
  await expect(details.getByText('90%')).toBeVisible()
  await expect(details.getByText('88.57%')).toBeVisible()
  await expect(details.getByText('82.86%')).toBeVisible()
  await expect(details.getByText(/This recommendation reflects my interests in technology/)).toBeVisible()
  await expect(details.getByText('No comment submitted.')).toBeVisible()
  await expect(details.getByText('No feedback submitted')).toBeVisible()

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .slice(0, 8)
      .map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
  }))
  expect(overflow.scrollWidth, JSON.stringify(overflow.offenders)).toBeLessThanOrEqual(overflow.clientWidth)

  const accessibility = await details.evaluate(async (element, source) => {
    eval(source)
    return window.axe.run(element, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
  }, axe.source)
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  expect(consoleErrors).toEqual([])
  await page.screenshot({ path: testInfo.outputPath('admin-anonymous-feedback-detail.png'), fullPage: true })
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
  await expect(page.getByRole('heading', { name: 'Academic programme recommendations' })).toBeVisible()
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

test('Admin recommendation review opens the selected programme detail', async ({ page }) => {
  test.slow()
  await installAdminApi(page, true)
  await page.goto('/admin/students/10', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Review Curriculum & Quotas' }).first().click()

  await expect(page).toHaveURL(/\/admin\/programmes\/bs-information-technology$/)
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByRole('dialog').getByRole('heading', {
      name: 'BS Information Technology',
      exact: true,
    }),
  ).toBeVisible()
})

test('Administrator invitation and account governance render securely without overflow', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await installAdminApi(page, true)
  await page.goto('/admin/administrators')

  await expect(page.getByRole('heading', { name: 'Administrators', exact: true })).toBeVisible()
  await page.getByRole('tab', { name: /^invitations/i }).click()
  await expect(page.getByText('Pending Administrator')).toBeVisible()
  await page.getByRole('tab', { name: /^administrators/i }).click()
  await expect(page.getByText('Suspended', { exact: true }).filter({ visible: true })).toBeVisible()
  await page.getByRole('button', { name: 'Invite administrator' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByLabel('Confirm with your password')).toBeVisible()
  await expect(page.getByLabel(/temporary password/i)).toHaveCount(0)
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')?.contains(document.activeElement)))).toBe(true)

  const overflow = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)
  const accessibility = await page.evaluate(async (source) => {
    eval(source)
    return window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
  }, axe.source)
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  await page.screenshot({ path: testInfo.outputPath('administrator-management.png'), fullPage: true })

  await page.goto(`/admin/setup#token=${'a'.repeat(64)}`)
  await expect(page.getByRole('heading', { name: 'Set up your Administrator account' })).toBeVisible()
  await expect(page.getByText('Invited Administrator')).toBeVisible()
  await expect(page).toHaveURL('/admin/setup')
  await page.getByLabel('Password', { exact: true }).fill('SecureAdmin!2026')
  await page.getByLabel('Confirm password').fill('SecureAdmin!2026')
  await page.getByRole('button', { name: 'Activate Administrator account' }).click()
  await expect(page.getByText(/Administrator account is active/i)).toBeVisible()
  const setupOverflow = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
  expect(setupOverflow.scrollWidth).toBeLessThanOrEqual(setupOverflow.clientWidth)
  expect(consoleErrors).toEqual([])
})
